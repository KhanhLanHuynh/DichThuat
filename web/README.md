# DichThuat Web App

Translation workbench for Buddhist Chinese → Hán-Việt → Vietnamese.

## Prerequisites

- Node.js 20+ (LTS)

## Setup

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Default login

When `AUTH_DISABLED` is not set:

- Username: `admin`
- Password: `dichthuat` (or `AUTH_PASSWORD` env)

## Data layout

Corpus files live under `web/data/` (configurable via `CONTENT_ROOT`):

| Path | Contents |
|------|----------|
| `web/data/sources/` | Chinese source (`.zh.md`) |
| `web/data/translations/` | Hán-Việt (`.hv.md`) and thuần Việt (`.vi.md`) |
| `web/data/projects/` | Project manifests (`.yaml`) |
| `web/data/glossary/` | Terminology YAML (`terms.yaml`, `{series}.yaml`) |

Notes and Cursor rules remain at repo root (`REPO_ROOT`).

## Project manifests

Add a manifest in `web/data/projects/{id}.yaml`:

```yaml
id: my-project
title: "Chapter title"
series: my-series
source: sources/.../ch01.zh.md
hv: translations/.../ch01.hv.md
vi: translations/.../ch01.vi.md
glossary:
  - glossary/terms.yaml
  - glossary/{series}.yaml
```

Paths in manifests are **logical** (resolved against `CONTENT_ROOT` for `source`, `hv`, `vi`, and `glossary`).

**One line = one paragraph.** ZH body, HV, and VI must have the same line count. Translation files are plain text bodies in `.md` files (no Markdown headings in the body).

## Upload source files

In the editor TopBar, use **Upload** (before the source file selector) to add `.zh.md` files under `sources/{series}/`. If the project manifest has a `volume`, uploads are placed under that volume by default.

## Docker

From repo root:

```bash
docker compose up --build
```

- `REPO_ROOT=/data` — repo root (notes, `.cursor/` prompt context)
- `CONTENT_ROOT=/app/data` — corpus volume (`./web/data` mounted; sources, translations, projects, glossary)

## Machine Translate

Machine translation uses the **Cursor SDK** (local agent, `composer-2.5`). Set `CURSOR_API_KEY` in `web/.env.local` — the key is server-side only and is not entered in the UI.

1. Open [Cursor Dashboard → API Keys](https://cursor.com/dashboard?tab=api-keys)
2. Click **New API Key** and copy the value
3. Add to `web/.env.local`:

```bash
CURSOR_API_KEY=cursor_your_key_here
```

Optional:

```bash
CURSOR_MODEL=composer-2.5
```

The Next.js dev server must run on a machine with the repo checked out (`REPO_ROOT=..`). Cursor IDE does not need to be open. Each chapter translation runs one local agent job and fills all paragraphs when complete.
