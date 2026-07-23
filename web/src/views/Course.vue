<script setup>

import { computed } from "vue";
import { useRoute } from "vue-router";

import DifficultyOfSubjectsYear from "@/components/Dashboard/DifficultyOfSubjectsYear.vue";
import YearDifficultyEvolution from "@/components/Dashboard/YearDifficultyEvolution.vue";
import SubjectCard from "@/components/Dashboard/SubjectCard.vue";

import {
    RECENT_YEARS,
    coreSubjects,
    optionalSubjectsOf,
    courseRate,
    formatPct
} from "@/utils/metrics";

/**
 * Una sola vista para los cuatro cursos, y con las estadísticas del curso y el
 * listado de asignaturas juntos: antes eran ocho ficheros casi idénticos
 * (firstYear…forthYear + dashboardYear) para el mismo contenido.
 */
const route = useRoute();

const course = computed(() => String(route.params.curso));

const COURSE_NAMES = {
    1: "Primero",
    2: "Segundo",
    3: "Tercero",
    4: "Cuarto"
};

const courseName = computed(() =>
    COURSE_NAMES[course.value] ?? "Curso"
);

const core = computed(() => coreSubjects(course.value));

const optional = computed(() => optionalSubjectsOf(course.value));

const summary = computed(() => ({
    rendimiento: courseRate(course.value, "rendimiento"),
    noPresentados: courseRate(course.value, "noPresentados"),
    noSuperacion: courseRate(course.value, "noSuperacion")
}));

</script>

<template>

<main class="page">

    <header class="hero">

        <h1>{{ courseName }}</h1>

        <p>
            Estadísticas del curso y acceso al dashboard de cada asignatura.
        </p>

        <div class="summary">

            <div class="summaryItem">
                <span class="summaryValue">
                    {{ formatPct(summary.rendimiento, 0) }}
                </span>
                <span class="summaryLabel">aprueban de media</span>
            </div>

            <div class="summaryItem">
                <span class="summaryValue">
                    {{ formatPct(summary.noPresentados, 0) }}
                </span>
                <span class="summaryLabel">no se presentan</span>
            </div>

            <div class="summaryItem">
                <span class="summaryValue">{{ core.length }}</span>
                <span class="summaryLabel">troncales</span>
            </div>

            <div
                v-if="optional.length"
                class="summaryItem"
            >
                <span class="summaryValue">{{ optional.length }}</span>
                <span class="summaryLabel">optativas ofertadas</span>
            </div>

        </div>

        <p class="summaryNote">
            Medias ponderadas por matriculados de las troncales del curso en los
            últimos {{ RECENT_YEARS }} cursos académicos.
        </p>

    </header>

    <section class="panels">

        <DifficultyOfSubjectsYear :course="course" />

        <YearDifficultyEvolution :course="course" />

    </section>

    <section class="section">

        <h2 class="sectionTitle core">Troncales</h2>

        <div class="grid">

            <SubjectCard
                v-for="subject in core"
                :key="subject.code"
                :code="subject.code"
            />

        </div>

    </section>

    <section
        v-if="optional.length"
        class="section"
    >

        <h2 class="sectionTitle optional">Optativas de {{ course }}º</h2>

        <p class="sectionNote">
            Muchas se ofertan también en el otro curso.
            <RouterLink to="/optativas">
                Ver todas las optativas del grado →
            </RouterLink>
        </p>

        <div class="grid">

            <SubjectCard
                v-for="subject in optional"
                :key="subject.code"
                :code="subject.code"
            />

        </div>

    </section>

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

.panels{

    display:flex;

    flex-direction:column;

    gap:24px;

    margin-bottom:48px;

}

.section{

    margin-bottom:48px;

}

.sectionTitle{

    margin:0 0 8px;

    font-size:1.6rem;

    font-weight:600;

}

.sectionTitle.core{

    color:#38bdf8;

}

.sectionTitle.optional{

    color:#c084fc;

}

.sectionNote{

    margin:0 0 20px;

    color:#94a3b8;

    font-size:.9rem;

}

.sectionNote a{

    color:#38bdf8;

    text-decoration:none;

    font-weight:600;

}

.sectionNote a:hover{

    text-decoration:underline;

}

.grid{

    display:grid;

    grid-template-columns:repeat(auto-fill,minmax(280px,1fr));

    gap:20px;

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
