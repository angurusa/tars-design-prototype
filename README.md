# TARS Design Prototype

A standalone prototype of the TARS Mission Control application for design review. All data is mock — no backend, database, or API keys required.

## Quick Start

```bash
cd prototype
bun install
bun dev
# Open http://localhost:3000
```

## Design Controls

A floating **Design Controls** panel appears in the bottom-right corner of every page. It allows you to:

- **Switch page state** — Toggle between `loading`, `empty`, `error`, `populated`, and `streaming` for the current page
- **Apply to all pages** — Set the same state across every page at once
- **Toggle theme** — Switch between Light and Dark mode
- **TARS Agent** — Toggle the floating TARS Agent panel between `closed`, `minimized`, and `open`
- **Quick actions** — Trigger toast notifications, open the command palette (Cmd+K), or open the quick note dialog

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Greeting, quick actions, today's focus, coding tasks, quick notes, recent activity |
| Briefing | `/briefing` | Daily AI-generated briefing with markdown content |
| Standup | `/standup` | Auto-generated standup with yesterday/today/blockers |
| Work Items | `/ado` | ADO task dashboard with summary cards, 4 tabs, task detail side panel |
| Coding Agents | `/coding-agents` | Stats row, agent cards with step indicators and progress bars |
| Project Planner | `/project-planner` | Project list with card/list views |
| Project Workspace | `/project-planner/demo-1` | Split layout: chat + tabs (one-pager, work items, logs, summary) |
| Task Workspace | `/task/demo-1` | Split layout: coding agent chat + tabs (task, changes, PR, logs, summary) |
| Notes (Daily) | `/notes/daily` | 2-column: note list sidebar + markdown content |
| Notes (Weekly) | `/notes/weekly` | Same layout for weekly summaries |
| Notes (Monthly) | `/notes/monthly` | Same layout for monthly summaries |
| 1:1 Notes | `/one-on-one` | 2-panel: people/sessions sidebar + session content |
| Engage Posts | `/engage` | Post drafts from work/articles/newsletters, approval flow |
| Agents | `/agents` | Queue depth, dependency health, agent table with toggles, custom agents, recent outputs |

## States Per Page

Each page supports these visual states:

- **Loading** — Skeleton loaders matching the page layout
- **Empty** — Empty state with icon, message, and call-to-action
- **Error** — Error banner with realistic error messages
- **Populated** — Full mock data showing the intended design
- **Streaming** — Content being generated (animated indicators)

## Global Elements

- **Sidebar** — Full navigation with active states and live badge
- **Top bar** — Sidebar toggle, theme switch, user avatar
- **Command palette** — Press `Cmd+K` to open search/navigation
- **Quick note** — Press `Cmd+Shift+N` or use sidebar footer button
- **TARS Agent** — Floating chat panel, press `Cmd+J` to toggle
- **Toast notifications** — Triggered via Design Controls

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Command palette |
| `Cmd+Shift+N` | Quick note |
| `Cmd+J` | Toggle TARS Agent |
| `Cmd+/` | Toggle sidebar |

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- shadcn/ui v4 (radix-vega style, taupe base)
- OKLCH color system with full light/dark theme support
- Geist font family
