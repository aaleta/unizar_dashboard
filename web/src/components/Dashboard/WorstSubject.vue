<script setup>

import { computed } from "vue";

import {
    RECENT_YEARS,
    METRICS,
    allCoreSubjects,
    subjectRate,
    subjectName,
    formatPct
} from "@/utils/metrics";

// Ranking por tasa de no superación (suspensos + no presentados sobre
// matriculados), agregada y ponderada sobre los últimos cursos.
const mostFeared = computed(() => {

    const ranking = allCoreSubjects
        .map(subject => ({
            code: subject.code,
            name: subjectName(subject.code),
            value: subjectRate(subject.code, "noSuperacion")
        }))
        .filter(item => item.value !== null)
        .sort((a, b) => b.value - a.value);

    return ranking.slice(0, 5);

});

</script>

<template>

<div class="panel">

    <h2>Las asignaturas más temidas del grado</h2>

    <ol class="ranking">

        <li
            v-for="(subject, index) in mostFeared"
            :key="subject.code"
            :class="{ leader: index === 0 }"
        >

            <span class="position">{{ index + 1 }}</span>

            <RouterLink
                class="name"
                :to="`/asignatura/${subject.code}`"
            >
                {{ subject.name }}
            </RouterLink>

            <span class="score">{{ formatPct(subject.value) }}</span>

        </li>

    </ol>

    <p class="description">

        <strong>{{ METRICS.noSuperacion.label }}</strong>:
        {{ METRICS.noSuperacion.definition }}
        Media ponderada por matriculados de los últimos
        {{ RECENT_YEARS }} cursos académicos, solo troncales.

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

    display:flex;

    flex-direction:column;

    align-items:stretch;

    text-align:left;
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

.ranking{

    list-style:none;

    margin:20px 0 0;

    padding:0;

    display:flex;

    flex-direction:column;

    gap:2px;

}

.ranking li{

    display:grid;

    grid-template-columns:28px 1fr auto;

    align-items:center;

    gap:12px;

    padding:11px 8px;

    border-bottom:1px solid rgba(255,255,255,.06);

}

.ranking li:last-child{

    border-bottom:none;

}

.position{

    color:#64748b;

    font-size:.85rem;

    font-weight:700;

    text-align:center;

}

.name{

    color:#cbd5e1;

    font-size:.95rem;

    text-decoration:none;

    line-height:1.35;

}

.name:hover{

    color:#38bdf8;

    text-decoration:underline;

}

.score{

    color:#f87171;

    font-size:1.05rem;

    font-weight:700;

    font-variant-numeric:tabular-nums;

}

.ranking li.leader .name{

    color:white;

    font-weight:600;

}

.ranking li.leader .score{

    color:#ef4444;

    font-size:1.25rem;

}

.description{

    margin-top:20px;

    color:#94a3b8;

    line-height:1.5;

    font-size:.9rem;

    max-width:none;

}

.description strong{

    color:white;

}
</style>