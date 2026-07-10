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

const subjectData = computed(() =>
    notas
        .filter(item => item["Código"] === props.subjectCode)
        .sort((a, b) =>
            a["Curso Académico"].localeCompare(b["Curso Académico"])
        )
);

const chartData = computed(() => {

    const years = [];
    const failedPercentages = [];

    subjectData.value.forEach(item => {

        const enrolled =
            item["Sus"] +
            item["Apr"] +
            item["Not"] +
            item["Sob"] +
            item["MH"];

        const failedPercentage =
            enrolled === 0
                ? 0
                : (item["Sus"] / enrolled) * 100;

        years.push(item["Curso Académico"]);
        failedPercentages.push(failedPercentage);

    });

    return {

        labels: years,

        datasets: [

            {

                label: "% Suspensos",

                data: failedPercentages,

                borderColor: "#ef4444",

                backgroundColor: "rgba(239,68,68,.15)",

                pointBackgroundColor: "#ef4444",

                pointBorderColor: "#ef4444",

                pointRadius: 4,

                pointHoverRadius: 6,

                borderWidth: 3,

                tension: .35,

                fill: false

            }

        ]

    };

});

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            display: false

        },

        tooltip: {

            callbacks: {

                label: context =>
                    context.parsed.y.toFixed(1) + "%"

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

    <div class="panelHeader">

        <h2>Evolución del porcentaje de suspensos (Presentados)</h2>

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

.chartContainer{

    width:100%;

    height:260px;

}

</style>