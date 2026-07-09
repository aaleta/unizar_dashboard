<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "vue-chartjs";

import notas from "../../../../data/json/NotasRaw.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const props = defineProps({
    subjectCode: Number
});

const subjectData = computed(() => {

    return notas
        .filter(item => item["Código"] === props.subjectCode)
        .sort((a, b) =>
            a["Curso Académico"].localeCompare(b["Curso Académico"])
        );

});

const chartData = computed(() => ({

    labels: subjectData.value.map(
        item => item["Curso Académico"]
    ),

    datasets: [

        // Matriculados
        {

            label: "Matriculados",

            data: subjectData.value.map(item =>

                item["No pre"] +
                item["Sus"] +
                item["Apr"] +
                item["Not"] +
                item["Sob"] +
                item["MH"]

            ),

            borderColor: "#38bdf8",

            backgroundColor: "rgba(56,189,248,.15)",

            pointBackgroundColor: "#38bdf8",

            pointRadius: 5,

            borderWidth: 3,

            tension: .3,

            fill: false

        },

        // Suspensos
        {

            label: "Suspensos",

            data: subjectData.value.map(
                item => item["Sus"]
            ),

            borderColor: "#ef4444",

            backgroundColor: "rgba(239,68,68,.15)",

            pointBackgroundColor: "#ef4444",

            pointRadius: 5,

            borderWidth: 3,

            tension: .3,

            fill: false

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            display: true,

            labels: {

                color: "#cbd5e1",

                usePointStyle: true,

                pointStyle: "circle"

            }

        }

    },

    scales: {

        x: {

            ticks: {

                color: "#cbd5e1"

            },

            grid: {

                display: false

            }

        },

        y: {

            beginAtZero: true,

            ticks: {

                color: "#94a3b8"

            },

            grid: {

                color: "rgba(255,255,255,.08)"

            }

        }

    }

};

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Evolución de matriculados y suspensos</h2>

    </div>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

</div>

</template>

<style scoped>

.panel{

    width:420px;
    height:340px;

    padding:22px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#38bdf8;

    box-shadow:0 15px 35px rgba(0,0,0,.35);

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

.chartContainer{

    width:100%;

    height:270px;

}

</style>