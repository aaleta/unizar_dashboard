<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "vue-chartjs";

import notasAcceso from "../../../../data/json/NotasDeCorteRaw.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const chartData = computed(() => ({

    labels: notasAcceso.map(item => item["Año"]),

    datasets: [

        {

            label: "Nota media de acceso",

            data: notasAcceso.map(
                item => item["Nota media en pruebas de acceso"]
            ),

            borderColor: "#3b82f6",

            backgroundColor: "#3b82f6",

            borderWidth: 3,

            pointRadius: 5,

            pointHoverRadius: 7,

            tension: 0.3

        },

        {

            label: "Nota de corte",

            data: notasAcceso.map(
                item => item["Nota de corte"]
            ),

            borderColor: "#22c55e",

            backgroundColor: "#22c55e",

            borderWidth: 3,

            pointRadius: 5,

            pointHoverRadius: 7,

            tension: 0.3

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            labels: {

                color: "white"

            }

        },

        tooltip: {

            callbacks: {

                label: context =>

                    `${context.dataset.label}: ${context.raw.toFixed(3)}`

            }

        }

    },

    scales: {

        x: {

            ticks: {

                color: "#cbd5e1"

            },

            grid: {

                color: "rgba(255,255,255,.08)"

            }

        },

        y: {

            suggestedMin: 10,

            suggestedMax: 13.5,

            ticks: {

                color: "#cbd5e1"

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

    <h2>Evolución de las notas de acceso</h2>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        Comparación entre la nota media de acceso y la nota de corte del Grado en Física durante los últimos cursos.

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

    line-height:1.5;

}

</style>