/**
 * Todo lo que la ficha necesita de una asignatura, para un curso académico.
 *
 * Ninguna fórmula vive aquí: los seis indicadores, la distribución, la serie y
 * la media del curso salen de metrics.js. Lo que se resuelve aquí es la
 * fontanería que si no acabaría repetida por la vista: qué años tienen datos,
 * contra qué se compara cada delta, qué puesto ocupa en su curso y de dónde
 * sale la guía docente.
 */

import { computed, unref } from "vue";

import guias from "../../../data/json/processed/profesores_guias_doc.json";

import {
    METRICS,
    RECENT_YEARS,
    subjectInfo,
    subjectName,
    subjectRow,
    subjectYears,
    subjectRateBefore,
    subjectSeries,
    averageEnrolment,
    averageSittings,
    officialResult,
    matriculados,
    distribution,
    courseRateForYear,
    coreSubjects,
    subjectRate,
    isSmallCohort
} from "@/utils/metrics";

/** Valor, ref o getter. Ver la nota en useCourse.js: `unref` sola no basta. */
const read = source =>
    typeof source === "function" ? source() : unref(source);

const ORDINALS = {
    1: "Primero",
    2: "Segundo",
    3: "Tercero",
    4: "Cuarto"
};

/**
 * Los seis indicadores de la ficha, en el orden en que se leen.
 *
 * `higherIsBetter` NO es decorativo: decide si una subida se pinta como buena
 * o como mala. Subir 19 pp de no superación y subir 2 pp de aprobados son
 * cosas opuestas, y sin esto el color diría lo mismo en los dos casos.
 */
export const SUBJECT_KPIS = [
    {
        key: "noSuperacion",
        label: "No superan",
        higherIsBetter: false,
        ramp: true
    },
    { key: "rendimiento", label: "Aprueban", higherIsBetter: true },
    { key: "noPresentados", label: "No presentados", higherIsBetter: false },
    { key: "excelencia", label: "Sob. + MH", higherIsBetter: true }
];

export const useSubject = (codeSource, yearSource) => {
    const code = computed(() => Number(read(codeSource)));

    const years = computed(() => subjectYears(code.value));

    const exists = computed(() => years.value.length > 0);

    /** Si el año pedido no existe para esta asignatura, manda el más reciente. */
    const year = computed(() => {
        const wanted = read(yearSource);

        if (wanted && years.value.includes(wanted)) return wanted;

        return years.value[years.value.length - 1] ?? null;
    });

    const info = computed(() => subjectInfo(code.value));

    const row = computed(() =>
        year.value ? subjectRow(code.value, year.value) : null
    );

    const enrolled = computed(() => (row.value ? matriculados(row.value) : 0));

    /** Curso al que pertenece: el primero, si es optativa de 3º y 4º. */
    const course = computed(() =>
        info.value ? Number(info.value.courses[0]) : null
    );

    const kpis = computed(() =>
        SUBJECT_KPIS.map(kpi => {
            const definition = METRICS[kpi.key];

            const value = row.value ? definition.compute(row.value) : null;

            const reference = subjectRateBefore(
                code.value,
                kpi.key,
                year.value,
                RECENT_YEARS
            );

            return {
                ...kpi,
                value,
                // Delta contra la media de los cursos ANTERIORES al elegido,
                // no contra la media global: comparar un año consigo mismo
                // dentro de la media lo diluye.
                delta:
                    value !== null && reference !== null
                        ? value - reference
                        : null,
                hasReference: reference !== null
            };
        })
    );

    /**
     * Convocatorias consumidas: dato oficial, no derivable de las notas. Si el
     * año elegido no lo tiene —hay optativas que no se ofertan todos los
     * cursos— se cae al más reciente que sí, y se dice cuál es.
     */
    const sittings = computed(() => {
        const exact = averageSittings(code.value, year.value);

        if (exact !== null) {
            return { value: exact, year: year.value, exact: true };
        }

        const fallback = officialResult(code.value);

        return fallback
            ? {
                  value: fallback.media_convocatorias,
                  year: fallback.curso,
                  exact: false
              }
            : { value: null, year: null, exact: false };
    });

    const grades = computed(() =>
        row.value ? distribution(row.value, "matriculados") : []
    );

    const history = computed(() =>
        subjectSeries(code.value, "noSuperacion").filter(
            point => point.value !== null
        )
    );

    /**
     * La no superación tal y como la enseñan las listas: media ponderada de los
     * últimos RECENT_YEARS cursos, y no la del año elegido arriba.
     *
     * La ficha es la única pantalla que habla de UN curso académico; el mapa
     * del grado, la vista de curso y las tablas hablan del periodo. Son dos
     * cifras distintas de la misma asignatura (Álgebra II: 51 % en 2025-2026,
     * 54 % en el trienio) y sin enseñar las dos aquí, la diferencia parece un
     * error de cálculo.
     */
    const recentNoSuperacion = computed(() =>
        subjectRate(code.value, "noSuperacion")
    );

    /** Puesto por dificultad entre las troncales de su curso. */
    const ranking = computed(() => {
        if (!course.value || info.value?.tipo !== "troncal") return null;

        const ranked = coreSubjects(course.value)
            .map(subject => ({
                code: Number(subject.code),
                value: subjectRate(subject.code, "noSuperacion")
            }))
            .filter(item => item.value !== null)
            .sort((a, b) => b.value - a.value);

        const position = ranked.findIndex(item => item.code === code.value);

        return position === -1
            ? null
            : { position: position + 1, total: ranked.length };
    });

    /** La misma métrica, para el conjunto de troncales del curso y ese año. */
    const courseAverage = computed(() =>
        course.value && year.value
            ? {
                  rendimiento: courseRateForYear(
                      course.value,
                      "rendimiento",
                      year.value
                  ),
                  noSuperacion: courseRateForYear(
                      course.value,
                      "noSuperacion",
                      year.value
                  )
              }
            : null
    );

    /**
     * Guía docente y profesorado. Van por su cuenta porque cubren cursos
     * (hasta 2026-2027) para los que aún no hay notas, y porque hay optativas
     * que no se ofertan todos los años: se coge la más reciente que exista.
     */
    const teaching = computed(() => {
        const entries = guias
            .filter(entry => Number(entry.id_asignatura) === code.value)
            .sort((a, b) => b.anyo_academico.localeCompare(a.anyo_academico));

        return entries[0] ?? null;
    });

    return {
        code,
        exists,
        name: computed(() => subjectName(code.value)),
        info,
        course,
        courseName: computed(() => ORDINALS[course.value] ?? null),
        years,
        year,
        row,
        enrolled,
        smallCohort: computed(() => isSmallCohort(enrolled.value)),
        averageEnrolment: computed(() => averageEnrolment(code.value)),
        kpis,
        sittings,
        grades,
        history,
        recentNoSuperacion,
        ranking,
        courseAverage,
        teaching,
        recentYears: RECENT_YEARS
    };
};
