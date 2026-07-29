# Plan de implementación — Escritorio

> **Documento de trabajo.** Organiza *cómo* llevar `design_handoff_escritorio/`
> al código de `web/`. No re-especifica el diseño: la fuente de verdad son
> `design_handoff_escritorio/README.md` y los once ficheros de
> `design_handoff_escritorio/pantallas/*.html` (se abren en el navegador a
> 1440 px). Cuando el escritorio esté terminado, este fichero se borra y lo que
> haya que recordar se muda a `docs/DISENO.md`.

---

## 0. El código que hay hoy

| Área | Situación |
|---|---|
| Stack | Vue 3.5 (`<script setup>`) + Vite 8 + vue-router 5 con **hash history**. Sin store: los JSON se importan estáticamente y todo lo demás son funciones puras y `computed`. |
| Datos | `utils/metrics.js` (610 líneas, definición única de cada tasa), `utils/dataSources.js`, `utils/NodesLinks.js` (grafo en formato `vis-network`). |
| Lógica derivada | 10 composables: `useDegree`, `useDegreeMap`, `useCourse`, `useSubject`, `useSubjectList`, `useSchedule`, `useProfessorNetwork`, `useFight`, `useViewport`, `usePageHeader`. |
| Presentación | 15 primitivas `Ui*`, una gráfica (`charts/LineChart.vue`, SVG a mano), 3 componentes de horario, 2 de red (`ProfWeb` → `ProfGraph`). |
| Carcasa | `AppShell` = `AppHeader` + `AppPageTitle` + `<RouterView>` + `BottomTabBar` + `MoreSheet`. Scroll del documento, no de un contenedor. |
| Vistas | 11 pantallas + `views/dev/UiGallery.vue` (solo en desarrollo, `/dev/ui`). |
| Tema | Papel cálido + navy, tokens en `theme/tokens.css` y `theme/typography.css`, rampa en `theme/difficulty.js`, notas en `theme/gradePalette.js`. |
| Escritorio | **No existe.** `--content-max: 520px` centra el layout móvil a cualquier ancho. Único consumidor de `useViewport()`: `Faculty.vue`, que a partir de 900 px renderiza `ProfWeb.vue` — el escritorio anterior, tema oscuro, colores a pelo. |

### Lo que ya está resuelto y no hay que volver a tocar

- **Las cifras.** Todas las que pide el handoff salen de `metrics.js` y de los
  composables. Solo faltan seis agregados nuevos (§5), y van ahí, no en la vista.
- **El contrato de color, la tipografía y los radios.** Los valores del
  prototipo son los tokens que ya existen; hay que *usarlos*, no añadirlos.
- **Las primitivas.** El handoff está dibujado sobre ellas (`UiKpiCard`,
  `UiMeterRow`, `UiSortHeader`, `UiSubjectCard`, `UiCountBar`, `UiCallout`…).
- **Las redirecciones de rutas viejas** (`router/index.js`). No se tocan.

### Lo que no existe todavía

Barra lateral; banda de título con antetítulo, migas y controles a la derecha;
tabla maestra de 54 filas con cabecera pegajosa; grafo en papel y navy;
horario a dos columnas sin pestañas; y los paneles que el móvil no muestra
(reparto de calificaciones del grado, tendencia de rendimiento, ranking de
matrículas de honor, tabla de indicadores, «días de aire», histograma del
índice de colaboración).

---

## 1. Los cinco principios de esta implementación

**R1 — Un solo código base.** Ninguna vista se duplica. Las once pantallas de
escritorio son las mismas `views/*.vue`.

**R2 — CSS primero; `isDesktop` solo cuando cambia el DOM o el coste.**

| Caso | Herramienta |
|---|---|
| Rejilla, tamaños, huecos, orden visual, ocultar un bloque barato | `@media (min-width: 900px)` en el `<style scoped>` de la vista |
| Modelo de interacción distinto (grafo, tabla, selector permanente) | subcomponente de presentación + `v-if="isDesktop"` |
| Contenido caro de montar (`vis-network`, listas de 267 filas) | `isDesktop` + `defineAsyncComponent` |

El breakpoint es **900 px y solo 900 px**, el mismo de `useViewport()`. Las
media queries no pueden leer una custom property, así que el literal se repite;
lo que no se repite es el número: si algún día cambia, se busca `900px` y se
cambia en `useViewport.js` y en las media queries a la vez.

**R3 — Ninguna cifra escrita a mano.** Las del prototipo están congeladas y
sirven solo para comprobar que el cálculo da lo mismo.

**R4 — Ninguna cadena duplicada.** Ver §3.

**R5 — 44 px y 4,5:1 también en escritorio.** El ancho no es excusa para filas
de 31 px, y `--ink-soft` sobre `--surface-sunken` sigue sin cumplir (ahí,
`--ink-2`).

---

## 2. Qué se reutiliza, qué se toca y qué es nuevo

### Se reutiliza tal cual (no se abre el fichero)

`theme/*` (salvo tres tokens nuevos), `utils/dataSources.js`,
`utils/NodesLinks.js`, `composables/useDegreeMap`, `useCourse`, `useSubject`,
`useFight`, `useNavigationProgress`, y las primitivas
`UiCard`, `UiChip`, `UiPill`, `UiStat`, `UiSectionHeader`, `UiSearchField`,
`UiDifficultyDot`, `UiCountBar`, `UiMeterRow`, `UiCallout`, `UiLinkRow`,
`UiSortHeader`, `UiKpiCard`, `UiSubjectCard`.

### Se toca (ampliar, nunca bifurcar)

| Fichero | Cambio |
|---|---|
| `theme/tokens.css` | `--content-max-desktop: 1196px`, `--sidebar-width: 244px`, `--focus-on-navy`; y, si se decide dar color a los deltas sobre navy, `--delta-good-on-navy` / `--delta-bad-on-navy`. |
| `components/layout/AppShell.vue` | Elige carcasa por `isDesktop`. Segundo (y último previsto) consumidor de `useViewport()`. |
| `components/layout/AppPageTitle.vue` | Antetítulo/migas, `<h1>` a 29 px y hueco para los controles de la pantalla. |
| `composables/usePageHeader.js` | Además del título: `eyebrow`, `breadcrumbs` y `source` (la vigencia que enseña el pie de la lateral). |
| `components/ui/UiIcon.vue` | Icono `network` (el path está en el handoff, §Assets). |
| `components/charts/LineChart.vue` | `width`/`height` del `viewBox` como props (hoy 300×118 fijo); el móvil conserva los valores actuales por defecto. |
| `utils/metrics.js` | Los seis agregados de §5. |
| `composables/useProfessorNetwork.js` | Histograma del índice y filtros por curso/peso que hoy viven en `ProfWeb.vue`. |
| `composables/useSchedule.js` | «Días de aire» entre exámenes. |
| `components/network/ProfWeb.vue`, `ProfGraph.vue` | Rediseño completo: papel, navy, las tres familias, leyenda y composición del lienzo. |
| `views/*.vue` (las 11) | Media queries y, donde toque, el subcomponente de escritorio. |
| `components/layout/BottomTabBar.vue`, `MoreSheet.vue` | Dejan de escribir sus destinos: los leen de `content/navigation.js`. |

### Nuevo

| Fichero | Qué es |
|---|---|
| `components/layout/AppSidebar.vue` | La lateral de 244 px: marca, tres grupos, submenú de cursos, pie de vigencia. |
| `content/navigation.js` | El mapa único de destinos de la aplicación (§3). |
| `content/copy.js` | La microcopia compartida (§3). |
| `utils/format.js` | `pct`, `decimal`, `thousands`. Hoy están copiados en siete ficheros. |
| `components/subjects/SubjectsTable.vue` | La tabla maestra de escritorio (54 filas, cabecera pegajosa). |
| `components/network/*` | Lo que salga de partir el grafo: leyenda, lienzo, lista lateral con scroll. |

**Antes de crear un componente nuevo hay que descartar las quince primitivas**
(`/dev/ui` las enseña todas). Si de verdad hace falta una nueva, se añade a
`UiGallery.vue`: si no aparece ahí, no existe.

---

## 3. Los textos: dónde vive cada cadena

El riesgo real no es el CSS, es la frase escrita dos veces: se corrige una
errata en el móvil y la de escritorio se queda. Regla:

> **Una cadena que aparece en más de un sitio no vive en ningún componente.**
> Una cadena que aparece en uno solo se queda donde se lee, en su contexto.

Convertir las once pantallas en un catálogo de claves sería peor que el
problema: la prosa dejaría de leerse en su sitio. Solo sube a `content/` lo que
de verdad se comparte.

### `content/navigation.js` — el mapa de destinos

Hoy los mismos destinos están escritos en `BottomTabBar.vue` (3 pestañas) y en
`MoreSheet.vue` (5 filas), y la lateral sería la tercera copia. Un solo array:

```js
export const DESTINATIONS = [
    {
        to: "/horario",
        label: "Monta tu horario",       // lateral y hoja "Más"
        subtitle: "Tus clases y exámenes, sin solapamientos.",  // solo la hoja
        icon: "calendar",
        group: "herramientas",           // solo la lateral
        matches: path => path.startsWith("/horario")
    },
    …
];
```

- `BottomTabBar` toma los tres destinos con `tab: true`.
- `MoreSheet` toma los que no son pestaña.
- `AppSidebar` los agrupa por `group` (`grado` / `herramientas` / `letra-pequeña`)
  y les cuelga el recuento (`count`, una función: 54, 21, 267 **calculados**).
- Los `<h1>` siguen saliendo de `meta.title` del router. La etiqueta de menú y
  el titular son cosas distintas y así seguirán.

### `content/copy.js` — la microcopia compartida

Agrupada por pantalla, con el mismo criterio: solo lo que se usa dos o más
veces. Lo que hay que extraer en la Fase 0 (todo esto lo reutiliza el
escritorio tal cual):

| Cadena | Hoy | Quién la compartirá |
|---|---|---|
| «Quién comparte asignatura con quién. Cada colaboración pesa 1/n…» | `Faculty.vue` + `ProfWeb.vue` (dos redacciones distintas del mismo párrafo) | lista móvil y panel del grafo |
| «Índice = suma de 1/n por asignatura y curso…» (pie) | `Faculty.vue` | las dos |
| «En activo · N» / «Todos · N», «Buscar profesor…», «Imparte este curso», «Ha impartido alguna vez», «Colabora más con» | `Faculty.vue` | las dos |
| «Tamaño del nodo = nº de asignaturas» / «Grosor del enlace = peso» | `ProfGraph.vue` | leyenda del grafo |
| «Medias ponderadas de los últimos N cursos» | `Subjects.vue`, `FightMode.vue`, `Course.vue` (tres redacciones) | + tabla maestra |
| «⚠ = menos de 10 alumnos» y su `title` | `Subjects.vue`, `Subject.vue`, `Course.vue` | + tabla y leyenda de escritorio |
| «Las prácticas van aparte» + URL de la Guía Docente | `Schedule.vue` | horario móvil y de escritorio |
| «Todas / Troncales / Optativas» | `Subjects.vue` | + filtros de escritorio |
| Estados vacíos («Ninguna asignatura coincide…», «Ningún profesor coincide…») | 3 vistas | + escritorio |

**No suben a `copy.js`** (ya tienen dueño único, y ese dueño manda):

| Texto | Dónde vive |
|---|---|
| Nombre y definición de cada tasa | `METRICS` en `utils/metrics.js` |
| Etiquetas de orden («No superan», «Sob. + MH», «A–Z») | `SORTS` en `useSubjectList.js` |
| Los KPI de la ficha de asignatura | `SUBJECT_KPIS` en `useSubject.js` |
| Descripción y vigencia de cada fuente | `DATA_SOURCES` en `utils/dataSources.js` |
| Tramos de la rampa | `theme/difficulty.js` |
| Categorías de nota | `GRADE_CATEGORIES` / `theme/gradePalette.js` |
| Título de cada pantalla | `meta.title` en `router/index.js` |
| La prosa de Metodología y Acerca de | Su vista: son pantalla única, no se duplican |

### `utils/format.js`

`pct` está copiado seis veces (`Home`, `Course`, `Subjects`, `Subject`,
`Optatives`, `DegreeMap`, `UiSubjectCard`, `useFight`), `decimal` dos y
`thousands` una. Son tres funciones de una línea, pero son *formato de cifra*:
si mañana los porcentajes llevan un decimal, hay que cambiarlo en un sitio.

---

## 4. La carcasa de escritorio

### AppShell

```
isDesktop = false                    isDesktop = true
─────────────────────                ───────────────────────────────
AppHeader (navy + oro)               AppSidebar (244px, fija)
AppPageTitle                         │  main
<RouterView/>                        │    AppPageTitle (banda, 29px + controles)
BottomTabBar + MoreSheet             │    <RouterView/>  (1196px)
```

- **Un solo `<main>`**, lo sigue abriendo la carcasa.
- **El scroll sigue siendo el del documento.** La lateral se pega con
  `position: sticky; top: 0; height: 100dvh`, no con un `overflow` propio: un
  contenedor de scroll interno rompería la banda pegajosa de la tabla maestra.
- En escritorio no hay `AppHeader`: la marca está en la lateral, y dos bandas
  navy serían una de más.
- `--content-max` deja de aplicarse por encima de 900 px; el contenido pasa a
  `--content-max-desktop` (1196 px) con 32 px de margen.

### Los controles de cada pantalla en la banda de título

El buscador, el selector de curso académico o los botones 1º–4º van **dentro
del contenido en móvil y en la banda de título en escritorio**. Para no
escribirlos dos veces, cada vista los envuelve en:

```vue
<Teleport to="#pageActions" :disabled="!isDesktop">…</Teleport>
```

Mismo marcado, misma instancia, mismo estado; solo cambia dónde se pinta.
`AppShell` deja el `<div id="pageActions">` en la banda. Es el mecanismo que
evita que «el buscador de escritorio» y «el buscador de móvil» acaben siendo
dos componentes que se separan con el tiempo.

### AppSidebar

Estructura y medidas: handoff §«Lateral». Puntos de implementación:

- La entrada activa sale de `matches(route.path)`, igual que hoy en la barra de
  pestañas, no de una lista aparte.
- Recuentos **calculados**: `allSubjects.length`, `poolOptionalSubjects.length`,
  nodos de `NodesLinks`.
- Submenú de cursos: solo con `route.name === "course"`.
- **«Red de colaboración» no es una ruta nueva**: es una entrada que enlaza a
  `/profesorado#red`, con el mismo `matches` que Profesorado, así que en esa
  pantalla las dos se ven activas. El diseño `4a` pone la madeja y la ficha
  persona a persona en la misma página y partirla en dos rutas iría contra él.
- Pie: la vigencia de la pantalla activa, leída de `DATA_SOURCES` a través del
  `source` que la vista declara con `usePageHeader` (`"notas"` en la portada,
  `"guias"` en profesorado…). Si la vista no declara ninguno, no hay pie.
- Foco sobre navy: `--focus-on-navy`; el `:focus-visible` navy de `style.css` no
  se ve sobre `--navy-surface`.

### Hover (nuevo en escritorio)

Solo dentro de `@media (min-width: 900px)` y, mejor, bajo `@media (hover: hover)`:
filas → `--navy-wash`; tarjetas → `border-color: --line-strong`; entradas
inactivas de la lateral → `rgba(255,255,255,.06)`. Transiciones ≤ 0,15 s, y el
bloque de `prefers-reduced-motion` de `style.css` ya las neutraliza.

---

## 5. Agregados nuevos (van a `metrics.js`, no a la vista)

| Dato del diseño | Función |
|---|---|
| Reparto de calificaciones del grado (8.204 matrículas, 6 tramos) — portada y «Lo que hay dentro» de Acerca de | `degreeDistribution(years)` |
| Total de matrículas del grado | `degreeEnrolment(years)` |
| «949 matrículas por curso académico» (ficha de curso) | `courseEnrolment(course, years)` |
| «Excelencia 10 %» del grado (5.º KPI de portada) | ya existe: `degreeRateForPeriod("excelencia", …)`, solo hay que exponerlo en `useDegree` sin meterlo en `rates` (el móvil sigue con cuatro) |
| «¿Mejora con los años?» | ya existe: `passTrend` en `useDegree`, hoy sin usar |
| «33 % Sob. o MH» de la bolsa de optativas | `weightedRate` sobre las filas de la bolsa, en `Optatives.vue` como ya se hace con `averagePass` |
| Ranking de matrículas de honor entre optativas | computed en `Optatives.vue` a partir de `rows` |
| Histograma del índice de colaboración (6 tramos) | `useProfessorNetwork` |
| «Días de aire» entre exámenes | `useSchedule` |

---

## 6. Fases

Cada fase termina con: `npm run lint`, `npm run format`, `npm run build`, y una
revisión a 1440 px **y** a 390 px. La regla de oro de todas ellas: **si el móvil
cambia de aspecto, algo se ha hecho mal** (salvo donde se diga lo contrario).

### Fase 0 — Preparación compartida · sin un solo cambio visual ✅ HECHA

1. ✅ `utils/format.js` y sustituidas las ocho copias de `pct` / `decimal` / `thousands`.
2. ✅ `content/navigation.js`; `BottomTabBar` y `MoreSheet` lo leen.
3. ✅ `content/copy.js` con la microcopia compartida.
4. ✅ `LineChart`: `width` / `height` como props (por defecto 300×118).
5. ✅ `UiIcon`: icono `network`, y el inventario de iconos en `/dev/ui`.
6. ✅ `usePageHeader`: documentados `eyebrow`, `breadcrumbs` y `source`.
7. ✅ `--content-max-desktop`, `--sidebar-width` y `--focus-on-navy`.
8. ✅ `degreeDistribution`, `degreeEnrolment` y `courseEnrolment`, más
   `excellence`, `gradeDistribution` y `totalEnrolment` en `useDegree`.

*Verificación:* volcado del DOM de las trece rutas antes y después, a 402 px.
Todo idéntico salvo espacios en blanco colapsados y un cambio de texto
deliberado (abajo). Los agregados nuevos dan las cifras congeladas del
prototipo: 8.204 matrículas, reparto 8,9 / 13,0 / 37,6 / 30,2 / 6,9 / 3,5 % y
949 matrículas por curso en 1º.

**Lo que se hizo distinto de lo previsto en §3, y por qué:**

- **El ⚠ del mapa del grado cambia de frase.** Decía «Menos de 10 matriculados:
  el porcentaje baila mucho» y la tarjeta y la lista decían «Menos de 10
  alumnos: los porcentajes bailan mucho». Ahora hay una sola, y el umbral sale
  de `MIN_COHORT`. Es el único texto visible que cambia en toda la fase.
- **No se extrajeron** el aviso «Las prácticas van aparte» ni los filtros
  Todas/Troncales/Optativas: el escritorio no los duplica —el horario sigue
  siendo una vista y los filtros se quedan en `Subjects.vue`, teleportados—, así
  que subirlos a `content/` sería ceremonia sin duplicación que evitar. Se
  revisa en las fases 5 y 12 si aparece la segunda copia.
- **La leyenda del grafo tampoco sube todavía**: `ProfGraph.vue` se reescribe
  entero en la Fase 11 y su copia se decide entonces, con el diseño delante.

### Fase 1 — La carcasa (desbloquea las once pantallas) ✅ HECHA

`AppSidebar.vue`, el conmutador de `AppShell`, la banda de título con antetítulo
y `#pageActions`, y `--content-max` limitado a menos de 900 px.

*Verificación:* a 1440 px se navega por las once pantallas con la lateral, con
el contenido a 1196 px y todavía con el layout móvil dentro — feo pero correcto.
El submenú de cursos aparece solo en `/grado/:curso`. A 402 px el DOM de las
trece rutas solo gana los envoltorios de la banda y el destino vacío de los
teleports, todos ocultos: ni una palabra ni un espacio de diferencia.

**Cómo quedó resuelto lo que el plan dejaba abierto:**

- **Dos variables colocan la rejilla entera.** `.shell.desktop` redefine
  `--content-max` (a 1196 px) y `--gutter` (a 32 px). Como las once vistas ya
  pintaban su relleno con `--gutter` y su ancho con `--content-max`, ninguna
  necesita saber que existe el escritorio para caer donde toca. Comprobado a
  920, 1024 y 1440 px sin desbordamientos (decisión abierta n.º 3, cerrada).
- **`meta.eyebrow` y `meta.source`** viven en `router/index.js`, con los títulos,
  para poder leerlos todos juntos. `source` es una clave de `DATA_SOURCES` y es
  lo que el pie de la lateral convierte en «Calificaciones / curso 2025-2026»;
  las dos pantallas que no describe ninguna fuente traen su `footer` escrito
  (Acerca de) o calculado (Metodología, con el periodo de `academicYears`).
- **`DATA_SOURCES` gana un campo `short`**: «Calificaciones por asignatura» no
  cabe en los 200 px del pie. Va junto al nombre largo para que no se escriban
  en dos sitios.
- **El recuento de profesores se pide en diferido** (`import()` dentro de
  `onMounted`): vive en el grafo, que arrastra 250 kB de guías docentes, y la
  lateral solo se monta en escritorio. Un teléfono no descarga nada de eso.
- **La letra pequeña va sin icono**, como en el prototipo: el de documento
  repetiría el de Asignaturas tres filas más arriba.
- **La lateral usa entradas de 38 px** (y 30 px el submenú de cursos), que es lo
  que pide el diseño. No contradice la regla de los 44 px: esa es para las filas
  de datos, donde el objetivo es pequeño de verdad; aquí la fila ocupa los
  220 px de ancho de la lateral y se pulsa con un ratón.

### Fase 2 — Portada (`1a`) ✅ HECHA

Cinco KPI (cifra a 30 px), fila 2 `704px minmax(0,1fr)`, fila 3
`452px minmax(0,1fr) 288px`. Dos paneles nuevos: tendencia de rendimiento
(`passTrend`) y reparto de calificaciones (`degreeDistribution`). El panel de
fuentes ya existe.

*Verificación:* las cifras coinciden con el prototipo (10,375 ▼1,79 · 78 % ·
9 % ▼2 pp · 10 % ▼1 pp · 1,33 · 54 % Álgebra II con 441 matrículas · 25/25/23/5
por curso · 8,9/13,0/37,6/30,2/6,9/3,5 %). A 402 px el DOM solo gana lo que va
oculto, y el aspecto es el de antes.

**Lo aprendido, que sirve para las nueve pantallas que quedan:**

- **Cuidado con el nombre de una clase en el CSS de una vista.** El estilo con
  ámbito alcanza también la raíz de los componentes que la vista coloca: una
  `.row { display: contents }` en la portada le cambió el `display` a todas las
  `UiMeterRow` de la pantalla, en el móvil incluido. Antes de nombrar un
  contenedor, mirar la clase raíz de las primitivas que hay dentro.
- **Dos escalones, no uno.** Las columnas del diseño son fijas (704, 452, 288) y
  no caben por debajo de ~1200 px. De 900 a 1199 la misma pantalla se ordena en
  dos columnas iguales, con la gráfica y la frescura a todo el ancho; a partir
  de 1200, la rejilla del diseño. Nada se oculta: solo cambia el reparto. Las
  pantallas siguientes deberían repetir este patrón.
- **Los paneles de solo-escritorio se ocultan con CSS** (`.onlyWide`), no con
  `isDesktop`: son baratos y así el conmutador no crece.
- **El lienzo de las gráficas lo decide `LineChart`**, con `desktopWidth` /
  `desktopHeight`: el `viewBox` es un atributo y no hay media query que valga.
  El componente ajusta además márgenes y tamaño de las etiquetas, porque en el
  lienzo ancho el SVG se pinta casi a escala 1:1 y las cifras del móvil se
  verían la mitad de grandes.
- **`UiKpiCard` crece en escritorio** con una media query propia, y quien la
  coloca decide la cifra con `--kpi-value-size` (30 px en la portada, 28 px en
  la ficha de asignatura).

**Textos que ahora dicen lo mismo en las dos pantallas** (el escritorio traía la
versión larga y no se puede tener una en cada sitio): la leyenda de la gráfica
(«Nota media de admisión»), el pie de la más dura (que añade las matrículas del
periodo), la frase de la nota de corte (que ahora dice desde cuándo no estaba
tan baja, calculado) y la lista de fuentes, que pasa a los nombres cortos de
`DATA_SOURCES.short`.

**Lo que NO se implementó del prototipo:** el pie de «¿Qué curso cuesta más?»
dice ahí «Cuarto no es fácil: son 6 troncales y casi todas de laboratorio o
TFG». El catálogo no lo sostiene: de las seis troncales de 4.º, solo el TFG y
Técnicas físicas III lo son; Estado sólido I y II, Electrónica física y Física
nuclear no. Se ha dejado el pie metodológico. Si la frase importa, hay que
reescribirla con algo que los datos digan.

### Fase 3 — Estructura del grado (`2a`) ✅ HECHA

La espina girada 90°: `repeat(4, 1fr)`. Sin `＋ N más` en escritorio. La bolsa
de 21 optativas en una banda aparte a todo el ancho, y leyenda de la rampa al
pie (de `difficultyRamp`, no dibujada a mano).

*Verificación:* a 1440 px, las cuatro columnas con las 30 troncales visibles, la
banda de la bolsa y la leyenda; a 1024 px, dos columnas y dos; en el móvil, la
espina vertical de siempre con sus `＋ N más`. Del DOM móvil no desaparece nada.

**Decisiones:**

- **El recorte del móvil lo hace el CSS, no una rebanada en JavaScript.** La
  vista pinta siempre las 54 filas y `.rows.collapsed > li:nth-child(n+5)` las
  esconde mientras el curso esté plegado; en escritorio esa regla se desactiva y
  el botón «＋ N más» desaparece. Así no hay dos caminos distintos según el
  viewport, y `useViewport` no gana un consumidor por esto.
- **Filas de 44 px, no de 38.** El handoff pide 38 px en §2 y 44 px en su propia
  regla 5, que es la que coincide con `DISENO.md` §4. Manda la regla: las
  columnas quedan algo más altas y nadie falla el clic. (La lateral sí usa 38:
  es cromo, no una fila de datos.)
- **Dos escalones otra vez**, como en la portada: cuatro columnas a partir de
  1200 px, dos entre 900 y 1199. El tramo de espina de la columna par se apaga
  cuando la fila se parte, que si no apunta al vacío.
- **`useDegreeMap` gana la bolsa** (`pool`), el `avgNoShow` por curso y la
  bandera `poolOptatives`. Las dos cifras de la banda —cuántas se ofertan en los
  dos cursos y hasta dónde llega la más dura— se calculan.
- **El salto «Ver abajo ↓» es un `scrollIntoView`, no un ancla.** Con el
  enrutado por hash, un `href="#bolsa"` se lee como una URL y acaba en la
  portada.

**Cambios de texto que llegan también al móvil:** las optativas de 1.º pasan a
llamarse «Optativas especiales» (es lo que son, y así lo dice el escritorio), y
el pie de cada curso añade el «no se presentan» solo en pantalla ancha.

**Del prototipo, corregido:** decía «Ninguna pasa del 8 % de no superación» y la
más dura de la bolsa está en el 8,5 %. La cifra se calcula y se redondea hacia
arriba, así que ahora dice 9 % y seguirá siendo verdad cuando cambien los datos.

### Fase 4 — Ficha de curso (`2b`) ✅ HECHA

Tira de cinco cifras con filetes verticales (cifra a 32 px);
`minmax(0,1fr) 520px` para poner dificultad de troncales y serie del curso lado
a lado; rejillas de 3 columnas de `UiSubjectCard`; botones 1º–4º en la banda de
título vía `#pageActions`. Se mantiene la regla de cohorte pequeña (Geología).

*Verificación:* a 1440 px cuadra con el prototipo (75 % · 10 % · 9 · 3 · 949).
A 1024 px los dos paneles se apilan. En el móvil solo cambian dos textos, los de
abajo.

**Tres primitivas aprenden el escritorio, y con eso quedan hechas las pantallas
que vienen:**

- `UiStat` — la cifra sube a 32 px por encima de 900 px. Lo hereda la tira de
  Optativas y la de Profesorado.
- `UiSubjectCard` — nombre a 16,5 px y cifra a 20 px. Lo hereda Optativas.
- `UiSectionHeader` — nueva variante `band`: el rótulo crece a titular de 21 px,
  el recuento se queda en mono y la línea pasa de atravesarla a cerrarla por
  abajo. La pista de la derecha solo se pinta en escritorio, porque en el móvil
  se come el rótulo. En el móvil las dos variantes se ven igual.
- `UiMeterRow` — el ancho del rótulo se puede subir desde la pantalla
  (`--meter-label-width`, 186 px aquí): un estilo en línea no se deja pisar por
  una media query, una variable sí.

**Otras decisiones:** los botones de curso van en un `Teleport` incondicional
—en el móvil la banda los esconde, y no hacen falta porque se vuelve con la
pestaña—; las migas de la banda salen de `usePageHeader`; y el recorte de
tarjetas vuelve a hacerlo el CSS, como en el mapa.

**Cambios de texto en el móvil:** las optativas de 1.º se rotulan «optativas
especiales» (viene de la fase anterior) y la tarjeta dice «147 matriculados de
media» en vez de «147 matriculados», que es lo que la cifra es.

**Del prototipo, no implementado:** el pie de la gráfica añadía «Los tres
últimos cursos están planos». No lo están: 1.º va 24 → 23 → 28, casi cinco
puntos de recorrido. La frase se queda en los dos extremos de la serie, que sí
se pueden afirmar.

### Fase 5 — Lista maestra (`3a`) ✅ HECHA

`components/subjects/SubjectsTable.vue` + `v-if="isDesktop"`: es el caso claro
de DOM distinto (fila de dos líneas → siete columnas). Comparte
`useSubjectList` entero; el orden y los filtros no se reimplementan — la tabla
recibe `rows`, `sortKey` y `descending` y devuelve `@sort`.

*Verificación:* las 54 filas, la cabecera pegada arriba al desplazar
(comprobado de verdad, cargando la página en un iframe y haciéndole scroll), y
el móvil con su lista de dos líneas intacta.

**Decisiones:**

- **`UiSortHeader` gana `variant="table"`**: las mismas métricas, pero cada una
  en el ancho de su columna y alineada a la derecha, con los huecos del punto y
  del chevrón a los lados para que cabecera y filas cuadren. Una métrica con
  `sortable: false` es una columna que se rotula pero no ordena (Curso). Así no
  hay una segunda cabecera con su propio `aria-pressed` que mantener.
- **Una sola lista de columnas** (`COLUMNS` en `SubjectsTable`) alimenta la
  cabecera y las celdas: es la única forma de que sigan cuadrando cuando alguien
  cambie un ancho.
- **`overflow: clip`, no `hidden`**, en la tarjeta de la tabla. Con `hidden` se
  convierte en contenedor de desplazamiento y la cabecera deja de pegarse.
- **`SORTS` gana `rendimiento` y los rótulos cortos** (`Matr.`, `Sob+MH`). La
  cabecera del móvil los lee de ahí, así que las dos pantallas llaman igual a
  cada métrica.
- El buscador es **el mismo componente** en las dos, movido con
  `<Teleport :disabled="!isDesktop">`; el filtro de curso sí cambia de forma
  (cinco botones no caben en 402 px, el desplegable nativo sí).

**En el móvil**, de paso, los filtros de tipo y de curso vuelven a la misma
fila: al sacar el `<select>` del grupo de chips se había ido a una segunda
línea, y son la misma pregunta partida en dos.

### Fase 6 — Ficha de asignatura (`2c`) ✅ HECHA

Migas en la banda de título (`usePageHeader.breadcrumbs`), tres `UiPill`,
selector de año y botón de guía teleportados; seis KPI en fila; dos filas de
`minmax(0,1fr) 480px`. El marcador del callout es un punto de 11 px.

*Verificación:* cuadra con el prototipo (51 % ▼2 · 49 % ▲2 · 23 % · 1 % ▼2 ·
1,57 · 172, reparto 40/48/67/16/1/0). A 1024 px los KPI van de tres en tres.
En el móvil, la ficha de siempre.

**Decisiones:**

- **La banda de título gana un segundo destino**, `#pageBadges`, debajo del h1:
  ahí van las tres píldoras, que en el móvil abren el contenido. Es el mismo
  patrón que `#pageActions`, y lo mismo puede servirle a otra pantalla que
  quiera colgar algo del titular.
- **El botón «Ver guía docente →» sale dos veces** —en la banda y en su panel—,
  pero el rótulo es una constante de la vista y el enlace sale del mismo
  `teaching.guia_docente_web`: dos sitios donde se pinta, uno donde se decide.
  En el móvil solo está el del panel.
- **El atajo a Fight Mode se lleva la asignatura**: `/fight?a=<código>`, y
  `FightMode.vue` lo lee al montar. Un «Llevar a Fight Mode →» que no llevara
  nada obligaría a buscarla otra vez.
- **El metadato del panel es un solo elemento** que en escritorio se va a la
  derecha del título y en el móvil se lee como la entradilla que ya había. De
  paso, sus cifras pasan a mono, que es donde tienen que estar.

**Del prototipo, ajustado:** la lectura del reparto decía «Casi la mitad de la
clase no llega a aprobar»; ahora dice cuántos son de cuántos (88 de 172), que
es lo mismo sin redondear a ojo. Y la de la serie contaba una historia de tres
frases («sube sin parar desde…»); se queda en el mínimo, el máximo y cuánto ha
crecido la matrícula, que es lo que se puede afirmar mirando los datos.

### Fase 7 — Optativas (`3b`) ✅ HECHA

Cuatro cifras + callout de créditos; `minmax(0,1fr) 420px` con «Las más
elegidas» y el ranking nuevo de matrículas de honor (**en gris**: una nota alta
no es una dificultad); 21 tarjetas en rejilla de 4; insignia BIENAL a partir de
`se_alterna_con` del catálogo.

*Verificación:* las cuatro bienales que nombra el handoff son las cuatro que
salen marcadas (Geofísica, Física de la atmósfera, Aplicaciones de la
difracción, Iluminación y colorimetría). En el móvil, la pantalla de siempre
más la regla de créditos, que sube de nota al pie a callout.

**Decisiones:**

- **`UiSubjectCard` gana `density`**: a tres columnas (ficha de curso) la
  tarjeta respira y a cuatro (aquí) se queda como en el móvil, que es lo que
  cabe. Lo decide quien la coloca, que es quien sabe cuántas entran.
- **Y gana `badge`**, una insignia corta junto al nombre. En oro y sin relleno:
  «bienal» es una propiedad del catálogo, no una medida.
- `subjectSummary` expone `alternatesWith`, que hasta ahora solo leía la ficha
  desde `subjectInfo`. Es catálogo, pero quien pinta una lista lo necesita al
  lado del resto.
- **`UiCountBar` deja ensanchar su rótulo** (`--count-label-width`), como
  `UiMeterRow`: los nombres de las optativas son largos y a 132 px se cortaban
  todos.
- Las tres cifras del panel —el 31 % de las tres más elegidas, el 9 % de la más
  dura y la media de excelencia— se calculan.

**Cambio en el móvil:** la regla de créditos («En 3º deberías cursar 15
créditos…») estaba metida en la nota al pie, entre dos datos metodológicos.
Ahora es el callout que el escritorio pide, y el pie se queda con lo que es un
pie. La frase no se duplica: es el mismo elemento en las dos pantallas.

**Un fallo que se coló y conviene recordar:** `UiCallout` sin importar en la
vista. Vue no rompe —pinta un elemento desconocido con el texto dentro— y en
una captura pequeña parece un párrafo mal alineado. El aviso está en la consola
del servidor de desarrollo (`Failed to resolve component`), así que conviene
mirarla antes de dar una pantalla por buena.

### Fase 8 — Fuentes y metodología (`4c`) ✅ HECHA

`minmax(0,1fr) 300px` con índice lateral pegajoso; vuelve la tabla ancha de los
siete `METRICS`; rejillas de 3 / 2 / 2. **Ni una palabra del texto cambia**, y
las cifras del desacuerdo siguen saliendo de `officialAgreement`.

*Verificación:* el índice acompaña al desplazarse (comprobado con scroll), las
siete filas de la tabla salen de `METRICS` en su orden, y el móvil no cambia:
las mismas tarjetas apiladas.

**Decisiones:**

- **La tabla y las tarjetas son el mismo marcado.** `display: contents` en la
  cabecera de cada indicador disuelve el bloque y deja el nombre y la píldora
  como hermanos de la definición, que es lo que convierte tres bloques apilados
  en tres celdas. Sin un segundo componente ni una segunda lista.
- **`align-items: start` mata un `sticky`.** La columna del índice tiene que ser
  tan alta como la página para que lo pegajoso tenga por dónde viajar; con
  `start` la caja mide lo que su contenido y el índice se va con el scroll.
- **El índice salta con `scrollIntoView`**, no con el ancla: `href="#calculo"`
  se leería como una ruta y acabaría en la portada. El `href` se queda por
  semántica y el salto lo hace el script.
- **Sin marcar la sección activa.** El prototipo enseña la primera entrada en
  navy; hacerlo de verdad pide un observador de scroll, y una marca fija que no
  se corresponda con dónde estás miente. Las tres entradas se ven igual.
- Las cuatro cifras de «De un vistazo» se calculan (13 cursos, 3, 10, 5).

### Fase 9 — Acerca de (`4d`) ✅ HECHA

`minmax(0,1fr) 380px`, prosa contenida a 660 px, las tres personas en fila y el
panel «Lo que hay dentro» con los agregados de §5.

*Verificación:* 54 · 267 · 13 · 8.204, las cuatro calculadas. En el móvil, la
página de siempre sin el panel.

**Decisiones:**

- **El recuento de profesores se pide solo cuando el panel se va a ver.** Vive
  en el grafo, que arrastra 250 kB de guías docentes: en el móvil, donde el
  panel no existe, no se descarga nada. El rodeo está explicado una sola vez en
  `utils/counts.js`, que usan la lateral y esta página.
- Es el tercer y último consumidor previsto de `useViewport` fuera de la
  carcasa: aquí no vale una media query porque lo que hay que evitar es la
  descarga, no la pintura.

### Fase 10 — Fight Mode (`4b`) ✅ HECHA

Centrado a 980 px, no estirado. Medallón VS de 64 px, veredicto en `--gold-wash`,
tabla `1fr 190px 1fr`, y la quinta fila (Matriculados) en gris y discontinua
cuando no compiten dos optativas. El oro no aparece en ningún otro sitio.

*Verificación:* con dos troncales, la fila de matriculados sale apagada y con su
porqué; con una optativa delante, el resto de duelos se reparte igual. En el
móvil esa fila no aparece y la pantalla es la de siempre.

**Decisiones:**

- **La fila que no compite existe siempre en `useFight`**, con `competes: false`
  y su nota; antes ni se creaba. El ganador se fuerza a «ninguno», así que no
  puntúa, y el móvil la esconde con CSS. Es un dato de contexto, no un empate.
- **La banda de título no se centra.** El prototipo centra el titular en esta
  pantalla; el resto de la web abre siempre igual y `AppPageTitle` es de todas.
  Se centra el contenido, que es lo que hace el duelo.
- **Dos atajos en el pie, no uno.** El prototipo pone «Ver las dos fichas →», y
  un enlace no puede llevar a dos sitios: hay uno por contendiente.
- **La meta de cada contendiente no añade los matriculados** que enseña el
  prototipo: en el móvil la tarjeta mide 170 px y la línea se partía en tres. El
  dato está en la última fila de la tabla.

### Fase 11 — Profesorado y la red (`4a`) ✅ HECHA · la fase larga

*Verificación:* el grafo dibuja 152 profesores y 235 colaboraciones con el
umbral 0,50, y el histograma da 77/59/44/50/27/10 — las mismas cifras del
prototipo. En el móvil, la pantalla persona a persona de siempre.

**Lo que se hizo:**

- **`ProfWeb.vue` ya no existe.** Era la pantalla oscura entera; ahora la
  pantalla es `Faculty.vue` —una sola, con las dos vistas— y el grafo es solo
  el lienzo. Con eso se salda la deuda de `DISENO.md` §7.
- **`ProfGraph.vue` reescrito en papel y navy.** Los colores se leen de
  `tokens.css` con `getComputedStyle`, no se escriben: el componente no puede
  saber cuál es el navy, pero sí puede preguntarlo. El nodo elegido se marca con
  un anillo, no con otro color, porque el color ya dice otra cosa.
- **La composición del lienzo**: se calculan los grupos conexos, el principal se
  queda donde la física lo deja y los sueltos se recolocan en una banda debajo,
  ordenados de mayor a menor. Solo se mueven posiciones; los radios son el dato.
  *No se ponen los rótulos de cada grupo suelto que enseña el prototipo: son
  etiquetas dentro del lienzo y `vis-network` no las da sin inventar nodos.*
- **El estado del grafo baja a `useProfessorNetwork`** (curso, peso mínimo,
  grafo filtrado, histograma), que ya era el sitio donde vivía el resto.
- La lista de la derecha se desplaza dentro de su caja (492 px) en vez de
  desplegarse, y el recorte del móvil vuelve a ser una regla CSS.

**Decisión:** el `h1` sigue siendo «Profesorado», no «Red de colaboración
docente» como el prototipo. El título es de la pantalla y la pantalla es la
misma en el móvil, donde no hay red; la red tiene su `h2` en el panel.

#### Cómo estaba planteada

1. **Sacar el estado de `ProfWeb.vue`** (curso, peso mínimo) a
   `useProfessorNetwork`, junto con el histograma del índice.
2. **Rediseñar `ProfGraph.vue`**: opciones de `vis-network` en papel/navy
   (nodos `--navy` al 88 %, enlaces `--navy-line`, seleccionado con anillo de
   2 px), tipografías del sistema, leyenda arriba, y la composición del lienzo
   (grupo principal arriba a todo el ancho, los sueltos ordenados debajo). Si se
   calcula el layout, escalar x e y por separado y **nunca los radios**.
3. **Rehacer `Faculty.vue`** como una pantalla que en escritorio enseña las dos
   vistas: `minmax(0,1fr) 396px`, lista con scroll incrustado (`max-height: 492px`)
   en vez de `＋ N más`, ficha abierta debajo. En móvil, exactamente lo de hoy.
4. Controles (curso académico, peso mínimo) teleportados a la banda de título.

Es la pantalla con más superficie nueva y la única que además salda una deuda
vieja (`DISENO.md` §7). Conviene partirla en dos pasos: primero el grafo en
papel con la interfaz actual, luego la pantalla nueva alrededor.

### Fase 12 — Monta tu horario (`5a`) ✅ HECHA

`328px minmax(0,1fr)`: `SchedulePicker` permanente a la izquierda, rejilla y
calendario a la derecha, **sin pestañas** en escritorio (el `tab` sigue vivo en
móvil, y `?vista=examenes` se sigue respetando: la ruta lleva tiempo publicada).
Hora de 46 px, solapados repartiendo anchura, tabla nueva de «días de aire».

*Verificación:* con una selección de 9 asignaturas de 2.º semestre, la rejilla
pinta los choques repartiendo la anchura, la tabla de días de aire marca en rojo
los huecos de un día y el calendario ocupa la misma columna que el selector. En
el móvil siguen las dos pestañas y el «＋ N más» del catálogo.

**Decisiones:**

- **Las dos vistas se enseñan a la vez** con `v-if="isDesktop || tab === …"`:
  el conmutador no se borra, se queda sin trabajo. Así la ruta antigua sigue
  llevando a donde llevaba.
- **El selector se queda abierto** en escritorio: es una columna permanente y
  cerrarlo solo dejaría un hueco. El botón de abrir y cerrar desaparece, y el
  catálogo entero se desplaza dentro de su caja en vez de pedir «＋ N más».
- **La hora mide 46 px** y la decisión vive en `WeekTimetable`, en JavaScript:
  las posiciones de los bloques se calculan ahí y una media query no llega a un
  `style` en línea. El rango 08:00–20:00 ya era fijo.
- **`useSchedule` gana `examGaps` y `examSpan`**: los días libres entre examen y
  examen y el resumen de la tanda (cuántos días de punta a punta y cuál es el
  hueco más corto). El calendario responde «¿me queda hueco?» por la forma del
  mes; la tabla lo dice con un número.

### Correcciones tras la primera revisión

Repaso de las once pantallas ya montadas. Lo que se arregló:

- **La banda de título no se alineaba con el contenido.** El relleno iba fuera
  de la caja de ancho máximo, así que en un monitor ancho el titular arrancaba
  32 px antes que lo que tenía debajo. Ahora los dos usan el mismo modelo:
  ancho máximo con el relleno dentro.
- **Un cuadrado invisible se tragaba los clics en el mapa del grado.** El nodo
  del curso lleva un `::after` de 44 px para el dedo; al pasarlo a `static` en
  escritorio, ese cuadrado se lo quedaba `.course` como contenedor y aterrizaba
  en mitad de la columna, encima de dos filas. En la lista maestra no pasaba:
  las 54 filas responden (comprobado con `elementFromPoint` una por una).
- **El filete de `UiSectionHeader` pisaba el rótulo**: sin `flex: none`, en una
  columna estrecha el texto se salía de su caja por debajo de la línea.
- **Las gráficas responden al ratón**: al pasar por encima marcan el año y
  dicen las cifras de cada serie. Las barras llevan `title`, que es donde el
  rótulo se corta por el ancho.
- **Los dos rankings de optativas miden lo mismo** y su pie queda abajo.
- **Profesorado**: la explicación del peso se alarga en escritorio (la corta
  sigue en el móvil), los chips «en activo / todos» filtran también la madeja,
  los enlaces del grafo se ven (gris azulado con cuerpo en vez del borde de
  píldora), los grupos sueltos se ordenan en filas de diez con sus dos rótulos
  sobre el lienzo, y el panel acaba a la altura del histograma.
- **Fuera la entrada «Red de colaboración»** de la lateral.
- **Horario**: vuelve el botón «editar/cerrar» (en escritorio arranca abierto,
  pero se ve que se puede tocar), los seis filtros caben en una línea y el
  calendario lleva su leyenda debajo.

**Nota sobre las capturas:** el lienzo del grafo no sale en las capturas de
Chrome sin cabeza —el `<canvas>` se fotografía en blanco—, así que se verifica
leyendo sus píxeles (`toDataURL`) en vez de mirando la imagen.

### Fase 13 — Cierre

- `docs/DISENO.md`: reescribir §7 («el hueco que hay que llenar» ya no es un
  hueco), añadir la lateral a §6 y las escalas de escritorio a §2.
- `README.md`: está desactualizado (habla de `components/Dashboard/` y de
  ficheros JSON con otros nombres). Actualizar el árbol y borrar la sección de
  deuda de escritorio.
- Desinstalar `chart.js`, `vue-chartjs`, `cytoscape` y `vis-data`: no los usa
  nadie. `vis-network` se queda.
- Repasar contraste con `theme/contrast.js` sobre los fondos reales nuevos
  (`--surface-sunken` de la cabecera de tabla, navy de la lateral).
- Pasar el escáner de accesibilidad **a 1440 px** y con `--wait-for`, ruta por
  ruta (las rutas son lazy y el grafo tarda más que el `h1`).
- Borrar este documento.

---

## 7. Decisiones abiertas

1. **Color en los deltas sobre navy.** El prototipo los deja en `--navy-faint` y
   confía el signo a la flecha. Mientras se quede así, los dos tokens nuevos no
   hacen falta. *Recomendación: no añadirlos hasta que un diseño los pida.*
2. ~~**Qué hace la lateral entre 900 px y ~1100 px.**~~ Cerrada en la Fase 1: la
   lateral se queda fija y el contenido ocupa lo que quede, hasta 1196 px.
   Comprobado a 920 y 1024 px. Conviene seguir mirando esos dos anchos al
   cerrar cada pantalla.

---

## 8. Qué NO hacer

- Copiar el HTML del prototipo. Se reproduce con las primitivas.
- Escribir una cifra, un color o una frase repetida en la capa de presentación.
- Duplicar una vista para escritorio.
- Bajar de 44 px una fila o de 4,5:1 un texto porque «en escritorio se ve bien».
- Añadir un consumidor de `useViewport()` que se resuelva con una media query.
- Borrar las redirecciones de `router/index.js`.
- Cargar fuentes, iconos o scripts de un tercer origen.
