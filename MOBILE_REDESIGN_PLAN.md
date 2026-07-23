# Plan de implementación — Rediseño móvil "Grado en Física"

> **Documento temporal de trabajo.** Plan por fases para implementar
> `design_handoff_physics_mobile/` sobre `web/`. Borrar (o mover a `docs/`) cuando el
> rediseño esté terminado.
>
> Fuente de verdad del diseño: `design_handoff_physics_mobile/README.md` +
> `prototype/mobile-screens.dc.html` (abrir en navegador, ids `#1c`, `#2a`, …).
> Este documento **no** re-especifica el diseño: solo organiza *cómo* llevarlo al código.

---

## 0. Estado actual del código (lo que ya tenemos)

| Área | Situación |
|---|---|
| Stack | Vue 3.5 (SFC `<script setup>`) + Vite 8 + vue-router 5 (**hash history**), `base: /unizar_dashboard/` |
| Estado | **No hay store** (ni Pinia ni Vuex). Los datos son JSON importados estáticamente y funciones puras |
| Capa de datos | `utils/metrics.js` (625 líneas, "definiciones ÚNICAS"), `utils/dataSources.js`, `utils/NodesLinks.js` |
| Gráficas | `chart.js` + `vue-chartjs`; red de profesores con `cytoscape` / `vis-network` |
| Navegación | `Sidebar.vue` fija de 220px, que a <768px se convierte en una barra inferior con scroll horizontal |
| Tema | **Oscuro** (`#0f172a` / `#111827` / paleta slate-tailwind), forma de escritorio |
| Volumen | ~10.300 líneas entre vistas, componentes y utilidades |

**Lo bueno:** la capa de datos ya cumple el principio de "una sola definición" que exige el
handoff (§10). Las vistas móviles pueden consumir `metrics.js` tal cual, sin recalcular nada.

**Lo que cambia:** absolutamente toda la piel (tema oscuro → papel cálido `#F4EFE6` + navy
`#223D71`), la tipografía (Spectral / Public Sans / IBM Plex Mono), y la capa de navegación
(sidebar → header navy + tab bar de 4 pestañas + action sheet).

### Divergencias entre rutas actuales y las del handoff

| Handoff §6 | Ruta actual | Decisión propuesta |
|---|---|---|
| `/grado` (Spine `#1c`) | — no existe | **Nueva** |
| `/grado/:curso` (`#3a`) | `/curso/:course` | Usar `/grado/:curso`, dejar `/curso/:course` como redirección |
| `/fight` (`#5a`) | `/fight-mode` | Usar `/fight`, redirigir la antigua |
| `/acerca` (`#10a`) | — no existe | **Nueva** (contenido estático) |
| `/asignatura/:code` (`#2a`) | `/asignatura/:code` | Igual ✔ |
| `/asignaturas`, `/optativas`, `/profesorado`, `/metodologia` | iguales | Igual ✔ |

El bloque de redirecciones de `router/index.js` ya establece el patrón: **añadir, nunca romper
enlaces existentes.**

---

## 1. Decisiones de arquitectura (tomar antes de la Fase 1)

### D1 — Cómo conviven móvil y escritorio ← *la decisión importante* · **DECIDIDA**

**Decisión: un solo código base, responsive, mobile-first.** No hay versión móvil y versión
escritorio separadas.

Contexto aportado por el usuario, que fija la decisión:

1. **El escritorio puede quedar roto de momento.** Esto elimina el único argumento fuerte a
   favor de dos árboles paralelos: en el plan anterior el árbol `src/mobile/` existía para
   *proteger* el escritorio en funcionamiento. Si el escritorio es prescindible, esa protección
   no vale nada y solo se paga en duplicación.
2. **El escritorio agregará funcionalidad que el móvil no puede tener** (p.ej. la red completa
   de profesores). Esto exige **intercambio de componente por pantalla**, no un árbol paralelo.

**Por qué un solo código base**

- De las 11 pantallas, **solo Profesorado** diverge de verdad en modelo de interacción
  (lista ego a persona vs. grafo de fuerzas de 267 nodos). El propio handoff ya define la
  costura: en móvil, *"Ver red completa →"* enlaza al grafo de escritorio. Duplicar diez
  pantallas para resolver una es mal negocio.
- **El diseño de escritorio todavía no existe.** Un árbol de escritorio paralelo sería andamiaje
  construido contra nada. Cuando llegue ese diseño compartirá marca, contrato de color, tokens y
  rampa de dificultad — todo definido por el handoff a nivel de **producto**, no de móvil.
- **El handoff ya obliga a ser responsive** (≈320px → tablet, §3). Ampliar ese rango hacia
  arriba más adelante es continuo, no un mecanismo nuevo.
- **La duplicación peligrosa es la lógica, no el CSS.** Ordenación, filtros, agregados por curso,
  derivación del ego-network: en `composables/`, el rediseño de escritorio los consume en vez de
  reimplementarlos. Ahí es donde nacen los bugs de "el mismo número calculado de dos formas".

**Estructura resultante**

```
web/src/
├─ theme/            ← tokens, rampa de dificultad, paleta de notas   (nuevo)
├─ composables/      ← lógica derivada, sin UI                         (nuevo)
├─ components/
│  ├─ ui/            ← primitivas del sistema de diseño                (nuevo)
│  ├─ layout/        ← AppShell, AppHeader, BottomTabBar, MoreSheet    (nuevo)
│  ├─ charts/        ← wrappers de chart.js con el tema nuevo          (nuevo)
│  └─ Dashboard/     ← componentes actuales: fuente de lógica a extraer,
│                      y hogar de los componentes SOLO-ESCRITORIO
└─ views/            ← reescritas in situ, mobile-first
```

`components/Dashboard/` no se borra: contiene la lógica que funciona (configuración de gráficas,
grafo de profesores, reglas de Fight Mode). Se va canibalizando hacia `composables/` conforme
avanzan las fases. `ProfGraph.vue` / `ProfWeb.vue` se quedan **tal cual**: son el componente
solo-escritorio, y se renderizan únicamente por encima del breakpoint.

**Mecanismo de divergencia por viewport** (cuando haga falta, no antes):

```js
const { isDesktop } = useViewport()          // matchMedia reactivo
const FullGraph = defineAsyncComponent(() => import('@/components/Dashboard/ProfWeb.vue'))
// <FullGraph v-if="isDesktop" /> <ProfEgoList v-else />
```

Con carga diferida, `cytoscape` y `vis-network` —las dos dependencias más pesadas— **nunca se
descargan en un móvil**. Dos árboles paralelos darían lo mismo, pero pagándolo con la
duplicación de todo lo que no necesitaba duplicarse.

**Simplificación que se adopta ahora:** *no construir todavía el conmutador de viewport.* Se
construye mobile-first y las pantallas anchas muestran el layout móvil con un `max-width`
limitado. `useViewport()` se introduce cuando aterrice la primera divergencia real
(Profesorado, Fase 7a). Un conmutador sin nada que conmutar es complejidad especulativa.

**Coste honesto y asumido:** algunos componentes acumularán CSS de breakpoints cuando llegue el
diseño de escritorio, y unos pocos habrá que partirlos entonces. Es un coste real pero
**posterior**, y solo se paga donde de verdad hace falta — frente a duplicarlo todo por
adelantado apostando a que hará falta.

*Alternativas descartadas:* (A) árbol `src/mobile/` paralelo conmutado por viewport — solo se
justificaba para proteger un escritorio que ahora es prescindible; (C) rama móvil desechable —
no hay razón para tirar el trabajo si la base es compartida desde el principio.

### D2 — Paleta de calificaciones

`metrics.js` define `GRADE_CATEGORIES` con colores tailwind (`#94a3b8`, `#ef4444`, `#22c55e`…).
El handoff §5 exige otros (`#B9B0A1`, `#B5482F`, `#6E9A6A`, `#4E86A0`, `#7E6BA6`, `#D2A03F`).

**Propuesta (revisada tras D1):** con un solo código base y el escritorio prescindible, ya no hay
motivo para el apaño. Se hace lo correcto de una vez: **sacar el color de `metrics.js`** (un
color no es una métrica) y llevarlo a `theme/gradePalette.js`, indexado por la `key` de
`GRADE_CATEGORIES`. `metrics.js` se queda solo con definiciones y recuentos, que es lo que su
propia cabecera dice que es.

Impacto: `GradeDistribution.vue` y cualquier consumidor de `category.color` pasan a leer la
paleta del tema. Es un cambio pequeño y mecánico, y deja `metrics.js` más limpio para el
rediseño de escritorio.

### D3 — Fuentes · **HECHA (Fase 0)**

Auto-hospedadas, como se proponía. Detalles de la implementación real:

- Los `.woff2` viven en `src/assets/fonts/` (**no** en `public/fonts/`): así Vite los versiona
  y reescribe las URLs respetando `base: '/unizar_dashboard/'`. Desde `public/` habría que
  escribir la ruta base a mano y se rompería al cambiarla.
- `src/theme/fonts.css`, importado desde `main.js` antes de `style.css`.
- Solo subconjuntos `latin` + `latin-ext`; 12 ficheros, ~217 kB en total (un navegador solo
  descarga los que usa).
- ⚠ **Public Sans es una fuente VARIABLE**: Google sirve **el mismo fichero** para 400/500/600/
  700 y solo cambia la etiqueta `font-weight`. Declararla con pesos sueltos hace que el
  navegador **sintetice** las negritas en vez de usar el eje real. Se declara una sola vez por
  subconjunto con `font-weight:100 900`. Spectral e IBM Plex Mono sí son estáticas.
  *(Detectado porque Vite dedujo 4 ficheros idénticos y emitió uno solo.)*

### D4 — Nada de números escritos a mano

Todas las cifras del mock salen de datos reales. Verificado ya contra `data/`:

- `4 CURSOS · 33 TRONCALES · 21 OPTATIVAS` → **correcto** (12+9+6+6 troncales; 21 optativas
  únicas, ofertadas 21 en 3º y 19 en 4º).
- ⚠ `"Buscar entre 53 asignaturas…"` (`#9a`) → el catálogo real tiene **54** códigos únicos.
  **La cifra se calcula (`allSubjects.length`), no se escribe.** Mismo criterio en todos los
  contadores y en el subtítulo de Optativas.
- Frescura de fuentes (`#8a`): Calificaciones 2024-2025 · Tasas 2024-2025 · Notas de corte 2025
  · Profesorado 2026-2027 → **coincide** con `DataFreshness.json`. Sale de `DATA_SOURCES`.

### D5 — Rampa de dificultad: una sola función

Handoff §5 y §10 lo exigen explícitamente. `theme/difficulty.js` exporta `difficultyFill(pct)`,
`difficultyInk(pct, small)` y `difficultyBand(pct)`. **Ningún componente define un color de
dificultad por su cuenta.** Se aplica al punto de la fila, a las barras, al numeral y a las
gráficas.

Los seis tramos del handoff son **cinco** en el código: los dos últimos (8-14 % y <8 %) llevan
exactamente el mismo par de colores, así que mantenerlos separados sería fingir una distinción
que no existe. Los umbrales son los mismos.

La web no tenía ninguna escala equivalente con la que alinear estos umbrales: solo un `hot >= 30`
suelto en `Subjects.vue`, que la rampa sustituye.

---

## Fase 0 — Preparación · ✅ **COMPLETADA**

**Objetivo:** rama, tooling y decisiones cerradas.

1. Crear la rama `mobile` desde `main`. *(Sigue siendo útil aunque el código base sea único: es
   una rama de trabajo larga, no una versión paralela del producto. Se fusiona a `main` cuando
   el móvil esté terminado, con el escritorio pendiente de rediseño.)*
2. Cerrar D3 con el usuario (D1, D2, D4 y D5 ya están decididas).
3. Añadir las fuentes (D3) y comprobar que `npm run dev` + `npm run build` siguen verdes.
4. Confirmar que `data/` no necesita ningún campo nuevo (ver §"Huecos de datos" abajo).
5. Anotar en el `README.md` del repo que el escritorio queda temporalmente sin rediseñar, para
   que nadie lo tome por una regresión.

**Aceptación:** rama creada, app arrancando, fuentes cargando.

### Resultado

| Paso | Estado |
|---|---|
| Rama `mobile` | ✅ creada desde `main` |
| Decisiones | ✅ D1, D2, D4, D5 ya estaban decididas · **D3 cerrada y ejecutada** |
| Fuentes | ✅ 12 `.woff2` en `src/assets/fonts/` + `src/theme/fonts.css` importado desde `main.js` |
| `npm run build` | ✅ verde · las 12 fuentes se emiten versionadas y sin duplicados |
| `npm run lint` | ✅ verde (oxlint + eslint) |
| `npm run dev` | ✅ arranca; `fonts.css` y los `.woff2` se sirven con HTTP 200 |
| Huecos de datos | ✅ los 6 riesgos verificados + **2 nuevos encontrados** (ver la tabla de riesgos) |

**Sin cambios visuales**, como se pretendía: las fuentes están cargadas pero ninguna regla las
aplica todavía. Eso es la Fase 1.

**Nota de entorno:** Node en uso es **v23.2.0** y `package.json` pide `^22.18.0 || >=24.12.0`.
Ni build ni lint se quejan, pero es una versión no soportada por el propio proyecto. Conviene
alinearlo (usar Node 22 LTS, o ampliar `engines`) antes de que muerda en CI.

**Un dato que valida D1 antes de tiempo:** el build ya separa `ProfWeb` en su propio *chunk*
(516 kB JS + 221 kB CSS, con `cytoscape`/`vis-network` dentro). La carga diferida de la Fase 7a
no hay que construirla: ya existe, solo hay que condicionarla al viewport.

---

## Fase 1 — Cimientos de diseño · ✅ **COMPLETADA**

**Objetivo:** los tokens del handoff §5 existen en el código y son la única fuente de color,
tipografía y espaciado de **toda la app** (no solo del móvil: el rediseño de escritorio heredará
estos mismos tokens, así que se nombran a nivel de producto).

**Entregables**

- `theme/tokens.css` — custom properties: navy, oro, superficies, líneas, texto, radios,
  sombras, espaciado. Nombres semánticos (`--surface-card`, `--line-soft`), no literales.
- `theme/difficulty.js` — la rampa (D5), con test manual de los 6 tramos.
- `theme/gradePalette.js` — paleta categórica de calificaciones (D2).
- `theme/typography.css` — escala de tipos del handoff (H1 22-27px, sección 15-16px, tarjeta
  14-15px, cuerpo 11-13px, KPI mono 23-24px, eyebrow 8.5-9px), fluida con `clamp()`.
- `components/ui/` primitivas: `Card`, `Eyebrow`, `Pill`, `DifficultyDot` (relleno=troncal /
  anillo=optativa), `CountBar` (gris `#A89A86` sobre `#EFE7D7`), `StatRow`, `Callout`
  (variantes *estructural* `#EEF0F5` / *dura* `#F9ECE7` / *cohorte pequeña* `#C89A2E`),
  `SectionHeader`, `Chip`, `LinkRow`.
  Se nombran sin prefijo `M-`: son las primitivas de la app, no "las del móvil". Deben ser
  **agnósticas del layout** (sin anchos fijos, sin márgenes externos) — es lo que permitirá
  reutilizarlas en escritorio sin pelearse con ellas.
- Sustituir el tema oscuro de `style.css` (`#app { background:#0f172a }`) por el papel cálido
  `#F4EFE6`. Es el punto en el que el escritorio actual empieza a verse roto: **esperado y
  aceptado** por D1.
- Una **página de galería interna** (ruta `/dev/ui`, solo en `mode === 'development'`) que
  renderiza todas las primitivas y los 6 tramos de la rampa juntos → verificación visual barata
  contra el prototipo.

**Regla que se verifica aquí:** el *contrato de color* del handoff §4 — navy solo estructura,
rampa solo dificultad, gris solo recuentos, paleta categórica solo calificaciones, oro solo
decoración + ganador de Fight Mode.

**Aceptación:** galería `/dev/ui` comparada lado a lado con el prototipo; ningún color
hard-codeado fuera de `theme/`.

### Resultado

| Entregable | Fichero |
|---|---|
| Tokens | `theme/tokens.css` — el contrato de color de §4 está escrito en la cabecera, no solo en este plan |
| Tipografía | `theme/typography.css` — escala + utilidades `.num`, `.eyebrow`, `.serif` |
| Rampa | `theme/difficulty.js` — verificada tramo a tramo contra el handoff §5 |
| Paleta de notas | `theme/gradePalette.js` |
| Primitivas | `components/ui/` — `UiCard`, `UiCallout`, `UiChip`, `UiCountBar`, `UiDifficultyDot`, `UiKpiCard`, `UiLinkRow`, `UiPill`, `UiSearchField`, `UiSectionHeader`, `UiSortHeader`, `UiStat` |
| Galería | `views/dev/UiGallery.vue` + ruta `/dev/ui` |
| Base | `style.css` reescrito: papel cálido, reset, foco visible, `prefers-reduced-motion` |

**Comprobado:** lint y build verdes · la galería no entra en el bundle de producción
(`import.meta.env.DEV` se evalúa en compilación) · auditoría de color sin ningún hex fuera de
`theme/` · rampa contrastada contra la tabla del handoff, tramo a tramo.

**Nombres con prefijo `Ui`:** eslint exige nombres compuestos (`vue/multi-word-component-names`)
salvo en `views/`. `UiCard` en vez de `Card` evita tocar la configuración del linter y sigue la
convención de componentes base de la guía de estilo de Vue. La galería vive en `views/dev/` para
quedar cubierta por la excepción existente.

**`Eyebrow` no es un componente**, es la clase `.eyebrow` de `typography.css`. Un componente Vue
para envolver un `<span>` con tres propiedades CSS es más ceremonia que utilidad; la clase se usa
igual y no obliga a importar nada.

### Un hallazgo que cambia la rampa: contraste

Los tonos de texto del handoff se quedan **entre 3,1:1 y 3,7:1** sobre papel. Eso cumple AA para
texto grande (≥3:1) pero **no para texto normal** (≥4,5:1), y la tasa de no superación aparece a
**11px** en las filas de las listas de `#1c` y `#9a` — no solo en la KPI de 23px.

Por eso `difficulty.js` expone **dos tonos de texto por tramo**:

| | Uso | Contraste sobre papel |
|---|---|---|
| `ink` | Numeral grande (23px), tal cual lo especifica el handoff | 3,1 – 6,1 (AA texto grande) |
| `inkSmall` | Cifras de 11-13px, oscurecido | **4,5 – 6,1 (AA)** |

`difficultyInk(value, small)` decide cuál. El tramo más duro no necesitaba ajuste (ya iba a 6:1).
Los rellenos (`fill`) no se tocan: son superficie, no texto, y son los del handoff exactamente.

Es una desviación deliberada y mínima respecto del diseño, en la dirección que el propio handoff
pide ("*the numeral text uses the darker readable tone*"). **A confirmar con quien diseñó**, pero
la alternativa era publicar cifras que no se leen en una web de datos públicos.

---

## Fase 2 — Shell y navegación · ✅ **COMPLETADA**

**Objetivo:** la carcasa de todas las pantallas y el sistema de navegación móvil.

**Entregables**

- `components/layout/AppShell.vue` — header navy + cuerpo con scroll `#F4EFE6` + tab bar fija.
  Safe areas reales con `env(safe-area-inset-*)`; **no** portar el espaciador de 54px ni el
  bisel del prototipo (handoff §2). Contenido con `max-width` limitado y centrado, para que en
  pantallas anchas se vea el layout móvil contenido en lugar de estirado hasta lo absurdo.
- `components/layout/AppHeader.vue` — dos variantes: *identidad* (tesela oro "F" + título) e
  *interior* (chevron atrás + eyebrow de la ruta padre en mono mayúsculas + título Spectral).
- `components/layout/BottomTabBar.vue` — 62px, borde `#E2D8C6`, 4 pestañas con icono SVG de 20px
  y etiqueta de 9px; activo navy/600, inactivo `#A29A8A`/500. Iconos SVG inline (casa, capas,
  marcador, 3 puntos) en `components/ui/icons/`.
- `components/layout/MoreSheet.vue` — el roll-up `#11a`: scrim `rgba(24,20,14,.44)`, hoja blanca
  radio 16px con caret hacia la pestaña, 4 filas ≥44px, cierre por scrim o ✕, **sin cambio de
  ruta**. Bloqueo de scroll del fondo, `Escape` cierra, foco atrapado.
- `App.vue` pasa de `<Sidebar /> + <RouterView />` a `<AppShell><RouterView /></AppShell>`.
  `Sidebar.vue` queda huérfano: **no se borra todavía**, es la referencia del mapa de navegación
  para el rediseño de escritorio. Se retira en la Fase 9 si sigue sin usarse.
- Router: rutas nuevas (`/grado`, `/grado/:curso`, `/fight`, `/acerca`) + redirecciones desde
  las antiguas; `scrollBehavior` conservado.

**Lo que NO se hace aquí** (por D1): no se construye el conmutador móvil/escritorio ni
`useViewport()`. Llegan en la Fase 7a, con la primera divergencia real.

**Aceptación:** navegación completa entre pestañas con pantallas vacías (placeholders);
objetivos táctiles ≥44px medidos; el roll-up abre y cierra sin tocar la ruta.

### Resultado

| Entregable | Fichero |
|---|---|
| Carcasa | `components/layout/AppShell.vue` |
| Cabecera (2 variantes) | `components/layout/AppHeader.vue` |
| Barra de pestañas | `components/layout/BottomTabBar.vue` |
| Hoja "Más" | `components/layout/MoreSheet.vue` |
| Iconos | `components/ui/UiIcon.vue` — los diez en un fichero, sin dependencia externa |
| Rutas + `meta` | `router/index.js` |
| Andamios | `views/DegreeMap.vue` (fase 3), `views/About.vue` (fase 7d) |

**El mapa de navegación vive en `meta`**, no en las vistas: `header` (identidad o interior),
`eyebrow`, `title` y `back`. Así la jerarquía —qué cuelga de qué— se lee entera en un fichero
en vez de estar repartida por once componentes.

**Rutas nuevas y redirecciones:** `/grado`, `/grado/:curso`, `/fight`, `/acerca`. Se redirigen
`/curso/:course` → `/grado/:course` y `/fight-mode` → `/fight`, y se actualizan los enlaces
internos que apuntaban a las antiguas (`Dashboard.vue`, `FightModeButton.vue`). `Course.vue` pasa
a leer `params.curso`.

**Comprobado con Chrome dirigido por CDP** (no solo a ojo): la hoja abre y cierra con velo, ✕ y
Escape **sin tocar la ruta**; una fila navega y cierra; el scroll del fondo se bloquea y se
libera; el foco entra en el primer destino y **vuelve a la pestaña "Más"** al cerrar sin navegar.
Sin desbordamiento horizontal en ninguna ruta a 320px ni a 402px, y **todos los objetivos
táctiles ≥44px**.

**Dos cosas que se cayeron al probarlas de verdad:**

- El foco no volvía a la pestaña al cerrar, aunque el comentario del componente decía que sí.
  Peor: el primer intento de arreglo tenía una guarda equivocada (`closest("a")`) que lo
  suprimía precisamente en el caso que quería cubrir. Ahora se distingue explícitamente "cierro
  porque me voy" de "cierro porque desisto".
- El pico de la hoja apuntaba ~9px a la izquierda del centro de la pestaña: la hoja va metida
  12px por lado y la barra solo 6, y el 87,5 % no es el mismo punto en las dos. Corregido a
  88,5 %, que se mantiene dentro de ±2px de 320px al ancho máximo.

**Se retira `Sidebar.vue`** de `App.vue` (no se borra: es el mapa de navegación que heredará el
rediseño de escritorio). Con ella se va el hueco de 220px que siete vistas reservaban a mano.

**Sigue sin construirse** el conmutador móvil/escritorio: llega en la fase 7a, con la primera
divergencia real. Tampoco hay mecanismo para títulos de cabecera dinámicos —la ficha necesitará
"EL GRADO · PRIMERO"—; se añadirá en la fase 4b, cuando exista la necesidad concreta.

---

## Fase 3 — Mapa del grado / "The Spine" (`#1c`, `/grado`) · ✅ **COMPLETADA**

**Objetivo:** la pantalla organizadora, la que da sentido al rediseño. Se hace pronto porque es
la que valida las primitivas de la Fase 1 con datos reales.

**Entregables**

- `composables/useDegreeMap.js` — por cada curso 1-4: `avgPass` (`courseRate(c,'rendimiento')`),
  `nTroncales` (`coreSubjects`), `nOptativas` (`optionalSubjectsOf`), y las asignaturas
  ordenadas por `noSuperacion` desc (`subjectSummary`). Todo sobre `metrics.js`, cero fórmulas
  nuevas.
- `views/DegreeMap.vue` (**vista nueva**) — timeline con línea `#D7CDB9` de 2px, nodos navy de
  21px, bloque por curso (título Spectral 18px + caption "aprueban X% de media"), cabecera de
  grupo `TRONCALES · N` + `% que no aprueba`, filas de asignatura, enlace `＋ N troncales más`.
- Subgrupo `OPTATIVAS · N` en 3º y 4º (eyebrow oro `#A8813A`, filas con borde discontinuo,
  puntos huecos).
- Cuarto colapsado en tarjeta informativa `#EEF0F5`.
- Enlaces: nodo/título de curso → `/grado/:curso`; fila → `/asignatura/:code`.
- Afordancia "ver como lista" → `/asignaturas` (handoff §6, nota sobre El Grado).

**Aceptación:** cifras contrastadas contra el escritorio actual (`Course.vue`); ningún número
hard-codeado; la expansión "＋ N más" funciona.

### Resultado

`composables/useDegreeMap.js` + `views/DegreeMap.vue`. El composable **no calcula ninguna tasa**:
agrupa, separa troncales de optativas y ordena por dificultad, que son decisiones de
presentación. Todo lo demás sale de `metrics.js`.

**Comprobado con datos reales:** 12 · 9 · 6 · 6 troncales, 21 optativas en 3º, y aprueban
77 % · 77 % · 76 % · 94 %. Las cifras del mock (74 %, 76 %) eran de una versión anterior de los
datos; las de la web se calculan.

**"El curso más amable" se verifica, no se escribe.** Cuarto lo es hoy por veinte puntos, pero
es una afirmación sobre datos que cambian: el composable comprueba cuál es el curso con más
aprobados y la frase solo aparece si sigue siendo Cuarto.

**Interacciones probadas por CDP:** sin desbordamiento a 320px · 16 filas al entrar · desplegar
1º pasa a 24 y el botón cambia a "− ver menos" · plegar vuelve a 16 · el nodo lleva a
`/grado/1` y la fila a `/asignatura/26907`.

### Una contradicción del handoff que hay que decidir

El handoff §5 exige **objetivos táctiles ≥44px "en todas partes (…filas de lista…)"**, pero su
propio mock dibuja las filas de asignatura a **~31px**. No se puede cumplir lo uno sin
incumplir lo otro.

**Decidido: 44px**, porque una regla de accesibilidad explícita pesa más que la densidad, y
rebajarla en silencio sería justo el tipo de cosa que no se debe hacer sin decirlo. El coste es
real: la lista queda ~40 % más alta y de un vistazo entran dos cursos en vez de tres.

⚠ **Es reversible en una línea** (`min-height` de `.row` en `DegreeMap.vue`). Si se prefiere la
densidad del mock, decidirlo aquí y aplicar el mismo criterio a las listas de la fase 5.

---

## Fase 4 — Drill-down: Vista de curso y Ficha de asignatura · ✅ **COMPLETADA**

**Objetivo:** completar el camino Spine → Curso → Ficha, el eje del handoff §8.

### 4a. Vista de curso — `#3a` (`/grado/:curso`)
- Badge de año + resumen (`X% aprueban · Y% no se presentan · N troncales · M optativas`, con
  el conteo de troncales en navy y el de optativas en oro).
- "Dificultad de las troncales": barras horizontales sobre la rampa, ordenadas desc.
- Sección `TRONCALES · N`: tarjeta por asignatura (blanca) con matriculados, % no superan
  grande, pie (aprueban, no pres.), "Ver ficha →" + `＋ N troncales más`.
- Sección `OPTATIVAS · N`: eyebrow oro, tarjetas discontinuas, nota "también se ofertan en 4º",
  "Ver todas las optativas →".
- Reutiliza la lógica de `Course.vue` / `DifficultyOfSubjectsYear.vue` vía composable.

### 4b. Ficha de asignatura — `#2a` (`/asignatura/:code`)
La pantalla con más superficie de datos; cada bloque mapea 1:1 con un panel existente.
- Fila de tags (`TRONCAL`, `1º CURSO`, `CÓD. 26907`) + título Spectral 27px + banner de
  veredicto (paleta "dura"), con el ranking calculado (`rankSubjects`).
- **INDICADORES**: selector de curso académico (`subjectYears(code)`) + 6 tarjetas KPI en 2
  columnas con deltas contra la media de 3 años (`subjectRateBefore`).
- Distribución de calificaciones: barra apilada con la paleta categórica (D2) + leyenda de 2
  columnas con recuentos (`distribution(row)`).
- "No superan, curso a curso": barras sobre la rampa (`subjectSeries`), última en negrita.
- "Frente a las troncales de Nº": 2 barras (asignatura vs media del curso en gris) + conclusión.
- Profesorado y guía: lista de docentes + botón navy "Ver guía docente →" + "PDF"
  (`TeachingInfo.vue` / `Profesores_GuiasDoc.json`). ⚠ Riesgo 7: hay optativas que no se ofertan
  este curso — usar el año más reciente con guía y, si no hay ninguna, ocultar el botón.

**Aceptación:** cambiar el año recalcula los 6 KPIs y la distribución; los enlaces externos
abren con `rel="noopener"`; cohorte pequeña muestra ⚠ y su nota.

### Resultado

| Entregable | Fichero |
|---|---|
| Datos de curso | `composables/useCourse.js` |
| Datos de asignatura | `composables/useSubject.js` |
| Cabecera dinámica | `composables/usePageHeader.js` |
| Vista de curso | `views/Course.vue` (reescrita) |
| Ficha | `views/Subject.vue` (**renombrada** desde `Dashboard.vue`) |
| Nuevas primitivas | `UiMeterRow`, `UiSubjectCard` |

**`Dashboard.vue` → `Subject.vue`.** El fichero se reescribía entero y "dashboard" no describe una
ficha de asignatura. La ruta no cambia.

**La cabecera dinámica llega ahora, no antes** (se aplazó en la fase 2 hasta que hubiera una
necesidad concreta): la ficha necesita el eyebrow "EL GRADO · PRIMERO", y de qué curso es una
asignatura no está en la ruta sino en el catálogo. `usePageHeader` deja que la pantalla afine
`title`, `eyebrow` y `back`; el `meta` de la ruta sigue mandando por defecto.

**El selector de año paga los 12 cursos de datos oficiales.** Comprobado: pasar de 2024-2025 a
2019-2020 cambia los seis indicadores **incluidas las convocatorias** (1,57 → 1,24) y la
distribución (139 → 108 matriculados). Antes de la reingesta de datos ese KPI habría mostrado
`—` en once de los doce años.

**Casos límite probados:** código inexistente y curso inexistente dan aviso estructural con
salida; una optativa no ofertada este curso (26934) cae a la guía docente del año más reciente
que la tenga (riesgo 7); una cohorte de 9 alumnos (26909 Biología) muestra el aviso ámbar. Sin
desbordamiento a 320px en ninguna de las cinco rutas.

### Dos cosas aprendidas por el camino

- **`unref()` no resuelve getters.** `useCourse(() => route.params.curso)` devolvía `NaN` y la
  pantalla decía "ese curso no existe". Los dos composables usan ahora un `read()` que acepta
  valor, ref o función.
- **Tras tocar un composable hay que reiniciar Vite antes de fiarse de una comprobación.** Dos
  "fallos" de la cabecera fueron módulos rancios de HMR, no código. Se perdió un rato
  depurando algo que ya funcionaba.

### Desviaciones del mock, deliberadas

- **El veredicto solo sale si la asignatura está entre las tres más duras de su curso.** Una
  troncal de media tabla no necesita banner rojo, y ponerlo igualmente convierte un aviso en
  decoración.
- **La frase de la serie compara el primer curso con el último** (56 % → 61 %), no el mínimo con
  el último como hacía el mock ("en 2019-20 el 19 %; hoy el 61 %"). Elegir el mínimo como base
  exagera la tendencia, y esta web va justo de lo contrario.
- **"La troncal más dura de primero"**, no "del grado": el ranking se calcula dentro del curso,
  así que afirmar lo otro sería decir más de lo que se ha medido.

---

## Fase 5 — Listas: Asignaturas y Optativas · ✅ **COMPLETADA**

**Objetivo:** la maquinaria compartida de búsqueda / filtro / orden.

**Entregables**

- `composables/useSubjectList.js` — búsqueda en vivo, filtros (todas/troncales/optativas/curso),
  orden por métrica con dirección, **orden por defecto `noSuperacion` desc**. Compartido por
  ambas pantallas y reutilizable por el escritorio.
- **Asignaturas `#9a`** (`/asignaturas`): buscador (`Buscar entre {{ n }} asignaturas…`, n
  calculado — ver D4), chips de filtro (activo = relleno navy), cabecera de columna ordenable
  `#ECE5D7`, filas densas (punto de dificultad + nombre + línea meta mono + % grande), ⚠ en
  cohortes pequeñas, `＋ N asignaturas más`.
- **Optativas `#4a`** (`/optativas`): resumen (`21 optativas · N matrículas/año · X% aprueban`,
  el 21 en oro), "Las más elegidas" con **barras grises** (es un recuento, no dificultad —
  handoff §4), buscador + chips de orden (`Populares / Más fáciles / ＋ Sob·MH / A-Z`), tarjetas
  de optativa discontinuas sobre `#FCFAF5`, nota de cohorte pequeña, regla al pie.

**Aceptación:** estados vacíos de búsqueda; orden y filtro combinables; las barras de
popularidad son grises en cualquier caso.

### Resultado

`composables/useSubjectList.js` + `views/Subjects.vue` y `views/Optatives.vue` reescritas.
`UiSubjectCard` gana la variante de optativa (Sob+MH en vez de no presentados) y `UiChip` la
forma rectangular: **píldora para filtrar** (quitar cosas) y **rectángulo para ordenar** (las
mismas cosas en otro orden) son gestos distintos y el diseño los separa por la forma.

**Probado con Chrome dirigido:** orden por defecto (más duras primero) · reordenar por
matriculados · filtro Optativas · filtro + búsqueda combinados · búsqueda sin resultados →
estado vacío · los cuatro órdenes con nombre de Optativas (Populares / Más fáciles / ＋ Sob·MH /
A–Z) devuelven cada uno lo suyo. Sin desbordamiento y con todos los objetivos ≥44px a 320px.

**Densidad:** se mantienen los 44px decididos en la fase 3, ahora también aquí. Las filas de la
lista maestra llevan dos líneas y llegan a ~52px de forma natural, así que el coste es cero;
donde se nota es en el mapa del grado.

### El fallo que encontró "Más fáciles"

Ordenar optativas por facilidad saca arriba las de cohorte diminuta, y ahí se vio que **el aviso
de cohorte pequeña no saltaba**: se calculaba sobre el total acumulado de los tres cursos
(`recentStudents`) mientras la tarjeta enseñaba la matrícula **media**. Resultado: una tarjeta
que decía "7 matr." y "0 % no superan" sin una sola advertencia, justo en el primer puesto de
"las más fáciles".

Ahora el umbral se mide sobre **la misma cifra que se enseña**. Cuadrarlo con un número que el
lector no ve es como no tenerlo. Corregido en las tres listas (`useSubjectList`, `useCourse`,
`useDegreeMap`); la ficha ya usaba los matriculados del año concreto, que es lo correcto ahí.

Además, con cohorte pequeña el pie de la tarjeta **sustituye** los porcentajes por el aviso, en
vez de añadirlo debajo: decir "aprueban el 100 %" justo encima de "los porcentajes bailan mucho"
es contradecirse en dos líneas.

---

## Fase 6 — Inicio (`#8a`, `/`) y gráficas tematizadas · ✅ **COMPLETADA**

**Objetivo:** la portada — *"a dashboard opens with numbers, not charts"* — y el re-tematizado
de chart.js.

**Entregables**

- `components/charts/` — wrappers de `vue-chartjs` con el tema nuevo: sin rejilla pesada, tipografía
  IBM Plex Mono en ejes, tooltips en la paleta de papel, `maintainAspectRatio:false` y alturas
  fijas por móvil. Un solo módulo de opciones base, reutilizado.
- Héroe navy (identidad, título, línea honesta sobre el origen oficial de los datos, motivo de
  círculos concéntricos tenue).
- 4 tarjetas KPI en rejilla 2×2 (nota de corte, aprueban, no presentados, convocatorias) con
  numeral mono 24px y delta coloreado (`#B5482F` baja / `#4A6A44` sube). Datos de
  `DegreeKpiRow.vue` + `NotasDeCorteRaw.json`.
- "Notas de acceso": gráfica de líneas 2020-2025 (media `#4C6699` / corte `#C4642F`) +
  conclusión (`AdmisionGrades.vue`).
- Aviso de la asignatura más dura (paleta "dura") → enlace a su ficha (`WorstSubject.vue`).
- Tendencia de aprobados: barras neutras de 12 años (`YearsTroncComparation.vue`).
- Frescura por fuente desde `DATA_SOURCES` + descargo de responsabilidad al pie.

**Aceptación:** las 4 fuentes muestran su curso real y distinto; las gráficas legibles a 320px.

### Resultado

`composables/useDegree.js` + `views/Home.vue` reescrita + `components/charts/LineChart.vue`.

### Cambio de plan: SVG a mano en lugar de chart.js

El plan pedía envoltorios de `vue-chartjs` tematizados. Al llegar aquí, **la portada necesita
UNA gráfica de líneas** — la tendencia de aprobados son barras, como la serie de la ficha, y esas
ya se hacen con `<div>`. Traer una librería de dibujo entera, su capa de tematizado y su canvas
para un solo gráfico sale caro en bytes y en peleas con el estilo: este diseño quiere ejes en
mono, sin rejilla y con los tonos del papel, que en chart.js son treinta líneas de opciones y en
SVG cuatro atributos. Y en SVG el texto **es texto**: se selecciona, lo lee un lector de pantalla
y escala con el zoom.

**Consecuencia útil:** tras esta fase quedan **catorce componentes de `components/Dashboard/`
huérfanos**, entre ellos los ocho que importaban chart.js. Solo siguen vivos `FightPanel`,
`FightModeResult`, `ProfGraph` y `ProfWeb` — y la fase 7 reescribe Fight Mode y Profesorado. Es
muy probable que **chart.js se pueda desinstalar en la fase 9**; hay que comprobarlo entonces, no
antes.

### La serie de notas de acceso: 16 años, no 6

El mock dibuja 2020-2025 porque era lo que había cuando se diseñó. Con los 16 cursos que trajo la
reingesta, la gráfica cuenta algo que en seis puntos no se ve: **la nota de corte fue un 5,0
plano hasta 2014** —es decir, entraba todo el mundo— y a partir de ahí subió hasta rozar el 12,2.
Esconder diez años disponibles en una web que va de datos abiertos no tenía defensa.

El eje Y **no arranca en cero** a propósito: estas notas se mueven entre 5 y 13, y forzar el cero
aplastaría dieciséis años de historia en una franja. Queda anotado en el componente.

### Comprobado

Cifras reales frente a las del mock: nota de corte **10,375 ▼1,79 vs 2024** (coincide exacto),
aprueban **79 %** (el mock decía 82 %), no presentados **9 %** (8 %), convocatorias **1,32**
(1,34). Las tres últimas venían de datos anteriores; las de la web se calculan.

Sin desbordamiento y con todos los objetivos ≥44px a 320px y a 402px.

Dos arreglos de formato que se vieron en pantalla: el delta usaba punto decimal ("1.79" en una
web en español) y las tasas se rotulaban con el nombre oficial ("Tasa de rendimiento") en vez de
en román paladino ("Aprueban"). El nombre oficial sigue en `metrics.js`, que es de donde lo toma
la metodología.

---

## Fase 7 — Pantallas secundarias (las 4 del roll-up) · ✅ **COMPLETADA**

### Resultado

| Pantalla | Ficheros |
|---|---|
| Profesorado | `composables/useProfessorNetwork.js` · `composables/useViewport.js` · `views/Faculty.vue` |
| Fight Mode | `composables/useFight.js` · `views/FightMode.vue` (reescrita) |
| Metodología | `views/Methodology.vue` (reescrita, **texto intacto**) |
| Acerca de | `views/About.vue` (contenido real) |

**D1 queda demostrada, no solo argumentada.** Comprobado con el navegador: a 402px se ve la
lista persona a persona y **no** hay grafo; a 1200px se ve el grafo y **no** hay lista. Y en el
build, `vis-network`/`cytoscape` **no aparecen en el chunk principal**: viven en `ProfWeb`
(515 kB JS + 221 kB CSS) que solo se pide por encima de 900px. `Faculty` pesa 5 kB.

Ese es el patrón para todo lo que el escritorio agregue y el móvil no pueda tener: composable de
datos compartido + componente de presentación por viewport + carga diferida. Nunca una segunda
copia de la aplicación.

**El cambio aditivo a `NodesLinks.js`** (riesgo 3 de la fase 0) ya está: `weight`, `shared`,
`fullName`, `subjects` y `years` salen como campos propios en vez de vivir dentro de la cadena
`title` del tooltip. `value` y `title` se dejan intactos, así que el grafo de escritorio sigue
igual. Los pesos coinciden con los del mock hasta el céntimo (2,53 / 1,64 / 1,12 / 0,99 / 0,96),
que es la señal de que el modelo es el mismo.

**Fight Mode conserva la regla de los matriculados:** cuatro duelos entre troncales, cinco
cuando las dos son optativas. Verificado cambiando los contendientes en el navegador. Si falta
un dato el duelo queda en empate en vez de inventarse un ganador.

**Acerca de deja los tres huecos de colaborador sin rellenar**, en gris de marcador. Inventar
nombres en la página que dice quién responde de los datos sería la peor forma posible de
estrenar una web que va de no fiarse de los rumores.

### Un formateo que no se puede delegar

`(2003).toLocaleString("es-ES")` devuelve **"2003"** en Chrome headless: reconoce el locale pero
no aplica la agrupación, porque está compilado con ICU reducido. Para meter un punto cada tres
dígitos en una web que solo está en español, la dependencia no compensa el riesgo — se formatea
a mano.

### Cosas que se dejan como están

- Algún nombre del profesorado viene en mayúsculas desde el scraper (`GUILLERMO ROYO CAL…`).
  Normalizar mayúsculas en nombres españoles —con sus «de», «la», «Mª»— rompe más de lo que
  arregla. Se muestra tal y como lo publica la fuente.
- El hamburguesa que el mock dibuja en el héroe de la portada **no se implementa**: con la barra
  de pestañas y la hoja "Más" no tiene nada que abrir, y duplicar navegación confunde.

### 7a. Profesorado `#6a` (`/profesorado`) — *el rediseño más profundo* · **la única divergencia real**
El grafo de fuerzas (267 nodos / 2.003 aristas) es ilegible en móvil, así que el móvil va
**persona a persona**; el grafo completo se queda en escritorio.

**Aquí es donde aterriza el mecanismo de D1**, y solo aquí:

- `composables/useViewport.js` — `matchMedia` reactivo, breakpoint ≈900px. Se crea **ahora**,
  no antes.
- `ProfWeb.vue` / `ProfGraph.vue` se quedan **tal cual, sin tocar**: son el componente
  solo-escritorio. Se cargan con `defineAsyncComponent` bajo `v-if="isDesktop"`, de modo que
  `cytoscape` y `vis-network` nunca lleguen a un móvil.
- `views/Faculty.vue` (nueva) elige entre la lista ego (móvil) y el grafo completo (escritorio).

Contenido móvil:
- **Primero**, cambio aditivo en `NodesLinks.js` (ver riesgo 3, ya verificado): exponer `weight`,
  `shared`, `fullName` y `subjects` como campos de nodos y aristas. El dato ya se calcula, pero
  hoy solo sobrevive dentro de la cadena `title`. No tocar `value`/`title`: el grafo de
  escritorio debe seguir funcionando igual.
- `composables/useProfessorNetwork.js` sobre `NodesLinks.js`: ranking por alcance y, por
  profesor, `subjects[]` + `topCollaborators[] {name, weight(1/n), sharedCount}`.
- Título + explicación del peso 1/n + fila de estadísticas. **Ojo:** son 267 profesores y 2.003
  colaboraciones (el mock acierta) pero **10 cursos, no 8** (riesgo 8). Calculadas, no escritas.
- Aviso informativo con glifo de grafo + "Ver red completa →". Con un único código base este
  enlace **no** puede ser un enlace externo a otra build: es la misma ruta vista en pantalla
  ancha. Copy a ajustar en consecuencia (invita a abrirlo en pantalla grande, no navega a otro
  sitio) — desviación mínima y justificada respecto del handoff, que asumía dos versiones.
- Buscador + lista rankeada; fila seleccionada con borde izquierdo navy y fondo `#EEF0F5`.
- Tarjeta de ego-network: IMPARTE (píldoras con contorno navy) + COLABORA MÁS CON (barras
  **grises**, peso mono, nº de asignaturas compartidas). Pie: "el TFG se excluye".

**Este es el patrón a repetir** cuando el escritorio agregue más funcionalidad que el móvil no
pueda tener: composable de datos compartido + componente de presentación por viewport, cargado
en diferido. Nunca una segunda copia de la app.

### 7b. Fight Mode `#5a` (`/fight`)
- Dos ranuras de contendiente con autocompletado ("cambiar ▾") + medallón VS (círculo navy, "VS"
  oro, la única sombra fuerte).
- Banner de veredicto en oro sobre `#FBF5E7` (trofeo + marcador).
- Filas de duelo en rejilla `1fr 90px 1fr`; celda ganadora con borde y fondo oro + "gana".
  Métricas en orden: más fácil de superar, tasa de éxito, no presentados, excelencia.
  **5ª fila (matriculados) solo si ambas son optativas** — misma regla que hoy en `FightPanel`.
- Reutiliza la lógica de `FightPanel.vue` / `FightModeResult.vue`.

### 7c. Metodología `#7a` (`/metodologia`)
- La tabla oscura y ancha del escritorio pasa a tarjetas apiladas.
  **Textos verbatim desde `Methodology.vue` — no parafrasear** (handoff §7.9).
- 3 recuentos base como tarjetas numeradas; 7 indicadores como tarjetas con su **píldora de
  denominador en navy** (`÷ matriculados` / `÷ presentados`) tomada de `METRICS[].base`;
  4 tarjetas de fuente con su "último" curso real + "Fuente →"; 7 limitaciones con teselas de
  glifo.

### 7d. Acerca de `#10a` (`/acerca`) — **ruta nueva**
- Misión, crédito real a `@aaleta` + **3 huecos de colaborador editables** en `#9A9182` con
  avatares "··". **No inventar nombres** (handoff §7.10).
- "Cómo se hizo" → enlaces a Metodología; CTA navy a GitHub; descargo en aviso estructural.

---

## Fase 8 — Estados, accesibilidad y fluidez · ✅ **COMPLETADA**

### Resultado

**Contraste: de 21-52 fallos por pantalla a CERO.** Auditadas las diez rutas midiendo cada nodo
de texto contra su fondo real. Detalle abajo.

**Carga** — `composables/useNavigationProgress.js`. Una barra fina bajo la cabecera que **no
aparece durante los primeros 180 ms**. Comprobado: en navegación instantánea no se ve nada a los
90 ms; con la red estrangulada aparece a los 500 ms y desaparece al llegar la pantalla.

**Vacío** — las dos listas, el buscador de profesores, y avisos con salida para código o curso
inexistentes. Ya estaban de fases anteriores; aquí solo se han verificado.

**Cohorte pequeña** — ⚠ y nota en lista, tarjeta y ficha, medido siempre sobre la cifra que se
enseña (arreglado en la fase 5).

**Fluidez** — sin desbordamiento horizontal en **320, 360, 402, 430, 768 y 1280 px**.

**Movimiento** — con `prefers-reduced-motion: reduce` las transiciones caen a 0,00001 s y la hoja
"Más" **sigue abriéndose**: se quita la animación, no la función.

**Foco** — contorno de 2px visible al tabular.

**COVID** — descartado por decisión del usuario; no se anota nada en las series.

### El hallazgo gordo: la paleta de grises apagados no cumplía

El handoff define cuatro niveles de gris para texto secundario (`#8A8275`, `#A49A86`, `#948C7E`,
`#9A9182`). Sobre el papel dan entre **2,4:1 y 3,3:1**, y el texto normal necesita 4,5:1. No es
un matiz decorativo: son los eyebrows, las líneas de metadatos, las notas al pie y los enlaces
"＋ N más" — contenido real, y alguno pulsable.

Y hay un límite duro: **por encima de 4,5:1 sobre este fondo no caben cuatro grises
distinguibles**. Cualquiera que cumpla acaba pegado a los demás. Así que la escala baja a **dos
niveles** y la jerarquía la sostienen el tamaño y el peso — que es lo que el diseño ya hacía de
todos modos: estos textos van a 8,5–10px frente a los 12,5px del cuerpo.

Otros cuatro arreglos del mismo tipo:

- **Numerales de la rampa a 15,5px** (tarjeta de asignatura, celdas de Fight Mode) usaban el tono
  claro. 15,5px no llega a "texto grande" (18,66px en negrita), así que les toca el tono
  oscurecido. Los de 21-23px sí son texto grande y se quedan como estaban.
- **Recuentos dentro de la barra apilada de notas**: en blanco fijo se quedaban en 2,1:1 sobre el
  gris de "no presentados". Ahora se elige la tinta que más contraste dé y, si **ninguna** llega
  a 4,5:1 —le pasa al azul de los notables, 4,05 con blanco y con negro— **la cifra no se pinta**.
  No se pierde nada: la leyenda lleva los seis recuentos. Antes que un número ilegible, ninguno.
- **Cabecera ordenable**: va sobre `#ece5d7`, más oscuro que el papel; usa tinta secundaria.
- **Oro sobre navy** (el «VS», la «AA», la «F») se quedaba en 4,43. Se aclara el oro un 1 %, que
  no se nota y arregla los tres a la vez. El trofeo pasa de blanco a navy: blanco sobre oro son
  2,4:1.

### Un fallo que solo se veía en pantalla ancha

Las bandas navy —el héroe de la portada y la fila de cifras del mapa— quedaban recortadas al
ancho de la columna mientras la cabecera cruzaba toda la pantalla: en un portátil parecían una
caja azul suelta colgando. Añadida la utilidad `.fullBleed`, que estira la banda de borde a
borde y devuelve su contenido a la columna.

**Objetivo:** lo que el handoff §9 exige y suele quedarse fuera.

- **Carga** — esqueletos en el estilo del código (aunque el JSON sea síncrono, las rutas son
  `import()` diferidos: la transición existe).
- **Vacío** — sin resultados de búsqueda/filtro, en cada lista.
- **Cohorte pequeña (<10)** — ⚠ `#C89A2E` + "los porcentajes bailan mucho" + preferir recuentos
  absolutos. Consistente en lista, tarjetas y ficha (`isSmallCohort` ya existe).
- **Años COVID / desajuste de fuentes** — anotación sutil y consistente donde se grafique.
- **Fluidez 320px → tablet**: el mock es de 402px fijos; verificar a 320, 360, 402, 430 y 768.
- **Pantalla ancha (≥900px)**: no es objetivo de este esfuerzo, pero **debe ser presentable, no
  vergonzoso**: layout móvil centrado con `max-width`, sin texto estirado a 1600px ni gráficas
  deformadas. Es lo que verá cualquiera que abra la web en un portátil hasta que llegue el
  rediseño de escritorio.
- **Accesibilidad**: contraste AA en la rampa sobre papel, `aria-current` en las pestañas, roles
  de diálogo en el roll-up, foco visible, `prefers-reduced-motion` respetado.
- **Animación contenida**: subida del roll-up, feedback de pulsación en chips, transiciones de
  lista. Nada más (handoff §8).

---

## Fase 9 — Verificación y cierre

- Repaso pantalla a pantalla contra los ids del prototipo (`#1c`, `#8a`, `#3a`, `#2a`, `#9a`,
  `#4a`, `#6a`, `#5a`, `#7a`, `#10a`, `#11a`), con capturas lado a lado.
- **Auditoría del contrato de color** (§4): recorrer cada color usado y clasificarlo en
  estructura / dificultad / recuento / categoría de nota. Cualquiera que no encaje es un fallo.
- **Auditoría de "un solo origen"**: `grep` de porcentajes y contadores literales en las vistas
  nuevas — no debe quedar ninguno.
- `npm run lint` + `npm run format` + `npm run build`; comprobar el build con `base:
  /unizar_dashboard/` y rutas hash.
- **Comprobar el reparto de bundles**: `cytoscape` y `vis-network` deben quedar en un chunk
  diferido que un móvil nunca descarga (consecuencia directa de D1 — si no se cumple, el
  `defineAsyncComponent` de la Fase 7a está mal puesto).
- Prueba en dispositivo real (safe areas del notch, barra de direcciones de iOS Safari).
- **Inventario de deuda de escritorio**: listar qué quedó roto o sin rediseñar y qué componentes
  antiguos siguen vivos (`Sidebar.vue`, `views/` no migradas, `components/Dashboard/*`). Es el
  punto de partida del siguiente esfuerzo, y conviene escribirlo mientras está fresco.
- Actualizar `README.md` del repo; borrar este documento.

---

## Huecos y riesgos de datos (verificar pronto)

**Todos verificados en la Fase 0** contra los ficheros reales de `data/`. Resultado:

| # | Asunto | Verificado | Qué hacer |
|---|---|---|---|
| 1 | **Convocatorias oficiales** | ✅ **RESUELTO** (23-07-2026). Los nuevos CSV de `data/xlsx_csv/rendimiento/` traen **12 cursos (2013-2014 → 2024-2025), 611 filas** en vez de 53 de un solo curso | Ya no hace falta ningún `—`: el selector de año de la ficha tiene dato en todos los cursos. Quedan 9 asignaturas de 54 sin los doce (optativas que no se ofertan siempre): ahí se cae al curso más reciente con dato y **se dice cuál es** |
| 2 | **"53 asignaturas"** del mock | ⚠ **Confirmado:** el catálogo tiene **54** códigos | Calcular con `allSubjects.length` (D4) |
| 3 | **`sharedCount`** de colaboradores | ✅ **Existe el dato, pero no está expuesto.** `NodesLinks.js:98-102` ya acumula `{weight, shared}`… y luego lo entierra en la cadena `title` de la arista (`NodesLinks.js:129-131`). Igual pasa con `fullName` y `subjects` en los nodos | Cambio **aditivo** en `NodesLinks.js`: sacar `weight`, `shared`, `fullName` y `subjects` como campos propios. Sin tocar `value`/`title`, así el grafo de escritorio sigue igual. **Prohibido parsear el `title`** |
| 4 | **Serie de notas de corte** | ✅ **AMPLIADA** (23-07-2026). Ya no son 6 cursos sino **16 (2010-2025)**. Además las columnas cambiaron de nombre y la serie de nota media venía **corregida** al alza en cinco años | El mock dibuja 2020-2025; con 16 años se puede enseñar la serie completa, que cuenta mucho mejor la historia (la nota de corte era un 5 hasta 2014). **A decidir en la Fase 6** |
| 5 | **Tendencia de aprobados** | ✅ **12 cursos, 2013-2014 → 2024-2025** | Coincide con los "12 años" del mock |
| 6 | **Guías docentes** | ✅ Cobertura **100 %** de `guia_docente_web`, `guia_docente_pdf` y `profesores` en las 53 asignaturas de 2026-2027 | Ver el matiz del punto 7 |
| 7 | **Catálogo ≠ guías** (nuevo) | ⚠ **26934 Física de la atmósfera** y **26939 Iluminación y colorimetría** están en el catálogo y tienen notas, pero **no se ofertan en 2026-2027** (son optativas que alternan). **26943 Prácticas externas** está en las guías pero sin notas ni clasificación | La ficha **no** puede asumir guía del curso actual: usar el año más reciente que la tenga, y si no hay ninguna, ocultar el botón en vez de enlazar a nada |
| 8 | **"8 cursos" del mock** (nuevo) | ⚠ Reproducida la red real: **267 profesores ✅ · 2.003 colaboraciones ✅ · pero 10 cursos**, no 8 (2017-2018 → 2026-2027) | Los dos primeros números del mock son correctos; el tercero está desfasado. Calcular los tres (D4) |

---

## Datos nuevos (23-07-2026)

El repositorio incorporó cinco carpetas nuevas de datos abiertos de la Universidad. La mayoría
cubre cosas que la web **no** hace todavía y se dejan para más adelante; dos afectan de lleno a
lo que ya existe y ya están integradas.

### Integrado

| Fuente | Qué aporta |
|---|---|
| `xlsx_csv/rendimiento/` (12 CSV) | Sustituye al desaparecido `resultados.csv`. Tasas oficiales y **media de convocatorias por asignatura y curso, 12 años**. Resuelve el riesgo 1 |
| `xlsx_csv/notas_de_corte.xlsx` | Renombrado (antes `Notas_de_corte.xlsx`), **16 cursos** en vez de 6 y columnas nuevas. Serie de nota media corregida |

### Aparcado — funcionalidad que la web no tiene

| Fuente | Qué contiene | Para qué serviría |
|---|---|---|
| `resultados/` (12 CSV) | Nivel titulación: matriculados, nuevo ingreso, plazas ofertadas, graduados, duración media, tasas de abandono/graduación/eficiencia | Una pantalla de "el grado en conjunto": ¿cuánta gente entra, cuánta acaba, en cuántos años? Hoy la web no habla de eso |
| `procedencia/` (16 CSV) | De qué comunidad autónoma viene el alumnado, sexo, dedicación | Perfil de quién estudia el grado |
| `egresados/` (12 CSV) | Graduados, abandonos, traslados, por tipo de egreso y sexo | La otra cara de la tasa de abandono |
| `erasmus/` (11 CSV) | Movilidad: plazas por universidad, país, idioma | Un buscador de destinos Erasmus |

⚠ **Ojo con `resultados/`**: trae `TASA_RENDIMIENTO` y `TASA_EXITO` a nivel de titulación, que la
web ya calcula desde las calificaciones. **No mezclar.** La metodología explica que las dos
fuentes discrepan y que se usa una sola; tomar la tasa oficial del grado rompería esa promesa.

### Calidad de los CSV

~60 filas de 61.000 vienen partidas: hay nombres de asignatura con saltos de línea sin
entrecomillar, y eso corre todas las columnas del registro. **Ninguna es de Física**, pero
`Updater.py` ahora lee todo como texto y convierte los números a mano, para que un curso
contaminado no vuelva `CURSO_ACADEMICO` un campo de texto y contamine el proceso en silencio.

---

## Orden y dependencias

```
Fase 0 ──> Fase 1 ──> Fase 2 ──┬─> Fase 3 ──> Fase 4
                               ├─> Fase 5
                               ├─> Fase 6
                               └─> Fase 7
                                     └──────> Fase 8 ──> Fase 9
```

Las fases 0-2 son estrictamente secuenciales (todo lo demás depende del shell y los tokens).
La 3 va antes que la 4 porque el Spine es la pantalla que define el lenguaje visual. Las fases
4-7 son independientes entre sí una vez existe el shell.

**Punto de control recomendado:** enseñar el resultado tras la Fase 3 antes de seguir — es el
momento más barato para corregir el rumbo del lenguaje visual.

---

## Qué pasa con el escritorio mientras tanto

Consecuencia asumida de D1, escrito aquí para que no sorprenda a nadie:

- A partir de la **Fase 1** el tema oscuro desaparece y las vistas de escritorio que aún no se
  han migrado se verán mal (texto claro sobre papel claro, sidebar oscura sobre fondo cálido).
  **Es esperado.**
- A partir de la **Fase 2** la `Sidebar.vue` deja de montarse; la navegación en pantalla ancha
  pasa a ser la tab bar inferior. Funcional, pero claramente no diseñada para escritorio.
- Al final de la Fase 9 la app es **una app móvil bien hecha que también se abre en un
  portátil**, con el layout contenido y legible. No es un escritorio diseñado.

**Lo que el siguiente esfuerzo hereda ya construido** (y que es justamente lo que justifica no
haber hecho dos versiones):

| Ya hecho | Dónde |
|---|---|
| Tokens, tipografía, contrato de color | `theme/` |
| Rampa de dificultad, paleta de notas | `theme/difficulty.js`, `theme/gradePalette.js` |
| Primitivas del sistema de diseño | `components/ui/` |
| Toda la lógica derivada, sin UI | `composables/` |
| Gráficas ya tematizadas | `components/charts/` |
| Patrón de divergencia por viewport | `useViewport()` + Fase 7a |
| Rutas y redirecciones definitivas | `router/index.js` |

El rediseño de escritorio será entonces, sobre todo, **layout**: rejillas más anchas, navegación
lateral, y las agregaciones que solo caben en pantalla grande. No hay que rehacer ni el sistema
de diseño ni la capa de datos.
