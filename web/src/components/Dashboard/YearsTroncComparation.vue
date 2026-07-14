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

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const courses = ["1", "2", "3", "4"];

const courseAverage = (course) => {

    const courseSubjects = subjects.troncales[course];

    if (!courseSubjects || courseSubjects.length === 0) return 0;

    const subjectMeans = courseSubjects.map(subject => {

        const rows = notas.filter(
            row => row["Código"] === subject.code
        );

        if (rows.length === 0) return 0;

        const lastThreeYears = [...new Set(
            rows.map(row => row["Curso Académico"])
        )]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3);

        const recentRows = rows.filter(row =>
            lastThreeYears.includes(row["Curso Académico"])
        );

        if (recentRows.length === 0) return 0;

        const totalEnrolled = recentRows.reduce(

    (sum, row) =>

        sum +

        Number(row["No pre"]) +

        Number(row["Sus"]) +

        Number(row["Apr"]) +

        Number(row["Not"]) +

        Number(row["Sob"]) +

        Number(row["MH"]),

    0

);

if (totalEnrolled === 0) return 0;

const weightedAverage = recentRows.reduce(

    (sum, row) => {

        const enrolled =

            Number(row["No pre"]) +

            Number(row["Sus"]) +

            Number(row["Apr"]) +

            Number(row["Not"]) +

            Number(row["Sob"]) +

            Number(row["MH"]);

        return sum +

            (Number(row["Sus %"]) + Number(row["No pre %"])) * enrolled;

    },

    0

);

return weightedAverage / totalEnrolled;

    });

    return (

        subjectMeans.reduce((sum, value) => sum + value, 0)

        / subjectMeans.length

    );

};

const values = computed(() => courses.map(courseAverage));

const chartData = computed(() => ({

    labels: [

        "1º",

        "2º",

        "3º",

        "4º"

    ],

    datasets: [

        {

            label: "Media % Suspensos + No Presentados",

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

                label: context =>

                    `${context.raw.toFixed(2)} %`

            }

        }

    },

    scales: {

        x: {

            beginAtZero: true,

            suggestedMax: 40,

            ticks: {

                color: "#cbd5e1",

                callback: value => value + "%"

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

        *Media ponderada del porcentaje de suspensos y no presentados de las asignaturas troncales durante los tres cursos académicos más recientes.

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