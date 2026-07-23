/**
 * El grado entero, curso a curso, tal y como lo dibuja el mapa.
 *
 * No calcula ninguna tasa: todo sale de utils/metrics.js. Lo que hace es
 * ORDENAR —agrupar por curso, separar troncales de optativas y rankear por
 * dificultad—, que es una decisión de presentación y no de datos, y por eso no
 * tiene sitio en metrics.js.
 *
 * Vive en composables/ para que el rediseño de escritorio lo reutilice: la
 * pantalla será otra, pero "el grado agrupado por curso y ordenado por lo que
 * más cuesta" es la misma pregunta.
 *
 * No es reactivo y no tiene por qué serlo: los datos son JSON importado en
 * tiempo de compilación y no cambian mientras la página está abierta. Se
 * calcula una vez al cargar el módulo, no una vez por componente que lo use.
 */

import {
    coreSubjects,
    optionalSubjectsOf,
    subjectSummary,
    courseRate,
    allCoreSubjects,
    allOptionalSubjects,
    isSmallCohort
} from "@/utils/metrics";

const COURSES = [1, 2, 3, 4];

const NAMES = {
    1: "Primero",
    2: "Segundo",
    3: "Tercero",
    4: "Cuarto"
};

/**
 * De más dura a más asequible. Las asignaturas sin datos van al final: un
 * hueco no es un 0 % y no debería colarse entre las fáciles.
 */
const byDifficulty = (a, b) => {

    if (a.noSuperacion === null) return 1;

    if (b.noSuperacion === null) return -1;

    return b.noSuperacion - a.noSuperacion;

};

const describe = subject => {

    const summary = subjectSummary(subject.code);

    return {
        code: summary.code,
        name: summary.name,
        noSuperacion: summary.noSuperacion,
        // Con menos de 10 matriculados el porcentaje es ruido, y la fila tiene
        // que decirlo allí donde se muestre. Se mide sobre la matrícula media,
        // como en el resto de listas: ver la nota en useSubjectList.js.
        smallCohort: isSmallCohort(Math.round(summary.enrolment))
    };

};

const buildCourse = number => {

    const troncales = coreSubjects(number).map(describe).sort(byDifficulty);
    const optativas = optionalSubjectsOf(number).map(describe).sort(byDifficulty);

    return {
        number,
        name: NAMES[number],
        // Solo troncales: son las que cursa todo el mundo, así que es la única
        // media que describe "cómo va el curso" sin depender de qué optativas
        // elija cada uno.
        avgPass: courseRate(number, "rendimiento"),
        troncales,
        optativas
    };

};

const courses = COURSES.map(buildCourse);

/**
 * ¿Cuál es el curso que más aprueba? El diseño llama a Cuarto "el curso más
 * amable", y ahora mismo es verdad por veinte puntos. Pero es una afirmación
 * sobre datos que cambian, así que se comprueba en vez de escribirse: el día
 * que deje de serlo, la frase desaparece sola.
 */
const kindest = courses.reduce(
    (best, course) =>
        course.avgPass !== null && (best === null || course.avgPass > best.avgPass)
            ? course
            : best,
    null
);

export const useDegreeMap = () => ({

    courses,

    kindestCourse: kindest?.number ?? null,

    totals: {
        courses: COURSES.length,
        troncales: allCoreSubjects.length,
        optativas: allOptionalSubjects.length
    }

});
