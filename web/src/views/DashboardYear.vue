<script setup>

import { computed } from "vue";
import { useRoute } from "vue-router";

import DifficultyOfSubjectsYear from "@/components/Dashboard/DifficultyOfSubjectsYear.vue";

const route = useRoute();

const course = computed(() => Number(route.params.course));

const courseName = computed(() => {

    switch(course.value){

        case 1:
            return "Primero";

        case 2:
            return "Segundo";

        case 3:
            return "Tercero";

        case 4:
            return "Cuarto";

        default:
            return "Curso";

    }

});

</script>

<template>

<main class="page">

    <header class="hero">

        <h1>

            {{ courseName }}

        </h1>

        <p>

            Estadísticas generales del curso.

        </p>

    </header>

    <section class="dashboard-grid">

        <DifficultyOfSubjectsYear
            :course="course"
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

    background:#0f172a;

    color:white;

    box-sizing:border-box;

    overflow-x:hidden;

}

.hero{

    margin-bottom:40px;

}

.hero h1{

    margin:0 0 10px;

    font-size:2.8rem;

    font-weight:700;

}

.hero p{

    margin:0;

    color:#94a3b8;

    font-size:1.05rem;

}

.dashboard-grid{

    display:flex;

    flex-wrap:wrap;

    justify-content:center;

    align-items:flex-start;

    gap:25px;

    width:100%;

}

/* Responsive */

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:25px;

    }

    .hero{

        text-align:center;

    }

    .hero h1{

        font-size:2.2rem;

    }

    .dashboard-grid{

        justify-content:center;

    }

}

</style>