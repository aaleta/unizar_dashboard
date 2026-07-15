<script setup>

import { computed } from "vue";

import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from "chart.js";

import { Radar } from "vue-chartjs";

import notas from "../../../../data/json/NotasRaw.json";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const props = defineProps({
    course: String
});

const courseSubjects = computed(() =>
    subjects.troncales[props.course] ?? []
);

const difficulty = (subject) => {

    const rows = notas.filter(
        r => r["Código"] === subject.code
    );

    if (!rows.length) return 0;

    const years = [...new Set(
        rows.map(r => r["Curso Académico"])
    )]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3);

    const recentRows = rows.filter(r =>
        years.includes(r["Curso Académico"])
    );

    let weighted = 0;
    let totalStudents = 0;

    recentRows.forEach(row => {

        const students =
            row["No pre"] +
            row["Sus"] +
            row["Apr"] +
            row["Not"] +
            row["Sob"] +
            row["MH"];

        const difficultyValue =
            Number(row["Sus %"]) +
            Number(row["No pre %"]);

        weighted += difficultyValue * students;
        totalStudents += students;

    });

    return totalStudents
        ? weighted / totalStudents
        : 0;

};

const values = computed(() =>
    courseSubjects.value.map(difficulty)
);

const maxDifficulty = computed(() => {

    if (!values.value.length) return 40;

    return Math.ceil(Math.max(...values.value) + 5);

});

const hardestSubject = computed(() => {

    if (!courseSubjects.value.length) return null;

    let hardest = courseSubjects.value[0];
    let max = difficulty(hardest);

    courseSubjects.value.forEach(subject => {

        const value = difficulty(subject);

        if (value > max) {

            max = value;
            hardest = subject;

        }

    });

    return {

        name: hardest.name,
        difficulty: max

    };

});

const chartData = computed(() => ({

    labels: courseSubjects.value.map(
        s => s.name
    ),

    datasets: [

        {

            label: "Dificultad",

            data: values.value,

            backgroundColor(context) {

                const chart = context.chart;
                const { ctx, chartArea } = chart;

                if (!chartArea)
                    return "rgba(59,130,246,.25)";

                const gradient = ctx.createLinearGradient(
                    0,
                    chartArea.top,
                    0,
                    chartArea.bottom
                );

                gradient.addColorStop(
                    0,
                    "rgba(59,130,246,.45)"
                );

                gradient.addColorStop(
                    1,
                    "rgba(59,130,246,.08)"
                );

                return gradient;

            },

            borderColor: "#60a5fa",

            borderWidth: 4,

            pointRadius: 6,

            pointHoverRadius: 9,

            pointBackgroundColor: "#60a5fa",

            pointBorderColor: "#ffffff",

            pointBorderWidth: 2,

            fill: true

        }

    ]

}));

const chartOptions = computed(() => ({

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            display: false

        },

        tooltip: {

            backgroundColor: "#0f172a",

            borderColor: "#3b82f6",

            borderWidth: 1,

            padding: 12,

            callbacks: {

                label: context =>

                    `${context.label}: ${context.raw.toFixed(1)} %`

            }

        }

    },

    scales: {

        r: {

            beginAtZero: true,

            suggestedMax: maxDifficulty.value,

            angleLines: {

                color: "rgba(255,255,255,.18)"

            },

            grid: {

                color: "rgba(255,255,255,.12)"

            },

            pointLabels: {

                color: "white",

                font: {

                    size: 15,
                    weight: "bold"

                }

            },

            ticks: {

                display: false,

                backdropColor: "transparent"

            }

        }

    }

}));

</script>

<template>

<div class="panel">

    <div class="header">

        <div>

            <span class="badge">
                Curso {{ course }}
            </span>

            <h2>

                Dificultad de las asignaturas

            </h2>

            <p class="subtitle">

                Media ponderada del porcentaje de
                <strong>Suspensos + No Presentados</strong>
                durante los tres cursos académicos más recientes.

            </p>

        </div>

        <div
            v-if="hardestSubject"
            class="highlight"
        >

            <span class="highlightTitle">

                Asignatura más difícil

            </span>

            <h3>

                {{ hardestSubject.name }}

            </h3>

            <div class="difficultyValue">

                {{ hardestSubject.difficulty.toFixed(1) }}%

            </div>

        </div>

    </div>

    <div class="chartContainer">

        <Radar

            :data="chartData"

            :options="chartOptions"

        />

    </div>

    <div class="footer">

        <div class="legend">

            <div class="legendDot"></div>

            <span>

                Cuanto más alejado del centro,
                mayor dificultad presenta la asignatura.

            </span>

        </div>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:min(950px,95vw);

    min-height:760px;

    margin:auto;

    padding:34px;

    background:linear-gradient(
        180deg,
        #1f2937 0%,
        #172033 100%
    );

    border-radius:26px;

    border:1px solid rgba(255,255,255,.08);

    box-shadow:
        0 18px 50px rgba(0,0,0,.35);

    transition:.3s;

}

.panel:hover{

    transform:translateY(-6px);

    border-color:#60a5fa;

    box-shadow:
        0 25px 60px rgba(0,0,0,.45);

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:flex-start;

    gap:30px;

    margin-bottom:35px;

}

.badge{

    display:inline-block;

    padding:8px 14px;

    border-radius:999px;

    background:rgba(59,130,246,.18);

    color:#93c5fd;

    font-size:.85rem;

    font-weight:700;

    letter-spacing:.5px;

    margin-bottom:16px;

}

.header h2{

    margin:0;

    color:white;

    font-size:2rem;

    font-weight:700;

}

.subtitle{

    margin-top:12px;

    color:#94a3b8;

    max-width:600px;

    line-height:1.7;

    font-size:1rem;

}

.subtitle strong{

    color:white;

}

.highlight{

    min-width:260px;

    padding:22px;

    border-radius:18px;

    background:linear-gradient(
        135deg,
        rgba(59,130,246,.18),
        rgba(30,64,175,.35)
    );

    border:1px solid rgba(96,165,250,.35);

    text-align:center;

    box-shadow:
        inset 0 0 25px rgba(255,255,255,.03);

}

.highlightTitle{

    color:#bfdbfe;

    font-size:.85rem;

    text-transform:uppercase;

    letter-spacing:1px;

}

.highlight h3{

    margin:18px 0;

    color:white;

    font-size:1.3rem;

    line-height:1.35;

}

.difficultyValue{

    display:inline-flex;

    justify-content:center;

    align-items:center;

    padding:12px 24px;

    border-radius:999px;

    background:#3b82f6;

    color:white;

    font-size:2rem;

    font-weight:700;

    box-shadow:
        0 10px 25px rgba(59,130,246,.35);

}

.chartContainer{

    width:100%;

    height:560px;

}

.footer{

    margin-top:28px;

    padding-top:20px;

    border-top:1px solid rgba(255,255,255,.08);

}

.legend{

    display:flex;

    align-items:center;

    justify-content:center;

    gap:12px;

    color:#94a3b8;

    font-size:.95rem;

}

.legendDot{

    width:14px;

    height:14px;

    border-radius:50%;

    background:#60a5fa;

    box-shadow:
        0 0 12px rgba(96,165,250,.7);

}

@media(max-width:900px){

    .panel{

        width:100%;

        min-height:auto;

        padding:24px;

    }

    .header{

        flex-direction:column;

        align-items:center;

        text-align:center;

    }

    .subtitle{

        max-width:100%;

    }

    .highlight{

        width:100%;

        max-width:420px;

    }

    .chartContainer{

        height:420px;

    }

    .header h2{

        font-size:1.6rem;

    }

}

</style>