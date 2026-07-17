<script setup>

import { computed } from "vue";

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

const props = defineProps({

    fighter1: Object,
    fighter2: Object

});

const optionalCodes = new Set(

    Object.values(subjects.optativas)
        .flat()
        .map(subject => subject.code)

);

const coreCodes = new Set(

    Object.values(subjects.troncales)
        .flat()
        .map(subject => subject.code)

);

const bothCore = computed(() =>

    coreCodes.has(props.fighter1.code) &&
    coreCodes.has(props.fighter2.code)

);

const bothOptional = computed(() =>

    optionalCodes.has(props.fighter1.code) &&
    optionalCodes.has(props.fighter2.code)

);

const incompatibleComparison = computed(() =>

    !bothCore.value && !bothOptional.value

);

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
            (Number(r["Sob %"])+Number(r["MH %"])) * total;

        students += total;

    });

    return students
        ? weighted/students
        :0;

};

const metrics = computed(() => {

    const result = [];

    if (bothCore.value) {

        result.push({

            name: "Más Fácil",

            first: difficulty(props.fighter1),

            second: difficulty(props.fighter2),

            higherIsBetter: false,

            suffix: " %"

        });

    }

    if (bothOptional.value) {

        result.push({

            name: "Media de Matriculaciones",

            first: popularity(props.fighter1),

            second: popularity(props.fighter2),

            higherIsBetter: true,

            suffix: " alumnos"

        });

    }

    result.push({

        name: "Excelencia",

        first: excellence(props.fighter1),

        second: excellence(props.fighter2),

        higherIsBetter: true,

        suffix: " %"

    });

    return result;

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

<div
    v-if="incompatibleComparison"
    class="panel errorPanel"
>

    <h2>Imposible</h2>

    <p>

        Solo se pueden comparar dos asignaturas del mismo carácter (troncal - optativa).

    </p>

</div>

<div
    v-else
    class="panel"
>

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
            :class="{ winner: winner(metric) == 1 }"
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
            :class="{ winner: winner(metric) == 2 }"
        >

            <span class="number">

                {{ metric.second.toFixed(1) }}{{ metric.suffix }}

            </span>

        </div>

    </div>

</div>

</div>

</template>

<style scoped>

.panel{

    width:100%;

    max-width:700px;

    margin:40px auto;

    padding:36px;

    background:#1f2937;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    display:flex;

    flex-direction:column;

    gap:28px;

    box-sizing:border-box;

    margin-top: 0%;

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


@media(max-width:768px){

    .panel{

        max-width:100%;

        margin:20px auto;

        padding:22px 18px;

        gap:22px;

        border-radius:14px;

        margin-bottom: 90px;

    }

    h2{

        font-size:1.35rem;

        margin-bottom:20px;

    }

    .fighters{

        grid-template-columns:1fr;

        gap:14px;

        margin-bottom:22px;

    }

    .vs{

        text-align:center;

        font-size:1.4rem;

    }

    .fighterCard{

        padding:16px;

    }

    .fighterCard h3{

        font-size:.95rem;

    }

    .metric{

        grid-template-columns:1fr;

        gap:10px;

        margin-bottom:20px;

    }

    .metricName{

        font-size:.95rem;

    }

    .value{

        padding:12px;

    }

    .number{

        font-size:1rem;

    }

}

.errorPanel{

    text-align:center;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    gap:18px;

    min-height:260px;

}

.errorPanel h2{

    margin:0;

    color:#f87171;

}

.errorPanel p{

    max-width:500px;

    color:#cbd5e1;

    line-height:1.7;

}

</style>