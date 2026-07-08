<script setup>

import { computed } from "vue";
import notas from "../../../../data/json/NotasRaw.json";

const props = defineProps({
    subjectCode: Number,
    selectedYear: String
});

const subjectData = computed(() =>
    notas.filter(item => item["Código"] === props.subjectCode)
);

const currentData = computed(() =>
    subjectData.value.find(
        item => item["Curso Académico"] === props.selectedYear
    )
);

const approvedCount = computed(() => {

    if (!currentData.value) return 0;

    return (
        Number(currentData.value["Apr"]) +
        Number(currentData.value["Not"]) +
        Number(currentData.value["Sob"]) +
        Number(currentData.value["MH"])
    );

});

const failedCount = computed(() => {

    if (!currentData.value) return 0;

    return Number(currentData.value["Sus"]);

});

const totalEvaluated = computed(() => {

    return approvedCount.value + failedCount.value;

});

const approved = computed(() => {

    if (totalEvaluated.value === 0) return 0;

    return approvedCount.value * 100 / totalEvaluated.value;

});

const failed = computed(() => {

    if (totalEvaluated.value === 0) return 0;

    return failedCount.value * 100 / totalEvaluated.value;

});

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Aprobados vs Suspensos</h2>

        <span class="year">{{ props.selectedYear }}</span>

    </div>

    <div class="progressBar">

        <div
            class="approved"
            :style="{ width: approved + '%' }"
        ></div>

        <div
            class="failed"
            :style="{ width: failed + '%' }"
        ></div>

    </div>

    <div class="legend">

        <div>

            <span class="dot green"></span>

            Aprobados

            <strong>{{ approved.toFixed(1) }}%</strong>

        </div>

        <div>

            <span class="dot red"></span>

            Suspensos

            <strong>{{ failed.toFixed(1) }}%</strong>

        </div>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:420px;
    height:220px;

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.panelHeader h2{

    margin:0;

    font-size:1rem;

}

.year{

    color:#94a3b8;

    font-size:.9rem;

    font-weight:500;

}

.progressBar{

    display:flex;

    overflow:hidden;

    height:28px;

    border-radius:14px;

    background:#334155;

}

.approved{

    background:#22c55e;

    transition:.4s;

}

.failed{

    background:#ef4444;

    transition:.4s;

}

.legend{

    margin-top:25px;

    display:flex;

    justify-content:space-between;

}

.legend div{

    display:flex;

    align-items:center;

    gap:8px;

}

.dot{

    width:12px;

    height:12px;

    border-radius:50%;

}

.green{

    background:#22c55e;

}

.red{

    background:#ef4444;

}

strong{

    margin-left:5px;

    color:white;

}

</style>