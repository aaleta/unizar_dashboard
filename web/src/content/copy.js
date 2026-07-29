/**
 * La microcopia que comparten dos pantallas.
 *
 * Regla, para que esto no acabe siendo un catálogo de claves donde la prosa
 * deja de leerse en su sitio: **aquí sube lo que se escribe en más de un
 * componente, y nada más.** Una frase que solo aparece en una pantalla se
 * queda en esa pantalla, donde se lee con su contexto delante.
 *
 * Lo que sube es de dos clases: lo que ya estaba duplicado (el aviso de
 * cohorte pequeña vivía en tres sitios con dos redacciones) y lo que el
 * escritorio va a repetir, porque tendrá su propia presentación de la lista de
 * profesorado y de la lista maestra. El objetivo es que una errata se corrija
 * una vez.
 *
 * Los textos que YA tienen dueño no vienen aquí: el nombre de una tasa está en
 * METRICS, el de un orden en SORTS, el de una fuente en DATA_SOURCES y el
 * título de una pantalla en el `meta` de su ruta.
 */

import { MIN_COHORT, RECENT_YEARS } from "@/utils/metrics";

/* ------------------------------------------------------------------ *
 * Cohorte pequeña
 * ------------------------------------------------------------------ *
 * El umbral no se escribe: sale de MIN_COHORT. Una nota al pie que diga
 * "menos de 10" mientras el código avisa por debajo de 15 es peor que no
 * tener nota.
 */

export const COHORT = {
    /** `title` del ⚠ que va junto al nombre de la asignatura. */
    warning: `Menos de ${MIN_COHORT} alumnos: los porcentajes bailan mucho`,

    /** La misma advertencia, ya como frase. */
    sentence: `Menos de ${MIN_COHORT} alumnos: los porcentajes bailan mucho.`,

    /** Leyenda al pie de una lista donde el ⚠ aparece sin explicación. */
    legend: `⚠ = menos de ${MIN_COHORT} alumnos`
};

/* ------------------------------------------------------------------ *
 * Pies de página recurrentes
 * ------------------------------------------------------------------ */

/**
 * "Medias ponderadas de los últimos 3 cursos", con la variante que precisa
 * sobre qué se promedia. Sin punto final: quien la usa suele encadenarla con
 * otra cosa detrás.
 */
export const weightedAverages = (of = null, years = RECENT_YEARS) =>
    of
        ? `Medias ponderadas de ${of} · últimos ${years} cursos`
        : `Medias ponderadas de los últimos ${years} cursos`;

/* ------------------------------------------------------------------ *
 * Búsqueda y listas vacías
 * ------------------------------------------------------------------ */

export const SEARCH = {
    subjects: total => `Buscar entre ${total} asignaturas…`,
    subjectsLabel: "Buscar asignatura",
    optative: "Buscar optativa…",
    optativeLabel: "Buscar optativa",
    professor: "Buscar profesor…",
    professorLabel: "Buscar profesor"
};

export const EMPTY = {
    subjects: "Ninguna asignatura coincide con la búsqueda.",
    professors: "Ningún profesor coincide con la búsqueda."
};

/* ------------------------------------------------------------------ *
 * Profesorado
 * ------------------------------------------------------------------ *
 * La pantalla que más se reparte entre móvil y escritorio: la lista persona a
 * persona y la madeja cuentan lo mismo con dos formas, y todo esto lo dicen
 * las dos.
 */

export const FACULTY = {
    lead:
        "Quién comparte asignatura con quién. Cada colaboración pesa 1/n por " +
        "asignatura y curso.",

    activeChip: count => `En activo · ${count}`,
    allChip: count => `Todos · ${count}`,

    /**
     * En escritorio hay sitio para explicar el peso entero; en el móvil, no. La
     * frase larga extiende a la corta, no la sustituye.
     */
    leadMore:
        "Compartir una asignatura de dos profesores pesa más que compartir " +
        "una de veinte: cada pareja suma 1/n en cada asignatura y curso, y el " +
        "índice de una persona es la suma de todos sus pesos.",

    legendSize: "tamaño = nº de asignaturas distintas",
    legendWidth: "grosor = peso de la colaboración",

    currentSubjects: "Imparte este curso",
    pastSubjects: "Ha impartido alguna vez",
    topCollaborators: "Colabora más con",

    footnote:
        "Índice = suma de 1/n por asignatura y curso, donde n es el número de " +
        "profesores de esa asignatura ese año · en activo = aparecen en la " +
        "guía docente más reciente · el TFG se excluye porque lo firma medio " +
        "departamento."
};
