# Unizar Dashboard

Estadísticas del Grado en Física de la Universidad de Zaragoza.

## Fuente de los datos

- **Notas**: https://estudios.unizar.es/informe/resultados-academicos?estudio_id=20250124
- **Resultados**: https://zaguan.unizar.es/collection/opendata-academico-rendimiento-asignatura-titulacion?ln=en
- **Profesores y guías docentes**: se extraen directamente de la web (scraper en `Scripts/Updater.py`).

Todos los porcentajes de la web salen de `notas.xlsx`. De `resultados.csv` solo se
usa la **media de convocatorias consumidas**, que no puede deducirse del reparto de
notas; sus tasas no se mezclan con las nuestras porque las dos fuentes discrepan en
el número de alumnos de algunas asignaturas (ver `/metodologia` en la web).

`notas.xlsx` va algo desactualizado: la web solo deja seleccionar los cursos para
los que hay datos.

## Actualizar

```sh
uv run ./Scripts/Updater.py     # desde ./Scripts
cd web && npm run build && npm run deploy
```

`Updater.py` genera, en `data/json/processed/`:

| Fichero | Contenido |
|---|---|
| `AsignaturasPorCurso.json` | asignaturas agrupadas por curso |
| `AsignaturasClasificadasOptTronc.json` | troncales y optativas por curso |
| `ResultadosFisica.json` | filas del Grado en Física de `resultados.csv` (el original trae toda la universidad, ~3,5 MB) |
| `Profesores_GuiasDoc.json` | profesorado y guías docentes (scraper) |
| `DataFreshness.json` | último curso disponible de cada fuente; la web lo muestra en portada |

## Estructura de la web

Las métricas están definidas **una sola vez** en `web/src/utils/metrics.js`
(tasas de rendimiento, éxito, evaluación y no superación, con la nomenclatura
oficial de Unizar). Ningún componente debe recalcularlas por su cuenta.

## Rediseño en curso (rama `mobile`)

El 70 % de las visitas son desde el móvil y la web estaba pensada para
escritorio, así que se está rehaciendo **empezando por el móvil**. El plan por
fases está en `MOBILE_REDESIGN_PLAN.md` y el diseño de referencia en
`design_handoff_physics_mobile/`.

Es **un solo código base responsive**, no dos versiones: los tokens de diseño,
la rampa de dificultad y la lógica derivada se construyen una vez y el rediseño
de escritorio los heredará.

> ⚠️ **Mientras dure el rediseño, la vista de escritorio se verá rota**
> (tema oscuro sustituido por el claro, pantallas aún sin migrar). Es una
> consecuencia asumida del orden de trabajo, no una regresión que haya que
> reportar. El escritorio se rediseña después, sobre estos mismos cimientos.

## Última actualización

Ya no se anota a mano: cada fuente publica su propia fecha y la portada la lee
de `DataFreshness.json`.
