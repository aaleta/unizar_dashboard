<script setup>

import { computed } from "vue";

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

// Todas las asignaturas troncales sin duplicados
const allSubjects = [
    ...new Map(
        [
            ...subjects.troncales["1"],
            ...subjects.troncales["2"],
            ...subjects.troncales["3"],
            ...subjects.troncales["4"]
        ].map(subject => [subject.code, subject])
    ).values()
];

const mostFeared = computed(() => {

    const ranking = allSubjects.map(subject => {

        const rows = notas.filter(
            row => row["Código"] === subject.code
        );

        if (rows.length === 0) {

            return {
                code: subject.code,
                name: subject.name,
                fear: 0
            };

        }

        const lastThreeYears = [...new Set(
            rows.map(row => row["Curso Académico"])
        )]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3);

        const recentRows = rows.filter(row =>
            lastThreeYears.includes(row["Curso Académico"])
        );

        const fear = recentRows.reduce(

            (sum, row) =>

                sum +

                Number(row["Sus %"]) +

                Number(row["No pre %"]),

            0

        ) / recentRows.length;

        return {

            code: subject.code,

            name: subject.name,

            fear

        };

    });

    ranking.sort((a, b) => b.fear - a.fear);

    return ranking[0];

});

</script>

<template>

<div class="panel">

    <h2>La asignatura más temida del grado</h2>


    <h3>

        {{ mostFeared.name }}

    </h3>

    <div class="score">

        {{ mostFeared.fear.toFixed(1) }}%

    </div>

    <p class="description">

        Media de <strong>Suspensos + No Presentados</strong>
        durante los tres cursos académicos más recientes.

    </p>

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

    border-color:#ef4444;

}

h2{

    margin:0;

    color:white;

    font-size:1.15rem;

}

.medal{

    font-size:4rem;

    margin:25px 0 18px;

}

h3{

    color:white;

    font-size:1.35rem;

    margin-bottom:18px;

    line-height:1.4;

}

.score{

    display:inline-block;

    padding:10px 22px;

    border-radius:30px;

    background:#ef4444;

    color:white;

    font-size:2rem;

    font-weight:700;

}

.description{

    margin-top:25px;

    color:#94a3b8;

    line-height:1.5;

    font-size:.9rem;

}

.description strong{

    color:white;

}

</style>