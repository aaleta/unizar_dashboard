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

const optionalSubjects = [
    ...new Map(
        [
            ...subjects.optativas["3"],
            ...subjects.optativas["4"]
        ].map(subject => [subject.code, subject])
    ).values()
];

const averageEnrollment = (subject) => {

    const rows = notas.filter(
        row => row["Código"] === subject.code
    );

    if (rows.length === 0) return 0;

    const lastThreeYears = [...new Set(
        rows.map(row => row["Curso Académico"])
    )]
    .sort((a,b)=>b.localeCompare(a))
    .slice(0,3);

    const recentRows = rows.filter(row =>
        lastThreeYears.includes(row["Curso Académico"])
    );

    if(recentRows.length===0) return 0;

    const total = recentRows.reduce((sum,row)=>

        sum +

        Number(row["No pre"]) +

        Number(row["Sus"]) +

        Number(row["Apr"]) +

        Number(row["Not"]) +

        Number(row["Sob"]) +

        Number(row["MH"])

    ,0);

    return total / recentRows.length;

};

const ranking = computed(()=>

    optionalSubjects

        .map(subject=>({

            name:subject.name,

            average:averageEnrollment(subject)

        }))

        .sort((a,b)=>b.average-a.average)

);

const chartData = computed(()=>({

    labels:ranking.value.map(item=>item.name),

    datasets:[{

        label:"Media de matriculados",

        data:ranking.value.map(item=>item.average),

        backgroundColor:"#a855f7",

        borderRadius:8,

        barThickness:18

    }]

}));

const chartOptions={

    responsive:true,

    maintainAspectRatio:false,

    indexAxis:"y",

    plugins:{

        legend:{
            display:false
        },

        tooltip:{
            callbacks:{
                label:ctx=>`${ctx.raw.toFixed(1)} alumnos`
            }
        }

    },

    scales:{

        x:{

            beginAtZero:true,

            ticks:{
                color:"#cbd5e1"
            },

            grid:{
                color:"rgba(255,255,255,.08)"
            }

        },

        y:{

            ticks:{
                color:"white",
                font:{
                    size:11
                }
            },

            grid:{
                display:false
            }

        }

    }

};

</script>

<template>

<div class="panel">

    <h2>Media de matriculados por optativa</h2>

    <div class="chartContainer">

        <Bar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        Media del número de matriculados durante los tres cursos académicos más recientes.

    </div>

</div>

</template>

<style scoped>

.panel{

    width:100%;

    max-width:700px;

    padding:22px;

    background:#1e293b;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

    box-sizing:border-box;

    margin-bottom: 90px;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#a855f7;

}

.panel h2{

    margin:0 0 18px;

    color:white;

    font-size:1.15rem;

}

.chartContainer{

    width:100%;

    height:650px;

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