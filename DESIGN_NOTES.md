# Tinta

Propuesta de rediseño visual para la versión móvil. Rama `design/tinta`.
No cambia ni una línea de contenido, ni el orden de las secciones, ni la
navegación: solo el lenguaje visual.

## La idea

La web anterior era limpia pero anónima: crema cálido, azul corporativo, oro
heráldico y tres familias tipográficas, un conjunto que podría ser el de
cualquier panel institucional. **Tinta** la reencuadra como un impreso: papel
hueso frío, negro de humo, y una paleta que sale entera de cuatro pigmentos de
imprenta —azul de Prusia, verdín de cobre, óxido de hierro y ocre— en vez de
inventarse colores de interfaz. Desaparecen las sombras, los radios se cierran
de 11–14 px a 6–8 px y lo único que dibuja una caja es un filete de 1 px, de
modo que la profundidad la da la tipografía y no una penumbra. El cambio con
más consecuencias no es de tono sino de gramática: **la rampa de dificultad
deja de ser un semáforo verde-ámbar-rojo y pasa a ser una escala secuencial de
un solo pigmento**, porque lo que mide es una magnitud y un verde en el tramo
bajo decía "bien" donde el dato solo dice "poco". Ese cambio, además, libera el
amarillo para lo único que debería haber sido siempre: la cautela estadística.

## Paleta

Todos los valores están medidos contra los fondos sobre los que se pintan de
verdad. El texto llega a 4,5:1; lo que rotula iconos y no texto, a 3:1.

### Papel y tinta

| Token | Hex | Papel |
|---|---|---|
| `--paper` | `#f1efe9` | Fondo de la aplicación. Hueso frío, no crema: deja que el blanco de la tarjeta se lea como blanco |
| `--surface` | `#ffffff` | Tarjeta |
| `--surface-alt` | `#faf8f3` | Tarjeta de optativa |
| `--surface-sunken` | `#e8e4da` | Cabecera de tabla ordenable |
| `--bone` | `#ede9df` | La tesela de la marca, invertida sobre la banda |
| `--ink` | `#1b1d1f` | Texto primario. Negro de humo, con sesgo frío sobre papel cálido — 14,7:1 |
| `--ink-2` / `--ink-3` | `#3e4247` / `#4f545a` | Secundario y etiquetas — 8,8:1 / 6,7:1 |
| `--ink-muted` / `--ink-soft` | `#5b6066` / `#5f646a` | Apoyo, eyebrows y metadatos — 5,5:1 / 5,0:1 |
| `--ink-icon` / `--ink-chevron` | `#7a8087` / `#848a91` | Solo iconos — 3,5:1 / 3,0:1 |
| `--line` | `#e2ded4` | El filete que sustituye a la sombra |

### Los cuatro pigmentos

| Papel | Token | Hex | Dónde |
|---|---|---|---|
| **Azul de Prusia** — estructura y cromo | `--navy` | `#173d52` | Cabecera, pestaña activa, botones, enlaces, contadores estructurales, medallones. Nunca codifica una magnitud — 10,0:1 sobre papel |
| **Verdín de cobre** — lo elegible | `--verd` / `--verd-ink` | `#3e7f6e` / `#2a5e50` | Optativas y ganador de Fight Mode. Tampoco es un dato: es una categoría de la estructura — 6,5:1 |
| **Óxido de hierro** — dificultad | rampa | `#c0a088` → `#6f2a21` | Cinco tramos, un solo pigmento. El único color que codifica una magnitud |
| **Ocre** — cautela estadística | `--attention` / `--attention-ink` | `#a87f1e` / `#6f5410` | El ⚠ de las cohortes pequeñas, y nada más. Que sea el único amarillo del sistema es lo que lo hace visible — 6,2:1 |

### Rampa de dificultad (`theme/difficulty.js`)

Secuencial y de un solo tono, para que la ordenación sobreviva a la luminancia:
quien no distinga rojos, o mire la pantalla al sol, sigue viendo cuál de dos
puntos es el más oscuro.

| Tramo | `fill` | `ink` (cifra grande, ≥3:1) | `inkSmall` (cifra de lista, ≥4,5:1) |
|---|---|---|---|
| muy dura (≥45 %) | `#6f2a21` | `#6f2a21` — 9,0:1 | `#6f2a21` — 9,0:1 |
| dura (33–45 %) | `#93472f` | `#93472f` — 5,7:1 | `#8e4429` — 6,1:1 |
| exigente (22–33 %) | `#aa6449` | `#9c5636` — 4,8:1 | `#864b2f` — 6,0:1 |
| moderada (15–22 %) | `#b8886c` | `#a06945` — 4,0:1 | `#7e5136` — 5,9:1 |
| asequible (0–15 %) | `#c0a088` | `#9c7454` — 3,6:1 | `#7a5a43` — 5,4:1 |
| sin datos | `#bebab3` | `#7c776f` — 3,9:1 | `#67635c` — 5,2:1 |

El relleno de los tramos claros se queda en 2:1 sobre papel, que basta para un
punto de 8 px pero no para una cifra — de ahí los dos tonos de tinta. Y por eso
el punto de dificultad lleva ahora un filete de su propio tramo oscuro: le da
un borde de 3:1 sin sacarlo de la escala.

### Notas y gráficas

Las seis categorías de nota son pigmentos apagados **escalonados en claridad**:
cada una contrasta al menos 1,5:1 con la que le toca al lado en la barra
apilada. Antes, Notable (`#4e86a0`) y Sobresaliente (`#7e6ba6`) tenían la misma
luminancia y dos segmentos contiguos se fundían en uno.

`No pre` `#b5b0a6` · `Sus` `#8e3626` · `Apr` `#5e8467` · `Not` `#31627c` ·
`Sob` `#8877a0` · `MH` `#c09a3a`

Las dos líneas de notas de acceso son Prusia `#245a78` y ocre `#a87f1e`: la
pareja del sistema que mejor aguanta una daltonía, y —a diferencia del naranja
anterior— ninguna se confunde con un tramo de la rampa. La serie histórica de
no superación tiene token propio, `--chart-line-difficulty` `#93472f`, porque
sí habla de dificultad.

### Deltas

`--delta-good` es el verdín `#2a5e50` y `--delta-bad` el óxido `#9a3b29`: no son
colores nuevos, son los que ya están en el sistema. Un semáforo verde-ámbar-rojo
aquí sería un cuarto vocabulario cromático para decir algo que la flecha ▲▼ ya
dice.

## Tipografía

Dos familias, ni una más. Autohospedadas, variables y con licencia SIL OFL 1.1.

- **Newsreader** (`--font-serif`) — titulares, cabeceras de sección y los
  nombres de asignatura que encabezan una tarjeta. Una serif de texto para
  pantalla con contraste de trazo real: es lo que le da voz a la página y lo
  que separa un titular de una etiqueta sin hacerlo más grande. En las listas
  densas siguen mandando la sans y el ancho de columna.
- **Instrument Sans** (`--font-sans`) — cuerpo, interfaz, botones, eyebrows y
  **todas las cifras**.

Se va IBM Plex Mono, que antes se llevaba los números. La razón de tenerla era
buena —las cifras son el producto y tienen que alinearse en columna— y sigue
cubierta: la utilidad `.num` activa las cifras tabulares que Instrument Sans
trae de fábrica (`tnum`), así que las columnas cuadran igual. Lo que se pierde
es el aire de terminal, que no era información; lo que se gana es que la página
se lea como un impreso.

También se unifican los once tamaños de `h1` que había, uno por pantalla, en
los dos escalones fluidos `--text-h1` y `--text-h1-lg`: once títulos con once
tamaños parecidos no son una jerarquía.

**Rendimiento.** El paquete de fuentes baja de 219 kB a 107 kB. En una pantalla
en español solo se descargan los subconjuntos `latin`: 71 kB frente a los 118 kB
de antes. Newsreader se sirve con el eje óptico fijado en 20 con `fontTools`,
lo que le quita la mitad del fichero.

## Forma

| Token | Antes | Ahora |
|---|---|---|
| `--radius-card` / `--radius-card-lg` | 11 / 14 px | 6 / 8 px |
| `--radius-control` / `--radius-row` | 9 / 8 px | 6 / 5 px |
| `--shadow-card` | `0 1px 3px` | `none` |
| `--gutter` | 16 px | 18 px |
| `--gap-section` | 16 px | 22 px |
| `--pad-card` | 12/13 px | 14/15 px |

Las sombras desaparecen del todo salvo en la hoja desplegable "Más", que de
verdad se levanta por encima de la pantalla. Todos los filetes son de 1 px: se
han normalizado los tres que iban a 1,5 px. Los radios y los tamaños que estaban
escritos a pelo en los componentes (113 tamaños de letra e interlineados, 41
radios, 6 transiciones, 4 colores en `rgba()`) pasan a consumir tokens.

## Contrato de color

El de antes, con un papel más: **Prusia** = estructura · **rampa** = dificultad
· **gris** = recuentos · **notas** = el desglose No presentado→MH · **verdín** =
lo elegible. El ocre queda para la cautela estadística. Ante la duda: ¿esto es
estructura, dificultad, un recuento, una categoría de nota o algo elegible?

Tres sitios lo incumplían y se han corregido: la tesela de la marca era verdín
(y una marca no elige nada; ahora es hueso sobre tinta), el "VS" de Fight Mode
también (y no es un ganador; ahora es blanco), y los tres recuentos numerados de
Metodología (que son estructura del texto; ahora son Prusia). Al invertirse la
claridad respecto al oro, la estrella del ganador pasa de tinta a blanco sobre
verdín: 4,7:1 en vez de 2,4:1.

## Ficheros tocados

**Tema** — `web/src/theme/tokens.css`, `typography.css`, `fonts.css`,
`difficulty.js`, `gradePalette.js`, `contrast.js`; `web/src/style.css`.

**Fuentes** — `web/src/assets/fonts/`: fuera Spectral, Public Sans e IBM Plex
Mono (12 ficheros); dentro Newsreader e Instrument Sans (4 ficheros).

**Componentes** — `components/ui/` (UiCallout, UiCard, UiChip, UiCountBar,
UiDifficultyDot, UiKpiCard, UiLinkRow, UiMeterRow, UiPill, UiSearchField,
UiSectionHeader, UiSortHeader, UiStat, UiSubjectCard), `components/layout/`
(AppHeader, MoreSheet), `components/charts/LineChart.vue`,
`components/Dashboard/` (ExamCalendar, SchedulePicker, WeekTimetable — los tres
que usa el móvil).

**Vistas** — About, Course, DegreeMap, Faculty, FightMode, Home, Methodology,
Optatives, Schedule, Subject, Subjects, dev/UiGallery.

El resto de `components/Dashboard/` y `components/Sidebar.vue` son la
implementación parcial de escritorio y se quedan como estaban.

## Verificación

Las once pantallas se han renderizado a 402 px con Chrome headless sobre el
build de producción. La paleta se ha comprobado con un script que mide cada
tono contra los fondos reales; no queda ninguna combinación por debajo de su
mínimo.
