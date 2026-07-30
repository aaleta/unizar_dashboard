# Developer guide

How this site is built, how to run it locally, and how to publish it.

For the visual rules — colour, typography, primitives, accessibility — see
[`DESIGN.md`](DESIGN.md). This document is about the machinery.

- [1. What it is](#1-what-it-is)
- [2. Repository layout](#2-repository-layout)
- [3. Requirements](#3-requirements)
- [4. Running it locally](#4-running-it-locally)
- [5. How the front end is organised](#5-how-the-front-end-is-organised)
- [6. The data pipeline](#6-the-data-pipeline)
- [7. Updating the data](#7-updating-the-data)
- [8. Build and deploy](#8-build-and-deploy)
- [9. Link previews](#9-link-previews)
- [10. Quality checks](#10-quality-checks)
- [11. Common pitfalls](#11-common-pitfalls)

---

## 1. What it is

A **static site**. There is no server, no database and no API: a Python script
turns the university's spreadsheets and web pages into JSON files, Vite bundles
those JSON files *into* the JavaScript at build time, and the result is a folder
of static assets served by GitHub Pages.

Two consequences worth internalising:

- **The data ships with the code.** New data means a new build and a new
  deploy; there is nothing to refresh at runtime.
- **Bundle size is a data question.** Anything imported at the top level of a
  module that the home page reaches ends up in the initial download. The
  teaching guides (~300 kB) are deliberately loaded lazily for that reason.

Stack: Vue 3 (`<script setup>`) + Vue Router + Vite. Charts are hand-written
SVG, plus chart.js where it was already in place; the faculty graph uses
vis-network.

---

## 2. Repository layout

```
data/
  xlsx_csv/        Source spreadsheets, one CSV per academic year
  json/            Hand-maintained + generated JSON
    asignaturas.json          the subject catalogue — maintained by hand
    notas_raw.json            grade distribution, generated
    notas_de_corte_raw.json   entry marks, generated
    processed/                everything the scraper produces
scripts/
  updater.py       The whole pipeline: converters + scrapers
  pyproject.toml   Python dependencies (managed with uv)
web/
  index.html       Entry point: favicons, manifest, theme-color, Open Graph
  src/
    main.js        App bootstrap
    router/        Routes, screen titles, redirects for old URLs
    views/         One file per screen (11 of them)
    components/    ui/ primitives, layout/ shell, charts/, network/, …
    composables/   Per-screen data logic (useSubject, useSchedule, …)
    utils/         metrics.js is the single source of truth for every rate
    theme/         Tokens, typography, fonts, difficulty ramp, palettes
  public/          Icons, manifest and og-image.png, copied verbatim
docs/              This guide, DESIGN.md, og-card.html, the presentation
img/               Logos and README screenshots (not used by the app)
```

---

## 3. Requirements

| Tool | Version | For |
|---|---|---|
| Node.js | `^22.18.0` or `>=24.12.0` | Building and running the site |
| npm | ships with Node | Dependencies and scripts |
| Python | `>=3.14` | Refreshing the data (only then) |
| [uv](https://docs.astral.sh/uv/) | any recent | Python environment for the script |

You only need Python if you are going to regenerate the data. Front-end work
needs Node alone — the JSON files are committed.

---

## 4. Running it locally

```sh
cd web
npm install
npm run dev
```

Vite prints a URL that already includes the base path
(`http://localhost:5173/unizar_dashboard/`). Open that one — the bare root will
not resolve, because `base` is set to `/unizar_dashboard/` to match GitHub
Pages.

Two things exist only in development:

- **`/dev/ui`** — the live gallery of the fifteen UI primitives. It is compiled
  out of the production bundle by an `import.meta.env.DEV` check in the router.
- **Vue DevTools** — the plugin is only registered when `mode === "development"`
  (`vite.config.js`).

To check a production build locally:

```sh
npm run build
npm run preview
```

---

## 5. How the front end is organised

**Routing is hash-based** (`createWebHashHistory`). GitHub Pages cannot rewrite
unknown paths to `index.html`, so URLs look like `/unizar_dashboard/#/grado`.
Old routes from earlier versions are kept as redirects in `router/index.js`;
they are published and linked to, so do not delete them.

**Screen titles live in the route `meta`**, not in the view — the full list of
eleven titles reads in one file. A view only overrides its title through
`usePageHeader` when it depends on data (a subject's name, a course number).

**Views are thin; composables hold the logic.** `views/Subject.vue` renders,
`composables/useSubject.js` decides what a subject page knows. Anything that
counts or divides belongs in `utils/metrics.js`.

**`utils/metrics.js` is the single definition of every rate.** Unizar's
official vocabulary, reproduced there:

```
matriculados = No pre + Sus + Apr + Not + Sob + MH
presentados  = matriculados − No pre
superados    = Apr + Not + Sob + MH

rendimiento  = superados / matriculados
éxito        = superados / presentados
evaluación   = presentados / matriculados
```

The difficulty figure shown across the site is the **non-pass rate**,
`100 − rendimiento`. Never recompute any of these in a component: the same
number used to come out differently in two panels of the same screen, which is
exactly what this module exists to prevent.

**Lazy loading matters.** Only `Home.vue` is imported eagerly; every other view
is a dynamic import. `ProfGraph.vue` (vis-network, ~500 kB) is loaded on demand
and only on desktop, and the teaching-guide JSON is fetched only by the screens
that need it.

**Mobile and desktop are one responsive codebase**, not two apps. The only real
divergence is the faculty screen — a person-by-person list on mobile, a
267-node graph on desktop — switched by `useViewport()`, a single `matchMedia`
at 900px. Everything else is CSS.

---

## 6. The data pipeline

`scripts/updater.py` is the whole pipeline. Two halves:

**Converters (offline)** — read what is in `data/xlsx_csv/` and write JSON:

| Function | Reads | Writes |
|---|---|---|
| `convertir_notas()` | `xlsx_csv/notas/*.csv` | `json/notas_raw.json` |
| `convertir_notas_de_corte()` | `xlsx_csv/notas_de_corte.xlsx` | `json/notas_de_corte_raw.json` |
| `procesar_resultados()` | `xlsx_csv/rendimiento/` + `notas_raw.json` | `json/processed/resultados_fisica.json` |
| `validar_catalogo()` | `json/asignaturas.json` | — (validation only) |

The other folders under `xlsx_csv/` (`resultados/`, `egresados/`,
`procedencia/`, `erasmus/`) are archived source material that the pipeline does
not currently read.

**Scrapers (need network)** — read the university's public pages:

| Function | Writes |
|---|---|
| `obtener_datos_asignaturas()` | `json/processed/profesores_guias_doc.json` |
| `actualizar_horario()` | `json/processed/horarios.json` |
| `actualizar_examenes()` | `json/processed/examenes.json` |
| `escribir_frescura()` | `json/processed/data_freshness.json` |

The converters **fail loudly on purpose**: a CSV with missing columns, or one
whose contents disagree with the academic year in its filename, raises instead
of producing a silently incomplete JSON.

### Two subjects can share a code

`actualizar_horario()` keeps the centre's own title in `Asignatura`, and that
is not decoration. A subject taught in two languages is published **twice under
the same code and the same group** — `26937 Gravitación y cosmología` and
`26937 Gravitation and cosmology` are both `447-3-6`, the second one arriving
with a negative internal id — and the title is the only thing that tells them
apart. `useSchedule.js` builds the language selector from it; drop the title
and the timetable paints both versions at once, which is a week nobody has.

`escribir_frescura()` runs last and must: it derives each dataset's vintage
from the files the earlier steps just wrote. That tiny JSON is what the home
page and the desktop sidebar read to state how current each source is — it is
computed at build time so the site does not have to download 300 kB of
teaching guides just to display a year.

### `asignaturas.json` is hand-maintained

The subject catalogue is the one JSON nobody generates. It is the sole source
of truth for which subjects exist, which year they belong to and whether they
are core or optional — neither the scripts nor the site infer any of that from
the grade data. One entry per subject:

```json
{ "codigo": 26944,
  "nombre": "Aplicaciones de la difracción y de la interferometría",
  "cursos": [3, 4],
  "tipo": "optativa",
  "se_alterna_con": 26939 }
```

- `cursos` — every year the subject is taught in; pool optional subjects
  usually carry both `3` and `4`.
- `tipo` — `"troncal"` or `"optativa"`.
- `bolsa_optativas: false` — the three first-year optional subjects (Biología,
  Geología, Grafos y combinatoria) taught outside the normal pool. They count
  as optional everywhere, but do not appear in the Optativas section.
- `se_alterna_con: <codigo>` — biennial subjects that alternate with another.
  The subject page says so, and the timetable disables whichever is not in this
  year's publication.

Add new subjects here. `validar_catalogo()` warns about codes present in the
grade data but missing from the catalogue, so run the script after editing it.

---

## 7. Updating the data

1. Drop the new spreadsheets into `data/xlsx_csv/<dataset>/`, named by
   academic year (`2024_2025.csv`). The year inside the file must match the
   filename.
2. If subjects were added, removed or moved, edit `data/json/asignaturas.json`.
3. Run the pipeline:

   ```sh
   cd scripts
   uv run updater.py
   ```

   Scrapers overwrite the years they fetch; re-running is safe. The script
   prints a summary per step.
4. Review the diff in `data/json/` — an unexpectedly large one usually means
   the university changed a page or a column heading.
5. Commit, build and deploy (below). Nothing updates until you do.

Where the data comes from is listed in the README and, for readers of the site,
under **Fuentes y metodología**.

---

## 8. Build and deploy

```sh
cd web
npm run build     # → web/dist
npm run deploy    # gh-pages -d dist --dotfiles
```

`npm run deploy` pushes `dist/` to the `gh-pages` branch, which GitHub Pages
serves at `https://aaleta.github.io/unizar_dashboard/`. Build first — `deploy`
publishes whatever is currently in `dist/`.

`--dotfiles` is not decorative: it is what carries `.nojekyll`, without which
GitHub Pages drops the `_`-prefixed asset folder Vite emits and the site loads
without its JavaScript.

If the repository is ever renamed, `base` in `vite.config.js` must change with
it.

---

## 9. Link previews

The Open Graph tags that make WhatsApp, Telegram, Slack and the rest render a
card live in `web/index.html`, not in any view. Whoever reads them is a crawler
that downloads the document and executes nothing, so a tag added by Vue on
mount arrives far too late.

For the same reason there is **one card for the whole site**. Routes live after
the `#`, browsers never send a fragment to the server, so a crawler handed
`.../#/asignatura/26903` fetches exactly the same `index.html` as everyone
else. Per-screen previews are not possible while routing is hash-based
(see §5).

Two things are easy to get wrong:

- **Absolute URLs, with the domain.** `og:image` and `og:url` must be full
  `https://…` URLs. A relative path resolves fine in a browser and not at all
  in a crawler.
- **Keep the image modest.** `web/public/og-image.png` is 1200×630 and about
  100 kB. WhatsApp renders a big card below roughly 300 kB and silently falls
  back to a thumbnail above it.

The image is not hand-edited: it is rendered from `docs/og-card.html`, which
uses the site's own fonts and tokens. To regenerate it, from the repo root:

```sh
python3 -m http.server 8899
google-chrome --headless --window-size=1200,630 \
  --screenshot=web/public/og-image.png \
  http://localhost:8899/docs/og-card.html
```

Previews are cached hard by the messaging apps. After a change, validate with
[Facebook's sharing debugger](https://developers.facebook.com/tools/debug/)
(its "Scrape Again" also clears WhatsApp's copy) and expect existing chats to
keep the old card for a while.

---

## 10. Quality checks

```sh
npm run lint      # oxlint, then eslint, both with --fix
npm run format    # prettier over src/ and the root config files
```

Both are expected to be clean before a commit. Prettier settles all formatting
questions — 4-space indent, double quotes, 80 columns — so there is nothing to
argue about by hand.

There is no automated test suite. The checks that actually catch regressions
are the pipeline's own assertions on the data, and a look at `/dev/ui` plus the
affected screens after a change to the theme.

---

## 11. Common pitfalls

- **Opening `http://localhost:5173/` instead of the base path.** Blank page.
  Use the URL Vite prints.
- **Importing data at module top level in a screen the home page reaches.**
  It lands in the initial bundle. Load it lazily instead.
- **Recomputing a rate in a component.** Use `utils/metrics.js`; that is the
  point of it.
- **Deploying without building.** `npm run deploy` ships a stale `dist/`.
- **Adding a second `<main>`.** `AppShell` already opens one; a view that opens
  another leaves two landmarks in the document.
- **Deleting an old route.** They are redirects on purpose.
</content>
