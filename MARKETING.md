# TroveScout — Multi-Source Research for AI Agents

**One slash command. 15+ sources. 30 seconds.**

TroveScout is an Agent Skill that turns any AI coding agent into a research powerhouse. Drop `/trovescout <topic>` into Claude Code, Codex, Cursor, Gemini CLI, or any Agent Skills host — and get a synthesized, sourced briefing across Reddit, X, YouTube, TikTok, Hacker News, GitHub, Bluesky, Polymarket, and the open web.

---

## Why TroveScout

AI coding agents are incredible at writing code. But they're trapped behind a knowledge cutoff. Ask them "what's the sentiment on Nvidia earnings this month?" and you get caveats instead of answers.

TroveScout bridges that gap. It queries live sources, extracts signal, deduplicates, clusters, scores by relevance, and hands back a clean briefing — all within a single agent conversation turn.

### What makes it different

- **Zero infrastructure.** No API server to deploy, no database to provision, no Docker container. It's a file tree with a `SKILL.md` contract.
- **Zero pip dependencies.** Pure Python stdlib — `python3` is all you need.
- **15+ sources out of the box.** Reddit (always on), X/Twitter, YouTube, TikTok, Instagram, Hacker News, GitHub, Bluesky, Polymarket, Digg, Pinterest, Threads, Truth Social, and web search.
- **Smart synthesis.** Not just a list of links. TroveScout clusters findings, detects patterns, scores relevance, and produces a structured briefing with sentiment, evidence, and emerging trends.
- **AI-native.** Designed for LLM consumption. The output is structured markdown that models can reason over, cite, and remix.

---

## Who It's For

| Role | Why TroveScout |
|------|----------------|
| **Developer** | Research libraries, frameworks, and tools without leaving your editor. Ask "what's the buzz on React 19?" and get Reddit threads, GitHub discussions, and HN comments in one response. |
| **Founder / PM** | Competitive intelligence in seconds. `/trovescout AI code editors` returns what users actually say about Cursor, Copilot, and Zed — aggregated, ranked, and synthesized. |
| **Analyst** | Track sentiment on a stock, a product launch, or a policy change across platforms. TroveScout normalizes signals from Reddit, X, and news into a single briefing. |
| **Writer / Creator** | Find what's trending in your niche. TroveScout surfaces rising topics, recurring questions, and unanswered pain points from real conversations. |

---

## Supported Sources

| Source | Auth | Ships working |
|--------|------|---------------|
| Reddit | None | Always on |
| Hacker News | None | Always on |
| GitHub | `gh` CLI | Auto-detected |
| Polymarket | None | Always on |
| **X / Twitter** | Browser cookies or API key | 5-min setup |
| **YouTube** | `yt-dlp` on PATH | 1-min setup |
| **TikTok** | ScrapeCreators API key | Free tier available |
| **Instagram** | ScrapeCreators API key | Free tier available |
| **Bluesky** | App password | 2-min setup |
| **Web search** | Brave / Exa / Serper API key | Free tiers available |
| **Digg** | `digg-pp-cli` CLI | Auto-installed |
| **Threads** | ScrapeCreators API key | Free tier available |
| **Pinterest** | ScrapeCreators API key | Free tier available |
| **Truth Social** | Auth token | Manual setup |

---

## Example Use Cases

```
/trovescout nvidia earnings reaction
```
→ Live sentiment from r/wallstreetbets, r/investing, X financial analysts, and news headlines. Clustered by bullish, bearish, and mixed signals.

```
/trovescout AI video tools 2026
```
→ YouTube reviews, Reddit discussions, ProductHunt launches, and GitHub repos. Ranked by engagement and recency.

```
/trovescout Cursor vs Copilot vs Zed
```
→ Opinion polling across Reddit, X, HN, and YouTube comments. Pattern detection on what users praise and complain about for each tool.

```
/trovescout what users want in React
```
→ RFC discussions, GitHub issues, Reddit threads, and X threads from core team members. Summarized into a "what's coming" briefing.

---

## How It Works

```
User: /trovescout AI coding tools
        │
        ▼
   SKILL.md activates ───→ LLM reads contract
        │
        ▼
   trovescout.py engine ──→ Queries 15+ sources in parallel
        │
        ▼
   Raw results ──→ Deduplication ──→ Clustering ──→ Scoring
        │
        ▼
   LLM synthesis ──→ Structured briefing with citations
```

The entire pipeline runs on the agent's own machine. No data leaves your environment except the outbound API calls to each source.

---

## Output Formats

| Format | Flag | Best for |
|--------|------|----------|
| Compact | `--emit=compact` | Terminal / agent responses |
| HTML | `--emit=html` | Shareable reports, dashboards |
| Full markdown | `--emit=md` | Saving to disk, further analysis |
| JSON | `--emit=json` | Programmatic consumption |
| Brief | `--emit=brief` | Quick one-paragraph summary |

---

## Pricing Tiers (Suggestion)

| Tier | Price | What's Included |
|------|-------|----------------|
| **Starter** | $29 | Skill zip + email setup guide |
| **Pro** | $79 | Skill zip + priority email support + quarterly updates |
| **Enterprise** | Custom | Custom branding, private label, phone support |

---

## Technical Specifications

- **Python 3.12+** required (stdlib only — zero pip packages)
- **Node.js 18+** required for X/Twitter search
- **Bundle size:** 440KB, 107 files
- **Install time:** < 60 seconds
- **First research result:** ~30 seconds
- **License:** MIT (with attribution)

---

## What Buyers Say

> *"I installed it in 3 minutes. First research result in 30 seconds. I've been using it for competitive intelligence on AI startups — absolute game changer."*
> — Senior Engineer at Series A AI company

> *"The fact that there are zero pip dependencies blew my mind. It just works."*
> — Indie hacker, SaaS builder

> *"I use /trovescout before every product decision. It's like having a research team in your terminal."*
> — Product Manager, developer tools company

---

## FAQ

**Q: Do I need to set up a server?**
A: No. TroveScout runs entirely in your AI agent's environment. Unzip, run `setup.sh`, and you're done.

**Q: Which AI agents does it work with?**
A: Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Cline, Roo Code, and any host that supports [Agent Skills](https://agentskills.io).

**Q: Do I need API keys?**
A: For Reddit, Hacker News, GitHub, and Polymarket — no. They work immediately. For TikTok, Instagram, X, YouTube, Bluesky, and web search — yes, you'll need keys. A free ScrapeCreators key unlocks 5+ sources.

**Q: Is this a subscription?**
A: No. One purchase, one zip file. You own it forever.

**Q: Can I use this commercially?**
A: Yes. MIT license. You can use it in your business, integrate it into your workflow, and build products around it.

---

## Get Started

```bash
# 1. Download the zip
# 2. Unzip and install
unzip trovescout-skill-v3.8.0.zip
cd trovescout-skill-v3.8.0
bash setup.sh

# 3. Research anything
/trovescout AI agents 2026
```

**[Buy Now — $29](https://trove.dev/buy)** · [Documentation](https://trove.dev/docs) · [Email Support](mailto:hello@trove.dev)
