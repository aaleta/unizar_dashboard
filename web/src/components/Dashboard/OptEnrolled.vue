<script setup>

import { computed } from "vue";

import {
    RECENT_YEARS,
    allOptionalSubjects,
    averageEnrolment,
    subjectName,
    formatNumber
} from "@/utils/metrics";

const ranking = computed(() =>

    allOptionalSubjects
        .map(subject => ({
            code: subject.code,
            name: subjectName(subject.code),
            enrolled: averageEnrolment(subject.code)
        }))
        .sort((a, b) => b.enrolled - a.enrolled)

);

const topSubjects = computed(() =>
    ranking.value.slice(0, 3)
);

const bottomSubjects = computed(() =>
    [...ranking.value].reverse().slice(0, 3)
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

            {{ formatNumber(subject.enrolled, 1) }}

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

            {{ formatNumber(subject.enrolled, 1) }}

        </span>

    </div>

    <div class="footerNote">

        <p>

            Media de alumnos matriculados en los últimos {{ RECENT_YEARS }}
            cursos académicos con datos.

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