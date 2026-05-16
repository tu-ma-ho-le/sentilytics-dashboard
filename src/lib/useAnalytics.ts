import { useMemo } from "react";
import { useSentimentStore } from "@/lib/store";
import { extractTopKeywords, summarize } from "@/lib/sentiment";

export function useAnalytics() {
  const { results } = useSentimentStore();
  return useMemo(() => {
    const summary = summarize(results);
    const distribution = [
      { name: "Positive", value: summary.counts.positive, color: "var(--positive)" },
      { name: "Neutral", value: summary.counts.neutral, color: "var(--neutral)" },
      { name: "Negative", value: summary.counts.negative, color: "var(--negative)" },
    ];

    // group by day
    const byDay = new Map<string, { date: string; positive: number; neutral: number; negative: number; avg: number; count: number }>();
    for (const r of results) {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const cur = byDay.get(key) ?? { date: key, positive: 0, neutral: 0, negative: 0, avg: 0, count: 0 };
      cur[r.sentiment]++;
      cur.avg += r.score;
      cur.count++;
      byDay.set(key, cur);
    }
    const trend = Array.from(byDay.values())
      .map((d) => ({ ...d, avg: Number((d.avg / Math.max(1, d.count)).toFixed(3)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topAll = extractTopKeywords(results, undefined, 20);
    const topPositive = extractTopKeywords(results, "positive", 10);
    const topNegative = extractTopKeywords(results, "negative", 10);

    return { results, summary, distribution, trend, topAll, topPositive, topNegative };
  }, [results]);
}
