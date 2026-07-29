/**
 * Procedencia y actualidad de cada conjunto de datos.
 *
 * Las fechas salen de data_freshness.json, que genera scripts/updater.py a partir
 * de los propios ficheros: la portada afirmaba "datos del curso 2024-2025" para
 * todo, y de las cuatro fuentes solo una lo cumplía.
 *
 * `short` es el mismo nombre en corto: el pie de la lateral de escritorio
 * tiene 200px y "Calificaciones por asignatura" no cabe sin partirse en tres
 * líneas. Va aquí, junto al largo, para que no se escriban en dos sitios.
 *
 * Es un JSON diminuto a propósito: calcularlo en el navegador obligaría a cargar
 * los 300 kB de guías docentes en la página de inicio solo para leer un año.
 */

import freshness from "../../../data/json/processed/data_freshness.json";

export const DATA_SOURCES = [
    {
        key: "notas",
        ...freshness.notas,
        short: "Calificaciones",
        description:
            "Reparto de calificaciones (no presentados, suspensos, aprobados, " +
            "notables, sobresalientes y matrículas de honor) de cada asignatura " +
            "y curso académico. Es la base de casi todos los indicadores."
    },
    {
        key: "resultados",
        ...freshness.resultados,
        short: "Tasas oficiales",
        description:
            "Tasas oficiales de éxito, rendimiento y evaluación, y media de " +
            "convocatorias consumidas. Publicadas en abierto por la Universidad."
    },
    {
        key: "notas_corte",
        ...freshness.notas_corte,
        short: "Notas de corte",
        description:
            "Nota de corte y nota media de las pruebas de acceso del grado."
    },
    {
        key: "guias",
        ...freshness.guias,
        short: "Guías docentes",
        description:
            "Profesorado asignado y enlaces a la guía docente de cada asignatura, " +
            "extraídos de la web de la Universidad."
    },
    {
        key: "horarios",
        ...freshness.horarios,
        short: "Horarios y exámenes",
        description:
            "Horario semanal de clases y fechas de examen de cada convocatoria, " +
            "según la publicación oficial del centro."
    }
];

/** Por clave: la lateral pregunta por la fuente de la pantalla activa. */
export const dataSource = key =>
    DATA_SOURCES.find(source => source.key === key) ?? null;

export default freshness;
