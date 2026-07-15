<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from "chart.js";

import { Radar } from "vue-chartjs";

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const props = defineProps({
    course: String
});

const courseSubjects = computed(() =>
    subjects.troncales[props.course] ?? []
);

const difficulty = subject => {

    const rows = notas.filter(
        r => r["Código"] === subject.code
    );

    if (!rows.length) return 0;

    const years = [...new Set(
        rows.map(r => r["Curso Académico"])
    )]
    .sort((a,b)=>b.localeCompare(a))
    .slice(0,3);

    const recentRows = rows.filter(r =>
        years.includes(r["Curso Académico"])
    );

    let weighted = 0;
    let totalStudents = 0;

    recentRows.forEach(row=>{

        const students =
            row["No pre"] +
            row["Sus"] +
            row["Apr"] +
            row["Not"] +
            row["Sob"] +
            row["MH"];

        const value =
            Number(row["Sus %"]) +
            Number(row["No pre %"]);

        weighted += value * students;
        totalStudents += students;

    });

    return totalStudents
        ? weighted / totalStudents
        : 0;

};

const chartData = computed(()=>({

    labels: courseSubjects.value.map(s=>s.name),

    datasets:[{

        label:"Dificultad",

        data: courseSubjects.value.map(difficulty),

        backgroundColor:"rgba(59,130,246,.25)",

        borderColor:"#3b82f6",

        borderWidth:2,

        pointBackgroundColor:"#3b82f6",

        pointRadius:4,

        fill:true

    }]

}));

const chartOptions={

    responsive:true,

    maintainAspectRatio:false,

    plugins:{
        legend:{
            display:false
        }
    },

    scales:{

        r:{

            beginAtZero:true,

            suggestedMax:40,

            angleLines:{
                color:"rgba(255,255,255,.15)"
            },

            grid:{
                color:"rgba(255,255,255,.10)"
            },

            pointLabels:{
                color:"white",
                font:{
                    size:12
                }
            },

            ticks:{
                display: false,

                backdropColor: "transparent"

            }

        }

    }

};

</script>

<template>

<div class="panel">

    <h2>Dificultad de las asignaturas</h2>

    <div class="chartContainer">

        <Radar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        Media ponderada de %(Suspensos + No Presentados) de los tres últimos cursos académicos.

    </div>

</div>

</template>

<style scoped>

.panel{

    width:520px;
    height:470px;

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

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

    height:360px;

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