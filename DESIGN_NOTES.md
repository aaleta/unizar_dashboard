# Dirección: «Milimetrado»

Restyle de la versión móvil. Solo cambia el lenguaje visual: la estructura, el
contenido y el comportamiento quedan como estaban. La versión de escritorio
(`web/src/components/Dashboard/`, `Sidebar.vue`) no se toca.

## Rationale

El producto son mediciones de un Grado en Física, y el artefacto que todo
estudiante de física asocia a una medición es el papel milimetrado del cuaderno
de prácticas. El fondo pasa a ser una retícula milimetrada fría sobre la que
las tarjetas blancas se posan como gráficas pegadas en un cuaderno; el color
estructural pasa del azul corporativo a un petróleo de instrumento, lejos de la
rampa cálida de dificultad para que el contrato de color del proyecto
(estructura ≠ dificultad ≠ recuentos ≠ notas) siga sin mentir. La tipografía
baja de tres familias a dos con la superfamilia IBM Plex —sans para la voz,
mono para toda cifra—, que es la voz de un manual técnico: el titular se
distingue por peso y tracking, no por cambiar de familia. Los radios se
recogen y las sombras casi desaparecen: la estructura la dan los hairlines,
como en un instrumento, no la elevación.

Todo pasa por `web/src/theme/` (los componentes ya consumían tokens; se
retiraron los dos únicos rgba sueltos que quedaban). Todos los pares
texto/fondo se han verificado a WCAG AA (4,5:1 texto normal, 3:1 iconos y
trazos) sobre papel, sobre blanco y sobre petróleo.

## Paleta

| Hex | Token | Papel |
|---|---|---|
| `#17545c` | `--navy`¹ | Petróleo estructural: cabecera, pestaña activa, enlaces, botones |
| `#2e5f60` | `--navy-soft` | Petróleo legible como texto sobre fondo claro |
| `#a9c4c6` / `#bcd3d3` | `--navy-faint` / `--on-navy-soft` | Eyebrows y párrafos sobre petróleo |
| `#ecf1ef` / `#dde6e3` | `--navy-wash(-line)` | Aviso estructural claro |
| `#f6f7f4` | `--paper` | Fondo de la aplicación (el milimetrado) |
| `rgba(23,84,92,.05/.09)` | `--grid-minor/major` | Las dos tramas de la retícula (8px / 40px) |
| `#ffffff` | `--surface` | Tarjeta |
| `#dde1da` (familia) | `--line-*` | Hairlines fríos: bordes y divisores |
| `#1b1f1d` → `#697066` | `--ink-*` | Escala de tinta fría (todas ≥ 4,5:1) |
| `#cba44c` / `#85662d` | `--gold(-ink)` | Latón: decoración y ganador de Fight Mode, nunca un dato |
| `#2f6e76` / `#c4642f` | `--chart-line-1/2` | Nota media / nota de corte |
| `#98a29b` | `--count-fill` | Recuentos (cantidad ≠ dificultad) |
| `#44694a` / `#b5482f` | `--delta-good/bad` | Mejor / peor |
| `#9a3b23…#8aa07a` | rampa (`difficulty.js`) | Dificultad, sin cambios: es semántica de datos, no tema |

¹ Los nombres `--navy-*` se conservan aunque el tono ya no sea azul: renombrar
tocaría 27 ficheros y este diff debe leerse como lo que es, un restyle. Queda
anotado en `tokens.css`; el rename mecánico a `--brand-*` es un follow-up.

## Tipografías

- **IBM Plex Sans** (variable 100–700, auto-hospedada, latin + latin-ext):
  titulares (peso 650, tracking −0,01em, clase `.serif`²), cuerpo, interfaz.
- **IBM Plex Mono** (400/500/600, ya estaba): todas las cifras, eyebrows,
  metadatos y códigos. Sin cambios de uso.
- Retiradas: Spectral y Public Sans (los .woff2 se borran; el peso total de
  fuentes baja ~56 KB).

² También legado; anotado en `typography.css`.

## Ficheros tocados

- `web/src/theme/tokens.css` — paleta, radios, sombras (mismos nombres, valores nuevos)
- `web/src/theme/typography.css` — dos familias, titular por peso, comentario del contrato
- `web/src/theme/fonts.css` — @font-face de Plex Sans variable; fuera Spectral y Public Sans
- `web/src/theme/difficulty.js` — solo el tramo «sin datos», a gris frío
- `web/src/theme/gradePalette.js` — solo los neutros («No pre» y fallback), a gris frío
- `web/src/theme/contrast.js` — la constante INK sigue a `--ink`
- `web/src/style.css` — la retícula milimetrada en `#app`
- `web/src/views/Home.vue` — dos rgba de oro a pelo → `--gold-halo(-soft)`
- `web/index.html` + `web/public/manifest.webmanifest` — `theme-color` y `background_color`
- `web/src/assets/fonts/` — entran `ibm-plex-sans-var-*`, salen `spectral-*` y `public-sans-*`
