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
    const noPresentedPercentages = [];

    subjectData.value.forEach(item => {

        const enrolled =
            item["No pre"] +
            item["Sus"] +
            item["Apr"] +
            item["Not"] +
            item["Sob"] +
            item["MH"];

        const percentage =
            enrolled === 0
                ? 0
                : (item["No pre"] / enrolled) * 100;

        years.push(item["Curso Académico"]);
        noPresentedPercentages.push(percentage);

    });

    return {

        labels: years,

        datasets: [

            {

                label: "% No presentados",

                data: noPresentedPercentages,

                borderColor: "#64748b",

                backgroundColor: "rgba(100,116,139,.15)",

                pointBackgroundColor: "#64748b",

                pointBorderColor: "#64748b",

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

        <h2>Evolución del porcentaje de no presentados</h2>

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

    width:95%;

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