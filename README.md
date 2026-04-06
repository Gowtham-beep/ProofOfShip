# ProofOfShip

A verified reputation platform for vibe coders. Users connect GitHub, get their projects analyzed, and receive a ProofOfShip Score that proves they ship fast and clean.

## Features
- GitHub project analysis
- ProofOfShip Score (complexity + quality)
- Dynamic SVG card embeddable in READMEs
- Public profiles and leaderboards

## Project Structure
```
proofofship/
├── apps/
│   ├── api/                  ← Fastify server, core backend, Analysis Engine
│   ├── web/                  ← Next.js 14 app router, public profiles
│   └── card-renderer/        ← Fastify server, dedicated SVG card service
├── packages/
│   ├── analysis/             ← shared library, complexity + quality analysis
│   ├── scorer/               ← shared library, score composition logic
│   ├── github/               ← shared library, GitHub API client
│   └── types/                ← shared TypeScript types
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start infrastructure:
   ```bash
   docker-compose up -d
   ```
5. Run development servers:
   ```bash
   pnpm -r dev
   ```
