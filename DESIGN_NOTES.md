# Ficha técnica

Dirección visual del rediseño móvil. Rama `design/ficha-tecnica`.

## Qué es

Brutalismo suizo-industrial: la web deja de parecer una app y pasa a parecer el
documento técnico del que salen sus datos. Papel de documentación sin blanquear,
tinta de carbón, un rojo de aviación como única tinta directa y una trama de
seguridad amarilla reservada a lo que pide cautela. No hay una sola esquina
redondeada ni una sola sombra difusa: lo que delimita una caja es su regla de
tinta, y lo único que se despega del papel es la hoja modal, con un
desplazamiento sólido a modo de sombra impresa. El contraste tipográfico, que
antes lo ponía el salto de serif a sans, ahora lo pone la escala: de los 8,5px
de una nota al pie a los 46px de un titular hay un factor de cinco, y los
titulares van en mayúsculas y apretados hasta formar bloques. Los datos ganan
con el cambio, que era el objetivo: en mono, en mayúsculas y sobre rejilla, una
tabla de tasas de no superación se lee como lo que es —una lectura de
instrumento— y no como el contenido de una tarjeta.

Lo que se ha evitado a conciencia: nada de degradados, nada de violeta, ni un
solo verde (el extremo bueno de la rampa es la ausencia de tinta de aviso, no
una buena noticia que celebrar), ni la tríada esmeralda/ámbar/rojo de rigor.

## Paleta

Todo vive en `web/src/theme/tokens.css`, salvo las dos escalas que codifican
datos, que tienen fichero propio por el mismo motivo de siempre.

### Sustrato y tinta

| Hex | Token | Papel |
|---|---|---|
| `#e9e6dd` | `--paper` | Fondo de la aplicación: cartulina de documentación sin blanquear |
| `#f6f4ee` | `--surface` | La hoja pegada encima: toda tarjeta y todo panel |
| `#e3e0d4` | `--surface-alt` | Otro papel: tarjeta de optativa |
| `#dbd7c9` | `--surface-sunken` | Banda hundida: cabecera de tabla ordenable |
| `#14140f` | `--ink` / `--carbon` / `--line` | Carbón. Texto primario, reglas y bloques entintados: es el mismo color en los tres papeles, y por eso el conjunto se lee como una única tinta |
| `#33302a` → `#5f5c52` | `--ink-2` … `--ink-faint` | Dos niveles de gris apagado, ambos por encima de 4,5:1 |
| `#b6b1a1` / `#c3beac` | `--carbon-faint` / `--on-carbon-soft` | Texto secundario **sobre** el bloque de tinta |
| `#dcd8c9` | `--carbon-wash` | Panel plano: estructural, sin entintar del todo |

### Las tres tintas

| Hex | Token | Papel |
|---|---|---|
| `#d3220f` | `--accent` | Rojo de aviación. Reglas, marcadores, rellenos, estados pulsados y el ganador del Fight Mode. **Nunca** texto pequeño: sobre papel se queda en 4,2:1 |
| `#a91a0b` | `--accent-ink` | El mismo rojo legible como texto (5,9:1). Enlaces, deltas negativos, avisos |
| `#e0a800` | `--caution` | Amarillo de seguridad. Solo el marcador de cohorte pequeña y la trama diagonal de peligro; siempre encerrado en tinta, porque solo se ve por el marco |
| `#645000` | `--caution-ink` | El amarillo legible como texto y como glifo ⚠ (6,3:1) |

### Rampa de dificultad (`theme/difficulty.js`)

Cantidad de tinta de aviso, no un arcoíris: del gris del propio papel al rojo a
plena carga. Cada tramo trae `fill` (superficie), `ink` (cifra grande) e
`inkSmall` (cifra de 11px, oscurecido hasta 4,5:1 sobre papel, tarjeta y panel
hundido).

| Tramo | fill | ink | inkSmall |
|---|---|---|---|
| muy dura (≥45 %) | `#b0140a` | `#a8140a` | `#a8140a` |
| dura (≥33 %) | `#ce3d12` | `#b8360c` | `#a83208` |
| exigente (≥22 %) | `#c06a0c` | `#a25708` | `#8a4e05` |
| moderada (≥15 %) | `#a07b10` | `#8a6b08` | `#6e5806` |
| asequible (<15 %) | `#6e6a5c` | `#4f4c42` | `#4f4c42` |
| sin datos | `#7d7869` | `#5f5c52` | `#5b584e` |

### Calificaciones (`theme/gradePalette.js`)

El único sitio donde hacen falta seis colores a la vez, y por tanto el único
que sale de las tres tintas. Seis tintas planas alternando claro/oscuro por
posición: en una barra apilada lo que separa dos tramos contiguos es el salto
de luminosidad, no el matiz. Cada par contiguo va por encima de 2,5:1.

`No pre #bdb8a6` · `Sus #b0170b` · `Apr #d3a12e` · `Not #2e5c74` ·
`Sob #8fa07c` · `MH #14140f`

### Otros papeles del color

- **Deltas** — dúo, no tríada: lo que empeora va en rojo (`--delta-bad`) y lo
  que mejora se queda en carbón (`--delta-good`). La flecha ▲/▼ va escrita al
  lado, así que la dirección nunca depende del color.
- **Recuentos** — barras de tinta neutra (`--count-fill #4e4b41`) encerradas en
  un marco de un píxel. Una cantidad no es una dificultad.
- **Gráficas** — dos tintas, como una impresión a dos colores: carbón
  (`--chart-line-1`) y rojo (`--chart-line-2`).

Todos los pares texto/fondo del sistema se han verificado por encima de 4,5:1
(3:1 para iconos y numerales grandes).

## Tipografía

Dos familias, ninguna nueva, una menos que antes.

- **Public Sans** (variable, ya auto-hospedada) — cuerpo, nombres de asignatura
  y de persona, textos de interfaz.
- **Public Sans Display** — no es otra fuente: es **el mismo fichero** declarado
  con el eje recortado a `font-weight: 700 900`. El navegador lo descarga una
  sola vez y a cambio cualquier peso por debajo de 700 se recorta a 700, así que
  un titular no puede quedarse flojo por descuido. Se usa en `h1`, `h2`, `h3`,
  cabeceras de tarjeta y nombres, con tracking negativo (`-0.035em` a
  `-0.045em`) y `line-height` de 0,92.
- **IBM Plex Mono** (ya auto-hospedada) — todas las cifras, los eyebrows, los
  metadatos, los rótulos de botón, las pestañas y los códigos, en mayúsculas y
  con tracking de `0.14em`.

Se ha retirado **Spectral** (la serif de los titulares) y con ella cuatro
ficheros `.woff2` que ya no se descargan: el rediseño pesa menos que el diseño
que sustituye.

Regla de mayúsculas: van en mayúsculas los **rótulos** (titulares de página,
cabeceras de sección, eyebrows, botones, navegación). No van en mayúsculas los
**nombres propios** —asignaturas, profesores—, que se quedan en caja normal con
peso 700/800. Un nombre en mayúsculas se lee peor y no gana nada.

## Forma, ritmo y movimiento

- **Radios: cero.** Los tokens `--radius-*` se conservan con valor 0 para que
  siga documentado qué era cada cosa y para que un eventual regreso ocurra en un
  único fichero.
- **Reglas: dos grosores** y solo dos (`--rule: 1px`, `--rule-strong: 2px`). El
  borde exterior de una caja es carbón pleno; los divisores internos bajan a
  gris. Un tercer grosor no se distingue a 402px de ancho.
- **Sombras: una,** dura (`--shadow-hard`, `--shadow-sheet`), y solo para lo que
  está literalmente encima. `--shadow-card` es `none`.
- **Espaciado** en múltiplos de cuatro (`--gap-row: 4px`, `--gap-card: 8px`,
  `--gap-section: 20px`).
- **Textura**: grano de papel como una tesela SVG de 120px en el fondo de
  `#app`. Sin `mix-blend-mode` y sin capa fija a propósito — una capa que
  compone encima de todo obliga al navegador a rehacer la mezcla en cada
  desplazamiento, y eso en un móvil de gama media se nota.
- **Micro-interacciones**: al pulsar, las cosas se desplazan un píxel y su regla
  pasa a rojo, con `transition: steps(1)`. Nada se desliza ni se escala; es el
  gesto de un sello que se apoya. La barra de progreso avanza en `steps(8)`,
  como una aguja de instrumento.
- **Iconos**: remates a escuadra, uniones en ángulo, trazo de 2px; los círculos
  decorativos pasan a cuadros.
- **Firma**: la regla roja de 3px bajo la cabecera, presente en todas las
  pantallas, y su gemela cerrando el bloque de tinta de la portada.

## Ficheros tocados

Tema (fuente única de todo lo anterior):

- `web/src/theme/tokens.css` — reescrito
- `web/src/theme/typography.css` — reescrito
- `web/src/theme/fonts.css` — reescrito (fuera Spectral, dentro Public Sans Display)
- `web/src/theme/difficulty.js`, `web/src/theme/gradePalette.js`, `web/src/theme/contrast.js`
- `web/src/style.css`
- `web/src/assets/fonts/spectral-*.woff2` — **eliminados** (4 ficheros)

Primitivas y carcasa:

- `web/src/components/ui/` — `UiCallout`, `UiCard`, `UiChip`, `UiCountBar`,
  `UiDifficultyDot`, `UiIcon`, `UiKpiCard`, `UiLinkRow`, `UiMeterRow`, `UiPill`,
  `UiSearchField`, `UiSectionHeader`, `UiSortHeader`, `UiStat`, `UiSubjectCard`
- `web/src/components/layout/` — `AppHeader`, `AppShell`, `BottomTabBar`, `MoreSheet`
- `web/src/components/charts/LineChart.vue`
- `web/src/components/Dashboard/` — `ExamCalendar`, `SchedulePicker`,
  `WeekTimetable` (los tres que el móvil comparte con el escritorio; el resto de
  esa carpeta es escritorio heredado y se ha dejado como estaba)

Pantallas:

- `web/src/views/` — `About`, `Course`, `DegreeMap`, `Faculty`, `FightMode`,
  `Home`, `Methodology`, `Optatives`, `Schedule`, `Subject`, `Subjects`,
  `dev/UiGallery`

Envoltorio:

- `web/index.html` y `web/public/manifest.webmanifest` — `theme-color` y
  `background_color` al nuevo carbón y al nuevo papel
- `README.md` — la regla del color, actualizada

No se ha tocado el escritorio heredado (el resto de `components/Dashboard/`),
que sigue pintando sus colores oscuros a pelo, ni la estructura, el contenido,
el orden de las secciones, el enrutado o el comportamiento de ninguna pantalla.

## Renombrados

El contrato de color cambió de dueños, así que los tokens cambiaron de nombre
para no mentir: `--navy*` → `--carbon*`, `--ink-on-navy` → `--on-carbon`,
`--gold*` → `--accent*`, `--attention*` → `--caution*`, `--font-serif` →
`--font-display`. Los valores de prop que iban con ellos también:
`tone="navy"` → `tone="carbon"`, `tone="gold"` → `tone="accent"`,
`tone="attention"` → `tone="caution"`. Un token llamado `--navy` con un negro
dentro es exactamente el tipo de mentira que la cabecera de `tokens.css` lleva
prohibiendo desde el principio.
