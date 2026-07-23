<script setup>

import { computed } from "vue";

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
    BASES,
    subjectRow,
    distribution,
    formatPct
} from "@/utils/metrics";

import { gradeColor } from "@/theme/gradePalette";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

const props = defineProps({

    subjectCode: Number,

    year: String,

    base: {
        type: String,
        default: "matriculados"
    }

});

const row = computed(() =>
    subjectRow(props.subjectCode, props.year)
);

const slices = computed(() =>
    distribution(row.value, props.base)
);

const baseCaption = computed(() =>
    BASES[props.base].caption
);

const chartData = computed(() => ({

    labels: slices.value.map(slice => slice.short),

    datasets: [{

        data: slices.value.map(slice => slice.pct ?? 0),

        backgroundColor: slices.value.map(slice => gradeColor(slice.key)),

        borderRadius: 8,

        borderSkipped: false,

        barPercentage: .7,

        categoryPercentage: .7

    }]

}));

const chartOptions = computed(() => ({

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            display: false

        },

        tooltip: {

            callbacks: {

                // Porcentaje Y recuento: sin la n, el porcentaje engaña.
                label: context => {

                    const slice = slices.value[context.dataIndex];

                    return `${slice.label}: ${formatPct(slice.pct)} (${slice.count} alumnos)`;

                }

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

                stepSize: 10,

                callback: value => `${value} %`

            },

            grid: {
                color: "rgba(255,255,255,.08)"
            }

        }

    }

}));

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Distribución de calificaciones</h2>

        <span class="yearTag">{{ year }}</span>

    </div>

    <template v-if="row">

        <div class="chartContainer">

            <Bar
                :data="chartData"
                :options="chartOptions"
            />

        </div>

        <!-- Alternativa textual al gráfico y fuente de los recuentos. -->
        <table class="dataTable">

            <caption class="sr-only">
                Distribución de calificaciones, {{ baseCaption }}
            </caption>

            <thead>
                <tr>
                    <th scope="col">Calificación</th>
                    <th scope="col">Alumnos</th>
                    <th scope="col">%</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="slice in slices"
                    :key="slice.key"
                >
                    <th scope="row">
                        <span
                            class="dot"
                            :style="{ background: gradeColor(slice.key) }"
                        ></span>
                        {{ slice.label }}
                    </th>
                    <td>{{ slice.count }}</td>
                    <td>{{ formatPct(slice.pct) }}</td>
                </tr>
            </tbody>

        </table>

        <p class="footer">{{ baseCaption }}.</p>

    </template>

    <div
        v-else
        class="empty"
    >
        No hay estadísticas para el curso {{ year }}.
    </div>

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

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:12px;

    margin-bottom:20px;

}

.panelHeader h2{

    margin:0;

    color:white;

    font-size:1.1rem;

    font-weight:600;

}

.yearTag{

    color:#94a3b8;

    font-size:.85rem;

    font-variant-numeric:tabular-nums;

}

.chartContainer{

    width:100%;

    height:260px;

}

.dataTable{

    width:100%;

    margin-top:18px;

    border-collapse:collapse;

    font-size:.85rem;

    color:#cbd5e1;

}

.dataTable th,
.dataTable td{

    padding:6px 8px;

    text-align:right;

    font-weight:500;

    border-bottom:1px solid rgba(255,255,255,.06);

}

.dataTable thead th{

    color:#94a3b8;

    font-size:.75rem;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.dataTable tbody th{

    text-align:left;

    color:white;

}

.dot{

    display:inline-block;

    width:9px;

    height:9px;

    margin-right:8px;

    border-radius:50%;

}

.footer{

    margin:14px 0 0;

    color:#64748b;

    font-size:.78rem;

}

.empty{

    display:flex;

    align-items:center;

    justify-content:center;

    min-height:200px;

    color:#94a3b8;

    font-style:italic;

    border:1px dashed rgba(255,255,255,.12);

    border-radius:12px;

}

.sr-only{

    position:absolute;

    width:1px;

    height:1px;

    overflow:hidden;

    clip:rect(0,0,0,0);

    white-space:nowrap;

}

</style>
