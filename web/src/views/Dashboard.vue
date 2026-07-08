<script setup>
import { useRoute } from "vue-router";
import DashboardHist from "@/components/Dashboard/DashboardHistogram.vue";

const route = useRoute();

// Código de la asignatura obtenido de la URL
const subjectCode = Number(route.params.code);
</script>

<template>

<div class="dashboard">

    <h1>Dashboard asignatura {{ subjectCode }}</h1>

    <DashboardHist
        :subjectCode="subjectCode"
    />

</div>

</template>

<style scoped>

.dashboard{

    width: 100%;
    min-height: 100vh;
    padding: 30px;
    background: #f4f6fa;

}

.dashboard h1{

    margin-bottom:30px;

}

</style>