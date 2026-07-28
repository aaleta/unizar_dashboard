# Propuesta «Cartel»

Estilo tipográfico internacional: papel blanco, tinta casi negra, filetes de
imprenta en lugar de sombras, esquinas vivas y un único color estructural —
un azul cobalto eléctrico.

## Justificación

Esta web publica datos oficiales de una universidad, y el registro visual que
mejor le sienta es el del cartel suizo: retícula, contraste máximo y cero
ornamento, porque la autoridad la ponen las cifras y no la decoración. Las
tarjetas dejan de "flotar" sobre gris con sombras blandas y pasan a ser
módulos delimitados por un borde de 1px, como una página impresa. El cromo
abandona el navy corporativo por un cobalto eléctrico que jamás se confunde
con un dato: la rampa de dificultad ocupa todo el espectro rojo–naranja–
amarillo–verde, así que el único acento posible que no miente es un azul, y
si solo hay un azul, puede ser rotundo. El contrato de color del proyecto
(estructura / dificultad / recuentos / notas, sin mezclarse) se conserva
íntegro, con todos los pares texto/fondo verificados a WCAG AA.

## Paleta

| Token | Hex | Papel |
|---|---|---|
| `--paper` | `#f5f5f2` | Fondo de la aplicación (blanco offset) |
| `--surface` | `#ffffff` | Tarjeta / módulo |
| `--ink` | `#17181a` | Texto primario (tinta casi negra, neutra) |
| `--ink-2` … `--ink-faint` | `#43454a` … `#63666d` | Escala de apoyo, grises fríos (todos ≥ 4,5:1) |
| `--line` | `#d6d7d1` | Filete de tarjeta: el sistema de elevación ES la línea |
| `--navy` | `#1c3ac6` | **Cobalto estructural**: cabeceras, pestaña activa, enlaces, botones (7,8:1 con blanco). Conserva el nombre histórico del token |
| `--gold` / `--gold-ink` | `#c29a2b` / `#7d6414` | Ocre heráldico: decoración, optativas y ganador de Fight Mode. Nunca un dato |
| `--warn-title` / bg | `#96311b` / `#faeeea` | Aviso "la más dura" |
| `--attention` | `#a17c1a` | Aviso de cohorte pequeña (⚠) |
| `--delta-good` / `--delta-bad` | `#2e6b40` / `#b23c22` | Variaciones mejor/peor |
| `--chart-line-1` / `-2` | `#3a55c8` / `#c05a2a` | Nota media / nota de corte |
| Rampa de dificultad | `#a03018 → #c25a24 → #d19335 → #ccb84f → #7d9a6d` | Solo dificultad (en `theme/difficulty.js`, con tintas AA por tamaño) |
| Calificaciones | `#a9aaa4 · #b23c22 · #619159 · #4581aa · #7767b0 · #c99e2f` | Categórica No presentado→MH (en `theme/gradePalette.js`) |

Radios: 1–4px (esquinas vivas; las «píldoras» pasan a etiquetas
rectangulares). Sombras: solo la hoja modal las conserva; el resto es plano.

## Tipografía (dos familias, variables, auto-hospedadas)

- **Archivo** (variable en peso 100–900 y anchura 62–125 %):
  - a peso 800 y anchura 110 % es la voz de titular (clase `.serif`, que
    conserva su nombre histórico) — portada, secciones, nombres de asignatura;
  - a pesos de labor es todo el cuerpo e interfaz (`--font-sans`).
- **Spline Sans Mono** (variable 300–700): todas las cifras y porcentajes
  (`.num`, tabular), eyebrows, metadatos y códigos.

Cuatro ficheros woff2 (~230 KB, latin + latin-ext) frente a los diez
anteriores: menos peticiones, mismo peso.

## Ficheros tocados

- `web/src/theme/tokens.css` — repintado completo; nuevos tokens `--gold-ring(-soft)`, `--chrome-overlay(-strong)`, `--radius-bar`
- `web/src/theme/typography.css` — familias y voces; escala de tamaños intacta
- `web/src/theme/fonts.css` + `web/src/assets/fonts/` — Archivo y Spline Sans Mono variables; retiradas Spectral, Public Sans e IBM Plex Mono
- `web/src/theme/difficulty.js` — rampa retintada (mismos tramos y contratos de contraste)
- `web/src/theme/gradePalette.js` — categorías retintadas
- `web/src/theme/contrast.js` — literal de tinta actualizado
- `web/src/views/{Home,Course,Faculty,About,Subject,Schedule,Methodology,Optatives,FightMode}.vue`, `web/src/components/ui/{UiSubjectCard,UiChip,UiCountBar,UiMeterRow}.vue`, `web/src/components/layout/{AppHeader,MoreSheet}.vue` — valores sueltos (radios, rgba) sustituidos por tokens; peso de titular de la cabecera

Sin cambios de estructura, copy, componentes ni comportamiento. La versión de
escritorio sin migrar queda como estaba.
