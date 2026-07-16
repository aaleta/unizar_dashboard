<script setup>

import OptEnrolled from "@/components/Dashboard/OptEnrolled.vue";
import YearsTroncComparation from "@/components/Dashboard/YearsTroncComparation.vue";
import WorstSubject from "@/components/Dashboard/WorstSubject.vue";
import AdmisionGrades from "@/components/Dashboard/AdmisionGrades.vue";
import FightModeButton from "@/components/Dashboard/FightModeButton.vue";

</script>

<template>

<main class="home">

    <section class="hero">

        <h1>
            Dashboard Física Unizar
        </h1>

        <p class="subtitle">
            Datos actualizados al curso académico
            <strong>2024-2025</strong>.
            Todos los indicadores se han calculado a partir de la
            información oficial publicada por la Universidad de Zaragoza.
        </p>

        <div class="dashboardGrid">

            <OptEnrolled />

            <YearsTroncComparation />

            <WorstSubject />

            <AdmisionGrades />

            <FightModeButton />

        </div>

    </section>

</main>

</template>

<style scoped>

.home{

    min-height:100vh;

    margin-left:220px;

    padding:40px;

    background:#111216;

    box-sizing:border-box;

}

.hero{

    max-width:1400px;

    margin:0 auto;

}

.hero h1{

    text-align:center;

    font-size:clamp(2.5rem,6vw,5rem);

    color:white;

    margin-bottom:18px;

    font-weight:700;

    letter-spacing:2px;

}

.subtitle{

    max-width:900px;

    margin:0 auto 45px;

    text-align:center;

    color:#94a3b8;

    font-size:1.05rem;

    line-height:1.7;

}

.subtitle strong{

    color:white;

    font-weight:600;

}

.dashboardGrid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));

    gap:30px;

    align-items:start;

}

.dashboardGrid > *{

    width:100%;

    min-width:0;

}

@media(max-width:768px){

    .home{

        margin-left:0;

        margin-bottom:70px;

        padding:20px 16px;

    }

    .hero{

        max-width:100%;

    }

    .hero h1{

        font-size:2rem;

        line-height:1.2;

        margin-bottom:15px;

        letter-spacing:1px;

    }

    .subtitle{

        max-width:100%;

        padding:0;

        margin:0 auto 30px;

        font-size:.95rem;

        line-height:1.6;

    }

    .dashboardGrid{

        grid-template-columns:1fr;

        gap:20px;

    }

}

</style>