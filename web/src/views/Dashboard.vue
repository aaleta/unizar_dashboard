<script setup>

import { computed } from "vue";
import { useRoute } from "vue-router";

import DashboardPassRate from "@/components/Dashboard/DashboardBar.vue";
import DashBoardSusp from "@/components/Dashboard/DashBoardSusp.vue";
import DashboardNoPreGraph from "@/components/Dashboard/DashboardNoPreGraph.vue";
import DashboardHistDesc from "@/components/Dashboard/DashboardHistDesc.vue";

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

        <DashboardHistDesc
            :subjectCode="subjectCode"
        />

        <DashboardPassRate
            :subjectCode="subjectCode"
        />

        <DashBoardSusp
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

    min-height:100vh;

    padding:50px;

    box-sizing:border-box;

    background:#0f172a;

    color:white;

}

.hero{

    max-width:1400px;

    margin:0 auto 40px;

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

    justify-content:center;

    align-items:flex-start;

    gap:25px;

    max-width:1400px;

    margin:0 auto;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:25px;

    }

    .hero{

        margin-bottom:30px;

    }

    .hero h1{

        font-size:2.2rem;

    }

    .dashboard-grid{

        justify-content:center;

    }

}

</style>
