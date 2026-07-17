<script setup>

import { ref, computed } from "vue";

import datos from "../../../../data/json/processed/Profesores_GuiasDoc.json";

import ProfWebYearSelector from "./ProfWebYearSelector.vue";
import ProfGraph from "./ProfGraph.vue";

const years = computed(() =>

    [...new Set(
        datos.map(d => d.anyo_academico)
    )].sort((a, b) => b.localeCompare(a))

);

const selectedYear = ref(years.value[0]);

</script>

<template>

<div class="page">

    <ProfWebYearSelector
        v-model="selectedYear"
        :years="years"
    />

    <ProfGraph
        :year="selectedYear"
    />

</div>

</template>

<style scoped>

.page {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

</style>