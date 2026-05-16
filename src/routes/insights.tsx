import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/useAnalytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights Report — Sentilytics" },
      { name: "description", content: "Executive summary, key findings, and AI-generated recommendations." },
    ],
  }),
  component: InsightsPage,
});

function generateObservations(s: ReturnType<typeof useAnalytics>) {
  const out: string[] = [];
  const { summary, topPositive, topNegative, trend } = s;
  if (summary.total === 0) return ["No data analyzed yet — upload a CSV or analyze text to populate this report."];

  if (summary.pctPositive >= 60) out.push(`Overall sentiment skews strongly positive (${summary.pctPositive}%), indicating high satisfaction.`);
  else if (summary.pctNegative >= 40) out.push(`A notable ${summary.pctNegative}% of feedback is negative — investigate root causes urgently.`);
  else out.push(`Sentiment is mixed: ${summary.pctPositive}% positive, ${summary.pctNeutral}% neutral, ${summary.pctNegative}% negative.`);

  if (summary.avgConfidence < 0.55) out.push(`Average confidence (${Math.round(summary.avgConfidence * 100)}%) is moderate — consider richer text inputs for stronger signal.`);
  else out.push(`Model confidence averages ${Math.round(summary.avgConfidence * 100)}%, suggesting reliable classifications.`);

  if (topPositive[0]) out.push(`Customers frequently praise "${topPositive[0].word}" — leverage this in marketing copy.`);
  if (topNegative[0]) out.push(`Pain points cluster around "${topNegative[0].word}" — prioritize this in the next sprint.`);

  if (trend.length >= 2) {
    const last = trend[trend.length - 1].avg;
    const prev = trend[trend.length - 2].avg;
    if (last > prev + 0.1) out.push(`Sentiment is trending up day-over-day (+${(last - prev).toFixed(2)}).`);
    else if (last < prev - 0.1) out.push(`Sentiment is trending down day-over-day (${(last - prev).toFixed(2)}).`);
    else out.push("Day-over-day sentiment is stable.");
  }
  return out;
}

function generateRecommendations(s: ReturnType<typeof useAnalytics>) {
  const recs: string[] = [];
  const { summary, topNegative } = s;
  if (summary.pctNegative > 30) recs.push("Create a dedicated triage workflow for negative feedback within 24 hours.");
  if (topNegative[0]) recs.push(`Run a root-cause analysis on top complaint theme: "${topNegative.slice(0, 3).map((t) => t.word).join(", ")}".`);
  if (summary.pctPositive > 50) recs.push("Surface positive testimonials in onboarding and landing pages.");
  recs.push("Re-run the report weekly and compare deltas to track interventions.");
  recs.push("Combine sentiment scores with NPS or CSAT for richer correlation analysis.");
  return recs;
}

function InsightsPage() {
  const s = useAnalytics();
  const observations = generateObservations(s);
  const recommendations = generateRecommendations(s);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Sentilytics — Insights Report", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(new Date().toLocaleString(), 14, 25);

    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text("Executive Summary", 14, 36);
    doc.setFontSize(10);
    const exec = `Across ${s.summary.total} analyzed items, ${s.summary.pctPositive}% are positive, ${s.summary.pctNeutral}% neutral, and ${s.summary.pctNegative}% negative. Average sentiment score: ${s.summary.avgScore}. Average confidence: ${Math.round(s.summary.avgConfidence * 100)}%.`;
    doc.text(doc.splitTextToSize(exec, 180), 14, 42);

    autoTable(doc, {
      startY: 62,
      head: [["Metric", "Value"]],
      body: [
        ["Total analyzed", String(s.summary.total)],
        ["Positive", `${s.summary.counts.positive} (${s.summary.pctPositive}%)`],
        ["Neutral", `${s.summary.counts.neutral} (${s.summary.pctNeutral}%)`],
        ["Negative", `${s.summary.counts.negative} (${s.summary.pctNegative}%)`],
        ["Avg score", String(s.summary.avgScore)],
        ["Avg confidence", `${Math.round(s.summary.avgConfidence * 100)}%`],
      ],
      theme: "striped",
    });

    let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(13); doc.text("Key Findings", 14, y); y += 6;
    doc.setFontSize(10);
    observations.forEach((o) => { const lines = doc.splitTextToSize(`• ${o}`, 180); doc.text(lines, 14, y); y += lines.length * 5 + 1; });

    y += 4;
    doc.setFontSize(13); doc.text("Recommendations", 14, y); y += 6;
    doc.setFontSize(10);
    recommendations.forEach((r) => { const lines = doc.splitTextToSize(`• ${r}`, 180); doc.text(lines, 14, y); y += lines.length * 5 + 1; });

    if (s.topPositive.length || s.topNegative.length) {
      autoTable(doc, {
        startY: y + 4,
        head: [["Top Positive Keywords", "Count", "Top Negative Keywords", "Count"]],
        body: Array.from({ length: Math.max(s.topPositive.length, s.topNegative.length) }).map((_, i) => [
          s.topPositive[i]?.word ?? "", s.topPositive[i]?.count ?? "",
          s.topNegative[i]?.word ?? "", s.topNegative[i]?.count ?? "",
        ]),
      });
    }

    doc.save(`sentilytics-report-${Date.now()}.pdf`);
    toast.success("Report exported.");
  };

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Insights <span className="gradient-text">Report</span></h1>
          <p className="text-muted-foreground mt-1">AI-generated narrative based on your analyzed data.</p>
        </div>
        <Button onClick={exportPdf} className="gradient-bg text-primary-foreground">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <Section title="Executive Summary" icon={FileText}>
        <p>
          Across <b>{s.summary.total}</b> analyzed items, <b>{s.summary.pctPositive}%</b> are positive,{" "}
          <b>{s.summary.pctNeutral}%</b> neutral, and <b>{s.summary.pctNegative}%</b> negative.
          Average sentiment score is <b>{s.summary.avgScore}</b> with{" "}
          <b>{Math.round(s.summary.avgConfidence * 100)}%</b> average model confidence.
        </p>
      </Section>

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Key Findings" icon={Lightbulb}>
          <ul className="space-y-2 text-sm">
            {observations.map((o, i) => <li key={i} className="flex gap-2"><span className="text-primary">▸</span><span>{o}</span></li>)}
          </ul>
        </Section>
        <Section title="Recommendations" icon={Lightbulb}>
          <ul className="space-y-2 text-sm">
            {recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-accent">▸</span><span>{r}</span></li>)}
          </ul>
        </Section>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Top Positive Terms">
          <KeywordList items={s.topPositive} color="var(--positive)" />
        </Section>
        <Section title="Top Negative Terms">
          <KeywordList items={s.topNegative} color="var(--negative)" />
        </Section>
      </div>

      <Section title="Conclusion">
        <p className="text-sm text-muted-foreground">
          This report is regenerated automatically from your latest data. For best results, analyze new feedback regularly and pair these findings with quantitative metrics such as NPS, CSAT, and churn rate.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function KeywordList({ items, color }: { items: { word: string; count: number }[]; color: string }) {
  if (items.length === 0) return <div className="text-sm text-muted-foreground">No data yet.</div>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.word} className="flex items-center gap-3 text-sm">
          <div className="w-24 truncate font-medium">{it.word}</div>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.count / max) * 100}%`, background: color }} />
          </div>
          <div className="text-xs text-muted-foreground w-8 text-right">{it.count}</div>
        </div>
      ))}
    </div>
  );
}
