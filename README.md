# Unizar Dashboard

Estadísticas del Grado en Física de la Universidad de Zaragoza.

## Fuente de los datos

- **Notas**: https://estudios.unizar.es/informe/resultados-academicos?estudio_id=20250124
- **Resultados**: https://zaguan.unizar.es/collection/opendata-academico-rendimiento-asignatura-titulacion?ln=en
- **Profesores y guías docentes**: se extraen directamente de la web (scraper en `scripts/updater.py`).

Todos los porcentajes de la web salen de `notas.xlsx`. De `xlsx_csv/rendimiento/`
(un CSV por curso) solo se usa la **media de convocatorias consumidas**, que no
puede deducirse del reparto de notas; sus tasas no se mezclan con las nuestras
porque las dos fuentes discrepan en el número de alumnos de algunas asignaturas
(ver `/metodologia` en la web).

En `data/xlsx_csv/` hay además datos abiertos que la web todavía **no** usa:
`resultados/` (nivel titulación: ingreso, graduados, abandono), `procedencia/`,
`egresados/` y `erasmus/`. Están ahí para más adelante.

`notas.xlsx` va algo desactualizado: la web solo deja seleccionar los cursos para
los que hay datos.

## Actualizar

```sh
uv run ./scripts/updater.py     # desde ./scripts
cd web && npm run build && npm run deploy
```

`updater.py` genera, en `data/json/processed/`:

| Fichero | Contenido |
|---|---|
| `AsignaturasPorCurso.json` | asignaturas agrupadas por curso |
| `AsignaturasClasificadasOptTronc.json` | troncales y optativas por curso |
| `ResultadosFisica.json` | filas del Grado en Física de `xlsx_csv/rendimiento/*.csv`, los 12 cursos (los originales traen toda la universidad, ~27 MB, y no se vuelcan a JSON) |
| `Profesores_GuiasDoc.json` | profesorado y guías docentes (scraper) |
| `DataFreshness.json` | último curso disponible de cada fuente; la web lo muestra en portada |

## Estructura de la web

Las métricas están definidas **una sola vez** en `web/src/utils/metrics.js`
(tasas de rendimiento, éxito, evaluación y no superación, con la nomenclatura
oficial de Unizar). Ningún componente debe recalcularlas por su cuenta.

## Rediseño móvil (hecho)

El 70 % de las visitas llegan desde el móvil y la web estaba pensada para
escritorio, así que se rehizo **empezando por el móvil**, siguiendo el diseño de
`design_handoff_physics_mobile/`.

Es **un solo código base responsive**, no dos versiones.

```
web/src/
├─ theme/          tokens, rampa de dificultad, paleta de notas, contraste
├─ composables/    lógica derivada, sin interfaz
├─ components/
│  ├─ ui/          primitivas del sistema de diseño (Ui*)
│  ├─ layout/      carcasa: cabecera, pestañas, hoja "Más"
│  ├─ charts/      gráficas en SVG
│  └─ Dashboard/   ⚠ componentes de ESCRITORIO heredados (ver abajo)
└─ views/          una vista por pantalla
```

Reglas que conviene no romper:

- **El color no miente.** Carbón = estructura; la rampa = dificultad y nada
  más; gris = recuentos; la paleta categórica = calificaciones. Está escrito en
  la cabecera de `theme/tokens.css`, junto con la dirección visual vigente
  (ver `DESIGN_NOTES.md`).
- **Ninguna cifra se escribe a mano.** Todo sale de `utils/metrics.js`.
- **Ningún color fuera de `theme/`.**
- **Contraste AA** en las diez pantallas. Los grises del diseño original no
  llegaban; ver la nota en `theme/tokens.css`.

### Deuda pendiente: el escritorio

El escritorio **no está rediseñado**. Por encima de 900px se ve el layout móvil
centrado con un ancho máximo: presentable, pero no diseñado para esa pantalla.

- `components/Dashboard/` y `Sidebar.vue` son el escritorio **anterior**, con su
  tema oscuro. Se conservan como referencia del rediseño pendiente.
- De ellos solo siguen vivos `ProfWeb.vue` → `ProfGraph.vue`: el grafo completo
  de profesores, que se carga **solo por encima de 900px** y en diferido, para
  que un móvil no descargue medio mega de `vis-network`.
- El resto está huérfano. No entra en el bundle (Vite no lo incluye si nadie lo
  importa), pero tampoco se ha borrado.
- `chart.js` y `vue-chartjs` ya **no se usan en ninguna pantalla viva** y no
  aparecen en el bundle de producción. Se pueden desinstalar cuando el rediseño
  de escritorio decida qué hacer con los paneles antiguos.

## Última actualización

Ya no se anota a mano: cada fuente publica su propia fecha y la portada la lee
de `DataFreshness.json`.
