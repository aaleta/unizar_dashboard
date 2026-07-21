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

import {
    METRICS,
    academicYears,
    courseSeries
} from "@/utils/metrics";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const props = defineProps({

    course: [String, Number]

});

const series = computed(() =>
    courseSeries(props.course, "noSuperacion")
);

const chartData = computed(() => ({

    labels: academicYears,

    datasets: [

        {

            label: METRICS.noSuperacion.label,

            data: series.value.map(point => point.value),

            borderColor: "#3b82f6",

            backgroundColor: "rgba(59,130,246,.18)",

            fill: true,

            tension: .35,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointBackgroundColor: "#60a5fa",

            pointBorderColor: "#fff",

            spanGaps: true

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

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

            ticks: {
                color: "#cbd5e1"
            },

            grid: {
                display: false
            }

        },

        y: {

            beginAtZero: true,

            suggestedMax: 50,

            ticks: {

                color: "#94a3b8",

                callback: value => `${value} %`

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

    <h2>

        Evolución de la tasa de no superación del curso

    </h2>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        <strong>{{ METRICS.noSuperacion.label }}</strong>:
        {{ METRICS.noSuperacion.definition }}
        Media de las troncales del curso, ponderada por matriculados.

    </div>

</div>

</template>

<style scoped>

.panel{

    width:100%;

    padding:24px;

    background:#1e293b;

    border-radius:20px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

    margin-bottom: 90px;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#3b82f6;

}

h2{

    margin:0 0 20px;

    color:white;

    font-size:1.2rem;

}

.chartContainer{

    width:100%;

    height:340px;

}

.footer{

    margin-top:20px;

    padding-top:14px;

    border-top:1px solid rgba(255,255,255,.08);

    color:#94a3b8;

    font-size:.85rem;

    line-height:1.5;

}

.footer strong{

    color:white;

}

</style>