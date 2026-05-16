import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { analyzeText, type AnalysisResult } from "./sentiment";

const STORAGE_KEY = "sentilytics:results";

interface StoreCtx {
  results: AnalysisResult[];
  addText: (text: string) => AnalysisResult | null;
  addBatch: (texts: string[]) => AnalysisResult[];
  clear: () => void;
  remove: (id: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const SEED = [
  "Absolutely love this product! Works perfectly and the support team is amazing.",
  "The app keeps crashing on launch. Very frustrating experience.",
  "It's okay, nothing special but does the job.",
  "Best purchase I've made this year. Highly recommend!",
  "Terrible customer service. Waited two hours and no response.",
  "Pretty good value for the price. Could be a bit faster.",
  "I hate the new update, it broke everything I liked.",
  "Smooth, clean interface and very easy to use. Great job!",
  "Average product. Nothing to complain about, nothing to rave about.",
  "Outstanding quality and fantastic customer experience!",
  "Way too expensive for what you get. Disappointed.",
  "The dashboard is beautiful and super helpful for my work.",
];

export function SentimentStoreProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { setResults(JSON.parse(raw)); return; }
    } catch {}
    // seed first-time visitors
    const seeded = SEED.map((t, i) => ({ ...analyzeText(t), timestamp: Date.now() - (SEED.length - i) * 1000 * 60 * 60 * 6 }));
    setResults(seeded);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(results)); } catch {}
  }, [results]);

  const addText = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return null;
    const r = analyzeText(t);
    setResults((prev) => [r, ...prev]);
    return r;
  }, []);

  const addBatch = useCallback((texts: string[]) => {
    const batch = texts.map((t) => t.trim()).filter(Boolean).map(analyzeText);
    setResults((prev) => [...batch, ...prev]);
    return batch;
  }, []);

  const clear = useCallback(() => setResults([]), []);
  const remove = useCallback((id: string) => setResults((p) => p.filter((r) => r.id !== id)), []);

  const value = useMemo(() => ({ results, addText, addBatch, clear, remove }), [results, addText, addBatch, clear, remove]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSentimentStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSentimentStore must be used inside SentimentStoreProvider");
  return v;
}
