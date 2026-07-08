<script setup>
    import { useRoute } from "vue-router";
    import DashboardHist from "@/components/Dashboard/DashboardHistogram.vue";
    import { computed } from "vue";
    import notas from "../../../data/json/NotasRaw.json";

    const route = useRoute();

    const subjectName = computed(() => {

        const subject = notas.find(
            item => item["Código"] === subjectCode
        );

        return subject
            ? subject["Asignatura"].trim()
            : `Asignatura ${subjectCode}`;

    });

    
    // Código de la asignatura obtenido de la URL
    const subjectCode = Number(route.params.code);

    


</script>

<template>

<main class="page">

    <header class="hero">

        <h1>Dashboard {{ subjectName }}</h1>

        <p>
            Estadísticas de la asignatura.
        </p>

    </header>

    <section class="dashboard-grid">

        <DashboardHist
            :subjectCode="subjectCode"
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

        padding:25px;

    }

}

</style>