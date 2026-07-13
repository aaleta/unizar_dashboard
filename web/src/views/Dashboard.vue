<script setup>

import { computed } from "vue";
import { useRoute } from "vue-router";

import DashboardHist from "@/components/Dashboard/DashboardHistogram.vue";
import DashboardPassRate from "@/components/Dashboard/DashboardBar.vue";
import DashBoardSusp from "@/components/Dashboard/DashBoardSusp.vue";
import DashboardDescription from "@/components/Dashboard/DashboardDescription.vue";
import DashboardNoPreGraph from "@/components/Dashboard/DashboardNoPreGraph.vue";

import notas from "../../../data/json/NotasRaw.json";

const route = useRoute();

const subjectCode = Number(route.params.code);

// Nombre de la asignatura
const subjectName = computed(() => {

    const subject = notas.find(
        item => item["Código"] === subjectCode
    );

    return subject
        ? subject["Asignatura"].trim()
        : `Asignatura ${subjectCode}`;

});

</script>

<template>

<main class="page">

    <header class="hero">

        <div>

            <h1>{{ subjectName }}</h1>

            <p>
                Estadísticas de la asignatura.
            </p>

        </div>

    </header>

    <section class="dashboard-grid">

        <DashboardHist
            :subjectCode="subjectCode"
        />

        <DashboardPassRate
            :subjectCode="subjectCode"
        />

        <DashBoardSusp
            :subjectCode="subjectCode"
        />

        <DashboardDescription
            :subjectCode="subjectCode"
        />

        <DashboardNoPreGraph
            :subjectCode="subjectCode"
        />

    </section>

</main>

</template>

<style scoped>

.page{

    margin-left:220px;

    width:calc(100% - 220px);

    padding:50px;

    min-height:100vh;

    background:#0f172a;

    color:white;

}

.hero{

    margin-bottom:40px;

}

.hero h1{

    font-size:2.8rem;

    margin-bottom:10px;

}

.hero p{

    color:#94a3b8;

}

.dashboard-grid{

    display:flex;

    flex-wrap:wrap;

    gap:25px;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:25px;

    }

}

</style>