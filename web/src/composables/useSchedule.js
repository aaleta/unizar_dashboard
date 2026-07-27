/**
 * Estado y datos de "Monta tu horario": una sola selección de asignaturas que
 * alimenta las dos vistas de la pantalla, el horario semanal de clases y el
 * calendario de exámenes. Elegir es lo caro (buscar, marcar, escoger grupo);
 * obligar a repetirlo por cada vista era el defecto de tener dos páginas.
 *
 * El estado vive a nivel de módulo y se guarda en localStorage: un horario se
 * monta una vez y se consulta muchas, y perder la selección al navegar a una
 * ficha y volver obligaría a empezar de cero.
 *
 * Fuentes:
 *   - TimeTableData.json  → clases (solo teoría lleva día y hora estables).
 *   - Examenes.json       → fechas de examen por convocatoria (tab-E1…).
 *   - AsignaturasClasificadasOptTronc.json → nombres y carácter; las
 *     asignaturas nuevas del plan que aún no tienen estadísticas (p. ej.
 *     Probabilidad y Estadística) se completan desde los propios exámenes.
 */

import { computed, ref, watch } from "vue";

import classification from "../../../data/json/processed/AsignaturasClasificadasOptTronc.json";
import examData from "../../../data/json/processed/Examenes.json";
import timetableData from "../../../data/json/processed/TimeTableData.json";

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export const MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const STORAGE_KEY = "fisica-horario";

/* ------------------------------------------------------------------ *
 * Catálogo
 * ------------------------------------------------------------------ */

const catalogue = (() => {

    const byCode = new Map();

    const add = (code, name, tipo, course) => {

        const key = String(code);

        if (!byCode.has(key)) {
            byCode.set(key, { code: key, name, tipo, courses: [] });
        }

        const entry = byCode.get(key);

        if (course !== null && !entry.courses.includes(course)) {
            entry.courses.push(course);
        }

    };

    for (const [tipo, byCourse] of [
        ["troncal", classification.troncales],
        ["optativa", classification.optativas]
    ]) {
        for (const [course, subjects] of Object.entries(byCourse)) {
            for (const subject of subjects) {
                add(subject.code, subject.name, tipo, Number(course));
            }
        }
    }

    // Asignaturas del plan nuevo sin estadísticas todavía: aparecen en los
    // exámenes pero no en el catálogo histórico.
    for (const entries of Object.values(examData)) {
        for (const entry of entries) {

            const [code, ...rest] = entry.asignatura.split(" - ");

            if (!byCode.has(code)) {
                add(code, rest.join(" - "), "troncal", Number(entry.curso) || null);
            }

        }
    }

    return Array.from(byCode.values()).sort(
        (a, b) =>
            (a.courses[0] ?? 9) - (b.courses[0] ?? 9) ||
            a.name.localeCompare(b.name, "es")
    );

})();

const catalogueByCode = new Map(catalogue.map(subject => [subject.code, subject]));

/* ------------------------------------------------------------------ *
 * Clases: solo teoría con día asignado. Las prácticas y laboratorios de la
 * publicación no traen día de la semana estable, así que no se pueden colocar
 * en una rejilla semanal sin mentir.
 * ------------------------------------------------------------------ */

const toMinutes = time => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
};

const theoryEvents = (() => {

    const seen = new Set();
    const events = [];

    for (const raw of timetableData) {

        if (raw.TipoActividad !== "T" || raw.Dia == null) continue;

        // El origen trae filas repetidas (la misma serie llega en varias
        // peticiones del scraper); una clase duplicada partiría su celda en
        // dos como si fuera un choque.
        const key = [raw.Asignatura, raw["Curso-Grupo"], raw.Semestre, raw.Dia, raw.HoraIni].join("|");

        if (seen.has(key)) continue;

        seen.add(key);

        events.push({
            code: raw.Asignatura.split(" ")[0],
            group: raw["Curso-Grupo"],
            semester: raw.Semestre,
            day: raw.Dia,
            start: raw.HoraIni,
            end: raw.HoraFin,
            startMin: toMinutes(raw.HoraIni),
            endMin: toMinutes(raw.HoraFin)
        });

    }

    return events;

})();

/** code → grupos con teoría, ordenados ("447-1-0", "447-1-1"…). */
const groupsByCode = (() => {

    const map = new Map();

    for (const event of theoryEvents) {

        if (!map.has(event.code)) map.set(event.code, new Set());

        map.get(event.code).add(event.group);

    }

    return new Map(
        Array.from(map, ([code, groups]) => [code, Array.from(groups).sort()])
    );

})();

/* ------------------------------------------------------------------ *
 * Exámenes, aplanados una vez: { code, name, convocatoria, fecha }
 * ------------------------------------------------------------------ */

const parseDate = dateStr => {

    const [day, month, year] = dateStr.split("-").map(Number);

    return {
        day,
        month,
        year,
        key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    };

};

const allExams = (() => {

    const seen = new Set();
    const exams = [];

    for (const [tab, entries] of Object.entries(examData)) {
        for (const entry of entries) {

            const code = entry.asignatura.split(" - ")[0];
            const key = `${code}|${entry.fecha_examen}|${tab}`;

            // El listado del centro repite filas (una por modalidad).
            if (seen.has(key)) continue;

            seen.add(key);

            exams.push({
                code,
                convocatoria: tab,
                date: entry.fecha_examen,
                ...parseDate(entry.fecha_examen)
            });

        }
    }

    return exams.sort((a, b) => a.key.localeCompare(b.key));

})();

/**
 * La publicación numera las convocatorias E1/E2/E3, pero nadie las llama así:
 * E1 son los exámenes del primer semestre, E2 los del segundo y E3 la
 * extraordinaria. Si el centro añadiera otra pestaña, cae al nombre crudo en
 * vez de romperse.
 */
const CONVOCATORIA_LABELS = {
    "tab-E1": "S1",
    "tab-E2": "S2",
    "tab-E3": "Extraordinaria"
};

export const convocatoriaLabel = tab =>
    CONVOCATORIA_LABELS[tab] ?? tab.replace(/^tab-/, "");

const convocatorias = Object.keys(examData);

/** Convocatoria → "ene–feb 2027", para explicar qué es E1 sin inventarlo. */
const convocatoriaSpans = (() => {

    const spans = {};

    for (const tab of convocatorias) {

        const exams = allExams.filter(exam => exam.convocatoria === tab);

        if (!exams.length) continue;

        const first = exams[0];
        const last = exams[exams.length - 1];

        const shortMonth = month => MONTHS[month - 1].slice(0, 3);

        if (first.month === last.month && first.year === last.year) {
            spans[tab] = `${shortMonth(first.month)} ${first.year}`;
        } else if (first.year === last.year) {
            spans[tab] = `${shortMonth(first.month)}–${shortMonth(last.month)} ${last.year}`;
        } else {
            spans[tab] = `${shortMonth(first.month)} ${first.year} – ${shortMonth(last.month)} ${last.year}`;
        }

    }

    return spans;

})();

/* ------------------------------------------------------------------ *
 * Estado compartido (módulo): la selección sobrevive a la navegación.
 * ------------------------------------------------------------------ */

const selectedCodes = ref([]);
const groupChoice = ref({});
const semester = ref("S1");
const convocatoria = ref("all");

const restore = () => {

    try {

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!saved) return;

        selectedCodes.value = (saved.codes ?? []).filter(code => catalogueByCode.has(code));
        groupChoice.value = saved.groups ?? {};

        if (saved.semester === "S1" || saved.semester === "S2") {
            semester.value = saved.semester;
        }

    } catch {
        /* Un localStorage corrupto no debe tumbar la pantalla. */
    }

};

restore();

watch([selectedCodes, groupChoice, semester], () => {

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            codes: selectedCodes.value,
            groups: groupChoice.value,
            semester: semester.value
        }));
    } catch {
        /* Sin almacenamiento (modo privado), la selección simplemente no persiste. */
    }

}, { deep: true });

/* ------------------------------------------------------------------ */

export const useSchedule = () => {

    const selectedSubjects = computed(() =>
        selectedCodes.value
            .map(code => catalogueByCode.get(code))
            .filter(Boolean)
    );

    const isSelected = code => selectedCodes.value.includes(code);

    const toggle = code => {

        if (isSelected(code)) {

            selectedCodes.value = selectedCodes.value.filter(c => c !== code);

            const groups = { ...groupChoice.value };
            delete groups[code];
            groupChoice.value = groups;

            return;

        }

        selectedCodes.value = [...selectedCodes.value, code];

        const available = groupsByCode.get(code) ?? [];

        if (available.length) {
            groupChoice.value = { ...groupChoice.value, [code]: available[0] };
        }

    };

    const clear = () => {
        selectedCodes.value = [];
        groupChoice.value = {};
    };

    const setGroup = (code, group) => {
        groupChoice.value = { ...groupChoice.value, [code]: group };
    };

    const groupsFor = code => groupsByCode.get(code) ?? [];

    /* ---------------- Clases ---------------- */

    /** Clases de teoría de la selección, del grupo elegido y semestre activo. */
    const classEvents = computed(() =>
        theoryEvents
            .filter(event =>
                isSelected(event.code) &&
                event.semester === semester.value &&
                // Sin elección guardada se cae al primer grupo: dejar pasar
                // todos pintaría la misma clase una vez por grupo.
                event.group === (groupChoice.value[event.code] ?? groupsByCode.get(event.code)?.[0])
            )
            .map(event => ({
                ...event,
                name: catalogueByCode.get(event.code)?.name ?? event.code,
                tipo: catalogueByCode.get(event.code)?.tipo ?? "troncal"
            }))
    );

    /**
     * Choques del semestre activo, agrupados por par de asignaturas para el
     * aviso ("Química y Álgebra I · lunes 12:00–13:00"). Dos clases de la
     * misma asignatura nunca chocan entre sí.
     */
    const classClashes = computed(() => {

        const clashes = [];
        const events = classEvents.value;

        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {

                const a = events[i];
                const b = events[j];

                if (a.code === b.code || a.day !== b.day) continue;

                if (a.startMin < b.endMin && b.startMin < a.endMin) {
                    clashes.push({ a, b });
                }

            }
        }

        return clashes;

    });

    /**
     * Asignaturas elegidas que no aparecen en la rejilla actual y por qué:
     * o su teoría cae en el otro semestre, o el centro no publica horario
     * (TFG, optativas sin docencia regular). Callarse y que "desaparezcan"
     * parecería un error de la web.
     */
    const missingFromGrid = computed(() =>
        selectedSubjects.value
            .filter(subject =>
                !classEvents.value.some(event => event.code === subject.code)
            )
            .map(subject => ({
                ...subject,
                reason: theoryEvents.some(event => event.code === subject.code)
                    ? "su teoría cae en el otro semestre"
                    : "sin horario de teoría publicado"
            }))
    );

    /* ---------------- Exámenes ---------------- */

    /** Exámenes de la selección en la convocatoria activa, en orden de fecha. */
    const examEvents = computed(() =>
        allExams
            .filter(exam =>
                isSelected(exam.code) &&
                (convocatoria.value === "all" || exam.convocatoria === convocatoria.value)
            )
            .map(exam => ({
                ...exam,
                name: catalogueByCode.get(exam.code)?.name ?? exam.code
            }))
    );

    /** Un día con dos asignaturas distintas es un choque de verdad. */
    const examDays = computed(() => {

        const byDate = new Map();

        for (const exam of examEvents.value) {

            if (!byDate.has(exam.key)) {
                byDate.set(exam.key, {
                    key: exam.key,
                    day: exam.day,
                    month: exam.month,
                    year: exam.year,
                    weekday: new Date(exam.year, exam.month - 1, exam.day)
                        .toLocaleDateString("es-ES", { weekday: "short" }),
                    exams: []
                });
            }

            byDate.get(exam.key).exams.push(exam);

        }

        return Array.from(byDate.values()).map(date => ({
            ...date,
            clash: new Set(date.exams.map(exam => exam.code)).size > 1
        }));

    });

    /**
     * Cuadrícula mensual de un mes concreto, de lunes a domingo, con los
     * exámenes de cada día ya colgados de su celda. `null` son los huecos
     * antes del día 1 y después del último.
     */
    const buildMonthWeeks = (year, month, examsByDay) => {

        const daysInMonth = new Date(year, month, 0).getDate();
        const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;

        const cells = [];

        for (let i = 0; i < leadingBlanks; i++) cells.push(null);

        for (let day = 1; day <= daysInMonth; day++) {

            const exams = examsByDay.get(day) ?? [];

            cells.push({
                day,
                exams,
                clash: new Set(exams.map(exam => exam.code)).size > 1
            });

        }

        while (cells.length % 7 !== 0) cells.push(null);

        const weeks = [];

        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
        }

        return weeks;

    };

    /**
     * Un calendario por convocatoria: la pregunta que responde esta vista es
     * "¿me quedan días entre examen y examen?", y eso se ve en la forma del
     * mes, no en una lista. Cada convocatoria va aparte porque mezclar enero
     * con junio en la misma cuadrícula no informa de nada.
     */
    const examPeriods = computed(() => {

        const periods = [];

        for (const tab of convocatorias) {

            if (convocatoria.value !== "all" && tab !== convocatoria.value) continue;

            const exams = examEvents.value.filter(exam => exam.convocatoria === tab);

            if (!exams.length) continue;

            const byMonth = new Map();

            for (const exam of exams) {

                const key = `${exam.year}-${exam.month}`;

                if (!byMonth.has(key)) {
                    byMonth.set(key, {
                        key,
                        year: exam.year,
                        month: exam.month,
                        byDay: new Map()
                    });
                }

                const month = byMonth.get(key);

                if (!month.byDay.has(exam.day)) month.byDay.set(exam.day, []);

                month.byDay.get(exam.day).push(exam);

            }

            periods.push({
                tab,
                label: convocatoriaLabel(tab),
                span: convocatoriaSpans[tab],
                months: Array.from(byMonth.values())
                    .sort((a, b) => a.year - b.year || a.month - b.month)
                    .map(month => ({
                        key: month.key,
                        label: `${MONTHS[month.month - 1]} ${month.year}`,
                        weeks: buildMonthWeeks(month.year, month.month, month.byDay),
                        days: Array.from(month.byDay.entries())
                            .sort((a, b) => a[0] - b[0])
                            .map(([day, exams]) => ({
                                day,
                                weekday: new Date(month.year, month.month - 1, day)
                                    .toLocaleDateString("es-ES", { weekday: "short" }),
                                exams,
                                clash: new Set(exams.map(exam => exam.code)).size > 1
                            }))
                    }))
            });

        }

        return periods;

    });

    const examClashes = computed(() => examDays.value.filter(date => date.clash));

    return {

        catalogue,
        convocatorias,
        convocatoriaSpans,

        selectedCodes,
        selectedSubjects,
        isSelected,
        toggle,
        clear,
        groupChoice,
        groupsFor,
        setGroup,

        semester,
        classEvents,
        classClashes,
        missingFromGrid,

        convocatoria,
        examEvents,
        examDays,
        examPeriods,
        examClashes

    };

};
