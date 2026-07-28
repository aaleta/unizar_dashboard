/**
 * Las cifras del grado entero: lo que abre la portada.
 *
 * Un dashboard abre con números, no con gráficas. Cuatro escalares dicen si el
 * grado va bien o mal antes de que nadie tenga que interpretar un eje.
 *
 * Las tasas se comparan contra los tres cursos ANTERIORES, no contra el curso
 * pasado suelto: un año raro (una huelga, un cambio de profesor, la pandemia)
 * movería la flecha sin que haya cambiado nada de fondo.
 */

import { computed } from "vue";

import corte from "../../../data/json/notas_de_corte_raw.json";

import {
    RECENT_YEARS,
    METRICS,
    academicYears,
    degreeRateForPeriod,
    allCoreSubjects,
    averageSittings,
    officialResult,
    subjectRate,
    subjectName,
    subjectInfo,
    courseSeries
} from "@/utils/metrics";

const recentPeriod = academicYears.slice(-RECENT_YEARS);
const previousPeriod = academicYears.slice(-2 * RECENT_YEARS, -RECENT_YEARS);

/**
 * En la portada las tasas se rotulan en román paladino: "Aprueban", no "Tasa
 * de rendimiento". El nombre oficial sigue en metrics.js y se usa donde toca
 * —la metodología—, pero quien acaba de abrir la web no debería tener que
 * saberse la nomenclatura de la Universidad para leer la primera cifra.
 */
const PLAIN_LABELS = {
    rendimiento: "Aprueban",
    noPresentados: "No presentados"
};

const rateKpi = key => {
    const value = degreeRateForPeriod(key, recentPeriod);
    const previous = degreeRateForPeriod(key, previousPeriod);

    return {
        key,
        label: PLAIN_LABELS[key] ?? METRICS[key].label,
        value,
        higherIsBetter: METRICS[key].higherIsBetter,
        delta: value !== null && previous !== null ? value - previous : null
    };
};

/** Serie de notas de acceso, ordenada y sin años incompletos. */
const admission = [...corte]
    .filter(row => row.nota_corte !== null && row.nota_media_admision !== null)
    .sort((a, b) => a.anyo - b.anyo);

/** Tasa de rendimiento del grado en cada curso académico. */
const passTrend = academicYears
    .map(year => ({
        year,
        value: degreeRateForPeriod("rendimiento", [year])
    }))
    .filter(point => point.value !== null);

export const useDegree = () => {
    /** La troncal con más no superación del grado ahora mismo. */
    const hardest = computed(() => {
        const ranked = allCoreSubjects
            .map(subject => ({
                code: Number(subject.code),
                name: subjectName(subject.code),
                course: subjectInfo(subject.code)?.courses[0] ?? null,
                value: subjectRate(subject.code, "noSuperacion")
            }))
            .filter(item => item.value !== null)
            .sort((a, b) => b.value - a.value);

        if (!ranked.length) return null;

        const worst = ranked[0];

        // ¿Va a peor? Se compara su tasa reciente con la de los cursos
        // anteriores, para no afirmar una tendencia que no se ha mirado.
        const series = courseSeries(worst.course, "noSuperacion");

        return { ...worst, series };
    });

    /** Convocatorias medias del grado: media simple entre troncales. */
    const sittings = computed(() => {
        const values = allCoreSubjects
            .map(subject => averageSittings(subject.code))
            .filter(value => value !== null);

        return values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null;
    });

    /**
     * De qué curso académico sale esa media. El dato por asignatura es el
     * oficial más reciente, así que se calcula y no se escribe: si un año la
     * Universidad publicara unas troncales sí y otras no, "curso X" pasaría
     * solo a "hasta X" en vez de afirmar un año que no es.
     */
    const sittingsYear = computed(() => {
        const years = new Set(
            allCoreSubjects
                .map(subject => officialResult(subject.code))
                .filter(row => row && row.media_convocatorias !== null)
                .map(row => row.curso)
        );

        if (!years.size) return null;

        const latest = [...years].sort().pop();

        return years.size === 1 ? `curso ${latest}` : `hasta ${latest}`;
    });

    const cutoff = computed(() => {
        const last = admission[admission.length - 1];
        const previous = admission[admission.length - 2];

        if (!last) return null;

        return {
            year: last.anyo,
            value: last.nota_corte,
            delta: previous ? last.nota_corte - previous.nota_corte : null,
            previousYear: previous?.anyo ?? null
        };
    });

    return {
        cutoff,

        rates: computed(() => [
            rateKpi("rendimiento"),
            rateKpi("noPresentados")
        ]),

        sittings,

        sittingsYear,

        admission,

        passTrend,

        hardest,

        recentYears: RECENT_YEARS,

        firstYear: academicYears[0],

        lastYear: academicYears[academicYears.length - 1]
    };
};
