/**
 * Procedencia y actualidad de cada conjunto de datos.
 *
 * Las fechas salen de data_freshness.json, que genera scripts/updater.py a partir
 * de los propios ficheros: la portada afirmaba "datos del curso 2024-2025" para
 * todo, y de las cuatro fuentes solo una lo cumplía.
 *
 * Es un JSON diminuto a propósito: calcularlo en el navegador obligaría a cargar
 * los 300 kB de guías docentes en la página de inicio solo para leer un año.
 */

import freshness from "../../../data/json/processed/data_freshness.json";

export const DATA_SOURCES = [
    {
        key: "notas",
        ...freshness.notas,
        description:
            "Reparto de calificaciones (no presentados, suspensos, aprobados, " +
            "notables, sobresalientes y matrículas de honor) de cada asignatura " +
            "y curso académico. Es la base de casi todos los indicadores."
    },
    {
        key: "resultados",
        ...freshness.resultados,
        description:
            "Tasas oficiales de éxito, rendimiento y evaluación, y media de " +
            "convocatorias consumidas. Publicadas en abierto por la Universidad."
    },
    {
        key: "notas_corte",
        ...freshness.notas_corte,
        description:
            "Nota de corte y nota media de las pruebas de acceso del grado."
    },
    {
        key: "guias",
        ...freshness.guias,
        description:
            "Profesorado asignado y enlaces a la guía docente de cada asignatura, " +
            "extraídos de la web de la Universidad."
    },
    {
        key: "horarios",
        ...freshness.horarios,
        description:
            "Horario semanal de clases y fechas de examen de cada convocatoria, " +
            "según la publicación oficial del centro."
    }
];

export default freshness;
