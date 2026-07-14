<script setup>

import { ref, computed, watch } from "vue";

import asignaturas from "../../../../data/json/processed/Profesores_GuiasDoc.json";

const props = defineProps({

    subjectCode: Number

});

// Datos de la asignatura
const subjectData = computed(() => {

    return asignaturas.filter(

        item => Number(item.id_asignatura) === props.subjectCode

    );

});

// Años académicos disponibles
const years = computed(() => {

    return subjectData.value

        .map(item => item.anyo_academico)

        .sort((a, b) => b.localeCompare(a));

});

// Año seleccionado
const selectedYear = ref("");

watch(

    years,

    (newYears) => {

        if (newYears.length > 0) {

            selectedYear.value = newYears[0];

        }

    },

    { immediate: true }

);

// Datos del año seleccionado
const currentData = computed(() => {

    return subjectData.value.find(

        item => item.anyo_academico === selectedYear.value

    );

});

// Profesores
const professors = computed(() => {

    if (!currentData.value) return [];

    return currentData.value.profesores ?? [];

});

// Guía docente web
const webGuide = computed(() => {

    if (!currentData.value) return null;

    const url = currentData.value.guia_docente_web;

    return url && url !== "No disponible"
        ? url
        : null;

});

// Guía docente PDF
const pdfGuide = computed(() => {

    if (!currentData.value) return null;

    const url = currentData.value.guia_docente_pdf;

    return url && url !== "No disponible"
        ? url
        : null;

});

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Información de la asignatura</h2>

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

    </div>

    <template v-if="currentData">

        <h3>Profesores</h3>

        <ul class="teacherList">

            <li
                v-for="teacher in professors"
                :key="teacher"
            >
                {{ teacher }}
            </li>

        </ul>

        <h3>Guía docente</h3>

        <div class="links">

            <a
                v-if="webGuide"
                :href="webGuide"
                target="_blank"
                rel="noopener"
            >
                Ver guía docente
            </a>

            <a
                v-if="pdfGuide"
                :href="pdfGuide"
                target="_blank"
                rel="noopener"
            >
                Descargar PDF
            </a>

        </div>

    </template>

    <template v-else>

        <p class="noData">

            No hay información disponible para este curso académico.

        </p>

    </template>

</div>

</template>

<style scoped>

.panel{

    width:420px;

    min-height:340px;

    padding:22px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    box-shadow:
        0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#38bdf8;

    box-shadow:
        0 15px 35px rgba(0,0,0,.35);

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:18px;

}

.panelHeader h2{

    margin:0;

    color:white;

    font-size:1rem;

    font-weight:600;

}

.yearSelector{

    background:#273358;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:8px 12px;

    font-size:.9rem;

    cursor:pointer;

}

.yearSelector:focus{

    outline:none;

    border-color:#38bdf8;

}

h3{

    margin:18px 0 10px;

    color:white;

    font-size:.95rem;

    font-weight:600;

}

.teacherList{

    margin:0 0 24px;

    padding-left:20px;

    color:#cbd5e1;

    line-height:1.8;

}

.teacherList li{

    margin-bottom:4px;

}

.links{

    display:flex;

    flex-direction:column;

    gap:12px;

    margin-top:10px;

}

.links a{

    color:#38bdf8;

    text-decoration:none;

    font-weight:600;

    transition:.2s;

}

.links a:hover{

    color:#7dd3fc;

    transform:translateX(4px);

}

.noData{

    margin-top:30px;

    color:#94a3b8;

    font-style:italic;

    text-align:center;

}

</style>