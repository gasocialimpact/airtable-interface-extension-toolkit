# GSIC Report Studio

A Georgia Social Impact Collaborative–branded reporting and data presentation
extension for **Airtable Interfaces**. Point it at any table and it produces a
polished, print-ready impact report:

- **KPI cards** — record count, sum/average of a value field, group count, and
  period-over-period movement
- **Group breakdown** — GSIC-styled horizontal bars + composition donut; click
  any group to drill the records table down to it
- **Monthly trend** — area chart over any date field
- **Records table** — GSIC table styling, native Airtable cell rendering,
  click a row to open the record, paginated
- **Date-range chips** — All time / Last 30 days / Last 90 days / Year to date
- **Print / PDF** — one click, with interactive chrome stripped via print CSS

Everything follows the shared GSIC design system: Familjen Grotesk, green
`#149a49` / purple `#4750a2` accents, the conic-gradient brand mark, and the
card/table/badge patterns used across GSIC tools. Dark mode is supported via
Airtable's appearance setting.

## Configuration

**Properties panel** (Interface Designer → select the extension element):

| Property | What it does |
|---|---|
| Report title | Heading shown next to the GSIC mark |
| Data table | The table to report on |
| Bars measure | Record count vs. sum of the value field |
| Show composition donut / monthly trend / records table | Section toggles |
| Show debug panel | Data-source troubleshooting aid |

**Report setup panel** (visible only while editing the interface): pick the
**Group by**, **Date**, and **Value to sum** fields. Choices persist per table
in the extension's GlobalConfig. If you never touch it, sensible fields are
auto-detected (first single select, first date field, first numeric field).

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
