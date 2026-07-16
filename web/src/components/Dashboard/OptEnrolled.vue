<script setup>

import { computed } from "vue";

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

// Optativas únicas (3º y 4º)
const optionalSubjects = [
    ...new Map(
        [
            ...subjects.optativas["3"],
            ...subjects.optativas["4"]
        ].map(subject => [subject.code, subject])
    ).values()
];

// Ranking según la media de matriculados de los 3 últimos cursos
const ranking = computed(() => {

    return optionalSubjects

        .map(subject => {

            const rows = notas.filter(
                row => row["Código"] === subject.code
            );

            // Últimos tres cursos académicos
            const lastThreeYears = [...new Set(

                rows.map(row => row["Curso Académico"])

            )]
            .sort((a,b)=>b.localeCompare(a))
            .slice(0,3);

            // Filas de esos cursos
            const recentRows = rows.filter(row =>
                lastThreeYears.includes(row["Curso Académico"])
            );

            // Matriculados por curso
            const enrolledPerYear = recentRows.map(row =>

                Number(row["No pre"]) +

                Number(row["Sus"]) +

                Number(row["Apr"]) +

                Number(row["Not"]) +

                Number(row["Sob"]) +

                Number(row["MH"])

            );

            const average = enrolledPerYear.length
                ? enrolledPerYear.reduce((a,b)=>a+b,0) / enrolledPerYear.length
                : 0;

            return{

                code:subject.code,

                name:subject.name,

                enrolled:average

            };

        })

        .sort((a,b)=>b.enrolled-a.enrolled);

});

// Top 3
const topSubjects = computed(() =>
    ranking.value.slice(0,3)
);

// Bottom 3
const bottomSubjects = computed(() =>
    [...ranking.value]
        .reverse()
        .slice(0,3)
);

</script>

<template>

<div class="panel">

    <h2>Ranking de matriculación de optativas</h2>

    <h3 class="sectionTitle">

        Optativas más escogidas

    </h3>

    <div
        v-for="(subject,index) in topSubjects"
        :key="'top-'+subject.code"
        class="row"
    >

        <span class="position">

            {{ index+1 }}

        </span>

        <span class="name">

            {{ subject.name }}

        </span>

        <span class="value">

            {{ subject.enrolled.toFixed(1) }}

        </span>

    </div>

    <h3 class="sectionTitle bottomTitle">

        Optativas menos escogidas

    </h3>

    <div
        v-for="subject in bottomSubjects"
        :key="'bottom-'+subject.code"
        class="row"
    >

        <span class="bottomDot"></span>

        <span class="name">

            {{ subject.name }}

        </span>

        <span class="value">

            {{ subject.enrolled.toFixed(1) }}

        </span>

    </div>

    <div class="footerNote">

        <p>

            *La métrica corresponde a la media de matriculados en los tres cursos académicos más recientes.

        </p>

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

    border-color:#c084fc;

}

.panel h2{

    margin:0 0 20px;

    color:white;

}

.sectionTitle{

    margin:20px 0 12px;

    color:#38bdf8;

    font-size:1rem;

    font-weight:600;

}

.bottomTitle{

    color:#f87171;

}

.row{

    display:grid;

    grid-template-columns:42px 1fr auto;

    gap:14px;

    align-items:center;

    padding:12px 0;

    border-bottom:1px solid rgba(255,255,255,.06);

}

.row:last-child{

    border-bottom:none;

}

.position{

    width:34px;

    height:34px;

    border-radius:50%;

    display:flex;

    justify-content:center;

    align-items:center;

    font-weight:700;

    color:#111827;

}

.sectionTitle + .row .position{

    background:#facc15;

}

.sectionTitle + .row + .row .position{

    background:#cbd5e1;

}

.sectionTitle + .row + .row + .row .position{

    background:#fb923c;

}

.bottomDot{

    width:10px;

    height:10px;

    border-radius:50%;

    background:#64748b;

    justify-self:center;

    align-self:center;

}

.name{

    color:white;

    line-height:1.3;

}

.value{

    color:#38bdf8;

    font-weight:700;

}

.footerNote{

    margin-top:18px;

    padding-top:12px;

    border-top:1px solid rgba(255,255,255,.08);

}

.footerNote p{

    margin:0;

    font-size:.8rem;

    color:#94a3b8;

    line-height:1.4;

}

</style>