import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSentimentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SentBadge } from "./index";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze — Sentilytics" },
      { name: "description", content: "Analyze text sentiment instantly with on-device NLP." },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const { results, addText, remove, clear } = useSentimentStore();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [q, setQ] = useState("");

  const handleAnalyze = () => {
    const r = addText(text);
    if (!r) { toast.error("Enter some text first."); return; }
    toast.success(`Analyzed: ${r.sentiment} (${Math.round(r.confidence * 100)}%)`);
    setText("");
  };

  const filtered = results.filter((r) => {
    if (filter !== "all" && r.sentiment !== filter) return false;
    if (q && !r.text.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analyze <span className="gradient-text">Text</span></h1>
        <p className="text-muted-foreground mt-1">Type or paste text to compute sentiment, confidence, and emotion.</p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. The new update is super smooth and the team was incredibly helpful..."
          className="min-h-32 bg-background/60 resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze(); }}
        />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Tip: ⌘/Ctrl + Enter to analyze.</span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setText("")} disabled={!text}>Clear</Button>
            <Button onClick={handleAnalyze} className="gradient-bg text-primary-foreground">
              <Sparkles className="h-4 w-4 mr-2" /> Analyze
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "positive", "neutral", "negative"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground border-transparent" : "bg-card hover:bg-accent/30"}`}
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search text..." className="pl-9 bg-card" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => { clear(); toast.success("Cleared all results."); }}>
          <Trash2 className="h-4 w-4 mr-1.5" /> Reset
        </Button>
      </div>

      <div className="glass-card rounded-2xl divide-y">
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No results match your filter.
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="p-4 flex items-start gap-3">
            <SentBadge sentiment={r.sentiment} />
            <div className="flex-1 min-w-0">
              <div className="text-sm">{r.text}</div>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                <span>score <b className="text-foreground">{r.score}</b></span>
                <span>confidence <b className="text-foreground">{Math.round(r.confidence * 100)}%</b></span>
                <span>emotion <b className="text-foreground capitalize">{r.emotion}</b></span>
                <span>{new Date(r.timestamp).toLocaleString()}</span>
              </div>
              {r.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.keywords.map((k) => (
                    <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{k}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
