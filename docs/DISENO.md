# Sistema de diseño

Guía para quien vaya a dibujar o escribir pantallas nuevas de esta web —
persona o herramienta. No describe una intención: describe lo que hay hoy en
`web/src`. Si algo de aquí no cuadra con el código, manda el código y esta
guía está desactualizada.

El objetivo de todo lo que sigue es uno: **esta web publica datos oficiales de
una universidad, y su único activo es que se la crea.** Cada regla de abajo
existe para que la pantalla no diga nada que los datos no digan.

---

## 1. El contrato de color

La regla que gobierna todo lo demás. **El color no miente.** Hay cuatro
papeles y no se mezclan nunca:

| Papel | Qué codifica | Dónde vive |
|---|---|---|
| **Navy** | Estructura y cromo: cabeceras, pestaña activa, botones, enlaces, la línea del timeline. **Nunca una magnitud.** | `--navy*` en `theme/tokens.css` |
| **Rampa** | Dificultad, y solo dificultad (tasa de no superación). | `theme/difficulty.js` |
| **Gris** | Recuentos y cantidades (matrículas, peso de colaboración). Una cantidad no es una dificultad. | `--count-*` |
| **Notas** | El desglose No presentado → Matrícula de honor, y nada más. Es categórico, no una escala. | `theme/gradePalette.js` |

El **oro** (`--gold*`) es decoración y el ganador de Fight Mode. Tampoco es un
dato. Su único uso estructural es el filete de 2px bajo la cabecera.

Ante cualquier color nuevo, la pregunta es: *¿esto es estructura, dificultad,
un recuento o una categoría de nota?* Si no es ninguna de las cuatro, casi
seguro no necesita color.

**Ningún componente escribe un color a pelo.** Si hace falta uno que no está
en `tokens.css`, se añade a `tokens.css`.

### La rampa de dificultad

Cinco tramos por tasa de no superación, de `asequible` (≥0%) a `muy dura`
(≥45%). Cada tramo trae tres tonos y no es redundancia:

- `fill` — superficies: el punto, la barra.
- `ink` — la cifra grande (23px), donde basta 3:1.
- `inkSmall` — la cifra pequeña (11–13px), oscurecida hasta 4,5:1 sobre papel
  **y** sobre blanco.

Usar `ink` en una cifra de 11px es el error clásico: se queda en 3,5:1 y deja
de leerse.

---

## 2. Tipografía

Tres familias con tres papeles que no se cruzan:

- **Spectral** (`--font-serif`) → titulares, cabeceras de sección, nombres de
  asignatura.
- **Public Sans** (`--font-sans`) → cuerpo, etiquetas de interfaz, botones.
- **IBM Plex Mono** (`--font-mono`) → **todas** las cifras y porcentajes, los
  eyebrows, los metadatos y los códigos.

Lo de la mono es lo importante: **los números son el producto.** En mono se
alinean en columna, se comparan de un vistazo y no bailan al cambiar de
dígito. Un porcentaje escrito en Public Sans es un error, no un matiz.

Dos clases globales (`theme/typography.css`), no hace falta redefinirlas:

- `.num` — cualquier cifra visible. Mono, tabular, peso 600.
- `.eyebrow` — etiqueta pequeña en mayúsculas que rotula un bloque.

Para titulares no hay clase: van con `var(--font-serif)` desde el componente,
que además ajusta tamaño e interlineado.

Las fuentes están **auto-hospedadas** en `assets/fonts/` (`theme/fonts.css`).
No se añaden orígenes de terceros: es una web pública de la Universidad y las
IP de los visitantes no se le regalan a nadie.

---

## 3. Superficies, líneas y relieve

El material es **papel**, no Material Design.

- `--paper` (`#f8f5ee`) es el fondo de la aplicación; `--surface` (blanco) la
  tarjeta.
- `--navy-surface` (`#1b3559`) es el azul de las manchas grandes: cabecera,
  héroe de la portada y banda de totales del mapa. Las tres leen el mismo
  token porque van pegadas y con dos azules distintos se ve la costura.
- Las líneas hacen casi todo el trabajo de separación: hay nueve tokens
  `--line-*`, uno por contexto. Antes de inventar un borde, mirar si ya existe.
- **Sombras escasas a propósito**: solo tres (`--shadow-card`, `--shadow-sheet`,
  `--shadow-medallion`). Una tarjeta se separa con un borde, no con una sombra.
- Sin degradados.

Radios: `--radius-row` 8px, `--radius-control` 9px, `--radius-card` 11px,
`--radius-card-lg` 14px, `--radius-sheet` 16px, `--radius-pill` 999px.

---

## 4. Accesibilidad: las dos reglas que no se negocian

**Contraste.** Texto normal a 4,5:1 como mínimo, sobre el fondo real en el que
va a caer. Solo hay **dos** niveles de gris apagado (`--ink-soft`,
`--ink-faint`) y no es por falta de ganas: sobre este papel, por encima de
4,5:1 no caben más sin que se peguen entre sí. La jerarquía la sostienen el
tamaño y el peso, no el matiz de gris. Hay un comprobador en
`theme/contrast.js`.

**Objetivo táctil de 44px** (`--touch-target`), también en las filas de lista.
Que el contenido de una fila sea corto no es motivo para encogerla. Si el
diseño pide filas de 31px y la accesibilidad pide 44, manda la accesibilidad:
la lista queda más larga y a cambio nadie falla el toque.

Además: el `alt` de una imagen es información, no adorno, y los SVG de datos
llevan texto real (seleccionable, legible por un lector de pantalla) en vez de
etiquetas dibujadas.

---

## 5. Las primitivas

Están en `web/src/components/ui/`. **Antes de crear un componente nuevo hay
que descartar estos quince.** Se ven todos juntos, en vivo, en `/dev/ui`
(`views/dev/UiGallery.vue`, solo en desarrollo) — es el inventario: si una
primitiva no aparece ahí, no existe.

| Primitiva | Para qué |
|---|---|
| `UiCard` | Contenedor blanco con borde. La caja por defecto. |
| `UiKpiCard` | La cifra grande de una pantalla, con su rótulo. |
| `UiStat` | Cifra + rótulo en filas de resumen bajo el título. |
| `UiSubjectCard` | Tarjeta de asignatura. |
| `UiLinkRow` | Fila de lista con `lead` / centro / `trail` y chevron. 44px. |
| `UiSectionHeader` | Cabecera de sección. |
| `UiSortHeader` | Cabecera de tabla ordenable. |
| `UiSearchField` | Buscador. |
| `UiChip` | Filtro seleccionable. |
| `UiPill` | Etiqueta no pulsable (mono, mayúsculas). |
| `UiDifficultyDot` | El punto de color de la rampa. |
| `UiCountBar` | Barra gris de recuento. |
| `UiMeterRow` | Fila con barra de magnitud. |
| `UiCallout` | Aviso destacado. |
| `UiIcon` | Los iconos del sistema. |

Gráficas: `components/charts/LineChart.vue`, en SVG a mano. **No se usa
chart.js para gráficas nuevas del sistema de diseño** aunque sea dependencia:
en SVG el texto es texto y los ejes se controlan con cuatro atributos en vez
de media hora de opciones de tematizado.

---

## 6. La carcasa y la navegación

`components/layout/AppShell.vue` monta, en este orden y en las once pantallas:

```
AppHeader        marca navy + filete de oro de 2px
AppPageTitle     banda de título sobre el papel
<RouterView/>    el contenido
BottomTabBar     tres pestañas + "Más"
```

El **título de cada pantalla sale del `meta` de la ruta**, no de la vista, para
que la lista entera se lea en un solo fichero (`router/index.js`). Una vista
solo lo afina con `usePageHeader` cuando el título depende de los datos (el
nombre de una asignatura, por ejemplo).

El desplazamiento es **el del documento**, no el de un contenedor interno: es
lo que deja que la barra de direcciones del móvil se recoja al bajar.

Pestañas: **Inicio** (`/`), **El Grado** (`/grado`, que absorbe `/asignatura`
y `/curso`) y **Optativas** (`/optativas`). Todo lo demás vive en la hoja
"Más": Monta tu horario, Profesorado, Fight Mode, Fuentes y metodología,
Acerca de.

Las rutas viejas se conservan como redirecciones en `router/index.js`. Llevan
tiempo publicadas y hay enlaces sueltos por ahí: **no se borran.**

---

## 7. Estado del escritorio — el hueco que hay que llenar

Hoy **no hay diseño de escritorio**. `--content-max` vale `520px` y toda la
carcasa se centra en esa columna: en un monitor de 1920px se ve una columna de
teléfono flotando en medio. Es un marcador de posición consciente, no un
descuido.

Lo que hay que saber antes de tocarlo:

- **Solo una pantalla diverge de verdad entre móvil y escritorio**: la red de
  profesores. En móvil va persona a persona (`views/Faculty.vue`); en
  escritorio es un grafo de 267 nodos (`components/network/ProfWeb.vue`, que
  se carga en diferido). Todo lo demás es la misma pantalla a otro ancho, y de
  eso se encarga el CSS. El conmutador es `useViewport()`, con un único
  `matchMedia` a 900px. **Antes de añadirle un consumidor, comprobar que el
  caso no se resuelve con una media query.**
- **`ProfWeb.vue` sigue con el aspecto anterior al rediseño** (fondo
  `#0f172a`, texto blanco, tipografías por defecto). Es lo único del árbol que
  no habla el idioma de esta guía, y es trabajo pendiente conocido: hay que
  traerlo al papel, al navy y a las tres familias tipográficas.
- La barra de pestañas inferior se usa hoy a cualquier ancho. El escritorio
  necesita su propia navegación; el mapa completo de destinos es el de la
  sección 6.

---

## 8. Convenciones de código

Si se generan ficheros, que se parezcan a los que ya hay.

- **Indentación de 4 espacios**, comillas dobles y punto y coma. Los 58
  ficheros de `src/` lo hacen así. Ojo: `.prettierrc.json` y `.editorconfig`
  dicen lo contrario (2 espacios, sin punto y coma, comillas simples) porque
  son restos del andamiaje inicial de Vue. **No pasar `npm run format`**: hoy
  reformatearía el proyecto entero.
- En CSS, **una propiedad por línea con una línea en blanco entre medias**, y
  sin espacio tras los dos puntos (`display:inline-flex;`). Es una convención
  a mano, deliberada.
- Orden en un `.vue`: `<script setup>`, `<template>`, `<style scoped>`.
- Los comentarios explican **por qué**, no qué. Van en español y en prosa. Un
  comentario que narra la historia del proyecto ("antes esto era…", "el
  handoff pedía…") sobra: describe el estado actual o no se escribe.

---

## 9. Qué NO hacer

- Escribir un color que no esté en `tokens.css`.
- Usar la rampa de dificultad para algo que no sea dificultad, o pintar de
  rojo una asignatura por estar muy matriculada.
- Poner una cifra en una fuente que no sea la mono.
- Bajar de 44px un objetivo táctil, o de 4,5:1 un texto.
- Añadir una sombra donde basta un borde, o un degradado en cualquier sitio.
- Redondear, estimar o "mejorar" un dato en la capa de presentación: quien
  pinta recibe la cifra ya formateada. El qué se cuenta y con qué denominador
  se decide en `utils/metrics.js`, y no cambia porque cambie el diseño.
- Cargar fuentes, iconos o scripts desde un tercer origen.

---

## 10. Dónde mirar

| Fichero | Qué contiene |
|---|---|
| `web/src/theme/tokens.css` | Color, radios, sombras, espaciado. El contrato de color, arriba del todo. |
| `web/src/theme/typography.css` | Escala tipográfica y clases globales. |
| `web/src/theme/fonts.css` | Las tres familias, auto-hospedadas. |
| `web/src/theme/difficulty.js` | La rampa. Única definición para toda la web. |
| `web/src/theme/gradePalette.js` | Los seis colores de calificación. |
| `web/src/theme/contrast.js` | Comprobador de contraste. |
| `web/src/components/ui/` | Las quince primitivas. |
| `web/src/components/layout/` | La carcasa. |
| `web/src/views/dev/UiGallery.vue` | El inventario en vivo → `/dev/ui`. |
| `web/src/router/index.js` | Rutas, títulos de pantalla y redirecciones viejas. |
| `web/src/utils/metrics.js` | Qué se cuenta y con qué denominador. |
