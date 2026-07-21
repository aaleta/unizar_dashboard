<script setup>

import { ref, computed } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "vue-chartjs";

import {
    RECENT_YEARS,
    METRICS,
    coreSubjects,
    optionalSubjectsOf,
    subjectRate,
    subjectName,
    averageEnrolment,
    formatPct
} from "@/utils/metrics";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const props = defineProps({

    // La vista pasa un número; las claves del JSON son cadenas.
    course: [String, Number]

});

/**
 * 3º y 4º son medio optativos, así que se puede incluirlas; por defecto se
 * comparan solo las troncales, que son las que cursa todo el mundo.
 */
const includeOptional = ref(false);

const hasOptional = computed(() =>
    optionalSubjectsOf(props.course).length > 0
);

const subjects = computed(() => {

    const core = coreSubjects(props.course).map(subject => ({
        ...subject,
        tipo: "troncal"
    }));

    if (!includeOptional.value) return core;

    const optional = optionalSubjectsOf(props.course).map(subject => ({
        ...subject,
        tipo: "optativa"
    }));

    return [...core, ...optional];

});

// Barras ordenadas: la comparación se lee de arriba abajo sin buscar.
const ranked = computed(() =>

    subjects.value
        .map(subject => ({
            code: subject.code,
            tipo: subject.tipo,
            name: subjectName(subject.code),
            value: subjectRate(subject.code, "noSuperacion"),
            enrolment: averageEnrolment(subject.code)
        }))
        .filter(item => item.value !== null)
        .sort((a, b) => b.value - a.value)

);

const hardestSubject = computed(() =>
    ranked.value.length ? ranked.value[0] : null
);

const chartData = computed(() => ({

    labels: ranked.value.map(item => item.name),

    datasets: [

        {

            label: METRICS.noSuperacion.label,

            data: ranked.value.map(item => item.value),

            backgroundColor: ranked.value.map(item =>
                item.tipo === "optativa" ? "#a855f7" : "#3b82f6"
            ),

            borderRadius: 6,

            barThickness: 16

        }

    ]

}));

const chartOptions = computed(() => ({

    responsive: true,

    maintainAspectRatio: false,

    indexAxis: "y",

    plugins: {

        legend: {
            display: false
        },

        tooltip: {

            callbacks: {

                label: context => {

                    const item = ranked.value[context.dataIndex];

                    return `${formatPct(item.value)} no supera · ${Math.round(item.enrolment)} matriculados de media`;

                }

            }

        }

    },

    scales: {

        x: {

            beginAtZero: true,

            ticks: {
                color: "#cbd5e1",
                callback: value => `${value} %`
            },

            grid: {
                color: "rgba(255,255,255,.08)"
            }

        },

        y: {

            ticks: {
                color: "white",
                font: {
                    size: 12
                }
            },

            grid: {
                display: false
            }

        }

    }

}));

// Altura proporcional al nº de barras: si no, se aplastan unas sobre otras.
const chartHeight = computed(() =>
    Math.max(260, ranked.value.length * 30 + 60)
);

</script>

<template>

<div class="panel">

    <div class="header">

        <div>

            <span class="badge">
                {{ course }}º curso
            </span>

            <h2>Dificultad de las asignaturas</h2>

            <p class="subtitle">
                <strong>{{ METRICS.noSuperacion.label }}</strong>:
                {{ METRICS.noSuperacion.definition }}
                Media ponderada por matriculados de los últimos
                {{ RECENT_YEARS }} cursos académicos.
            </p>

            <label
                v-if="hasOptional"
                class="toggle"
            >
                <input
                    v-model="includeOptional"
                    type="checkbox"
                >
                Incluir optativas del curso
            </label>

        </div>

        <div
            v-if="hardestSubject"
            class="highlight"
        >

            <span class="highlightTitle">
                Asignatura más difícil
            </span>

            <h3>{{ hardestSubject.name }}</h3>

            <div class="difficultyValue">
                {{ formatPct(hardestSubject.value) }}
            </div>

        </div>

    </div>

    <div
        class="chartContainer"
        :style="{ height: `${chartHeight}px` }"
    >

        <Bar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

    <div class="footer">

        <span class="legendItem">
            <span class="legendDot core"></span> Troncal
        </span>

        <span
            v-if="includeOptional"
            class="legendItem"
        >
            <span class="legendDot optional"></span> Optativa
        </span>

        <span class="legendNote">
            Barras más largas = más alumnos no superan la asignatura.
        </span>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:100%;

    padding:30px;

    box-sizing:border-box;

    background:#1e293b;

    border-radius:20px;

    border:1px solid rgba(255,255,255,.08);

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:flex-start;

    gap:30px;

    margin-bottom:26px;

}

.badge{

    display:inline-block;

    padding:6px 12px;

    border-radius:999px;

    background:rgba(59,130,246,.18);

    color:#93c5fd;

    font-size:.8rem;

    font-weight:700;

    letter-spacing:.5px;

    margin-bottom:12px;

}

.header h2{

    margin:0 0 10px;

    color:white;

    font-size:1.4rem;

    font-weight:700;

}

.subtitle{

    max-width:640px;

    margin:0;

    color:#94a3b8;

    font-size:.88rem;

    line-height:1.6;

}

.subtitle strong{

    color:#cbd5e1;

}

.toggle{

    display:inline-flex;

    align-items:center;

    gap:8px;

    margin-top:14px;

    color:#cbd5e1;

    font-size:.85rem;

    cursor:pointer;

}

.toggle input{

    accent-color:#38bdf8;

    cursor:pointer;

}

.highlight{

    flex-shrink:0;

    min-width:200px;

    padding:18px 20px;

    border-radius:16px;

    background:rgba(239,68,68,.1);

    border:1px solid rgba(239,68,68,.25);

    text-align:right;

}

.highlightTitle{

    color:#fca5a5;

    font-size:.72rem;

    font-weight:700;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.highlight h3{

    margin:8px 0 10px;

    color:white;

    font-size:1.05rem;

    line-height:1.35;

}

.difficultyValue{

    color:#f87171;

    font-size:1.6rem;

    font-weight:700;

}

.chartContainer{

    width:100%;

}

.footer{

    display:flex;

    flex-wrap:wrap;

    align-items:center;

    gap:18px;

    margin-top:20px;

    padding-top:16px;

    border-top:1px solid rgba(255,255,255,.08);

    color:#94a3b8;

    font-size:.8rem;

}

.legendItem{

    display:flex;

    align-items:center;

    gap:8px;

}

.legendDot{

    width:11px;

    height:11px;

    border-radius:3px;

}

.legendDot.core{

    background:#3b82f6;

}

.legendDot.optional{

    background:#a855f7;

}

.legendNote{

    margin-left:auto;

    color:#64748b;

}

@media(max-width:768px){

    .panel{

        padding:20px;

    }

    .header{

        flex-direction:column;

        gap:18px;

    }

    .highlight{

        width:100%;

        text-align:left;

    }

    .legendNote{

        margin-left:0;

    }

}

</style>
