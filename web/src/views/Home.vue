<script setup>

import DegreeKpiRow from "@/components/Dashboard/DegreeKpiRow.vue";
import OptEnrolled from "@/components/Dashboard/OptEnrolled.vue";
import YearsTroncComparation from "@/components/Dashboard/YearsTroncComparation.vue";
import WorstSubject from "@/components/Dashboard/WorstSubject.vue";
import AdmisionGrades from "@/components/Dashboard/AdmisionGrades.vue";

import { DATA_SOURCES } from "@/utils/dataSources";

/**
 * Los accesos a Fight Mode y a la red de profesores ya no son tarjetas: eran
 * navegación disfrazada de dato y competían con las gráficas. Ahora viven en
 * el menú lateral.
 */

</script>

<template>

<main class="home">

    <section class="hero">

        <h1>Dashboard Física Unizar</h1>

        <p class="subtitle">
            Estadísticas del Grado en Física de la Universidad de Zaragoza,
            calculadas a partir de la información oficial publicada por la
            propia Universidad.
        </p>

        <!-- Cada fuente se actualiza por su cuenta: una sola fecha para todas
             sería falsa. -->
        <ul class="freshness">

            <li
                v-for="source in DATA_SOURCES"
                :key="source.key"
            >
                <span class="freshnessLabel">{{ source.label }}</span>
                <span class="freshnessValue">{{ source.ultimo_curso }}</span>
            </li>

        </ul>

        <p class="methodology">
            <RouterLink to="/metodologia">
                Cómo se calcula cada indicador →
            </RouterLink>
        </p>

    </section>

    <DegreeKpiRow />

    <section class="dashboardGrid">

        <WorstSubject />

        <YearsTroncComparation />

        <AdmisionGrades />

        <OptEnrolled />

    </section>

</main>

</template>

<style scoped>

.home{

    margin-left:220px;

    min-height:100vh;

    padding:50px;

    background:#111216;

    box-sizing:border-box;

    overflow-x:hidden;

}

.hero,
.dashboardGrid,
:deep(.kpiGrid){

    width:100%;

    max-width:1500px;

    margin-left:auto;

    margin-right:auto;

}

.hero{

    margin-bottom:34px;

}

.hero h1{

    margin:0 0 16px;

    font-size:clamp(2.2rem,5vw,3.6rem);

    color:white;

    font-weight:700;

    letter-spacing:1px;

}

.subtitle{

    max-width:760px;

    margin:0 0 26px;

    color:#94a3b8;

    font-size:1.05rem;

    line-height:1.7;

}

.freshness{

    display:flex;

    flex-wrap:wrap;

    gap:12px;

    margin:0 0 16px;

    padding:0;

    list-style:none;

}

.freshness li{

    display:flex;

    flex-direction:column;

    gap:3px;

    padding:9px 14px;

    border-radius:10px;

    background:rgba(255,255,255,.04);

    border:1px solid rgba(255,255,255,.07);

}

.freshnessLabel{

    color:#64748b;

    font-size:.7rem;

    text-transform:uppercase;

    letter-spacing:.5px;

    font-weight:600;

}

.freshnessValue{

    color:#cbd5e1;

    font-size:.85rem;

    font-weight:600;

    font-variant-numeric:tabular-nums;

}

.methodology{

    margin:0;

}

.methodology a{

    color:#38bdf8;

    text-decoration:none;

    font-size:.9rem;

    font-weight:600;

}

.methodology a:hover{

    text-decoration:underline;

}

.dashboardGrid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(360px,1fr));

    gap:26px;

    align-items:stretch;

}

.dashboardGrid > *{

    width:100%;

    min-width:0;

    max-width:none;

    margin:0;

    box-sizing:border-box;

}

@media(max-width:768px){

    .home{

        margin-left:0;

        padding:24px 16px 90px;

    }

    .hero h1{

        font-size:1.9rem;

        line-height:1.2;

    }

    .subtitle{

        font-size:.95rem;

        margin-bottom:20px;

    }

    .dashboardGrid{

        grid-template-columns:1fr;

        gap:20px;

    }

}

</style>
