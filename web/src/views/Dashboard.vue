<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

import DashboardHist from "@/components/Dashboard/DashboardHistogram.vue";
import DashboardPassRate from "@/components/Dashboard/DashboardBar.vue";

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

// Datos de la asignatura
const subjectData = computed(() => {

    return notas.filter(
        item => item["Código"] === subjectCode
    );

});

// Años disponibles
const years = computed(() => {

    return subjectData.value
        .map(item => item["Curso Académico"])
        .sort((a, b) => b.localeCompare(a));

});

// Año seleccionado
const selectedYear = ref("");

watch(years, (newYears) => {

    if (newYears.length > 0) {

        selectedYear.value = newYears[0];

    }

}, { immediate: true });

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

        <select
            v-model="selectedYear"
            class="yearSelector"
        >

            <option
                v-for="year in years"
                :key="year"
                :value="year"
            >
                {{ year }}
            </option>

        </select>

    </header>

    <section class="dashboard-grid">

        <DashboardHist
            :subjectCode="subjectCode"
            :selectedYear="selectedYear"
        />

        <DashboardPassRate
            :subjectCode="subjectCode"
            :selectedYear="selectedYear"
        />

    </section>

</main>

</template>

<style scoped>

.page{

    margin-left:90px;
    padding:50px;

    min-height:100vh;

    background:#0f172a;

    color:white;

}

.hero{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:40px;

}

.hero h1{

    font-size:2.8rem;

    margin-bottom:10px;

}

.hero p{

    color:#94a3b8;

}

.yearSelector{

    background:#1e293b;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:10px 16px;

    font-size:1rem;

    cursor:pointer;

}

.yearSelector:focus{

    outline:none;

    border-color:#38bdf8;

}

.dashboard-grid{

    display:flex;

    flex-wrap:wrap;

    gap:25px;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        padding:25px;

    }

    .hero{

        flex-direction:column;

        align-items:flex-start;

        gap:20px;

    }

}

</style>