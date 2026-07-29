/**
 * Un curso del grado: sus cifras agregadas y sus asignaturas ordenadas.
 *
 * Como useDegreeMap, aquí no se calcula ninguna tasa: se pide a metrics.js y
 * se ordena. La diferencia es que este sí es reactivo, porque el curso viene
 * de la ruta y cambia sin recargar la página.
 */

import { computed, unref } from "vue";

/**
 * Acepta un valor, un ref o una función. `unref` sola no vale: con un getter
 * devolvería la función tal cual, y `Number(fn)` es NaN — que es justo el fallo
 * silencioso que deja la pantalla diciendo "ese curso no existe".
 */
const read = source =>
    typeof source === "function" ? source() : unref(source);

import {
    coreSubjects,
    optionalSubjectsOf,
    subjectSummary,
    courseEnrolment,
    courseRate,
    isSmallCohort,
    RECENT_YEARS
} from "@/utils/metrics";

const NAMES = {
    1: "Primero",
    2: "Segundo",
    3: "Tercero",
    4: "Cuarto"
};

const describe = subject => {
    const summary = subjectSummary(subject.code);

    return {
        code: summary.code,
        name: summary.name,
        enrolment: summary.enrolment,
        noSuperacion: summary.noSuperacion,
        rendimiento: summary.rendimiento,
        noPresentados: summary.noPresentados,
        courses: summary.courses,
        // Según la matrícula media, que es la que se enseña en la tarjeta.
        // Ver la nota en useSubjectList.js.
        smallCohort: isSmallCohort(Math.round(summary.enrolment))
    };
};

/** Sin datos al final: un hueco no es un 0 %. */
const byDifficulty = (a, b) => {
    if (a.noSuperacion === null) return 1;

    if (b.noSuperacion === null) return -1;

    return b.noSuperacion - a.noSuperacion;
};

export const useCourse = source => {
    const number = computed(() => Number(read(source)));

    const valid = computed(() => Boolean(NAMES[number.value]));

    const troncales = computed(() =>
        valid.value
            ? coreSubjects(number.value).map(describe).sort(byDifficulty)
            : []
    );

    const optativas = computed(() =>
        valid.value
            ? optionalSubjectsOf(number.value).map(describe).sort(byDifficulty)
            : []
    );

    return {
        number,

        valid,

        name: computed(() => NAMES[number.value] ?? null),

        troncales,

        optativas,

        // Solo troncales: son las que cursa todo el mundo, así que describen
        // el curso sin depender de qué optativas elija cada uno.
        avgPass: computed(() =>
            valid.value ? courseRate(number.value, "rendimiento") : null
        ),

        avgNoShow: computed(() =>
            valid.value ? courseRate(number.value, "noPresentados") : null
        ),

        // Cuánta gente pasa por el curso en un año, contando todas sus
        // troncales: es el tamaño del curso, y da la medida de las tasas.
        enrolment: computed(() =>
            valid.value ? Math.round(courseEnrolment(number.value)) : 0
        ),

        // ¿Sus optativas son las de la bolsa de 3.º y 4.º, o las especiales de
        // primero? Cambia el rótulo y lo que se puede enlazar.
        poolOptatives: computed(() =>
            valid.value
                ? optionalSubjectsOf(number.value).some(
                      subject => subject.enBolsa
                  )
                : false
        ),

        // ¿Estas optativas se ofertan también en otro curso? Lo dice la nota
        // de la sección, y es la clase de detalle que se escribe a mano y
        // envejece: aquí sale del catálogo.
        alsoInCourses: computed(() => {
            const others = new Set();

            optativas.value.forEach(subject =>
                subject.courses
                    .filter(course => Number(course) !== number.value)
                    .forEach(course => others.add(Number(course)))
            );

            return [...others].sort();
        }),

        recentYears: RECENT_YEARS
    };
};
