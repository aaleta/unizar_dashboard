# Handoff: Grado en Física — Mobile Redesign

> Design handoff for **Claude Code**. This document + the `prototype/` folder are everything you need to
> implement the new **mobile** experience for the Universidad de Zaragoza Physics-degree stats dashboard.

---

## 1. Overview

This is a **mobile-first redesign** of the existing "Grado en Física · Unizar" statistics dashboard
(the app that turns *"which subjects are hard?"* from corridor rumour into open data). 70% of traffic is
mobile, and the current app is desktop-shaped, so this redesign gives every route a phone-native shape.

**Scope of THIS task:** implement the mobile screens only, on a **new `mobile` branch**. The desktop
version is a later, separate effort — leave it alone. Nothing here changes the data, the metrics, or the
features: this is a **re-organisation + re-skin + mobile navigation layer** on top of what the app already
computes.

- **Existing codebase:** `github.com/aaleta/unizar_dashboard` — a **Vue** single-page app. The data
  scraping, metric definitions, and per-route components already exist (see the component map in §6).
- **Your job:** recreate the screens described here **in that Vue codebase, reusing its existing stores,
  data layer, and metric functions.** Do not re-derive any statistic — every number in the mocks already
  has a single source of truth in the app. Build the mobile UI/UX and wire it to what's there.

---

## 2. About the design files

The files in `prototype/` are **design references authored in HTML**, not production code to copy.
They are a fast, self-rendering prototype showing the intended **look, layout, copy, and behaviour**.

- `prototype/mobile-screens.dc.html` — the full design canvas. Open it in a browser; it renders itself.
- `prototype/ios-frame.jsx`, `prototype/support.js` — the prototype's device-bezel + runtime. **Prototype
  scaffolding only — do NOT port these.** The iPhone bezel, the `54px` status-bar spacer, and the canvas
  page chrome are presentation, not part of the app.

**Recreate the designs in the target codebase's own environment** (Vue SFCs, its component library, its
CSS/token conventions) — do not embed the HTML.

### What to IGNORE inside the HTML file
The canvas is organised as a series of "turns" (design iterations) stacked newest-first. For
implementation you only care about the **phone screen inside each `<x-import ... IOSDevice>`**. Ignore:
- Every `<section id="tN">` wrapper, `TURN N` badge, `<h1>`/intro paragraph, and the grey **"WHAT'S ON IT"**
  side-panel — those explain the design to a human reviewer.
- **Turn 1 options `#1a` (Registro/Ledger) and `#1b` (A ojo)** — these are *rejected* directions.
  Only **`#1c` (Mapa del grado / "The Spine")** was chosen.
- Any "Try next:" footer lines.

Each implementable screen is tagged with a stable id (`#1c`, `#2a`, …). §6 maps every id to a route.

---

## 3. Fidelity

**High-fidelity.** Colours, typography, spacing, copy, and layout are final and intended to be matched
closely. Recreate them pixel-faithfully using the codebase's patterns. Two caveats:

- The mocks are drawn at a fixed **402px** iPhone width. The real app must be **fluid/responsive**
  (≈320px → tablet), not locked to 402px. Treat the mock as the canonical *proportions and hierarchy*.
- Charts in the mock are hand-drawn SVG/`<div>` bars for illustration. In the app, feed the **real data**
  into the existing chart components; keep the palettes specified in §5.

---

## 4. The one rule that governs everything: the colour contract

This product's credibility rests on **honest data encoding**. There are three separate colour roles and
they must never bleed into each other:

1. **Brand navy `#223D71`** (Unizar corporate blue, PANTONE 653C) = **structure & chrome ONLY.**
   Headers, the bottom-nav active state, primary buttons, links, section eyebrows, structural counts
   (e.g. "*TRONCALES · 12*"), the timeline spine. **Navy NEVER encodes a data magnitude.**

2. **The "effort" / difficulty ramp** (warm red→green) = **how hard a subject is** (its *no-superan* rate).
   Higher failure = redder. This is the *only* thing that rides the ramp.

3. **Heraldic gold `#C9A24B` / `#A8813A`** = decoration + the **Fight-Mode winner** highlight. Not data.

Two more encodings that must stay OFF navy and OFF the ramp:
- **Neutral grey bars `#A89A86`** on track `#EFE7D7` = plain *counts/quantities* (enrolment popularity,
  collaboration weight) — a quantity is not a difficulty, so it gets grey.
- **Grade-distribution palette** (categorical, see §5) = the No-presentado→MH breakdown only.

If you're ever unsure what colour something should be, ask: *is this structure (navy), difficulty (ramp),
a plain count (grey), or a grade category (grade palette)?*

---

## 5. Design tokens

### Fonts (Google Fonts)
| Role | Family | Weights | Used for |
|---|---|---|---|
| Serif | **Spectral** | 600, 700 | Screen titles, section headers, subject/course names |
| Sans | **Public Sans** | 400/500/600/700 | Body, UI labels, buttons, nav labels |
| Mono | **IBM Plex Mono** | 400/500/600 | **All numerals & %**, eyebrow labels, metadata lines, codes |

Eyebrow/label convention: IBM Plex Mono, 8.5–9px, `letter-spacing:.4–.6px`, UPPERCASE, muted colour.

### Type scale (at 402px — scale fluidly, keep the hierarchy)
- Screen H1 (Spectral 700): **22–27px**
- Section header (Spectral 600): 15–16px
- Card title / subject name (Spectral 600): 14–15px
- Body text: 11–13px
- Big KPI numeral (Mono 600): 23–24px · in-card metric numeral: 15–16px
- Eyebrow label (Mono): 8.5–9px · nav label: 9px · footnote (Mono): 8.5px

### Colours

**Brand / chrome**
- Navy `#223D71` · navy header subtitle `#AEB9D1` / eyebrow `#AEB9D1` · navy-on-light body `#3A4667`
- Gold (bright) `#C9A24B` · gold (text/accent) `#A8813A`

**Surfaces & lines**
- App / screen background: `#F4EFE6` (warm paper)
- Card: `#FFF`, border `#E7DED0`, radius 8–14px, shadow `0 1px 3px rgba(35,32,27,.05)`
- Optativa card (visually distinct): background `#FCFAF5` **or** transparent, **dashed** border `#CDBF9E`
- Structural info callout: bg `#EEF0F5`, border `#DFE3EC`, text `#3A4667`
- "Hard / warning" callout: bg `#F9ECE7`, border `#F0D6CB`, heading `#8F3521`, body `#9C6B5C`
- Small-cohort/attention accent: `#C89A2E` (the ⚠ glyph), notes `#A08A3E`
- Divider lines: `#E7DED0` / `#F0EADD` (inside cards) / `#E7E0D2` (footer rule)

**Text**
- Primary `#23201B` · secondary `#4A463E` · muted `#6E675C`, `#8A8275` · faint mono `#A49A86`, `#948C7E`
- Placeholder / to-fill `#9A9182`

**Difficulty ("effort") ramp** — map from *no-superan* %. Fills use the lighter tone; the numeral text uses
the darker readable tone next to it. Centralise this as **one** function (matches the app's "one
definition" principle) and align thresholds with any scale the app already ships.

| no-superan | dot / bar fill | numeral text |
|---|---|---|
| ≥ ~45% (hardest) | `#9A3B23` | `#9A3B23` / `#8F3521` |
| ~33–44% | `#C4642F` | `#C4642F` |
| ~22–32% | `#D69A46` | `#A8813A` |
| ~15–21% | `#D8C168` / `#C9B06A` | `#8A7A3F` |
| ~8–14% | `#8AA07A` | `#6F8A5F` |
| < ~8% (easiest) | `#8AA07A` | `#6F8A5F` |

**Grade-distribution palette** (categorical — the stacked No-pre→MH bar only)
- No presentados `#B9B0A1` · Suspensos `#B5482F` · Aprobados `#6E9A6A`
- Notables `#4E86A0` · Sobresalientes `#7E6BA6` · Matrícula de honor `#D2A03F`

**Neutral count bars:** fill `#A89A86` on track `#EFE7D7`.

### Radii / shadows / spacing
- Radii: cards 11–14px · small tags 5–8px · buttons 9px · pills/chips `999px`
- Shadows: card `0 1px 3px rgba(35,32,27,.05)` · roll-up sheet `0 14px 34px rgba(20,18,14,.30)` ·
  VS medallion `0 2px 6px rgba(34,61,113,.28)`
- Screen content padding: **16px** horizontal · section vertical rhythm 16–18px · card padding 12–15px ·
  row gaps 6–9px
- **Touch targets ≥ 44px** everywhere (nav items, list rows, sheet rows, chips).

---

## 6. Navigation & screen map

### Global screen shell (every screen)
Top → bottom, inside the phone viewport:
1. *(Prototype only: 54px status-bar spacer — replace with the app's real safe-area handling.)*
2. **App header** — navy `#223D71` band. Either the home identity (logo "F" gold tile + "Física · Unizar")
   or a **back chevron + eyebrow + title** on inner screens (eyebrow = parent route in mono caps, e.g.
   "EL GRADO", title in Spectral 14px white).
3. **Scrollable body** — `#F4EFE6`, the screen content; vertical scroll only.
4. **Bottom tab bar** — fixed, see below.

### Bottom tab bar (persistent, 4 tabs)
White `#FFF`, top border `#E2D8C6`, height **62px**. 20px line-SVG icon + 9px label per tab.
Active = navy `#223D71`, label weight 600. Inactive = `#A29A8A`, label weight 500.

| Tab | Icon | Destination |
|---|---|---|
| **Inicio** | house | Home `#8a` |
| **El Grado** | stacked layers | Mapa del grado / Spine `#1c` (the redesigned main screen) |
| **Optativas** | bookmark | Optativas `#4a` |
| **Más** | 3-dot list | **Opens the "Más" roll-up** (action sheet — NOT a route change) |

### Route ↔ screen ↔ existing Vue component

| Screen (mock id) | Route (suggested) | Purpose | Maps to existing component(s) |
|---|---|---|---|
| Inicio `#8a` | `/` | Degree-wide landing: KPIs, trends, freshness | `Home.vue` (DegreeKpiRow · AdmisionGrades · WorstSubject · YearsTroncComparation) |
| **Mapa del grado / Spine `#1c`** | `/grado` | **Chosen main screen** — whole degree by year + core/elective split | new organising view over the degree/course data |
| Vista de curso `#3a` | `/grado/:curso` | One year's stats + its subjects | `Course.vue` (DifficultyOfSubjectsYear · SubjectCard) |
| Ficha de asignatura `#2a` | `/asignatura/:code` | Single-subject detail | Subject panels: SubjectKpiRow · GradeDistribution · SubjectEvolution · SubjectVsCourse · TeachingInfo |
| Asignaturas `#9a` | `/asignaturas` | Flat, sortable master list of all 53 | `Subjects.vue` |
| Optativas `#4a` | `/optativas` | Elective browser (choose-your-set) | `Optatives.vue` (GeneralOptEnrolled · SubjectCard) |
| Profesorado `#6a` | `/profesorado` | Teaching-collaboration, mobile ego-network | `NodesLinks.js` / `ProfGraph` (same data model) |
| Fight Mode `#5a` | `/fight` | Two subjects head-to-head | `FightPanel` + `FightModeResult` |
| Metodología `#7a` | `/metodologia` | Indicator definitions, sources, limitations | `Methodology.vue` |
| Acerca de `#10a` | `/acerca` | Who/how/why, repo link, disclaimer | **new route** |
| "Más" roll-up `#11a` | — | Action sheet linking to the 4 secondary routes | **new UI element** |

**Note on El Grado:** the "El Grado" tab lands on the **Spine (`#1c`)**. The flat **Asignaturas list
(`#9a`)** is the same data with zero structure — reach it as a view toggle / secondary link from El Grado
(e.g. a "ver como lista" affordance). Spine = overview; list = ranked table.

---

## 7. Screens in detail

Open the matching id in `prototype/mobile-screens.dc.html` for exact pixels. Below is the intent, layout,
key content, and states for each. Copy is Spanish and **final** — keep it verbatim.

### 7.1 Mapa del grado / "The Spine" — `#1c` (main screen, `/grado`)
The organising idea of the whole app: you see the shape of the degree at once.

- **Header:** home identity (gold "F" tile + "El Grado en Física") + a mono stat row: `4 CURSOS ·
  33 TRONCALES · 21 OPTATIVAS`.
- **Body = a vertical timeline ("spine").** A 2px line `#D7CDB9` runs down the left; each **year** is a
  navy numbered node (`1`–`4`, 21px circle, Spectral).
- **Per year block:** `Primero` (Spectral 18px navy) + inline caption "aprueban 74% de media". Then a
  labelled group header row: `TRONCALES · 12` (navy mono) — divider — `% que no aprueba` (faint mono,
  right). Then subject rows: white card row, radius 8px, `[difficulty dot] name [no-superan %]`. Show the
  top few, then a `＋ 8 troncales más` muted link.
- **Tercero onward** adds an **OPTATIVAS · 21** subgroup (gold eyebrow `#A8813A`, dashed-border rows,
  hollow difficulty dots) — this core/elective split is the point of the direction.
- **Cuarto:** collapsed into a single info card `#EEF0F5`: "6 troncales · aprueban **94%** de media · el
  curso más amable".
- **Interactions:** tap a **year node/title** → Vista de curso (`#3a`). Tap a **subject row** → Ficha
  (`#2a`). Difficulty dot = filled for troncal, hollow ring for optativa.

### 7.2 Inicio — `#8a` (`/`)
"A dashboard opens with numbers, not charts."

- **Navy hero** (extends the header): identity, hamburger, title "Estadísticas del Grado en Física",
  one honest line about official Unizar data, faint concentric-circle motif.
- **4 KPI cards** (2×2 grid): *Nota de corte* `10,375` (▼1,79 vs 2024), *Aprueban* `82%` (▲2pp), *No
  presentados* `8%` (▼1pp), *Convocatorias* `1,34`. Card = white, mono 24px numeral, coloured delta
  (`#B5482F` down / `#4A6A44` up), muted sublabel.
- **Notas de acceso** line chart (2020–2025): two lines — *Nota media* `#4C6699`, *Nota de corte*
  `#C4642F` — + a takeaway line.
- **Worst-subject callout** (warning palette): big `53% no superan` + "LA MÁS DURA AHORA MISMO · Álgebra
  II" → links to its Ficha.
- **Pass-rate trend** bar chart (12 years, neutral bars) "¿Aprueba más gente que antes?".
- **Per-source freshness** list: each dataset with its real last course (Calificaciones 2024-2025, Tasas
  2024-2025, Notas de corte 2025, Profesorado 2026-2027). Honest disclaimer footer.

### 7.3 Vista de curso — `#3a` (`/grado/:curso`)
Layer between the map and a subject. (Tercero shown because it's the first year with optativas.)

- **Header** back-chevron, eyebrow "EL GRADO", title "Tercero · vista de curso".
- Year badge + "Tercero" + summary stats row: `76% aprueban · 9% no se presentan · 6 troncales · 21
  optativas` (the troncal count in navy, optativa count in gold).
- **"Dificultad de las troncales"** — horizontal bars on the difficulty ramp, sorted by no-superan.
- **TRONCALES · 6** section: one `SubjectCard` each (solid white) — name, matriculados, big no-superan %,
  footer stats (aprueban, no pres.), "Ver ficha →". `＋ 3 troncales más`.
- **OPTATIVAS · 21** section: gold eyebrow, dashed cards, "también se ofertan en 4º" note + "Ver todas
  las optativas →". `＋ 19 optativas más`.

### 7.4 Ficha de asignatura — `#2a` (`/asignatura/:code`)
Every block maps 1:1 to a panel that already exists.

- **Header** eyebrow "EL GRADO · PRIMERO", title "Ficha de asignatura".
- Tag row: `TRONCAL`, `1º CURSO`, `CÓD. 26907` (pill outlines). Title "Álgebra II" (Spectral 27px).
  **Verdict banner** (warning palette): "La troncal más dura del grado ahora mismo / 1ª de 12 troncales…".
- **INDICADORES** — a **year selector** (`2024-2025 ▾`) + 6 KPI cards (2 cols): No superan `61%` (▲19pp),
  Aprueban `39%` (▼18pp), No presentados `23%`, Convocatorias `1,57` (official), Matriculados `139`
  (3yr avg 127), Sob.+MH `1%`. Deltas vs the 3-year average.
- **Distribución de calificaciones** — one stacked horizontal bar in the **grade palette** + a 2-col
  legend with counts (No pre 32, Susp 53, Apro 42, Notable 10, Sob 1, MH 1).
- **No superan, curso a curso** — bar trend on the difficulty ramp (rising = redder), latest bar bold.
- **Frente a las troncales de 1º** — this subject vs course-average (grey), 2 bars + takeaway.
- **Profesorado y guía** — teacher list (navy dot + name) + "Ver guía docente →" (navy button) + "PDF".
- **Interactions:** year `▾` re-fetches that year's metrics; guía/PDF are external links.

### 7.5 Asignaturas (master list) — `#9a` (`/asignaturas`)
The flat, ranked table the Spine deliberately isn't.

- **Search** "Buscar entre 53 asignaturas…" + **filter chips**: `Todas / Troncales / Optativas / Curso ▾`
  (active chip = navy fill).
- **Sortable column header** row (`#ECE5D7`): left "ASIGNATURA", right "NO SUPERAN ↓" — **default sort
  no-superan desc**; tapping a metric re-sorts.
- **Dense rows:** `[difficulty dot] name + mono meta line (T·1º·127 matr·aprueban 47%) [big no-superan %]`.
  Troncal = filled dot, optativa = hollow ring. Small-cohort rows carry ⚠. `＋ 42 asignaturas más` footer.
- Rows → Ficha.

### 7.6 Optativas — `#4a` (`/optativas`)
The screen built for *choosing a set*.

- Title + summary: `21 optativas · 528 matrículas/año · 96% aprueban de media` (21 in gold).
- **"Las más elegidas"** — most-enrolled electives as **neutral grey** bars (enrolment is a count, not
  difficulty).
- **Search** + **sort chips** `Populares / Más fáciles / ＋ Sob·MH / A–Z`.
- **Elective cards** (dashed, `#FCFAF5`): name, `OPTATIVA · 3º y 4º · 58 matr.`, big no-superan % (ramp),
  footer (aprueban, Sob+MH), "Ver ficha →". Small-cohort card keeps the honest ⚠ note ("Menos de 10
  alumnos: los porcentajes bailan mucho."). Footer rule: "Debes cursar un mínimo de optativas".

### 7.7 Profesorado — `#6a` (`/profesorado`)
**Deliberate mobile rethink:** the desktop force-graph (267 nodes / 2,003 edges) is unreadable on a phone,
so mobile goes person-by-person; the full graph stays desktop-only.

- Title "Red de colaboración" + explainer ("cada colaboración pesa 1/n…") + stat row `267 profesores ·
  2.003 colaboraciones · 8 cursos`.
- **Info callout** with a small graph glyph: "La madeja completa se explora mejor en pantalla grande …
  **Ver red completa →**" (deep-links to the desktop graph).
- **Search professor** + a list ranked by reach (name + "5 asignaturas · 75 colaboradores"); selected row
  = navy left-border + `#EEF0F5`.
- **Ego-network card** ("FICHA ABIERTA"): name, meta, **IMPARTE** (subject pills, navy outline), **COLABORA
  MÁS CON** — ranked collaborators with **grey** weight bars + mono weight (`2,53`) + shared count
  ("13 comp."). Footer: "Peso = suma de 1/n … el TFG se excluye".
- Same model as `NodesLinks.js`/`ProfGraph` (weights, TFG excluded, year filter). Bars are a quantity → grey.

### 7.8 Fight Mode — `#5a` (`/fight`)
The app's bit of fun, dressed up honestly. Gold marks the winner; navy stays structural.

- Centered title "Fight Mode" + "Dos asignaturas entran. Los datos deciden."
- **Two fighter slots** (white cards, "cambiar ▾" = autocomplete pickers) with a **VS medallion** (navy
  circle, gold "VS", the one shadow).
- **Verdict banner** (gold/`#FBF5E7`): trophy + "Gana Física estadística · 4–0" + a warm one-liner.
- **Duel rows** — a `1fr 90px 1fr` grid per metric: left value / metric label / right value. The winner
  cell gets the **gold** border+bg + "gana". Metrics, in order: *más fácil de superar* (no-superan, lower
  wins), *tasa de éxito*, *no presentados*, *excelencia (Sob+MH)*. **Add a 5th duel *matriculados* only
  when both subjects are optativas** (same rule as today). Footer explains the weighting.

### 7.9 Metodología — `#7a` (`/metodologia`)
The honesty page — the wide dark desktop table becomes stacked cards; **wording is verbatim from
`Methodology.vue`** — do not paraphrase.

- **Cómo se calcula:** the 3 base counts (Matriculados / Presentados / Superados) as numbered cards.
- **Indicator table → cards:** 7 indicators, each with its **denominator pill** in navy (`÷ matriculados`
  or `÷ presentados`): Tasa de rendimiento, Tasa de éxito, Tasa de evaluación, Tasa de no superación, No
  presentados, Suspensos sobre presentados, Excelencia. + the "official nomenclature / weighted by
  matriculados / last 3 courses" note.
- **Fuentes:** 4 dataset cards with real "último" course + "Fuente →".
- **Limitaciones:** 7 caveats with glyph tiles (small cohorts ⚠, no-pre ≠ suspenso, COVID years, plan/name
  changes, single-year official rates, source mismatch, "esto no evalúa a nadie").
- Denominator pills use navy (structural metadata) — never the data ramp.

### 7.10 Acerca de — `#10a` (`/acerca`)
The human page.

- Mission ("rumores → datos"). **Quién lo hace:** real `@aaleta` credit (avatar "AA", "Mantenimiento ·
  datos · scraper", GitHub link) + **3 editable placeholder contributor slots** (muted `#9A9182`, "··"
  avatars, grouped by contribution). **Do not invent names** — leave the slots to fill.
- **Cómo se hizo** (open data / one-definition / public code) → links to Metodología.
- **GitHub CTA** (navy card) → `github.com/aaleta/unizar_dashboard`.
- **Disclaimer** (structural callout): "Esto no juzga a nadie …". Independent-project footer.

### 7.11 "Más" roll-up — `#11a`
Reached from the **Más** tab. It is an **action sheet, not a page** — better than a whole screen: no route
change, keeps context.

- **Scrim** `rgba(24,20,14,.44)` over the current screen (dims, tap to dismiss).
- **Sheet** anchored above the Más tab: white, radius 16px, shadow `0 14px 34px rgba(20,18,14,.30)`, with
  a small **caret** pointing down to the tab. Header row: "MÁS" eyebrow + ✕ close.
- **4 rows** (each ≥44px): icon tile (34px rounded) + title + subtitle + chevron →
  **Profesorado (`#6a`) · Fight Mode (`#5a`) · Metodología (`#7a`) · Acerca de (`#10a`)**.
- Dismiss on scrim tap or ✕; no navigation on dismiss.

---

## 8. Interactions & behaviour

- **Navigation:** bottom tabs switch top-level routes; Más opens/closes the roll-up (animate up from the
  tab, fade the scrim). Inner screens use a back chevron in the header.
- **Spine → Curso → Ficha** is the core drill-down path. Subject rows/cards everywhere link to the Ficha.
- **Sorting/filtering** (Asignaturas, Optativas): chips toggle; the active chip is navy-filled; sort header
  shows the active metric + direction arrow. Default sort surfaces the hardest first (no-superan desc).
- **Search** filters the current list live.
- **Year selector** on the Ficha re-queries that course's metrics for the chosen year.
- **External links:** guía docente, PDF, "Fuente →", GitHub, "Ver red completa →" (desktop graph).
- **Animation:** keep it restrained — roll-up slide/fade, chip/press feedback, list transitions. Nothing
  flashy; this is an academic-credibility tool.

## 9. States to handle

- **Loading** — while data fetches (skeleton or spinner in the codebase's style).
- **Empty** — no search/filter results.
- **Small cohort (<10 matriculados)** — show the ⚠ glyph (`#C89A2E`) and a "los porcentajes bailan mucho"
  note; prefer showing absolute counts. Carries across list, cards, and ficha.
- **COVID-year anomaly** and **source-mismatch** — surfaced as caveats (see Metodología); if you annotate
  charts, keep it subtle and consistent.
- **Active vs inactive** nav/chip/sort states as specified.

## 10. State / data model (reuse the app's existing stores — do not recompute)

Shapes the UI needs (names illustrative; bind to the real store fields):

- **Degree:** `passRate`, `notaCorte` + Δ, `noShows`, `convocatorias`, admission series (media + corte by
  year), pass-rate trend (troncales, 2013-14 → 2024-25), per-source freshness.
- **Year (1–4):** `avgPass`, `avgNoShow`, `nTroncales`, `nOptativas`.
- **Subject:** `name`, `code`, `caracter` (troncal|optativa), `year(s)`, `matriculados` (current + 3yr
  avg), `noSuperan`, `aprueban`, `noPresentados`, `convocatorias` (official), `excelencia` (Sob+MH),
  `tasaExito`, grade distribution counts (No pre/Susp/Apro/Notable/Sob/MH), historical `noSuperan` series,
  `teachers[]`, `guiaDocenteUrl`/`pdfUrl`, `smallCohort` flag.
- **Professor:** `name`, `nAsignaturas`, `nColaboradores`, `subjects[]`, `topCollaborators[] {name,
  weight(1/n), sharedCount}`. Graph aggregate: 267 nodes / 2,003 edges / 8 cursos / TFG excluded.
- **Fight:** two subject refs → per-metric comparison (+ matriculados only when both optativas), winner
  per metric + overall score.
- **Methodology / About:** static content (indicator defs, sources, limitations, contributors, disclaimer).

Centralise the **difficulty-% → colour** mapping (§5) in one helper and reuse it everywhere the ramp
appears.

---

## 11. Files in this bundle

```
design_handoff_physics_mobile/
├─ README.md                        ← this document (self-sufficient spec)
└─ prototype/
   ├─ mobile-screens.dc.html        ← the design canvas — open in a browser
   ├─ ios-frame.jsx                 ← prototype device bezel (scaffolding — do not port)
   └─ support.js                    ← prototype runtime (scaffolding — do not port)
```

**How to view:** open `prototype/mobile-screens.dc.html` in a modern browser. It renders all screens on a
pan/zoom canvas. Use the ids in §6 to jump to a given screen; ignore the reviewer scaffolding per §2.

**Target repo:** `github.com/aaleta/unizar_dashboard` — implement on a new **`mobile`** branch, reusing the
existing Vue components/stores in §6. Desktop is out of scope for now.
