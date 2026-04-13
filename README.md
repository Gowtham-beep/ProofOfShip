# ProofOfShip
### Prove You Ship Clean Code.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[![ProofOfShip Score](https://proofofship.dev/card/Gowtham-beep)](https://proofofship.dev/u/Gowtham-beep)

---

## 1. The Problem
The vibe coding wave (Cursor, Claude Code, Gemini) has a reputation problem. 

As software agents and LLMs become first-class citizens in our IDEs, the barrier to "shipping" has vanished. But shipping code is not the same as shipping *quality*. Currently, there is:
- **No credible way** to prove you're a high-signal "vibe coder" vs. someone just spamming `cmd+K`.
- **GitHub profiles** show activity (green squares), but say nothing about architectural debt or comprehension health.
- **Self-reported claims** in resumes or Twitter bios are meaningless without verification.

There is a missing middle ground: a platform that objectively audits agent-assisted codebases to prove: *"I built this with AI, and it’s actually solid."*

---

## 2. What It Does
ProofOfShip is an automated audit platform for modern codebases. It uses a mix of deterministic static analysis and LLM-based reasoning to score repositories based on their maintainability and architectural integrity.

**The Core Loop:**
1. **Connect GitHub:** Secure OAuth flow to access your repositories.
2. **Ingest Metadata:** Fast, non-blocking ingestion of repo size, languages, and commit velocity.
3. **Select for Analysis:** Users choose which repositories they want to put on the record.
4. **Analysis Engine:** A multi-stage pipeline runs (Comprehension check -> Debt detection -> Scoring).
5. **Verified Score:** Receive a 0-100 score + a full audit trail.
6. **Showcase:** Deploy your public profile, share a dynamic SVG card in your README, or link to a deep-dive audit page.

**Four Surfaces:**
- **Dashboard:** Manage analysis, view summary stats, and get embed codes.
- **Public Profile (`/u/:username`):** A high-level view of your top-scored projects.
- **Repo Deep-Dive (`/repo/:username/:reponame`):** The full audit trail, including LLM insights and improvement suggestions.
- **Dynamic Card (`/card/:username`):** A live SVG badge for GitHub READMEs.

---

## 3. The Score
ProofOfShip rejects absolute scoring. We believe a solo dev shipping a production-ready fintech MVP should be judged differently than a 3-person team shipping a weekend CRUD app. 

We detect a **Complexity Tier** (Trivial, Moderate, Complex) before scoring. The final score is a reflection of: *"How clean is this code relative to the complexity of what you attempted to build?"*

### Score Components
| Component | Weight | What it measures |
| :--- | :--- | :--- |
| **Comprehension Health** | 30% | Can a human (or an agent) easily understand the logic flow? |
| **Hallucination Debt** | 25% | Did agents call non-existent methods or invent library patterns? |
| **Architectural Consistency** | 20% | Do naming conventions and patterns hold across the entire codebase? |
| **Debt Trajectory** | 15% | Based on commit velocity and size—is it getting cleaner or messier? |
| **Complexity Adjustment** | 10% | A relative boost for high-complexity projects that maintained quality. |

---

## 4. Architecture
ProofOfShip is built as a TypeScript monorepo to maintain type safety across the entire stack.

```text
proofofship/
├── apps/
│   ├── api/              ← Fastify core, handles auth, DB, and queue logic
│   ├── web/              ← Next.js 14 App Router (React Server Components)
│   └── card-renderer/    ← Isolated Fastify service for high-performance SVG rendering
├── packages/
│   ├── analysis/         ← Deterministic + LLM scoring logic
│   ├── github/           ← Octokit wrapper for OAuth and metadata fetching
│   └── types/            ← Shared domain models and API schemas
```

### Key Decisions
- **Two Separate BullMQ Queues:** We split work into an `ingestion` queue (fast metadata) and an `analysis` queue (slow LLM calls). This ensures users see their repos list in seconds, even if the deep-dive analysis takes a few minutes.
- **Isolated Card-Renderer:** SVG generation is CPU-bound and cache-heavy. By isolating it on a separate service (Port 3002), we ensure that high traffic to README embeds never blocks core API response times.
- **Append-Only Scores:** We use an `ON CONFLICT DO NOTHING` strategy on the scores table. Every re-analysis inserts a new version row. This preserves the historical trajectory of a repo's quality and prevents accidental overwrites.
- **Redis Multi-Layer Caching:** README cards are cached in Redis with a 1-hour TTL for scored repos and 5-minute TTL for pending ones. The `analysis-worker` explicitly busts the cache only after a successful score write.

---

## 5. Technical Challenges & War Stories

### Challenge 1: The SVG Avatar CORS Trap
Browser security blocks external image URLs (like GitHub avatars) inside SVG `<image>` tags when embedded in a third-party site. 
**Solution:** I modified the `card-renderer` to fetch the user's GitHub avatar server-side, convert it to a Base64 string, and embed it directly into the SVG buffer before serving. This ensures the card renders perfectly across all platforms.

### Challenge 2: Reducing LLM "Drift"
Early versions of the analysis engine had a ±15 point variance when running on the same codebase due to LLM non-determinism.
**Solution:** I implemented a deterministic seed in the system prompt and locked the final score in the database using a unique constraint. If a repo has already been analyzed at a specific commit hash, we return the cached score instead of re-running the LLM.

### Challenge 3: BullMQ + Upstash Redis (The rediss:// Debug)
Configuring BullMQ to work with Upstash's TLS-only Redis (`rediss://`) was undocumented. It required setting `maxRetriesPerRequest: null` and `enableReadyCheck: false` in the IORedis client. Without these, the workers would silently fail to reconnect after the first job.

### Challenge 4: Proactive Cache Busting
The SVG cards would often show "Pending" long after the analysis was finished because of the Redis TTL.
**Solution:** I added a post-analysis hook in the worker. After the scoring loop completes, the worker resolves the `github_username` and calls `redis.del('card:{username}')`. I wrapped this in a non-fatal `try/catch` to ensure that a Redis failure never causes an analysis job to be marked as failed.

### Challenge 5: Manual OAuth + JWT Flow
I chose not to use Passport.js or Auth.js to keep the dependencies lean.
**Solution:** After the GitHub OAuth callback, the backend generates a JWT and redirects to the frontend with the token as a URL parameter. The Next.js `/auth/callback` page reads the token, persists it to `localStorage`, and performs a client-side redirect to the dashboard.

---

## 6. The Stack

| Layer | Technology | Why? |
| :--- | :--- | :--- |
| **API** | Fastify + TypeScript | High performance, schema-first, and native TS support. |
| **Frontend** | Next.js 14 (App Router) | SSR for public profiles, Client Components for interactive dashboards. |
| **Database** | PostgreSQL (Aiven) | Relational integrity is required for the scores/repos relationship. |
| **Queue** | BullMQ + Redis (Upstash) | Reliable job persistence and easy-to-configure retry/backoff logic. |
| **Analysis** | Gemini 2.5 Pro + Flash | Flash for rapid metadata processing; Pro for deep architectural reasoning. |
| **Card Rendering** | SVG + Redis Cache | Sharp at any zoom level and extremely fast to deliver. |
| **Auth** | Manual GitHub OAuth + JWT | Full control over the user lifecycle without heavy middleware. |

---

## 7. Local Setup
```bash
# Clone the repository
git clone https://github.com/Gowtham-beep/ProofOfShip
cd ProofOfShip

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Fill in: DATABASE_URL, REDIS_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GEMINI_API_KEY, JWT_SECRET

# Run in development mode
pnpm dev
```

**Services:**
- **Web Frontend:** `http://localhost:3000`
- **Core API:** `http://localhost:3001`
- **Card Renderer:** `http://localhost:3002`

---

## 8. What's Next
- [ ] **Leaderboard:** Weekly/Monthly rankings of the cleanest shippers.
- [ ] **Score History:** Visual charts showing if a repo is getting better or worse over time.
- [ ] **GitHub Webhooks:** Automated re-analysis every time you push to `main`.
- [ ] **Private Repo Support:** Paid tier for closed-source verification.

---

**Built by [Gowtham](https://proofofship.dev/u/Gowtham-beep)** — Backend + Infrastructure Engineer, Bengaluru.
