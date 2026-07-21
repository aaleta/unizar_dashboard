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

import {
    BASES,
    GRADE_CATEGORIES,
    subjectRows,
    distribution,
    formatPct
} from "@/utils/metrics";

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

    subjectCode: Number,

    base: {
        type: String,
        default: "matriculados"
    }

});

const emit = defineEmits(["selectYear"]);

const rows = computed(() =>
    subjectRows(props.subjectCode)
);

const years = computed(() =>
    rows.value.map(row => row["Curso Académico"])
);

// Con base "presentados" los no presentados salen del reparto.
const categories = computed(() =>
    GRADE_CATEGORIES.filter(category =>
        props.base === "matriculados" || !category.onlyOverMatriculados
    )
);

const chartData = computed(() => ({

    labels: years.value,

    datasets: categories.value.map(category => ({

        label: category.label,

        data: rows.value.map(row => {

            const slice = distribution(row, props.base)
                .find(item => item.key === category.key);

            return slice?.pct ?? 0;

        }),

        borderColor: category.color,

        backgroundColor: `${category.color}2b`,

        pointBackgroundColor: category.color,

        pointBorderColor: "#ffffff",

        pointBorderWidth: 1.5,

        borderWidth: 2,

        pointRadius: 3,

        pointHoverRadius: 6,

        fill: true,

        tension: .3

    }))

}));

const chartOptions = computed(() => ({

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

        mode: "index",

        intersect: false

    },

    onClick: (event, elements) => {

        if (!elements.length) return;

        emit("selectYear", years.value[elements[0].index]);

    },

    plugins: {

        legend: {

            position: "bottom",

            labels: {

                color: "white",

                usePointStyle: true,

                pointStyle: "circle",

                boxWidth: 10,

                padding: 16,

                font: {
                    size: 11,
                    weight: "600"
                }

            }

        },

        tooltip: {

            callbacks: {

                label: context =>
                    `${context.dataset.label}: ${formatPct(context.raw)}`

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

                callback: value => `${value} %`

            },

            grid: {
                color: "rgba(255,255,255,.08)"
            }

        }

    }

}));

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Evolución de las calificaciones</h2>

    </div>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <p class="footer">

        {{ BASES[base].caption }}. Haz clic en un curso académico para ver su
        distribución detallada arriba.

    </p>

</div>

</template>

<style scoped>

.panel{

    display:flex;

    flex-direction:column;

    padding:24px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    min-width:0;

}

.panelHeader h2{

    margin:0 0 20px;

    color:white;

    font-size:1.1rem;

    font-weight:600;

}

.chartContainer{

    width:100%;

    height:360px;

}

.footer{

    margin:14px 0 0;

    color:#64748b;

    font-size:.78rem;

    line-height:1.5;

}

</style>
