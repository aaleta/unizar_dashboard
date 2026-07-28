/**
 * Búsqueda, filtro y orden de una lista de asignaturas.
 *
 * Lo comparten la lista maestra y el catálogo de optativas, que por fuera son
 * pantallas muy distintas —una tabla densa y unas tarjetas— pero por dentro
 * hacen exactamente lo mismo: coger el catálogo, quitar lo que no encaja y
 * ordenarlo por una métrica.
 *
 * Tenerlo aquí y no dentro de cada vista es lo que evita que dentro de un año
 * "más fáciles" ordene distinto en cada pantalla.
 *
 * El orden por defecto saca primero lo más duro. Alfabético sería lo neutral,
 * pero nadie abre esta web preguntándose qué asignatura empieza por A.
 */

import { computed, ref, unref } from "vue";

import { allSubjects, subjectSummary, isSmallCohort } from "@/utils/metrics";

/**
 * Las métricas por las que se puede ordenar.
 *
 * `higherIsFirst` dice qué extremo va arriba cuando el orden es "descendente",
 * y no siempre es el número más alto: en "más fáciles" arriba va la que MENOS
 * gente suspende.
 */
export const SORTS = {
    noSuperacion: {
        key: "noSuperacion",
        label: "No superan",
        higherIsFirst: true
    },

    enrolment: {
        key: "enrolment",
        label: "Matriculados",
        higherIsFirst: true
    },

    excelencia: {
        key: "excelencia",
        label: "Sob. + MH",
        higherIsFirst: true
    },

    name: {
        key: "name",
        label: "A–Z",
        higherIsFirst: false,
        text: true
    }
};

/** Sin acentos y en minúsculas: buscar "fisica" tiene que encontrar "Física". */
const normalize = text =>
    String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const describe = subject => {
    const summary = subjectSummary(subject.code);

    return {
        ...summary,
        // Se avisa según la matrícula MEDIA, que es la cifra que la tarjeta
        // enseña, y no según el total acumulado de los tres cursos. Si al lado
        // pone "7 matr." y un 0 %, el aviso tiene que estar ahí: cuadrar el
        // umbral con un número que el lector no ve deja fichas que dicen "7
        // alumnos, 0 % suspenden" sin una sola advertencia.
        smallCohort: isSmallCohort(Math.round(summary.enrolment)),
        search: normalize(`${summary.name} ${summary.code}`)
    };
};

/**
 * @param options.source  lista de asignaturas a usar (por defecto, todas)
 * @param options.sort    métrica inicial
 * @param options.descending  dirección inicial
 */
export const useSubjectList = (options = {}) => {
    const rows = computed(() =>
        (unref(options.source) ?? allSubjects).map(describe)
    );

    const query = ref("");
    const tipo = ref("todas");
    const course = ref("todos");
    const sortKey = ref(options.sort ?? "noSuperacion");
    const descending = ref(options.descending ?? true);

    /** Pulsar la métrica activa invierte; pulsar otra empieza por su extremo. */
    const sortBy = key => {
        if (sortKey.value === key) {
            descending.value = !descending.value;
            return;
        }

        sortKey.value = key;
        descending.value = SORTS[key]?.higherIsFirst ?? true;
    };

    /**
     * Orden explícito, sin alternar. Lo usan los chips con nombre propio:
     * "Más fáciles" es no superación ASCENDENTE, y con sortBy() saldría al
     * revés porque su extremo por defecto es el más duro primero.
     */
    const applySort = (key, isDescending) => {
        sortKey.value = key;
        descending.value = isDescending;
    };

    /** ¿Está activo este orden concreto? Para marcar el chip. */
    const isSort = (key, isDescending) =>
        sortKey.value === key && descending.value === isDescending;

    const filtered = computed(() => {
        const needle = normalize(query.value.trim());

        return rows.value.filter(row => {
            if (needle && !row.search.includes(needle)) return false;

            if (tipo.value !== "todas" && row.tipo !== tipo.value) return false;

            if (
                course.value !== "todos" &&
                !row.courses.includes(String(course.value))
            ) {
                return false;
            }

            return true;
        });
    });

    const sorted = computed(() => {
        const definition = SORTS[sortKey.value] ?? SORTS.noSuperacion;
        const direction = descending.value ? 1 : -1;

        return [...filtered.value].sort((a, b) => {
            if (definition.text) {
                return (
                    a.name.localeCompare(b.name, "es") *
                    (descending.value ? -1 : 1)
                );
            }

            const left = a[definition.key];
            const right = b[definition.key];

            // Sin datos siempre al final, se ordene como se ordene: un hueco
            // no es un cero y no debe colarse ni entre las duras ni entre las
            // fáciles.
            if (left === null) return 1;

            if (right === null) return -1;

            return (right - left) * direction;
        });
    });

    return {
        query,
        tipo,
        course,
        sortKey,
        descending,
        sortBy,
        applySort,
        isSort,
        rows,
        results: sorted,
        total: computed(() => rows.value.length),
        empty: computed(() => sorted.value.length === 0)
    };
};
