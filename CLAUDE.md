# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GovSense is an AI research assistant (OSS alternative to NotebookLM/Perplexity/Glean) that connects LLMs to internal knowledge sources with real-time team collaboration. This is a fork/rebrand as **GovSense** — a Vietnamese government internal AI assistant. Brand constants live in `surfsense_web/lib/brand.ts`.

## Monorepo Structure

| Directory | Stack | Package Manager |
|-----------|-------|-----------------|
| `govsense_backend/` | Python 3.12+, FastAPI, SQLAlchemy (async), Celery, LangGraph | `uv` |
| `surfsense_web/` | Next.js 16, React 19, TypeScript, Drizzle ORM, Electric SQL | `pnpm` |
| `surfsense_browser_extension/` | Plasmo (Manifest v3), React 18 | `pnpm` |

## Common Commands

### Backend (`govsense_backend/`)
```bash
uv pip install --system -e .          # Install dependencies
python main.py --reload               # Dev server (port 8000)
alembic upgrade head                  # Run migrations
alembic revision --autogenerate -m "" # Generate migration
ruff check --fix . && ruff format .   # Lint & format
celery -A app.celery_app worker --loglevel=info --concurrency=1 --pool=solo  # Task worker
```

### Frontend (`surfsense_web/`)
```bash
pnpm install                  # Install dependencies
pnpm dev                      # Dev server (webpack, port 3000)
pnpm dev:turbo                # Dev server (turbopack, faster)
pnpm build                    # Production build
pnpm format                   # Biome lint check
pnpm format:fix               # Biome auto-fix
pnpm db:generate              # Generate Drizzle migrations
pnpm db:migrate               # Apply Drizzle migrations
pnpm db:studio                # Open Drizzle Studio
```

### Browser Extension (`surfsense_browser_extension/`)
```bash
pnpm install && pnpm dev      # Development
pnpm build && pnpm package    # Build for distribution
```

### Docker
```bash
docker compose up              # Full stack (PostgreSQL+pgvector, Redis, Electric SQL, backend, frontend)
docker compose -f docker-compose.quickstart.yml up  # All-in-one quick start
```

## Code Style & Linting

- **Python**: Ruff (line-length 88, indent 4 spaces, double quotes). Config in `pyproject.toml`.
- **TypeScript/JS/JSON/CSS**: Biome (tabs, double quotes, semicolons, line-width 100). Config in `biome.json`.
- **Commits**: Conventional commits enforced via Commitizen (`feat:`, `fix:`, `refactor:`, etc.)
- **Pre-commit hooks**: Ruff, Biome, Bandit (security), detect-secrets. Config in `.pre-commit-config.yaml`.

## Architecture

### Backend
- **Entry**: `main.py` → uvicorn → `app/app.py` (FastAPI with lifespan)
- **Routes**: `app/routes/` — one file per feature/connector (~30+ route files)
- **Database**: PostgreSQL + pgvector via SQLAlchemy async. Models in `app/db.py`. Migrations via Alembic (`alembic/versions/`)
- **Auth**: fastapi-users (JWT + OAuth). RBAC system for search spaces.
- **AI Agents**: LangGraph-based deep agents in `app/agents/`. Main chat agent in `app/agents/new_chat/`
- **Task Queue**: Celery + Redis for document processing, connector indexing, chat streaming, podcast generation (`app/tasks/`)
- **LLM Integration**: LiteLLM (100+ LLMs), sentence-transformers (embeddings), rerankers (Flashrank/Pinecone/Cohere)
- **Windows note**: Uses `WindowsSelectorEventLoopPolicy` for asyncpg compatibility

### Frontend
- **App Router**: `app/` with route groups — `(home)/` for landing, `dashboard/[search_space_id]/` for main app
- **Real-time sync**: Electric SQL + PGlite for client-side PostgreSQL replication
- **State**: Jotai (atomic), Zustand (global), TanStack Query (server)
- **Chat UI**: assistant-ui library + Vercel AI SDK
- **I18n**: next-intl with locales `vi` (default), `en`, `zh`. Messages in `messages/`. Routing in `i18n/routing.ts`
- **Docs**: Fumadocs in `content/docs/`. Config in `source.config.ts`
- **UI components**: Shadcn/ui (New York style) + Radix UI + Tailwind CSS

### Database
- PostgreSQL 14 with pgvector extension
- **Backend ORM**: SQLAlchemy async + asyncpg
- **Frontend ORM**: Drizzle (schema in `app/db/schema.ts`)
- **Real-time**: Electric SQL (port 5133) provides logical replication to frontend

## Project-Specific Rules (from `.rules/`)

- **Preserve all source entries** in search results — do not deduplicate sources (breaks citation tracking)
- **Always provide unique `key` props** when mapping arrays to React elements
- **Never commit `.env` files** to the repository
- **Use consistent container image sources** in Docker configs
