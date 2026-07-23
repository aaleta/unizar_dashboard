<script setup>

import { ref, computed } from "vue";

import {
    RECENT_YEARS,
    MIN_COHORT,
    METRICS,
    allSubjects,
    subjectSummary,
    formatPct,
    formatNumber
} from "@/utils/metrics";

/**
 * Tabla maestra: la vista que responde de un vistazo "qué asignatura es dura",
 * sin tener que entrar una por una. Ordenable y filtrable.
 */
const rows = allSubjects.map(subject => subjectSummary(subject.code));

const COLUMNS = [
    {
        key: "name",
        label: "Asignatura",
        type: "text",
        align: "left"
    },
    {
        key: "course",
        label: "Curso",
        type: "course",
        align: "left"
    },
    {
        key: "enrolment",
        label: "Matriculados",
        type: "number",
        hint: `Media de matriculados de los últimos ${RECENT_YEARS} cursos.`
    },
    {
        key: "rendimiento",
        label: "Aprueban",
        type: "pct",
        hint: METRICS.rendimiento.definition
    },
    {
        key: "noPresentados",
        label: "No presentados",
        type: "pct",
        hint: METRICS.noPresentados.definition
    },
    {
        key: "excelencia",
        label: "Sob. + MH",
        type: "pct",
        hint: METRICS.excelencia.definition
    },
    {
        key: "noSuperacion",
        label: "No superan",
        type: "pct",
        hint: METRICS.noSuperacion.definition
    }
];

const search = ref("");

const tipoFilter = ref("todas");

const courseFilter = ref("todos");

const sortKey = ref("noSuperacion");

const sortAsc = ref(false);

const normalize = text =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const toggleSort = key => {

    if (sortKey.value === key) {

        sortAsc.value = !sortAsc.value;

        return;

    }

    sortKey.value = key;

    // El nombre se lee mejor de la A a la Z; los números, de mayor a menor.
    sortAsc.value = key === "name";

};

const filtered = computed(() => {

    const query = normalize(search.value.trim());

    return rows.filter(row => {

        if (query && !normalize(row.name).includes(query)) return false;

        if (tipoFilter.value !== "todas" && row.tipo !== tipoFilter.value) {
            return false;
        }

        if (
            courseFilter.value !== "todos" &&
            !row.courses.includes(courseFilter.value)
        ) {
            return false;
        }

        return true;

    });

});

const sorted = computed(() => {

    const key = sortKey.value;
    const direction = sortAsc.value ? 1 : -1;

    return [...filtered.value].sort((a, b) => {

        const first = a[key];
        const second = b[key];

        if (typeof first === "string") {

            return first.localeCompare(second) * direction;

        }

        // Las asignaturas sin datos van siempre al final, ordene como ordene.
        if (first === null) return 1;
        if (second === null) return -1;

        return (first - second) * direction;

    });

});

const sortIndicator = key => {

    if (sortKey.value !== key) return "";

    return sortAsc.value ? "▲" : "▼";

};


</script>

<template>

<main class="page">

    <header class="hero">

        <h1>Todas las asignaturas</h1>

        <p>
            Compara las {{ rows.length }} asignaturas del grado de un vistazo.
            Pulsa en una columna para ordenar; pulsa en una asignatura para ver
            su dashboard.
        </p>

    </header>

    <div class="filters">

        <label class="filter grow">

            <span class="filterLabel">Buscar</span>

            <input
                v-model="search"
                type="search"
                placeholder="Nombre de la asignatura..."
            >

        </label>

        <label class="filter">

            <span class="filterLabel">Carácter</span>

            <select v-model="tipoFilter">
                <option value="todas">Todas</option>
                <option value="troncal">Troncales</option>
                <option value="optativa">Optativas</option>
            </select>

        </label>

        <label class="filter">

            <span class="filterLabel">Curso</span>

            <select v-model="courseFilter">
                <option value="todos">Todos</option>
                <option value="1">1º</option>
                <option value="2">2º</option>
                <option value="3">3º</option>
                <option value="4">4º</option>
            </select>

        </label>

    </div>

    <p class="resultCount">
        {{ sorted.length }} asignatura(s)
    </p>

    <div class="tableWrapper">

        <table>

            <thead>

                <tr>

                    <th
                        v-for="column in COLUMNS"
                        :key="column.key"
                        :class="[column.align === 'left' ? 'left' : 'right']"
                        :aria-sort="
                            sortKey === column.key
                                ? (sortAsc ? 'ascending' : 'descending')
                                : 'none'
                        "
                    >

                        <button
                            type="button"
                            :title="column.hint"
                            @click="toggleSort(column.key)"
                        >
                            {{ column.label }}
                            <span class="indicator">
                                {{ sortIndicator(column.key) }}
                            </span>
                        </button>

                    </th>

                </tr>

            </thead>

            <tbody>

                <tr
                    v-for="row in sorted"
                    :key="row.code"
                >

                    <th
                        scope="row"
                        class="left"
                    >
                        <RouterLink :to="`/asignatura/${row.code}`">
                            {{ row.name }}
                        </RouterLink>

                        <span
                            v-if="row.recentStudents < MIN_COHORT"
                            class="warn"
                            title="Cohorte muy pequeña: los porcentajes son poco fiables."
                        >
                            ⚠
                        </span>
                    </th>

                    <td class="left">

                        <span
                            class="badge"
                            :class="row.tipo"
                        >
                            {{ row.tipo === "troncal" ? "Troncal" : "Optativa" }}
                        </span>

                        <span class="courses">
                            {{ row.courses.map(c => `${c}º`).join(", ") }}
                        </span>

                    </td>

                    <td>{{ formatNumber(row.enrolment, 0) }}</td>

                    <td>{{ formatPct(row.rendimiento) }}</td>

                    <td>{{ formatPct(row.noPresentados) }}</td>

                    <td>{{ formatPct(row.excelencia) }}</td>

                    <td
                        class="emphasis"
                        :class="{
                            hot: row.noSuperacion !== null && row.noSuperacion >= 30
                        }"
                    >
                        {{ formatPct(row.noSuperacion) }}
                    </td>

                </tr>

                <tr v-if="!sorted.length">

                    <td
                        :colspan="COLUMNS.length"
                        class="empty"
                    >
                        No se ha encontrado ninguna asignatura con esos filtros.
                    </td>

                </tr>

            </tbody>

        </table>

    </div>

    <p class="footnote">
        Todas las tasas son medias ponderadas por matriculados de los últimos
        {{ RECENT_YEARS }} cursos académicos con datos.
        ⚠ marca las asignaturas con menos de {{ MIN_COHORT }} alumnos en ese
        periodo, donde los porcentajes son poco fiables.
    </p>

</main>

</template>

<style scoped>

.page{

    /* Sin barra lateral: el hueco de 220px ya no reserva nada. */
    margin-left:0;

    width:calc(100% - 220px);

    min-height:100vh;

    padding:50px;

    box-sizing:border-box;

    background:#0f172a;

    color:white;

}

.hero{

    margin-bottom:28px;

}

.hero h1{

    margin:0 0 12px;

    font-size:2.6rem;

}

.hero p{

    max-width:760px;

    margin:0;

    color:#94a3b8;

    line-height:1.6;

}

.filters{

    display:flex;

    flex-wrap:wrap;

    gap:20px;

    margin-bottom:14px;

}

.filter{

    display:flex;

    flex-direction:column;

    gap:8px;

}

.filter.grow{

    flex:1;

    min-width:240px;

    max-width:420px;

}

.filterLabel{

    color:#94a3b8;

    font-size:.75rem;

    font-weight:600;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.filter input,
.filter select{

    background:#1e293b;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:10px 14px;

    font-size:.95rem;

}

.filter input:focus,
.filter select:focus{

    outline:none;

    border-color:#38bdf8;

}

.resultCount{

    margin:0 0 12px;

    color:#64748b;

    font-size:.85rem;

}

.tableWrapper{

    overflow-x:auto;

    border:1px solid rgba(255,255,255,.08);

    border-radius:16px;

    background:#1e293b;

}

table{

    width:100%;

    border-collapse:collapse;

    font-size:.9rem;

}

thead th{

    position:sticky;

    top:0;

    background:#172033;

    border-bottom:1px solid rgba(255,255,255,.1);

    white-space:nowrap;

}

thead th button{

    width:100%;

    padding:14px 12px;

    background:none;

    border:none;

    color:#94a3b8;

    font-size:.75rem;

    font-weight:700;

    text-transform:uppercase;

    letter-spacing:.5px;

    text-align:right;

    cursor:pointer;

}

thead th.left button{

    text-align:left;

}

thead th button:hover{

    color:white;

}

.indicator{

    display:inline-block;

    width:12px;

    color:#38bdf8;

}

tbody th,
tbody td{

    padding:11px 12px;

    text-align:right;

    font-weight:500;

    color:#cbd5e1;

    border-bottom:1px solid rgba(255,255,255,.05);

    font-variant-numeric:tabular-nums;

    white-space:nowrap;

}

tbody th.left,
tbody td.left{

    text-align:left;

    white-space:normal;

}

tbody tr:hover{

    background:rgba(255,255,255,.03);

}

tbody th a{

    color:white;

    text-decoration:none;

    font-weight:600;

}

tbody th a:hover{

    color:#38bdf8;

    text-decoration:underline;

}

.warn{

    margin-left:6px;

    color:#facc15;

    cursor:help;

}

.badge{

    display:inline-block;

    padding:3px 9px;

    border-radius:999px;

    font-size:.72rem;

    font-weight:600;

}

.badge.troncal{

    background:rgba(56,189,248,.18);

    color:#7dd3fc;

}

.badge.optativa{

    background:rgba(168,85,247,.18);

    color:#d8b4fe;

}

.courses{

    margin-left:8px;

    color:#64748b;

    font-size:.8rem;

}

.emphasis{

    color:white;

    font-weight:700;

}

.emphasis.hot{

    color:#f87171;

}

.empty{

    padding:40px;

    text-align:center;

    color:#94a3b8;

    font-style:italic;

}

.footnote{

    margin:16px 0 0;

    color:#64748b;

    font-size:.78rem;

    line-height:1.6;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:24px 16px 90px;

    }

    .hero h1{

        font-size:1.9rem;

    }

}

</style>
