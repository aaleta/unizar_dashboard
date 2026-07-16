<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
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
    Filler,
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
        row => row["Curso Académico"]
    ),

    datasets: [

        {

            label: "No Presentados",

            data: subjectData.value.map(row => Number(row["No pre %"])),

            borderColor: "#94a3b8",

            backgroundColor: "rgba(148,163,184,.12)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#94a3b8",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        },

        {

            label: "Suspensos",

            data: subjectData.value.map(row => Number(row["Sus %"])),

            borderColor: "#ef4444",

            backgroundColor: "rgba(239,68,68,.15)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#ef4444",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        },

        {

            label: "Aprobados",

            data: subjectData.value.map(row => Number(row["Apr %"])),

            borderColor: "#22c55e",

            backgroundColor: "rgba(34,197,94,.15)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#22c55e",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        },

        {

            label: "Notables",

            data: subjectData.value.map(row => Number(row["Not %"])),

            borderColor: "#3b82f6",

            backgroundColor: "rgba(59,130,246,.15)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#3b82f6",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        },

        {

            label: "Sobresalientes",

            data: subjectData.value.map(row => Number(row["Sob %"])),

            borderColor: "#a855f7",

            backgroundColor: "rgba(168,85,247,.15)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#a855f7",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        },

        {

            label: "MH",

            data: subjectData.value.map(row => Number(row["MH %"])),

            borderColor: "#facc15",

            backgroundColor: "rgba(250,204,21,.18)",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: "#facc15",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 1.5,

            fill: true,

            tension: .35

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

        mode: "index",

        intersect: false

    },

    plugins: {

        legend: {

            position: "bottom",

            labels: {

                color: "white",

                usePointStyle: true,

                pointStyle: "circle",

                boxWidth: 10,

                padding: 18,

                font: {

                    size: 11,

                    weight: "600"

                }

            }

        },

        tooltip: {

            callbacks: {

                label: context =>

                    `${context.dataset.label}: ${context.raw.toFixed(1)}%`

            }

        }

    },

    scales: {

        x: {

            stacked: true,

            ticks: {

                color: "#cbd5e1"

            },

            grid: {

                display: false

            }

        },

        y: {

            stacked: true,

            beginAtZero: true,

            max: 100,

            ticks: {

                color: "#94a3b8",

                callback: value => value + "%"

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

    <h2>Evolución de las calificaciones</h2>

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

    width:95%;

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

h2{

    margin:0 0 18px;

    color:white;

    font-size:1rem;

    font-weight:600;

}

.chartContainer{

    width:100%;

    height:270px;

}

</style>