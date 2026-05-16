// Lightweight lexicon-based sentiment analyzer (AFINN-inspired).
// Runs entirely client-side — no server/Python dependency.

const POSITIVE: Record<string, number> = {
  amazing: 3, awesome: 3, excellent: 3, fantastic: 3, great: 2, good: 2, love: 3, loved: 3,
  perfect: 3, wonderful: 3, best: 3, brilliant: 3, happy: 2, delighted: 3, satisfied: 2,
  enjoy: 2, enjoyed: 2, recommend: 2, beautiful: 2, nice: 1, fast: 1, easy: 1, helpful: 2,
  impressive: 3, outstanding: 3, superb: 3, like: 1, liked: 1, pleased: 2, smooth: 1,
  fun: 2, cool: 1, win: 2, won: 2, success: 2, successful: 2, thanks: 1, thank: 1,
  positive: 2, gain: 1, profit: 2, support: 1, supportive: 2, friendly: 2, clean: 1,
  works: 1, working: 1, solved: 2, solve: 1, useful: 2, quality: 1, reliable: 2,
};

const NEGATIVE: Record<string, number> = {
  bad: -2, awful: -3, terrible: -3, horrible: -3, worst: -3, hate: -3, hated: -3,
  poor: -2, broken: -2, bug: -2, bugs: -2, buggy: -2, slow: -2, ugly: -2, sad: -2,
  angry: -3, disappointing: -3, disappointed: -3, frustrating: -3, useless: -3,
  waste: -3, garbage: -3, crash: -3, crashed: -3, fail: -2, failed: -2, fails: -2,
  failure: -2, problem: -1, issue: -1, issues: -1, error: -2, errors: -2, wrong: -2,
  annoying: -2, boring: -2, dislike: -2, hard: -1, difficult: -2, confusing: -2,
  expensive: -1, lost: -1, missing: -1, never: -1, negative: -2, hurt: -2, pain: -2,
  scam: -3, fraud: -3, refund: -2, late: -1, dead: -2, dirty: -2, rude: -3,
};

const NEGATORS = new Set(["not", "no", "never", "n't", "cannot", "cant", "wont", "dont", "doesnt", "isnt", "arent"]);
const INTENSIFIERS: Record<string, number> = { very: 1.5, really: 1.4, extremely: 1.8, super: 1.5, so: 1.2, totally: 1.4, absolutely: 1.6 };

const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","else","when","at","by","for","with","about","of","to","in","on","is","are","was","were","be","been","being","have","has","had","do","does","did","this","that","these","those","i","you","he","she","it","we","they","my","your","his","her","its","our","their","as","from","so","up","out","off","than","too","just","can","will","would","should","could","also","get","got"
]);

export type Sentiment = "positive" | "neutral" | "negative";
export type Emotion = "joy" | "anger" | "sadness" | "fear" | "surprise" | "neutral";

export interface AnalysisResult {
  id: string;
  text: string;
  sentiment: Sentiment;
  score: number; // -1 to 1 normalized
  confidence: number; // 0-1
  emotion: Emotion;
  keywords: string[];
  timestamp: number;
}

const EMOTION_LEX: Record<Emotion, string[]> = {
  joy: ["love", "happy", "delighted", "awesome", "amazing", "fun", "great", "enjoy"],
  anger: ["angry", "hate", "furious", "rude", "annoying", "mad"],
  sadness: ["sad", "disappointed", "cry", "depressed", "miserable", "unhappy"],
  fear: ["afraid", "scared", "worried", "anxious", "nervous", "fear"],
  surprise: ["wow", "surprised", "shocking", "unexpected", "amazing"],
  neutral: [],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function detectEmotion(tokens: string[]): Emotion {
  const scores: Record<Emotion, number> = { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 0 };
  for (const t of tokens) {
    for (const e of Object.keys(EMOTION_LEX) as Emotion[]) {
      if (EMOTION_LEX[e].includes(t)) scores[e]++;
    }
  }
  let best: Emotion = "neutral";
  let max = 0;
  for (const e of Object.keys(scores) as Emotion[]) {
    if (scores[e] > max) { max = scores[e]; best = e; }
  }
  return best;
}

export function analyzeText(text: string): AnalysisResult {
  const tokens = tokenize(text);
  let raw = 0;
  let hits = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    let weight = 0;
    if (POSITIVE[t] !== undefined) weight = POSITIVE[t];
    else if (NEGATIVE[t] !== undefined) weight = NEGATIVE[t];
    if (weight === 0) continue;
    const prev = tokens[i - 1];
    const prev2 = tokens[i - 2];
    if (prev && NEGATORS.has(prev)) weight = -weight;
    if (prev && INTENSIFIERS[prev]) weight *= INTENSIFIERS[prev];
    if (prev2 && INTENSIFIERS[prev2]) weight *= INTENSIFIERS[prev2] * 0.8;
    raw += weight;
    hits++;
  }
  const normalized = Math.max(-1, Math.min(1, raw / Math.max(5, tokens.length / 2)));
  let sentiment: Sentiment = "neutral";
  if (normalized > 0.15) sentiment = "positive";
  else if (normalized < -0.15) sentiment = "negative";
  const confidence = Math.min(1, 0.4 + Math.abs(normalized) * 0.6 + Math.min(0.2, hits * 0.05));

  const keywords = Array.from(new Set(tokens.filter((t) => !STOPWORDS.has(t) && t.length > 3))).slice(0, 8);

  return {
    id: crypto.randomUUID(),
    text,
    sentiment,
    score: Number(normalized.toFixed(3)),
    confidence: Number(confidence.toFixed(3)),
    emotion: detectEmotion(tokens),
    keywords,
    timestamp: Date.now(),
  };
}

export function extractTopKeywords(results: AnalysisResult[], filter?: Sentiment, limit = 15) {
  const counts = new Map<string, number>();
  for (const r of results) {
    if (filter && r.sentiment !== filter) continue;
    for (const k of r.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function summarize(results: AnalysisResult[]) {
  const total = results.length;
  const counts = { positive: 0, neutral: 0, negative: 0 };
  let scoreSum = 0;
  let confSum = 0;
  for (const r of results) { counts[r.sentiment]++; scoreSum += r.score; confSum += r.confidence; }
  return {
    total,
    counts,
    avgScore: total ? Number((scoreSum / total).toFixed(3)) : 0,
    avgConfidence: total ? Number((confSum / total).toFixed(3)) : 0,
    pctPositive: total ? Math.round((counts.positive / total) * 100) : 0,
    pctNeutral: total ? Math.round((counts.neutral / total) * 100) : 0,
    pctNegative: total ? Math.round((counts.negative / total) * 100) : 0,
  };
}
