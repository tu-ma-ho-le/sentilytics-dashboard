# Sentilytics — AI Sentiment Analysis Dashboard

A modern, production-ready sentiment analysis dashboard built with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Recharts**. Sentilytics ingests text (single entries or CSV batches), classifies sentiment with an in-browser NLP engine, visualizes insights on a glassmorphism dashboard, and exports a professional PDF insights report.

> Privacy-first by design: all analysis runs **client-side**. No data ever leaves the browser.

---

## ✨ Features

- **Real-time sentiment scoring** — Positive / Neutral / Negative with confidence
- **Emotion detection** — joy, anger, sadness, fear, surprise
- **CSV batch upload** — drag-and-drop, with preview and sample dataset
- **Analytics dashboard** — distribution pie, trend lines, daily volume bars, keyword cloud
- **AI-style insights report** — auto-generated executive summary + PDF export
- **Technical documentation page** — explains the NLP pipeline transparently
- **Light / dark mode** with persistent theme
- **Zero backend required** — uses `localStorage` for persistence

---

## 🧠 NLP Engine

A custom **AFINN-inspired lexicon analyzer** (`src/lib/sentiment.ts`) that handles:

- Tokenization & stop-word removal
- Negation (`not good` → negative)
- Intensifiers (`very happy` → boosted)
- Score normalization to `[-1, 1]`
- Confidence calculation
- Keyword & emotion extraction

**Scoring formula:**

```text
raw       = Σ (lexicon[token] × negation × intensifier)
score     = clamp(raw / max(5, tokens/2), -1, 1)
sentiment = score >  0.15 → Positive
            score < -0.15 → Negative
            else          → Neutral
confidence = min(1, 0.4 + |score|·0.6 + hits·0.05)
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start v1 + React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (CSS-first via `src/styles.css`) |
| Charts | Recharts |
| CSV parsing | PapaParse |
| PDF export | jsPDF + jspdf-autotable |
| State | React Context + localStorage |
| Runtime | Cloudflare Workers compatible |

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── AppShell.tsx       # Sidebar layout, navigation, theme toggle
│   └── StatCard.tsx       # Animated stat tiles
├── lib/
│   ├── sentiment.ts       # NLP engine (lexicon + scoring)
│   ├── store.tsx          # React Context state + persistence
│   ├── theme.tsx          # Light/dark mode provider
│   └── useAnalytics.ts    # Derived metrics hook
├── routes/
│   ├── __root.tsx         # Root layout + providers
│   ├── index.tsx          # Dashboard
│   ├── analyze.tsx        # Manual text analyzer
│   ├── upload.tsx         # CSV batch upload
│   ├── insights.tsx       # Report + PDF export
│   └── technical.tsx      # How-it-works docs
└── styles.css             # Tailwind v4 tokens + glassmorphism
```

---

## 🚀 Getting Started

```bash
bun install
bun run dev
```

App runs at `http://localhost:8080`.

### Build

```bash
bun run build
```

---

## 📊 Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard — KPIs, distribution, trends, keywords |
| `/analyze` | Single-text analyzer with live scoring |
| `/upload` | CSV batch upload with preview |
| `/insights` | Auto-generated report + PDF export |
| `/technical` | NLP pipeline documentation |

---

## 🌐 Deployment

The app is fully static + edge-friendly. Deploy to:

- **Vercel** — `vercel deploy` (auto-detects Vite)
- **Cloudflare Pages / Workers** — `wrangler deploy`
- **Render** — set build `bun run build`, publish `dist/`
- **Lovable** — built-in publish

---

## 🔮 Roadmap

- Swap lexicon for a transformer model (DistilBERT) behind a server route
- Multilingual lexicons
- Aspect-based sentiment analysis
- Persistent storage via Lovable Cloud
- Team workspaces & sharing

---

## 📄 License

MIT — built as a portfolio / academic demo project.
