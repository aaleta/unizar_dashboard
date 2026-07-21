<script setup>

import { ref, computed } from "vue";

import GeneralOptEnrolled from "@/components/Dashboard/GeneralOptEnrolled.vue";
import SubjectCard from "@/components/Dashboard/SubjectCard.vue";

import {
    RECENT_YEARS,
    allOptionalSubjects,
    subjectSummary,
    formatPct,
    formatNumber
} from "@/utils/metrics";

/**
 * Listado y estadísticas de optativas en una sola página (antes /Optional y
 * /dashboardGeneralOpts contaban lo mismo por separado).
 */
const summaries = allOptionalSubjects.map(subject =>
    subjectSummary(subject.code)
);

const search = ref("");

const sortBy = ref("popularidad");

const SORTS = {
    popularidad: {
        label: "Más matriculados",
        compare: (a, b) => b.enrolment - a.enrolment
    },
    faciles: {
        label: "Más fáciles de superar",
        compare: (a, b) => (b.rendimiento ?? 0) - (a.rendimiento ?? 0)
    },
    excelencia: {
        label: "Más sobresalientes y MH",
        compare: (a, b) => (b.excelencia ?? 0) - (a.excelencia ?? 0)
    },
    nombre: {
        label: "Nombre (A–Z)",
        compare: (a, b) => a.name.localeCompare(b.name)
    }
};

const normalize = text =>
    text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const visible = computed(() => {

    const query = normalize(search.value.trim());

    const filtered = query
        ? summaries.filter(item => normalize(item.name).includes(query))
        : [...summaries];

    return filtered.sort(SORTS[sortBy.value].compare);

});

const totals = computed(() => {

    const withData = summaries.filter(item => item.rendimiento !== null);

    const students = summaries.reduce(
        (sum, item) => sum + item.enrolment,
        0
    );

    const rendimiento = withData.length
        ? withData.reduce((sum, item) => sum + item.rendimiento, 0) /
          withData.length
        : null;

    return {
        count: summaries.length,
        students,
        rendimiento
    };

});

</script>

<template>

<main class="page">

    <header class="hero">

        <h1>Optativas</h1>

        <p>
            Todas las optativas del grado, con sus estadísticas y su dashboard.
        </p>

        <div class="summary">

            <div class="summaryItem">
                <span class="summaryValue">{{ totals.count }}</span>
                <span class="summaryLabel">optativas</span>
            </div>

            <div class="summaryItem">
                <span class="summaryValue">
                    {{ formatNumber(totals.students, 0) }}
                </span>
                <span class="summaryLabel">matrículas al año</span>
            </div>

            <div class="summaryItem">
                <span class="summaryValue">
                    {{ formatPct(totals.rendimiento, 0) }}
                </span>
                <span class="summaryLabel">aprueban de media</span>
            </div>

        </div>

        <p class="summaryNote">
            Medias de los últimos {{ RECENT_YEARS }} cursos académicos.
        </p>

    </header>

    <section class="panel">

        <GeneralOptEnrolled />

    </section>

    <section class="section">

        <div class="controls">

            <label class="control grow">

                <span class="controlLabel">Buscar</span>

                <input
                    v-model="search"
                    type="search"
                    placeholder="Nombre de la asignatura..."
                >

            </label>

            <label class="control">

                <span class="controlLabel">Ordenar por</span>

                <select v-model="sortBy">
                    <option
                        v-for="(sort, key) in SORTS"
                        :key="key"
                        :value="key"
                    >
                        {{ sort.label }}
                    </option>
                </select>

            </label>

        </div>

        <p class="resultCount">
            {{ visible.length }} optativa(s)
        </p>

        <div
            v-if="visible.length"
            class="grid"
        >

            <SubjectCard
                v-for="item in visible"
                :key="item.code"
                :code="item.code"
            />

        </div>

        <p
            v-else
            class="empty"
        >
            No se ha encontrado ninguna asignatura.
        </p>

    </section>

</main>

</template>

<style scoped>

.page{

    margin-left:220px;

    width:calc(100% - 220px);

    min-height:100vh;

    padding:50px;

    box-sizing:border-box;

    background:#0f172a;

    color:white;

}

.hero{

    margin-bottom:34px;

}

.hero h1{

    margin:0 0 10px;

    font-size:2.8rem;

    font-weight:700;

}

.hero > p{

    margin:0 0 22px;

    color:#94a3b8;

    font-size:1.05rem;

}

.summary{

    display:flex;

    flex-wrap:wrap;

    gap:34px;

}

.summaryItem{

    display:flex;

    flex-direction:column;

    gap:4px;

}

.summaryValue{

    color:white;

    font-size:1.8rem;

    font-weight:700;

    font-variant-numeric:tabular-nums;

}

.summaryLabel{

    color:#94a3b8;

    font-size:.8rem;

}

.summaryNote{

    margin:16px 0 0;

    color:#64748b;

    font-size:.78rem;

}

.panel{

    margin-bottom:48px;

}

.section{

    margin-bottom:48px;

}

.controls{

    display:flex;

    flex-wrap:wrap;

    gap:20px;

    margin-bottom:14px;

}

.control{

    display:flex;

    flex-direction:column;

    gap:8px;

}

.control.grow{

    flex:1;

    min-width:240px;

    max-width:420px;

}

.controlLabel{

    color:#94a3b8;

    font-size:.75rem;

    font-weight:600;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.control input,
.control select{

    background:#1e293b;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:10px 14px;

    font-size:.95rem;

}

.control input:focus,
.control select:focus{

    outline:none;

    border-color:#38bdf8;

}

.resultCount{

    margin:0 0 20px;

    color:#64748b;

    font-size:.85rem;

}

.grid{

    display:grid;

    grid-template-columns:repeat(auto-fill,minmax(280px,1fr));

    gap:20px;

}

.empty{

    padding:40px;

    text-align:center;

    color:#94a3b8;

    font-style:italic;

    border:1px dashed rgba(255,255,255,.12);

    border-radius:16px;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:24px 16px 90px;

    }

    .hero h1{

        font-size:2rem;

    }

    .summary{

        gap:22px;

    }

    .grid{

        grid-template-columns:1fr;

    }

}

</style>
