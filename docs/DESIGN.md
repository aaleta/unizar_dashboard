# Design system

What to know before drawing or coding a new screen. It describes what is in
`web/src` today; if something here disagrees with the code, the code wins.

One idea underpins all of it: **this site publishes official university data,
and its only asset is being believed.** Every rule below exists so the screen
says nothing the data doesn't.

---

## 1. The colour contract

The rule that governs the rest. **Colour never lies.** Four roles, never mixed:

| Role | What it encodes | Where it lives |
|---|---|---|
| **Navy** | Structure and chrome: headers, active tab, buttons, links, rules. **Never a magnitude.** | `--navy*` in `theme/tokens.css` |
| **Ramp** | Difficulty, and only difficulty (non-pass rate). | `theme/difficulty.js` |
| **Grey** | Counts and quantities (enrolments, collaboration weight). A quantity is not a difficulty. | `--count-*` |
| **Grades** | The Not-sat → Distinction breakdown, nothing else. Categorical, not a scale. | `theme/gradePalette.js` |

**Gold** (`--gold*`) is decoration and the Fight Mode winner — not data. Its
only structural use is the 2px rule under the header.

For any new colour, ask: *is this structure, difficulty, a count, or a grade
category?* If it is none of the four, it almost certainly needs no colour.

**No component writes a raw colour.** If a needed colour is not in
`tokens.css`, add it to `tokens.css`.

### The difficulty ramp

Five bands by non-pass rate, from `asequible` (≥0%) to `muy dura` (≥45%). Each
band ships three tones, and that is not redundancy:

- `fill` — surfaces: the dot, the bar.
- `ink` — the large figure (23px), where 3:1 is enough.
- `inkSmall` — the small figure (11–13px), darkened to 4.5:1 on paper **and**
  on white.

Using `ink` on an 11px figure is the classic mistake: it lands at 3.5:1 and
stops being readable.

---

## 2. Typography

Three families, three roles that never cross:

- **Spectral** (`--font-serif`) → headlines, section headers, subject names.
- **Public Sans** (`--font-sans`) → body, UI labels, buttons.
- **IBM Plex Mono** (`--font-mono`) → **all** figures and percentages, plus
  eyebrows, metadata and codes.

The mono is the point: **the numbers are the product.** In mono they line up in
a column, compare at a glance, and don't shift as digits change. A percentage
set in Public Sans is an error, not a nuance.

Two global classes (`theme/typography.css`), no need to redefine them:

- `.num` — any visible figure. Mono, tabular, weight 600.
- `.eyebrow` — small uppercase label naming a block.

Headlines have no class: components apply `var(--font-serif)` directly, along
with their own size and leading.

Fonts are **self-hosted** in `assets/fonts/` (`theme/fonts.css`). No
third-party origins: this is a public university site and visitors' IPs are not
given away.

---

## 3. Surfaces, lines and depth

The material is **paper**, not Material Design.

- `--paper` (`#f8f5ee`) is the app background; `--surface` (white) is the card.
- `--navy-surface` (`#1b3559`) is the blue of the large fields: header,
  sidebar, home hero, degree-map totals band. They all read the same token
  because they sit next to each other, and two different blues show the seam.
- Lines do nearly all the separating: there are nine `--line-*` tokens, one per
  context. Before inventing a border, check whether one already exists.
- **Shadows are deliberately scarce**: only three (`--shadow-card`,
  `--shadow-sheet`, `--shadow-medallion`). A card separates with a border, not
  a shadow.
- No gradients.

Radii: `--radius-row` 8px, `--radius-control` 9px, `--radius-card` 11px,
`--radius-card-lg` 14px, `--radius-sheet` 16px, `--radius-pill` 999px.

---

## 4. Accessibility: the non-negotiables

**Contrast.** Normal text at 4.5:1 minimum, against the background it actually
lands on. There are only **two** muted greys (`--ink-muted`, `--ink-soft`), and
that is not for lack of trying: on this paper, above 4.5:1 no more fit without
collapsing into each other. Hierarchy is carried by size and weight, not by
shade. There is a checker in `theme/contrast.js`.

The ratios annotated in `tokens.css` are measured **on paper**, where almost
everything lands. On `--surface-sunken`, which is darker, the muted greys stop
qualifying: `--ink-soft` drops to 4.14:1 and `--ink-muted` to 4.46:1. There,
step up to `--ink-2`. That is the case of the timetable's day headers, and the
reason the rule says *the background it actually lands on*: the token doesn't
know where it will be used.

**One `<main>` per page.** The shell (`AppShell`) already opens one, so a view
that opens another leaves two `main` landmarks in the document. Views start
with a `<div>` or a `<section>`.

**ARIA copied without looking doesn't work.** `aria-sort` belongs to `th` and
`columnheader`: on a `<button>` nobody reads it. A sorting control says what it
does with `aria-pressed` and an explicit label ("Ordenar por X", or "X,
ordenado de mayor a menor" when active). See `UiSortHeader`.

**44px touch targets** (`--touch-target`), list rows included. Short row
content is no reason to shrink it. If the design asks for 31px rows and
accessibility asks for 44, accessibility wins: the list gets longer and nobody
misses the tap.

Also: an image's `alt` is information, not decoration, and data SVGs carry real
text (selectable, screen-readable) instead of drawn labels.

---

## 5. The primitives

They live in `web/src/components/ui/`. **Before creating a new component, rule
these fifteen out.** They are all visible together, live, at `/dev/ui`
(`views/dev/UiGallery.vue`, development only) — that is the inventory: if a
primitive isn't there, it doesn't exist.

| Primitive | For |
|---|---|
| `UiCard` | White bordered container. The default box. |
| `UiKpiCard` | A screen's headline figure, with its label. |
| `UiStat` | Figure + label in summary rows under the title. |
| `UiSubjectCard` | Subject card. |
| `UiLinkRow` | List row with `lead` / centre / `trail` and chevron. 44px. |
| `UiSectionHeader` | Section header. |
| `UiSortHeader` | Sortable table header. |
| `UiSearchField` | Search box. |
| `UiChip` | Selectable filter. |
| `UiPill` | Non-clickable label (mono, uppercase). |
| `UiDifficultyDot` | The ramp's coloured dot. |
| `UiCountBar` | Grey count bar. |
| `UiMeterRow` | Row with a magnitude bar. |
| `UiCallout` | Highlighted notice. |
| `UiIcon` | The system icons. |

Charts: `components/charts/LineChart.vue`, hand-written SVG. **chart.js is not
used for new design-system charts** even though it is a dependency: in SVG text
is text, and axes take four attributes instead of half an hour of theming
options.

---

## 6. Shell and navigation

`components/layout/AppShell.vue` assembles the same eleven screens at every
width. Two variables place the whole grid: `--content-max` is `520px` on
mobile and becomes `--content-max-desktop` (`1196px`) from 900px up.

- **Mobile**: `AppHeader` (navy brand + 2px gold rule) → `AppPageTitle` →
  `<RouterView/>` → `BottomTabBar` (three tabs + "Más").
- **Desktop**: `AppSidebar` replaces the header and the tab bar with a
  persistent navy rail; the title band gains its `meta.eyebrow`, and the
  sidebar footer states how fresh the active screen's data source is.

Each screen's **title comes from its route `meta`**, not from the view, so the
whole list reads in one file (`router/index.js`). A view only refines it with
`usePageHeader` when the title depends on data (a subject's name, say).

Scrolling is **the document's**, not an inner container's: that is what lets
the mobile address bar retract.

Tabs: **Inicio** (`/`), **El Grado** (`/grado`, which absorbs `/asignatura` and
`/curso`) and **Optativas** (`/optativas`). Everything else lives in the "Más"
sheet: Monta tu horario, Profesorado, Fight Mode, Fuentes y metodología, Acerca
de.

Old routes are kept as redirects in `router/index.js`. They have been published
for a long time and stray links exist: **do not delete them.**

**Only one screen genuinely diverges between mobile and desktop**: the faculty
network. On mobile it goes person by person (`views/Faculty.vue`); on desktop
it is a 267-node graph (`components/network/ProfGraph.vue`, lazily loaded
because `vis-network` weighs half a megabyte). Everything else is the same
screen at another width, and CSS handles that. The switch is `useViewport()`, a
single `matchMedia` at 900px. **Before adding a consumer, check the case isn't
solved by a media query.**

---

## 7. Code conventions

**Prettier decides formatting, not the hand.** `npm run format` leaves the tree
as it is: everything under `src/` already passes `prettier --check`. Nothing
below needs memorising; you write, then you format.

- **4-space indent**, double quotes, semicolons, no trailing comma, no parens
  around a single arrow argument (`event => …`). It's in `.prettierrc.json`.
- **80-column lines**; what doesn't fit, Prettier breaks.
- In CSS, **one property per line with a blank line between them** and a space
  after the colon (`display: inline-flex;`). Blank lines between properties are
  preserved; the one after the opening brace is not.
- A long comment **at the end of a declaration** makes Prettier shatter the
  declaration. If it doesn't fit on the line, put it above.
- Order inside a `.vue`: `<script setup>`, `<template>`, `<style scoped>`.
- Comments explain **why**, not what. They are written in Spanish, in prose. A
  comment narrating project history ("this used to be…", "the handoff asked
  for…") is noise: describe the current state or write nothing.

---

## 8. What NOT to do

- Write a colour that isn't in `tokens.css`.
- Use the difficulty ramp for anything but difficulty, or paint a subject red
  for being heavily enrolled.
- Set a figure in anything but the mono.
- Go below 44px on a touch target, or 4.5:1 on text.
- Underline links permanently. It was tried inside prose (`p a`, `li a`) and
  with this many links the page smears into stripes. Links are distinguished by
  the navy. What that leaves open — colour as the only signal — is unresolved;
  the sensible exits are a navy further from the body grey, or underlining only
  on `:hover` and `:focus-visible`.
- Add a shadow where a border suffices, or a gradient anywhere.
- Round, estimate or "improve" a figure in the presentation layer: whoever
  paints receives the number already formatted. What gets counted, and against
  which denominator, is decided in `utils/metrics.js` and does not change
  because the design changes.
- Load fonts, icons or scripts from a third-party origin.

---

## 9. Where to look

| File | Contents |
|---|---|
| `web/src/theme/tokens.css` | Colour, radii, shadows, spacing. The colour contract is at the top. |
| `web/src/theme/typography.css` | Type scale and global classes. |
| `web/src/theme/fonts.css` | The three families, self-hosted. |
| `web/src/theme/difficulty.js` | The ramp. Single definition for the whole site. |
| `web/src/theme/gradePalette.js` | The six grade colours. |
| `web/src/theme/contrast.js` | Contrast checker. |
| `web/src/components/ui/` | The fifteen primitives. |
| `web/src/components/layout/` | The shell. |
| `web/src/views/dev/UiGallery.vue` | The live inventory → `/dev/ui`. |
| `web/src/router/index.js` | Routes, screen titles and old redirects. |
| `web/src/utils/metrics.js` | What is counted, and against which denominator. |

See [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md) for how to run, build and deploy
the site.
</content>
