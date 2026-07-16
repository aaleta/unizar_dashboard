<script setup>

import GeneralOptEnrolled from '@/components/Dashboard/GeneralOptEnrolled.vue';

</script>

<template>

<main class="page">

    <header class="hero">

        <div>

            <h1>Dashboard de Optativas</h1>

            <p>
                Estadísticas globales de las asignaturas optativas del Grado en Física.
            </p>

        </div>

    </header>

    <section class="dashboard-grid">

        <GeneralOptEnrolled />

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

    overflow-x:hidden;

    box-sizing:border-box;

}

.hero{

    margin-bottom:40px;

}

.hero h1{

    font-size:2.8rem;

    margin-bottom:10px;

    color:white;

}

.hero p{

    color:#94a3b8;

    font-size:1.05rem;

}

.dashboard-grid{

    display:flex;

    flex-wrap:wrap;

    justify-content:center;

    gap:25px;

}

@media (max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:20px 16px;

        box-sizing:border-box;

    }

    .hero{

        text-align:center;

    }

    .hero h1{

        font-size:2rem;

        line-height:1.2;

    }

    .dashboard-grid{

        display:grid;

        grid-template-columns:1fr;

        gap:20px;

        justify-items:center;

    }

    .dashboard-grid > *{

        width:100%;

        max-width:500px;

    }

}

</style>