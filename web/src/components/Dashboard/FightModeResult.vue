<script setup>

import { computed } from "vue";

import {
    RECENT_YEARS,
    METRICS,
    subjectInfo,
    subjectRate,
    averageEnrolment,
    formatPct,
    formatNumber
} from "@/utils/metrics";

const props = defineProps({

    fighter1: Object,
    fighter2: Object

});

const tipoOf = subject => subjectInfo(subject.code)?.tipo ?? null;

// Solo la matriculación depende del carácter: comparar la popularidad de una
// troncal (obligatoria para todos) con la de una optativa no dice nada.
const bothOptional = computed(() =>
    tipoOf(props.fighter1) === "optativa" &&
    tipoOf(props.fighter2) === "optativa"
);

const metrics = computed(() => {

    const result = [];

    const rate = (key, label) => ({
        name: label ?? METRICS[key].label,
        definition: METRICS[key].definition,
        first: subjectRate(props.fighter1.code, key),
        second: subjectRate(props.fighter2.code, key),
        higherIsBetter: METRICS[key].higherIsBetter,
        format: formatPct
    });

    result.push(rate("noSuperacion", "Más fácil de superar"));
    result.push(rate("exito"));
    result.push(rate("noPresentados"));
    result.push(rate("excelencia"));

    if (bothOptional.value) {

        result.push({
            name: "Media de matriculados",
            definition:
                `Media de alumnos matriculados en los últimos ${RECENT_YEARS} cursos.`,
            first: averageEnrolment(props.fighter1.code),
            second: averageEnrolment(props.fighter2.code),
            higherIsBetter: true,
            format: value => `${formatNumber(value)} alumnos`
        });

    }

    return result;

});

const winner = metric => {

    if (metric.first === null || metric.second === null) return 0;

    if (metric.first === metric.second) return 0;

    if (metric.higherIsBetter) {

        return metric.first > metric.second ? 1 : 2;

    }

    return metric.first < metric.second ? 1 : 2;

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
            :class="{ winner: winner(metric) == 1 }"
        >

            <span class="number">

                {{ metric.format(metric.first) }}

            </span>

        </div>

        <div
            class="metricName"
            :title="metric.definition"
        >

            {{ metric.name }}

        </div>

        <div
            class="value"
            :class="{ winner: winner(metric) == 2 }"
        >

            <span class="number">

                {{ metric.format(metric.second) }}

            </span>

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

</style>