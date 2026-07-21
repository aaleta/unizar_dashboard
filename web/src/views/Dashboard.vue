<script setup>

import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

import SubjectKpiRow from "@/components/Dashboard/SubjectKpiRow.vue";
import GradeDistribution from "@/components/Dashboard/GradeDistribution.vue";
import SubjectEvolution from "@/components/Dashboard/SubjectEvolution.vue";
import SubjectVsCourse from "@/components/Dashboard/SubjectVsCourse.vue";
import TeachingInfo from "@/components/Dashboard/TeachingInfo.vue";

import {
    BASES,
    subjectName,
    subjectInfo,
    subjectYears,
    latestYear
} from "@/utils/metrics";

const route = useRoute();

const subjectCode = computed(() => Number(route.params.code));

const name = computed(() => subjectName(subjectCode.value));

const info = computed(() => subjectInfo(subjectCode.value));

/* --- Migas de pan: volver al listado del que viene la asignatura ------- */

const COURSE_ROUTES = {
    1: { path: "/curso/1", label: "Primero" },
    2: { path: "/curso/2", label: "Segundo" },
    3: { path: "/curso/3", label: "Tercero" },
    4: { path: "/curso/4", label: "Cuarto" }
};

const parent = computed(() => {

    if (!info.value) return null;

    if (info.value.tipo === "optativa") {

        return { path: "/optativas", label: "Optativas" };

    }

    return COURSE_ROUTES[info.value.courses[0]] ?? null;

});

const courseBadge = computed(() => {

    if (!info.value) return null;

    return info.value.courses.map(course => `${course}º`).join(" y ");

});

/* --- Controles de página: un curso académico y una base para TODO ------ */

const years = computed(() =>
    [...subjectYears(subjectCode.value)].reverse()
);

const selectedYear = ref("");

watch(

    // Al cambiar de asignatura hay que revalidar el curso seleccionado:
    // no todas tienen los mismos años con datos.
    [subjectCode, years],

    () => {

        if (!years.value.includes(selectedYear.value)) {

            selectedYear.value = latestYear(subjectCode.value) ?? "";

        }

    },

    { immediate: true }

);

const base = ref("matriculados");

</script>

<template>

<main class="page">

    <header class="hero">

        <nav
            v-if="parent"
            class="breadcrumb"
            aria-label="Migas de pan"
        >
            <RouterLink :to="parent.path">
                ← {{ parent.label }}
            </RouterLink>
        </nav>

        <h1>{{ name }}</h1>

        <div class="badges">

            <span
                v-if="info"
                class="badge"
                :class="info.tipo"
            >
                {{ info.tipo === "troncal" ? "Troncal" : "Optativa" }}
            </span>

            <span
                v-if="courseBadge"
                class="badge neutral"
            >
                {{ courseBadge }} curso
            </span>

            <span class="badge neutral">
                Código {{ subjectCode }}
            </span>

        </div>

    </header>

    <div
        v-if="years.length"
        class="controls"
    >

        <label class="control">

            <span class="controlLabel">Curso académico</span>

            <select v-model="selectedYear">

                <option
                    v-for="year in years"
                    :key="year"
                    :value="year"
                >
                    {{ year }}
                </option>

            </select>

        </label>

        <fieldset class="control">

            <legend class="controlLabel">Calcular porcentajes sobre</legend>

            <div class="toggle">

                <button
                    v-for="option in BASES"
                    :key="option.key"
                    type="button"
                    class="toggleOption"
                    :class="{ active: base === option.key }"
                    :aria-pressed="base === option.key"
                    :title="option.caption"
                    @click="base = option.key"
                >
                    {{ option.label }}
                </button>

            </div>

        </fieldset>

    </div>

    <section class="dashboardGrid">

        <div class="cell full">

            <SubjectKpiRow
                :subject-code="subjectCode"
                :year="selectedYear"
            />

        </div>

        <div class="cell half">

            <GradeDistribution
                :subject-code="subjectCode"
                :year="selectedYear"
                :base="base"
            />

        </div>

        <div class="cell half wide">

            <SubjectEvolution
                :subject-code="subjectCode"
                :base="base"
                @select-year="selectedYear = $event"
            />

        </div>

        <div class="cell full">

            <SubjectVsCourse :subject-code="subjectCode" />

        </div>

        <div class="cell full">

            <TeachingInfo :subject-code="subjectCode" />

        </div>

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

.hero,
.controls,
.dashboardGrid{

    max-width:1400px;

    margin-left:auto;

    margin-right:auto;

}

.hero{

    margin-bottom:28px;

}

.breadcrumb{

    margin-bottom:14px;

}

.breadcrumb a{

    color:#38bdf8;

    text-decoration:none;

    font-size:.9rem;

    font-weight:600;

}

.breadcrumb a:hover{

    color:#7dd3fc;

}

.hero h1{

    margin:0 0 14px;

    font-size:2.6rem;

    line-height:1.15;

}

.badges{

    display:flex;

    flex-wrap:wrap;

    gap:10px;

}

.badge{

    padding:5px 12px;

    border-radius:999px;

    font-size:.8rem;

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

.badge.neutral{

    background:rgba(255,255,255,.07);

    color:#cbd5e1;

}

.controls{

    display:flex;

    flex-wrap:wrap;

    gap:24px;

    margin-bottom:28px;

}

.control{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    border:none;

}

.controlLabel{

    padding:0;

    color:#94a3b8;

    font-size:.75rem;

    font-weight:600;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.control select{

    background:#1e293b;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:10px 14px;

    font-size:.95rem;

    cursor:pointer;

}

.control select:focus{

    outline:none;

    border-color:#38bdf8;

}

.toggle{

    display:flex;

    background:#1e293b;

    border:1px solid #334155;

    border-radius:10px;

    overflow:hidden;

}

.toggleOption{

    padding:10px 16px;

    border:none;

    background:transparent;

    color:#94a3b8;

    font-size:.9rem;

    font-weight:600;

    cursor:pointer;

    transition:.2s;

}

.toggleOption:hover{

    color:white;

}

.toggleOption.active{

    background:#38bdf8;

    color:#0f172a;

}

.dashboardGrid{

    display:grid;

    grid-template-columns:repeat(12,1fr);

    gap:24px;

    align-items:start;

}

.cell{

    min-width:0;

}

.cell.full{

    grid-column:span 12;

}

.cell.half{

    grid-column:span 5;

}

.cell.half.wide{

    grid-column:span 7;

}

@media(max-width:1100px){

    .cell.half,
    .cell.half.wide{

        grid-column:span 12;

    }

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

    .controls{

        gap:16px;

    }

}

</style>
