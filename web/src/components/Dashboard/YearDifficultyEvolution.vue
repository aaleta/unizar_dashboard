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

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const props = defineProps({
    course: String
});

const courseSubjects = computed(() =>
    subjects.troncales[props.course] ?? []
);


const years = computed(() => {

    return [...new Set(

        notas.map(r => r["Curso Académico"])

    )].sort();

});

const values = computed(() =>

    years.value.map(year => {

        let weighted = 0;
        let studentsTotal = 0;

        courseSubjects.value.forEach(subject => {

            const row = notas.find(r =>

                r["Código"] === subject.code &&
                r["Curso Académico"] === year

            );

            if (!row) return;

            const students =

                row["No pre"] +
                row["Sus"] +
                row["Apr"] +
                row["Not"] +
                row["Sob"] +
                row["MH"];

            const difficulty =

                Number(row["Sus %"]) +
                Number(row["No pre %"]);

            weighted += difficulty * students;
            studentsTotal += students;

        });

        return studentsTotal
            ? weighted / studentsTotal
            : null;

    })

);

const chartData = computed(() => ({

    labels: years.value,

    datasets: [

        {

            label: "Dificultad media",

            data: values.value,

            borderColor: "#3b82f6",

            backgroundColor: "rgba(59,130,246,.18)",

            fill: true,

            tension: .35,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointBackgroundColor: "#60a5fa",

            pointBorderColor: "#fff",

            pointBorderWidth: 2

        }

    ]

}));

const maxValue = computed(() =>

    Math.ceil(Math.max(...values.value.filter(v => v !== null)) + 5)

);

const chartOptions = computed(() => ({

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            display: false

        },

        tooltip: {

            callbacks: {

                label: ctx =>

                    `${ctx.raw.toFixed(2)} %`

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

            suggestedMax: maxValue.value,

            ticks: {

                color: "#94a3b8",

                callback: value => value + "%"

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

    <h2>

        Evolución de la dificultad del curso

    </h2>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        Media ponderada del porcentaje de
        <strong>Suspensos + No Presentados</strong>
        considerando el número de matriculados
        de todas las asignaturas troncales del curso.

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