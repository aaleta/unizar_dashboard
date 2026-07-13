<script setup>

import { ref, computed, watch } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "vue-chartjs";

import notas from "../../../../data/json/NotasRaw.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const props = defineProps({
    subjectCode: Number
});

const subjectData = computed(() => {

    return notas.filter(
        item => item["Código"] === props.subjectCode
    );

});

const years = computed(() => {

    return subjectData.value
        .map(item => item["Curso Académico"])
        .sort((a, b) => b.localeCompare(a));

});

const selectedYear = ref("");

watch(years, (newYears) => {

    if (newYears.length > 0) {

        selectedYear.value = newYears[0];

    }

}, { immediate: true });

const currentData = computed(() => {

    return subjectData.value.find(
        item => item["Curso Académico"] === selectedYear.value
    );

});

const enrolledStudents = computed(() => {

    if (!currentData.value) return 0;

    return (
        currentData.value["No pre"] +
        currentData.value["Sus"] +
        currentData.value["Apr"] +
        currentData.value["Not"] +
        currentData.value["Sob"] +
        currentData.value["MH"]
    );

});

const chartData = computed(() => {

    if (!currentData.value) {

        return {
            labels: [],
            datasets: []
        };

    }

    return {

        labels: [
            "No Pr",
            "Susp",
            "Apr",
            "Not",
            "Sob",
            "MH"
        ],

        datasets: [

            {

                data: [

                    Number(currentData.value["No pre %"]),
                    Number(currentData.value["Sus %"]),
                    Number(currentData.value["Apr %"]),
                    Number(currentData.value["Not %"]),
                    Number(currentData.value["Sob %"]),
                    Number(currentData.value["MH %"])

                ],

                backgroundColor: [
                    "#64748b",
                    "#ef4444",
                    "#22c55e",
                    "#3b82f6",
                    "#a855f7",
                    "#facc15"
                ],

                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.7

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

                stepSize: 10,

                callback: value => `${value}%`

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

        <h2>Distribución de calificaciones</h2>

        <select
            v-model="selectedYear"
            class="yearSelector"
        >

            <option
                v-for="year in years"
                :key="year"
                :value="year"
            >
                {{ year }}
            </option>

        </select>

    </div>

    <div class="chartContainer">

        <Bar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="panelFooter">

        <span>Matriculados</span>

        <strong>{{ enrolledStudents }}</strong>

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

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:18px;

}

.panelHeader h2{

    font-size:1rem;

    font-weight:600;

    color:white;

    margin:0;

}

.yearSelector{

    background:#273358;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:8px 12px;

    font-size:.9rem;

    cursor:pointer;

}

.yearSelector:focus{

    outline:none;

    border-color:#38bdf8;

}

.chartContainer{

    width:100%;

    height:250px;

}

.panelFooter{

    margin-top:12px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding-top:12px;

    border-top:1px solid rgba(255,255,255,.08);

    color:#cbd5e1;

    font-size:.95rem;

}

.panelFooter strong{

    color:white;

    font-size:1.15rem;

    font-weight:700;

}

</style>