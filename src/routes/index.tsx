import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { ArrowUpRight, Smile, Meh, Frown, Activity, Sparkles, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useAnalytics } from "@/lib/useAnalytics";
import { useSentimentStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sentilytics" },
      { name: "description", content: "Real-time sentiment dashboard with distribution, trends, and top keywords." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { summary, distribution, trend, topAll } = useAnalytics();
  const { results } = useSentimentStore();
  const recent = results.slice(0, 6);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Sentiment <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">Live overview of your analyzed text data.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/analyze" className="rounded-lg gradient-bg px-4 py-2 text-sm font-medium text-primary-foreground inline-flex items-center gap-2 shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" /> Analyze text
          </Link>
          <Link to="/insights" className="rounded-lg border bg-card px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
            View report <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Analyzed" value={summary.total} icon={MessageSquare} hint="All time" />
        <StatCard label="Positive" value={`${summary.pctPositive}%`} icon={Smile} accent="positive" hint={`${summary.counts.positive} items`} />
        <StatCard label="Neutral" value={`${summary.pctNeutral}%`} icon={Meh} accent="neutral" hint={`${summary.counts.neutral} items`} />
        <StatCard label="Negative" value={`${summary.pctNegative}%`} icon={Frown} accent="negative" hint={`${summary.counts.negative} items`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Sentiment Distribution</h3>
            <Badge variant="secondary">Pie</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Sentiment Over Time</h3>
            <Badge variant="secondary">Line</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="avg" name="Avg Score" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="positive" stroke="var(--positive)" strokeWidth={1.5} />
                <Line type="monotone" dataKey="negative" stroke="var(--negative)" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Daily Volume by Sentiment</h3>
            <Badge variant="secondary">Bar</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill="var(--positive)" />
                <Bar dataKey="neutral" stackId="a" fill="var(--neutral)" />
                <Bar dataKey="negative" stackId="a" fill="var(--negative)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Top Keywords</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2">
            {topAll.length === 0 && <div className="text-sm text-muted-foreground">No keywords yet.</div>}
            {topAll.map((k) => {
              const size = Math.min(2, 0.8 + k.count * 0.12);
              return (
                <span
                  key={k.word}
                  className="px-2.5 py-1 rounded-full glass-card text-foreground"
                  style={{ fontSize: `${size}rem`, lineHeight: 1.2 }}
                  title={`${k.count} mentions`}
                >
                  {k.word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Analyses</h3>
          <Link to="/analyze" className="text-xs text-primary hover:underline">Add more →</Link>
        </div>
        <div className="divide-y">
          {recent.map((r) => (
            <div key={r.id} className="py-3 flex items-start gap-3">
              <SentBadge sentiment={r.sentiment} />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{r.text}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  score {r.score} · {Math.round(r.confidence * 100)}% confidence · {r.emotion}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const cfg = {
    positive: { label: "Positive", color: "bg-[var(--positive)]/15 text-[var(--positive)] border-[var(--positive)]/30" },
    neutral: { label: "Neutral", color: "bg-[var(--neutral)]/15 text-[var(--neutral)] border-[var(--neutral)]/30" },
    negative: { label: "Negative", color: "bg-[var(--negative)]/15 text-[var(--negative)] border-[var(--negative)]/30" },
  }[sentiment];
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color} font-medium shrink-0`}>{cfg.label}</span>;
}
