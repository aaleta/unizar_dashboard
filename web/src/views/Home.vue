<script setup>
import OptEnrolled from '@/components/Dashboard/OptEnrolled.vue';
import YearsTroncComparation from '@/components/Dashboard/YearsTroncComparation.vue';
import WorstSubject from '@/components/Dashboard/WorstSubject.vue';
</script>

<template>

<main class="home">

    <section class="hero">

        <h1>

            Dashboard Física Unizar

        </h1>

        <div class="dashboardGrid">

            <OptEnrolled />

            <YearsTroncComparation />

            <WorstSubject />

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

    margin-bottom:40px;

    font-weight:700;

    letter-spacing:2px;

}

.dashboardGrid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(420px,1fr));

    gap:30px;

    align-items:start;

}

.dashboardGrid > *{

    width:100%;

    min-width:0;

}

@media(max-width:768px){

    .home{

        margin-left:70px;   

        padding:20px;

    }

    .dashboardGrid{

        grid-template-columns:1fr;

    }

    .hero h1{

        font-size:2rem;

        margin-bottom:30px;

    }

}

</style>