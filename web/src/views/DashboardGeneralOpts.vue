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

        margin-left:70px;

        width:calc(100% - 70px);

        padding:25px 15px;

    }

    .hero{

        text-align:center;

    }

    .hero h1{

        font-size:2rem;

    }

    .dashboard-grid{

        justify-content:center;

    }

}

</style>