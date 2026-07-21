<script setup>

import { computed } from "vue";

import {
    MIN_COHORT,
    subjectSummary,
    formatPct,
    formatNumber
} from "@/utils/metrics";

const props = defineProps({

    code: Number

});

/**
 * Antes todas las tarjetas eran idénticas y el listado no informaba de nada.
 * Con dos cifras por tarjeta la propia lista ya orienta.
 */
const summary = computed(() => subjectSummary(props.code));

const smallCohort = computed(() =>
    summary.value.recentStudents > 0 &&
    summary.value.recentStudents < MIN_COHORT
);

</script>

<template>

<RouterLink
    class="card"
    :class="summary.tipo"
    :to="`/asignatura/${summary.code}`"
>

    <h3>{{ summary.name }}</h3>

    <div
        v-if="summary.yearsWithData"
        class="stats"
    >

        <div class="stat">
            <span class="statValue">
                {{ formatNumber(summary.enrolment, 0) }}
            </span>
            <span class="statLabel">matriculados</span>
        </div>

        <div class="stat">
            <span class="statValue">
                {{ formatPct(summary.rendimiento, 0) }}
            </span>
            <span class="statLabel">aprueban</span>
        </div>

        <div class="stat">
            <span class="statValue">
                {{ formatPct(summary.noPresentados, 0) }}
            </span>
            <span class="statLabel">no se presentan</span>
        </div>

    </div>

    <p
        v-else
        class="noData"
    >
        Sin estadísticas publicadas.
    </p>

    <p
        v-if="smallCohort"
        class="warn"
    >
        ⚠ Menos de {{ MIN_COHORT }} alumnos: porcentajes poco fiables.
    </p>

    <span class="cta">Ver dashboard →</span>

</RouterLink>

</template>

<style scoped>

.card{

    display:flex;

    flex-direction:column;

    gap:14px;

    padding:22px;

    border-radius:16px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    color:white;

    text-decoration:none;

    transition:.2s;

    min-width:0;

}

.card:hover{

    transform:translateY(-4px);

    border-color:#38bdf8;

}

.card.optativa:hover{

    border-color:#a855f7;

}

h3{

    margin:0;

    font-size:1.05rem;

    font-weight:600;

    line-height:1.35;

}

.stats{

    display:flex;

    flex-wrap:wrap;

    gap:18px;

    margin-top:auto;

}

.stat{

    display:flex;

    flex-direction:column;

    gap:2px;

}

.statValue{

    color:white;

    font-size:1.15rem;

    font-weight:700;

    font-variant-numeric:tabular-nums;

}

.statLabel{

    color:#94a3b8;

    font-size:.72rem;

}

.noData{

    margin:0;

    color:#94a3b8;

    font-size:.85rem;

    font-style:italic;

}

.warn{

    margin:0;

    color:#fde68a;

    font-size:.75rem;

}

.cta{

    color:#38bdf8;

    font-size:.85rem;

    font-weight:600;

}

.card.optativa .cta{

    color:#d8b4fe;

}

</style>
