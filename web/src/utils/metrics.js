/**
 * Definiciones ÚNICAS de las métricas del dashboard.
 *
 * Toda la web debe calcular las tasas a través de este módulo. Antes cada
 * componente reimplementaba la fórmula y el mismo dato salía distinto según
 * el panel (p.ej. "% de suspensos" sobre matriculados en un sitio y sobre
 * presentados en otro, en la misma pantalla).
 *
 * Nomenclatura oficial de Unizar (la misma que usan los informes de calidad
 * y el fichero resultados_fisica.json):
 *
 *   matriculados = No pre + Sus + Apr + Not + Sob + MH
 *   presentados  = matriculados - No pre
 *   superados    = Apr + Not + Sob + MH
 *
 *   Tasa de rendimiento  = superados  / matriculados
 *   Tasa de éxito        = superados  / presentados
 *   Tasa de evaluación   = presentados / matriculados
 *
 * La antigua "dificultad" (Sus % + No pre %) es exactamente
 * 100 - tasa de rendimiento, y aquí se llama TASA DE NO SUPERACIÓN.
 */

import notas from "../../../data/json/notas_raw.json";
import catalogo from "../../../data/json/asignaturas.json";
import resultados from "../../../data/json/processed/resultados_fisica.json";

/** Nº de cursos académicos que se agregan en las métricas "recientes". */
export const RECENT_YEARS = 3;

/** Por debajo de este nº de matriculados los porcentajes son ruido estadístico. */
export const MIN_COHORT = 10;

const num = value => Number(value) || 0;

/* ------------------------------------------------------------------ *
 * Recuentos (una fila = una asignatura en un curso académico)
 * ------------------------------------------------------------------ */

export const matriculados = row =>
    num(row["No pre"]) +
    num(row["Sus"]) +
    num(row["Apr"]) +
    num(row["Not"]) +
    num(row["Sob"]) +
    num(row["MH"]) +
    num(row["Otr"]);

export const noPresentados = row => num(row["No pre"]);

export const presentados = row => matriculados(row) - noPresentados(row);

export const suspensos = row => num(row["Sus"]);

export const superados = row =>
    num(row["Apr"]) + num(row["Not"]) + num(row["Sob"]) + num(row["MH"]);

export const excelentes = row => num(row["Sob"]) + num(row["MH"]);

/** Devuelve null (no 0) cuando no hay denominador: "sin datos" != "0 %". */
const rate = (numerator, denominator) =>
    denominator > 0 ? (numerator / denominator) * 100 : null;

/* ------------------------------------------------------------------ *
 * Catálogo de métricas
 * ------------------------------------------------------------------ */

export const METRICS = {

    rendimiento: {
        key: "rendimiento",
        label: "Tasa de rendimiento",
        shortLabel: "Rendimiento",
        definition:
            "Alumnos que superan la asignatura sobre el total de matriculados.",
        base: "matriculados",
        higherIsBetter: true,
        compute: row => rate(superados(row), matriculados(row))
    },

    exito: {
        key: "exito",
        label: "Tasa de éxito",
        shortLabel: "Éxito",
        definition:
            "Alumnos que superan la asignatura sobre los que se presentan.",
        base: "presentados",
        higherIsBetter: true,
        compute: row => rate(superados(row), presentados(row))
    },

    evaluacion: {
        key: "evaluacion",
        label: "Tasa de evaluación",
        shortLabel: "Evaluación",
        definition:
            "Alumnos que se presentan sobre el total de matriculados.",
        base: "matriculados",
        higherIsBetter: true,
        compute: row => rate(presentados(row), matriculados(row))
    },

    noSuperacion: {
        key: "noSuperacion",
        label: "Tasa de no superación",
        shortLabel: "No superan",
        definition:
            "Matriculados que no superan la asignatura, ya sea por suspender " +
            "o por no presentarse. Es el complementario de la tasa de rendimiento.",
        base: "matriculados",
        higherIsBetter: false,
        compute: row =>
            rate(suspensos(row) + noPresentados(row), matriculados(row))
    },

    noPresentados: {
        key: "noPresentados",
        label: "No presentados",
        shortLabel: "No presentados",
        definition:
            "Matriculados que no llegan a presentarse a ninguna convocatoria.",
        base: "matriculados",
        higherIsBetter: false,
        compute: row => rate(noPresentados(row), matriculados(row))
    },

    suspensos: {
        key: "suspensos",
        label: "Suspensos sobre presentados",
        shortLabel: "Suspensos",
        definition:
            "Alumnos que suspenden sobre los que se presentan.",
        base: "presentados",
        higherIsBetter: false,
        compute: row => rate(suspensos(row), presentados(row))
    },

    excelencia: {
        key: "excelencia",
        label: "Excelencia",
        shortLabel: "Excelencia",
        definition:
            "Sobresalientes y matrículas de honor sobre el total de matriculados.",
        base: "matriculados",
        higherIsBetter: true,
        compute: row => rate(excelentes(row), matriculados(row))
    }

};

export const metric = key => METRICS[key];

/* ------------------------------------------------------------------ *
 * Base de cálculo (denominador) — se muestra siempre junto al dato
 * ------------------------------------------------------------------ */

export const BASES = {

    matriculados: {
        key: "matriculados",
        label: "Matriculados",
        caption: "% sobre el total de matriculados",
        total: matriculados
    },

    presentados: {
        key: "presentados",
        label: "Presentados",
        caption: "% sobre los alumnos presentados",
        total: presentados
    }

};

/* ------------------------------------------------------------------ *
 * Categorías de calificación
 * ------------------------------------------------------------------ *
 * Sin color: qué se cuenta y con qué denominador no cambia porque cambie el
 * diseño. Los colores viven en theme/gradePalette.js, indexados por `key`.
 */

export const GRADE_CATEGORIES = [
    {
        key: "No pre",
        label: "No presentados",
        short: "No pr",
        count: noPresentados,
        // Fuera de la distribución cuando el denominador son los presentados.
        onlyOverMatriculados: true
    },
    {
        key: "Sus",
        label: "Suspensos",
        short: "Susp",
        count: suspensos
    },
    {
        key: "Apr",
        label: "Aprobados",
        short: "Apr",
        count: row => num(row["Apr"])
    },
    {
        key: "Not",
        label: "Notables",
        short: "Not",
        count: row => num(row["Not"])
    },
    {
        key: "Sob",
        label: "Sobresalientes",
        short: "Sob",
        count: row => num(row["Sob"])
    },
    {
        key: "MH",
        label: "Matrículas de honor",
        short: "MH",
        count: row => num(row["MH"])
    }
];

/**
 * Distribución de calificaciones de una fila, sobre la base indicada.
 * @returns [{ key, label, short, count, pct }] — el color se pide aparte a
 *          theme/gradePalette.js con la misma `key`.
 */
export const distribution = (row, baseKey = "matriculados") => {

    if (!row) return [];

    const base = BASES[baseKey] ?? BASES.matriculados;
    const total = base.total(row);

    return GRADE_CATEGORIES
        .filter(category =>
            baseKey === "matriculados" || !category.onlyOverMatriculados
        )
        .map(category => {

            const count = category.count(row);

            return {
                key: category.key,
                label: category.label,
                short: category.short,
                count,
                pct: rate(count, total)
            };

        });

};

/* ------------------------------------------------------------------ *
 * Acceso a los datos
 * ------------------------------------------------------------------ */

const rowsByCode = new Map();

notas.forEach(row => {

    const code = Number(row["Código"]);

    if (!rowsByCode.has(code)) rowsByCode.set(code, []);

    rowsByCode.get(code).push(row);

});

// Orden ascendente por curso académico: los últimos son los más recientes.
rowsByCode.forEach(rows =>
    rows.sort((a, b) =>
        a["Curso Académico"].localeCompare(b["Curso Académico"])
    )
);

/** Filas de una asignatura, de más antigua a más reciente. */
export const subjectRows = code => rowsByCode.get(Number(code)) ?? [];

/** Cursos académicos para los que SÍ hay estadísticas de esta asignatura. */
export const subjectYears = code =>
    subjectRows(code).map(row => row["Curso Académico"]);

/** Curso académico más reciente con datos, o null. */
export const latestYear = code => {

    const years = subjectYears(code);

    return years.length ? years[years.length - 1] : null;

};

export const subjectRow = (code, year) =>
    subjectRows(code).find(row => row["Curso Académico"] === year) ?? null;

/** Últimos N cursos de una lista ya ordenada ascendentemente. */
export const lastYears = (rows, years = RECENT_YEARS) =>
    rows.slice(-years);

/** Todos los cursos académicos presentes en el dataset, ascendente. */
export const academicYears = [
    ...new Set(notas.map(row => row["Curso Académico"]))
].sort();

/* ------------------------------------------------------------------ *
 * Datos oficiales (resultados_fisica.json)
 * ------------------------------------------------------------------ *
 * Publicados por la propia Unizar. Aportan una métrica que no se puede
 * derivar de las calificaciones —la media de convocatorias consumidas— y
 * sirven para contrastar que nuestras tasas cuadran con las suyas.
 *
 * Cubren los mismos doce cursos que las calificaciones (2013-2014 en adelante).
 * Aun así, `officialResult` puede devolver null para una asignatura y un año
 * concretos: hay optativas que no se ofertan todos los cursos.
 */

const officialByCode = new Map();

resultados.forEach(row => {

    const code = Number(row.code);

    if (!officialByCode.has(code)) officialByCode.set(code, []);

    officialByCode.get(code).push({
        ...row,
        // El origen guarda 2024; el resto de la web habla de "2024-2025".
        curso: `${row.anyo_academico}-${row.anyo_academico + 1}`
    });

});

officialByCode.forEach(rows =>
    rows.sort((a, b) => a.anyo_academico - b.anyo_academico)
);

/** Cursos académicos cubiertos por los datos oficiales. */
export const officialYears = [
    ...new Set(resultados.map(row => `${row.anyo_academico}-${row.anyo_academico + 1}`))
].sort();

/** Fila oficial de una asignatura; sin año, la más reciente. */
export const officialResult = (code, year = null) => {

    const rows = officialByCode.get(Number(code)) ?? [];

    if (!rows.length) return null;

    if (!year) return rows[rows.length - 1];

    return rows.find(row => row.curso === year) ?? null;

};

/** Media de convocatorias consumidas: cuántos intentos cuesta la asignatura. */
export const averageSittings = (code, year = null) =>
    officialResult(code, year)?.media_convocatorias ?? null;

/**
 * Cuánto se parece NUESTRA tasa de rendimiento a la que publica la Universidad,
 * en un curso académico concreto.
 *
 * La página de metodología afirma que las dos fuentes no siempre cuadran. Esa
 * afirmación llevaba las cifras escritas a mano y se quedó obsoleta en cuanto
 * la Universidad republicó los datos. Calcularla es la única forma de que
 * siga siendo verdad el año que viene.
 *
 * Se comparan solo las asignaturas presentes en las dos fuentes ese curso.
 * @returns { curso, comparables, coinciden, difieren, diferenciaMaxima }
 */
export const officialAgreement = (year, tolerance = 0.05) => {

    let comparables = 0;
    let coinciden = 0;
    let diferenciaMaxima = 0;

    resultados
        .filter(official => `${official.anyo_academico}-${official.anyo_academico + 1}` === year)
        .forEach(official => {

            const row = subjectRow(official.code, year);

            if (!row || official.tasa_rendimiento === null) return;

            const ours = METRICS.rendimiento.compute(row);

            if (ours === null) return;

            const delta = Math.abs(ours - official.tasa_rendimiento);

            comparables += 1;

            if (delta <= tolerance) coinciden += 1;

            if (delta > diferenciaMaxima) diferenciaMaxima = delta;

        });

    return {
        curso: year,
        comparables,
        coinciden,
        difieren: comparables - coinciden,
        diferenciaMaxima
    };

};

/** El curso oficial más reciente, que es el que se contrasta en metodología. */
export const latestOfficialYear = officialYears[officialYears.length - 1] ?? null;

/* ------------------------------------------------------------------ *
 * Agregación
 * ------------------------------------------------------------------ */

/**
 * Media de una métrica sobre varias filas, ponderada por nº de matriculados
 * (una asignatura de 100 alumnos pesa más que una de 5).
 */
export const weightedRate = (rows, metricKey) => {

    const definition = METRICS[metricKey];

    let weighted = 0;
    let students = 0;

    rows.forEach(row => {

        const value = definition.compute(row);

        if (value === null) return;

        const weight = matriculados(row);

        weighted += value * weight;
        students += weight;

    });

    return students ? weighted / students : null;

};

/** Métrica de una asignatura agregada sobre sus últimos N cursos. */
export const subjectRate = (code, metricKey, years = RECENT_YEARS) =>
    weightedRate(lastYears(subjectRows(code), years), metricKey);

/** Misma métrica pero sobre los N cursos ANTERIORES al indicado (para deltas). */
export const subjectRateBefore = (code, metricKey, year, years = RECENT_YEARS) => {

    const previous = subjectRows(code).filter(
        row => row["Curso Académico"] < year
    );

    return weightedRate(lastYears(previous, years), metricKey);

};

/** Media de matriculados de una asignatura en sus últimos N cursos. */
export const averageEnrolment = (code, years = RECENT_YEARS) => {

    const rows = lastYears(subjectRows(code), years);

    if (!rows.length) return 0;

    return rows.reduce((sum, row) => sum + matriculados(row), 0) / rows.length;

};

/** Serie temporal de una métrica: [{ year, value, matriculados }]. */
export const subjectSeries = (code, metricKey) =>
    subjectRows(code).map(row => ({
        year: row["Curso Académico"],
        value: METRICS[metricKey].compute(row),
        matriculados: matriculados(row)
    }));

/* ------------------------------------------------------------------ *
 * Catálogo de asignaturas
 * ------------------------------------------------------------------ *
 * Qué asignaturas tiene el grado, de qué curso son y si son troncales u
 * optativas viene del catálogo mantenido a mano (data/json/asignaturas.json),
 * no de reglas deducidas de los datos: el plan de estudios es información
 * oficial, y deducirlo clasificaba mal las optativas especiales de primero.
 *
 * `enBolsa` (bolsa_optativas) distingue las optativas normales de las
 * especiales de primero (Biología, Geología, Grafos y combinatoria): estas
 * cuentan como optativas a todos los efectos, pero se eligen fuera de la
 * bolsa y por eso no aparecen en la sección Optativas.
 */

const subjectIndex = new Map(
    catalogo.asignaturas.map(subject => [
        subject.codigo,
        {
            code: subject.codigo,
            name: subject.nombre,
            tipo: subject.tipo,
            courses: subject.cursos.map(String),
            enBolsa: subject.tipo === "optativa"
                && subject.bolsa_optativas !== false,
            // Optativas de oferta bienal: el código de la asignatura con la
            // que se alternan, o null si se oferta todos los cursos.
            seAlternaCon: subject.se_alterna_con ?? null
        }
    ])
);

/** { code, name, tipo: 'troncal'|'optativa', courses: ['3','4'], enBolsa } o null. */
export const subjectInfo = code => subjectIndex.get(Number(code)) ?? null;

/** Nombre de la asignatura, con respaldo en las notas si no está catalogada. */
export const subjectName = code => {

    const info = subjectInfo(code);

    if (info) return info.name;

    const rows = subjectRows(code);

    return rows.length
        ? rows[0]["Asignatura"].trim()
        : `Asignatura ${code}`;

};

/** Catálogo completo del grado: troncales y optativas, sin duplicados. */
export const allSubjects = [...subjectIndex.values()];

/**
 * Fila resumen de una asignatura para la tabla maestra.
 * Todas las tasas son medias ponderadas de los últimos RECENT_YEARS cursos.
 */
export const subjectSummary = code => {

    const info = subjectInfo(code);
    const rows = subjectRows(code);
    const recent = lastYears(rows);

    return {
        code: Number(code),
        name: subjectName(code),
        tipo: info?.tipo ?? "otra",
        courses: info?.courses ?? [],
        // Una optativa de 3º y 4º ordena por su primer curso.
        course: info ? Number(info.courses[0]) : null,
        enrolment: averageEnrolment(code),
        rendimiento: subjectRate(code, "rendimiento"),
        noSuperacion: subjectRate(code, "noSuperacion"),
        noPresentados: subjectRate(code, "noPresentados"),
        excelencia: subjectRate(code, "excelencia"),
        latestYear: latestYear(code),
        yearsWithData: rows.length,
        // Matriculados agregados del periodo reciente: base para avisar de
        // cohortes pequeñas donde los porcentajes no son fiables.
        recentStudents: recent.reduce((sum, row) => sum + matriculados(row), 0)
    };

};

/** Troncales de un curso. */
export const coreSubjects = course =>
    allSubjects.filter(subject =>
        subject.tipo === "troncal" && subject.courses.includes(String(course))
    );

/** Optativas de un curso, especiales incluidas. */
export const optionalSubjectsOf = course =>
    allSubjects.filter(subject =>
        subject.tipo === "optativa" && subject.courses.includes(String(course))
    );

/** Todas las optativas del grado, especiales de primero incluidas. */
export const allOptionalSubjects = allSubjects.filter(
    subject => subject.tipo === "optativa"
);

/**
 * La bolsa de optativas entre las que se elige en 3º y 4º: todas menos las
 * especiales de primero. Es lo que lista la sección Optativas.
 */
export const poolOptionalSubjects = allOptionalSubjects.filter(
    subject => subject.enBolsa
);

/** Todas las troncales del grado. */
export const allCoreSubjects = allSubjects.filter(
    subject => subject.tipo === "troncal"
);

/* ------------------------------------------------------------------ *
 * Agregados por curso (1º–4º)
 * ------------------------------------------------------------------ */

/** Filas de todas las troncales de un curso en un curso académico dado. */
export const courseRows = (course, year) =>
    coreSubjects(course)
        .map(subject => subjectRow(subject.code, year))
        .filter(Boolean);

/** Métrica agregada de un curso en un curso académico concreto. */
export const courseRateForYear = (course, metricKey, year) =>
    weightedRate(courseRows(course, year), metricKey);

/** Métrica agregada de un curso sobre sus últimos N cursos académicos. */
export const courseRate = (course, metricKey, years = RECENT_YEARS) => {

    const rows = coreSubjects(course).flatMap(subject =>
        lastYears(subjectRows(subject.code), years)
    );

    return weightedRate(rows, metricKey);

};

/** Serie temporal de una métrica agregada de un curso. */
export const courseSeries = (course, metricKey) =>
    academicYears.map(year => ({
        year,
        value: courseRateForYear(course, metricKey, year)
    }));

/** Métrica del grado restringida a una lista concreta de cursos académicos. */
export const degreeRateForPeriod = (metricKey, years) => {

    const rows = allCoreSubjects.flatMap(subject =>
        years
            .map(year => subjectRow(subject.code, year))
            .filter(Boolean)
    );

    return weightedRate(rows, metricKey);

};

/** Cohorte demasiado pequeña para que los porcentajes signifiquen algo. */
export const isSmallCohort = students => students > 0 && students < MIN_COHORT;
