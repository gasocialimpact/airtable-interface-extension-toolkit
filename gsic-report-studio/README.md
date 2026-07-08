# GSIC Report Studio

A Georgia Social Impact Collaborative–branded **dashboard builder** for
Airtable Interfaces. A dashboard is a grid of independent sections — add as
many as you need, each with its own table, grouping, and measure:

- **KPI cards** — record count, sum/average of a value field, group count, and
  period-over-period movement
- **Bar breakdown** — GSIC-styled horizontal bars for any groupable field
- **Donut** — composition chart, independently grouped from the bars
- **Trend line** — monthly area chart over any date field
- **Records table** — native Airtable cell rendering, row click opens the
  record, paginated

Sections grouped by the same field cross-filter: click a bar or donut segment
and matching tables narrow to that group. Global date-range chips (all time /
30d / 90d / YTD) filter every section at once, and **Print / PDF** produces a
clean export with the editing chrome stripped.

Everything follows the shared GSIC design system: Familjen Grotesk, green
`#149a49` / purple `#4750a2` accents, the conic-gradient brand mark, and the
card/table/badge patterns used across GSIC tools. Dark mode is supported via
Airtable's appearance setting.

## Configuration

**Properties panel** (Interface Designer → select the extension element):

| Property | What it does |
|---|---|
| Dashboard title | Heading shown next to the GSIC mark |
| Default table for new sections | Pre-fills newly added sections |
| Show debug panel | Data-source troubleshooting aid |

**Section editing** (while the interface is in edit mode): every section shows
a settings strip — table, group field, date field, measure (record count, or
pick a numeric field to sum), custom title, reorder arrows, half/full width
toggle, and remove. An **Add section** bar sits at the bottom of the grid.
The layout persists in the extension's GlobalConfig and syncs to all viewers.
A fresh install starts with a sensible auto-detected layout (KPIs, bars,
donut, trend, table).

> Fields must be added as **data sources** for the extension in Interface
> Designer or they won't appear (and can't be read). If something looks empty,
> flip on the debug panel.

## Develop & deploy

This project is already linked to the **Reporting System** custom extension in
Builder Hub (`.block/remote.json` → `blkBiwWkCY0yZJc3c`), and the blocks CLI is
a local dev dependency. One-time auth, then release:

1. `npx block set-api-key` — paste a personal access token with the
   `block:manage` scope (create one at airtable.com/create/tokens).
2. `npx block run` to develop live (enable Development mode on the element in
   your interface), or
3. `npx block release` to publish — the extension then appears under
   **+ Add element → Custom extension → Reporting System** in any interface
   where you have creator access.

Requires Node 22+. `npm install --legacy-peer-deps` first on a fresh clone.

## Browser preview (no Airtable needed)

```bash
./preview/build.sh
open preview/dist/index.html
```

Renders the extension against sample GSIC Programs data with the SDK mocked —
useful for iterating on styling without a `block run` session.
