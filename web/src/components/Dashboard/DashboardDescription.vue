<script setup>

import { computed } from "vue";

import descriptions from "../../../../data/json/processed/AsignaturasDescripcion.json";

const props = defineProps({

    subjectCode: Number

});

const description = computed(() => {

    const subject = descriptions.find(

        item => item.code === props.subjectCode

    );

    return subject
        ? subject.description
        : "No hay descripción disponible para esta asignatura.";

});

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Descripción de la asignatura</h2>

    </div>

    <p class="description">

        {{ description }}

    </p>

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

    margin-bottom:18px;

}

.panelHeader h2{

    margin:0;

    color:white;

    font-size:1rem;

    font-weight:600;

}

.description{

    color:#cbd5e1;

    line-height:1.7;

    font-size:.95rem;

    text-align:justify;

}

</style>