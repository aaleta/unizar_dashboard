<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "vue-chartjs";

import {
    RECENT_YEARS,
    METRICS,
    courseRate
} from "@/utils/metrics";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const courses = ["1", "2", "3", "4"];

const values = computed(() =>
    courses.map(course => courseRate(course, "noSuperacion") ?? 0)
);

const chartData = computed(() => ({

    labels: courses.map(course => `${course}º`),

    datasets: [

        {

            label: METRICS.noSuperacion.label,

            data: values.value,

            backgroundColor: [
                "#3b82f6",
                "#2563eb",
                "#1d4ed8",
                "#1e40af"
            ],

            borderRadius: 10,

            barThickness: 26

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    indexAxis: "y",

    plugins: {

        legend: {

            display: false

        },

        tooltip: {

            callbacks: {

                label: context => `${context.raw.toFixed(1)} % no supera`

            }

        }

    },

    scales: {

        x: {

            beginAtZero: true,

            suggestedMax: 40,

            ticks: {

                color: "#cbd5e1",

                callback: value => `${value} %`

            },

            grid: {

                color: "rgba(255,255,255,.08)"

            }

        },

        y: {

            ticks: {

                color: "white",

                font: {

                    size: 15,

                    weight: "bold"

                }

            },

            grid: {

                display: false

            }

        }

    }

};

</script>

<template>

<div class="panel">

    <h2>Dificultad media por curso</h2>

    <div class="chartContainer">

        <Bar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        <strong>{{ METRICS.noSuperacion.label }}</strong>:
        {{ METRICS.noSuperacion.definition }}
        Media ponderada por matriculados de las troncales de cada curso
        durante los últimos {{ RECENT_YEARS }} cursos académicos.

    </div>

</div>

</template>

<style scoped>

.panel{

    width:100%;
    max-width:520px;

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

    box-sizing:border-box;

    margin:0;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#3b82f6;

}

.panel h2{

    margin:0 0 18px;

    color:white;

    font-size:1.15rem;

}

.chartContainer{

    width:100%;

    height:300px;

}

.footer{

    margin-top:15px;

    padding-top:12px;

    border-top:1px solid rgba(255,255,255,.08);

    color:#94a3b8;

    font-size:.82rem;

    line-height:1.4;

}

</style>