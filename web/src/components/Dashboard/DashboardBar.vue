<script setup>

import { computed } from "vue";
import notas from "../../../../data/json/NotasRaw.json";

const props = defineProps({
    subjectCode: Number
});

const subjectData = computed(() =>
    notas
        .filter(item => item["Código"] === props.subjectCode)
        .sort((a, b) =>
            b["Curso Académico"].localeCompare(a["Curso Académico"])
        )
        .slice(0, 4)
);

const yearsData = computed(() => {

    return subjectData.value.map(item => {

        const approvedCount =
            Number(item["Apr"]) +
            Number(item["Not"]) +
            Number(item["Sob"]) +
            Number(item["MH"]);

        const failedCount =
            Number(item["Sus"]);

        const totalEvaluated =
            approvedCount + failedCount;

        const approved =
            totalEvaluated === 0
                ? 0
                : approvedCount * 100 / totalEvaluated;

        const failed =
            totalEvaluated === 0
                ? 0
                : failedCount * 100 / totalEvaluated;

        return {

            year: item["Curso Académico"],

            approved,

            failed

        };

    });

});

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Aprobados vs Suspensos</h2>

    </div>

    <div
        v-for="year in yearsData"
        :key="year.year"
        class="yearRow"
    >

        <div class="yearHeader">

            <span class="year">{{ year.year }}</span>

            <span class="percentage">
                {{ year.approved.toFixed(1) }}%
            </span>

        </div>

        <div class="progressBar">

            <div
                class="approved"
                :style="{ width: year.approved + '%' }"
            ></div>

            <div
                class="failed"
                :style="{ width: year.failed + '%' }"
            ></div>

        </div>

    </div>

    <div class="legend">

        <div>

            <span class="dot green"></span>

            Aprobados

        </div>

        <div>

            <span class="dot red"></span>

            Suspensos

        </div>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:420px;
    height:300px;

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

}

.panelHeader{

    margin-bottom:22px;

}

.panelHeader h2{

    margin:0;

    font-size:1rem;

    color:white;

}

.yearRow{

    margin-bottom:18px;

}

.yearHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:8px;

}

.year{

    color:#cbd5e1;

    font-size:.9rem;

    font-weight:600;

}

.percentage{

    color:#94a3b8;

    font-size:.85rem;

}

.progressBar{

    display:flex;

    overflow:hidden;

    height:18px;

    border-radius:999px;

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

    margin-top:22px;

    display:flex;

    justify-content:space-around;

    color:#cbd5e1;

    font-size:.9rem;

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

</style>