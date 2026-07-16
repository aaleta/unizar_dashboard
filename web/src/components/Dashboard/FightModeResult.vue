<script setup>

import { computed } from "vue";

import notas from "../../../../data/json/NotasRaw.json";

const props = defineProps({

    fighter1: Object,
    fighter2: Object

});

const difficulty = subject => {

    const rows = notas.filter(r =>
        r["Código"] === subject.code
    );

    if (!rows.length) return 0;

    const years = [...new Set(
        rows.map(r => r["Curso Académico"])
    )]
        .sort((a,b)=>b.localeCompare(a))
        .slice(0,3);

    const recent = rows.filter(r =>
        years.includes(r["Curso Académico"])
    );

    let weighted = 0;
    let students = 0;

    recent.forEach(r=>{

        const total =
            r["No pre"]+
            r["Sus"]+
            r["Apr"]+
            r["Not"]+
            r["Sob"]+
            r["MH"];

        weighted +=
            (Number(r["Sus %"])+Number(r["No pre %"])) * total;

        students += total;

    });

    return students ? weighted/students : 0;

};

const popularity = subject => {

    const rows = notas.filter(r =>
        r["Código"] === subject.code
    );

    if(!rows.length) return 0;

    const years=[...new Set(
        rows.map(r=>r["Curso Académico"])
    )]
        .sort((a,b)=>b.localeCompare(a))
        .slice(0,3);

    const recent=rows.filter(r=>
        years.includes(r["Curso Académico"])
    );

    const students=recent.map(r=>

        r["No pre"]+
        r["Sus"]+
        r["Apr"]+
        r["Not"]+
        r["Sob"]+
        r["MH"]

    );

    return students.length
        ? students.reduce((a,b)=>a+b)/students.length
        :0;

};

const excellence = subject => {

    const rows = notas.filter(r =>
        r["Código"] === subject.code
    );

    if (!rows.length) return 0;

    const years = [...new Set(
        rows.map(r => r["Curso Académico"])
    )]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3);

    const recent = rows.filter(r =>
        years.includes(r["Curso Académico"])
    );

    let weighted = 0;
    let students = 0;

    recent.forEach(r => {

        const total =
            r["No pre"] +
            r["Sus"] +
            r["Apr"] +
            r["Not"] +
            r["Sob"] +
            r["MH"];

        const excellenceValue =
            Number(r["Sob %"]) +
            Number(r["MH %"]);

        weighted += excellenceValue * total;
        students += total;

    });

    return students
        ? weighted / students
        : 0;

};

const metrics = computed(()=>{

    return [

        {

            name:"Dificultad Media",

            first:difficulty(props.fighter1),

            second:difficulty(props.fighter2),

            higherIsBetter:false,

            suffix:" %"

        },

        {

            name:"Media de Matriculaciones",

            first:popularity(props.fighter1),

            second:popularity(props.fighter2),

            higherIsBetter:true,

            suffix:" alumnos"

        },

        {
            name: "Excelencia",

            first: excellence(props.fighter1),

            second: excellence(props.fighter2),

            higherIsBetter: true,

            suffix: " %"
        }

    ];

});

const winner = metric=>{

    if(metric.first===metric.second)
        return 0;

    if(metric.higherIsBetter){

        return metric.first>metric.second
            ?1
            :2;

    }

    return metric.first<metric.second
        ?1
        :2;

};

</script>

<template>

<div class="panel">

    <h2>Resultado del enfrentamiento</h2>

    <div class="fighters">

        <div class="fighterCard">

            <h3>{{ fighter1.name }}</h3>

        </div>

        <div class="vs">

            VS

        </div>

        <div class="fighterCard">

            <h3>{{ fighter2.name }}</h3>

        </div>

    </div>

    <div
        class="metric"
        v-for="metric in metrics"
        :key="metric.name"
    >

        <div
            class="value"
            :class="{ winner: winner(metric)==1 }"
        >

            <span class="number">

                {{ metric.first.toFixed(1) }}{{ metric.suffix }}

            </span>

        </div>

        <div class="metricName">

            {{ metric.name }}

        </div>

        <div
            class="value"
            :class="{ winner: winner(metric)==2 }"
        >

            <span class="number">

                {{ metric.second.toFixed(1) }}{{ metric.suffix }}

            </span>

        </div>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:100%;
    max-width:700px;

    margin:auto;

    padding:36px;

    background:#1f2937;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    display:flex;

    flex-direction:column;

    gap:28px;

    margin-left: 30%;

}

h2{

    margin:0 0 28px;

    color:white;

    text-align:center;

    font-size:1.6rem;

}

.fighters{

    display:grid;

    grid-template-columns:1fr auto 1fr;

    gap:20px;

    align-items:center;

    margin-bottom:30px;

}

.fighterCard{

    padding:18px;

    border-radius:14px;

    background:#0f172a;

    border:1px solid rgba(255,255,255,.08);

    text-align:center;

}

.fighterCard h3{

    margin:0;

    color:white;

    font-size:1rem;

    line-height:1.4;

}

.vs{

    color:#60a5fa;

    font-size:1.6rem;

    font-weight:bold;

}

.metric{

    display:grid;

    grid-template-columns:1fr 180px 1fr;

    gap:18px;

    align-items:center;

    margin-bottom:18px;

}

.metricName{

    color:#cbd5e1;

    text-align:center;

    font-weight:600;

}

.value{

    padding:14px;

    border-radius:12px;

    background:#111827;

    border:2px solid transparent;

    text-align:center;

    transition:.2s;

}

.number{

    color:white;

    font-size:1.1rem;

    font-weight:700;

}

.winner{

    border-color:#3b82f6;

    background:rgba(59,130,246,.12);

    box-shadow:0 0 18px rgba(59,130,246,.18);

}

@media(max-width:850px){

    .fighters{

        grid-template-columns:1fr;

    }

    .vs{

        text-align:center;

    }

    .metric{

        grid-template-columns:1fr;

        gap:10px;

    }

}

</style>