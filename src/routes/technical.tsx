import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/technical")({
  head: () => ({
    meta: [
      { title: "How It Works — Sentilytics" },
      { name: "description", content: "Technical explanation of the NLP pipeline, scoring logic, and architecture." },
    ],
  }),
  component: TechnicalPage,
});

const STEPS = [
  { name: "Tokenization", desc: "Split text into lowercase word tokens, stripping punctuation." },
  { name: "Stop-word removal", desc: "Remove common words (the, a, is) that carry little sentiment signal." },
  { name: "Lexicon scoring", desc: "Look up each token in an AFINN-style polarity dictionary (-3 … +3)." },
  { name: "Negation & intensifiers", desc: "Flip sign on negation (not, never) and scale magnitude on intensifiers (very, extremely)." },
  { name: "Normalization", desc: "Aggregate weights and clamp to [-1, 1] relative to document length." },
  { name: "Classification", desc: "Threshold the normalized score into Positive / Neutral / Negative." },
  { name: "Confidence", desc: "Confidence = base 0.4 + |score|·0.6 + token-hit bonus, capped at 1.0." },
  { name: "Emotion detection", desc: "Match tokens to emotion lexicons (joy, anger, sadness, fear, surprise)." },
];

function TechnicalPage() {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">How <span className="gradient-text">It Works</span></h1>
        <p className="text-muted-foreground mt-1">A transparent look at the NLP pipeline powering Sentilytics.</p>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Pipeline</h3>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.name} className="flex gap-3">
              <div className="h-7 w-7 rounded-lg gradient-bg text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">{i + 1}</div>
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Workflow Diagram</h3>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {["Raw text", "Tokenize", "Lex. score", "Negate/Intensify", "Normalize", "Classify"].map((b, i, arr) => (
              <span key={b} className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-md border bg-card font-medium">{b}</span>
                {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Scoring Formula</h3>
          <pre className="text-xs bg-background/60 border rounded-md p-3 overflow-x-auto leading-relaxed"><code>{`raw      = Σ (lexicon[token] × negation × intensifier)
score    = clamp(raw / max(5, tokens/2), -1, 1)
sentiment = score >  0.15  →  Positive
            score < -0.15  →  Negative
            else           →  Neutral
confidence = min(1, 0.4 + |score|·0.6 + hits·0.05)`}</code></pre>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-2">Architecture</h3>
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            <li>• <b className="text-foreground">Frontend:</b> React 19 + TanStack Start + Tailwind v4</li>
            <li>• <b className="text-foreground">Charts:</b> Recharts (pie, bar, line)</li>
            <li>• <b className="text-foreground">NLP engine:</b> custom AFINN-inspired lexicon, runs in-browser</li>
            <li>• <b className="text-foreground">Storage:</b> localStorage (privacy-first, zero backend)</li>
            <li>• <b className="text-foreground">Reports:</b> jsPDF + jspdf-autotable</li>
            <li>• <b className="text-foreground">CSV parsing:</b> PapaParse</li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold mb-2">Limitations</h3>
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            <li>• Lexicon approaches miss sarcasm and complex context.</li>
            <li>• Domain-specific jargon may be misclassified.</li>
            <li>• English-only vocabulary in the bundled lexicon.</li>
            <li>• Short texts produce lower confidence scores.</li>
            <li>• For production-grade accuracy, swap in a transformer model (e.g. DistilBERT) behind a server route.</li>
          </ul>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold mb-2">Accuracy notes</h3>
        <p className="text-sm text-muted-foreground">
          Lexicon scoring is fast, transparent, and ideal for demos and high-volume preprocessing. On standard product-review benchmarks it typically reaches 70–78% accuracy. To upgrade, send batches to a hosted classifier (e.g. via the AI Gateway) and persist results to a database — the UI already supports any data source that conforms to the <code>AnalysisResult</code> shape.
        </p>
      </div>
    </div>
  );
}
