<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "vue-chartjs";

import {
    METRICS,
    RECENT_YEARS,
    academicYears,
    subjectInfo,
    subjectRow,
    subjectRate,
    coreSubjects,
    allOptionalSubjects,
    weightedRate,
    formatPct
} from "@/utils/metrics";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

const props = defineProps({

    subjectCode: Number

});

const info = computed(() =>
    subjectInfo(props.subjectCode)
);

/**
 * Grupo de comparación: una troncal se compara con las troncales de su curso;
 * una optativa, con el resto de optativas del grado.
 */
const peers = computed(() => {

    if (!info.value) return [];

    if (info.value.tipo === "optativa") return allOptionalSubjects;

    return coreSubjects(info.value.courses[0]);

});

const peerLabel = computed(() => {

    if (!info.value) return "el grado";

    return info.value.tipo === "optativa"
        ? "las optativas del grado"
        : `las troncales de ${info.value.courses[0]}º`;

});

const otherPeers = computed(() =>
    peers.value.filter(
        subject => Number(subject.code) !== props.subjectCode
    )
);

const peerRateForYear = (metricKey, year) =>
    weightedRate(
        peers.value
            .map(subject => subjectRow(subject.code, year))
            .filter(Boolean),
        metricKey
    );

const peerRate = metricKey =>
    weightedRate(
        peers.value.flatMap(subject => {

            const rows = [];

            academicYears.slice(-RECENT_YEARS).forEach(year => {

                const row = subjectRow(subject.code, year);

                if (row) rows.push(row);

            });

            return rows;

        }),
        metricKey
    );

/* --- Titular: posición en el ranking de dificultad del grupo ----------- */

const ranking = computed(() =>

    peers.value
        .map(subject => ({
            code: Number(subject.code),
            value: subjectRate(subject.code, "noSuperacion")
        }))
        .filter(item => item.value !== null)
        .sort((a, b) => b.value - a.value)

);

const position = computed(() => {

    const index = ranking.value.findIndex(
        item => item.code === props.subjectCode
    );

    return index === -1 ? null : index + 1;

});

const subjectValue = computed(() =>
    subjectRate(props.subjectCode, "noSuperacion")
);

const groupValue = computed(() =>
    peerRate("noSuperacion")
);

const gap = computed(() =>
    subjectValue.value !== null && groupValue.value !== null
        ? subjectValue.value - groupValue.value
        : null
);

const verdict = computed(() => {

    if (gap.value === null) return "sin datos suficientes";

    // Umbral relativo: 3 pp es mucho cuando el grupo ronda el 5 % (optativas)
    // y poco cuando ronda el 25 % (troncales de 1º).
    const threshold = Math.max(2, groupValue.value * 0.15);

    if (Math.abs(gap.value) < threshold) return "en la media";

    return gap.value > 0
        ? "por encima de la media"
        : "por debajo de la media";

});

/* --- Gráfico: rendimiento de la asignatura vs media del grupo ---------- */

const COMPARISON_METRIC = "rendimiento";

const chartData = computed(() => ({

    labels: academicYears,

    datasets: [

        {

            label: "Esta asignatura",

            data: academicYears.map(year => {

                const row = subjectRow(props.subjectCode, year);

                return row
                    ? METRICS[COMPARISON_METRIC].compute(row)
                    : null;

            }),

            borderColor: "#38bdf8",

            backgroundColor: "#38bdf8",

            borderWidth: 3,

            pointRadius: 4,

            pointHoverRadius: 7,

            tension: .3,

            spanGaps: true

        },

        {

            label: `Media de ${peerLabel.value}`,

            data: academicYears.map(year =>
                peerRateForYear(COMPARISON_METRIC, year)
            ),

            borderColor: "#94a3b8",

            backgroundColor: "#94a3b8",

            borderWidth: 2,

            borderDash: [6, 4],

            pointRadius: 3,

            pointHoverRadius: 6,

            tension: .3,

            spanGaps: true

        }

    ]

}));

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

        mode: "index",

        intersect: false

    },

    plugins: {

        legend: {

            position: "bottom",

            labels: {

                color: "white",

                usePointStyle: true,

                pointStyle: "line",

                boxWidth: 24,

                padding: 16,

                font: {
                    size: 11,
                    weight: "600"
                }

            }

        },

        tooltip: {

            callbacks: {

                label: context =>
                    `${context.dataset.label}: ${formatPct(context.raw)}`

            }

        }

    },

    scales: {

        x: {

            ticks: {
                color: "#cbd5e1"
            },

            grid: {
                display: false
            }

        },

        y: {

            beginAtZero: true,

            max: 100,

            ticks: {

                color: "#94a3b8",

                callback: value => `${value} %`

            },

            grid: {
                color: "rgba(255,255,255,.08)"
            }

        }

    }

};

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Comparación con {{ peerLabel }}</h2>

    </div>

    <p
        v-if="position"
        class="headline"
    >
        Es la
        <strong>{{ position }}ª asignatura con más no superación</strong>
        de {{ ranking.length }}, y está
        <strong :class="gap > 0 ? 'worse' : 'better'">{{ verdict }}</strong>:
        {{ formatPct(subjectValue) }} frente al {{ formatPct(groupValue) }}
        del grupo en los últimos {{ RECENT_YEARS }} cursos.
    </p>

    <div class="chartContainer">

        <Line
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <p class="footer">

        Tasa de rendimiento: {{ METRICS.rendimiento.definition }}
        La media del grupo está ponderada por número de matriculados y se calcula
        sobre {{ otherPeers.length + 1 }} asignaturas.

    </p>

</div>

</template>

<style scoped>

.panel{

    display:flex;

    flex-direction:column;

    padding:24px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    min-width:0;

}

.panelHeader h2{

    margin:0 0 16px;

    color:white;

    font-size:1.1rem;

    font-weight:600;

}

.headline{

    margin:0 0 18px;

    padding:14px 16px;

    border-radius:12px;

    background:rgba(56,189,248,.08);

    color:#cbd5e1;

    font-size:.95rem;

    line-height:1.6;

}

.headline strong{

    color:white;

}

.headline .worse{

    color:#f87171;

}

.headline .better{

    color:#4ade80;

}

.chartContainer{

    width:100%;

    height:320px;

}

.footer{

    margin:14px 0 0;

    color:#64748b;

    font-size:.78rem;

    line-height:1.5;

}

</style>
