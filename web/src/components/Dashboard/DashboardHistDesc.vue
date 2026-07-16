<script setup>

import { ref, computed, watch } from "vue";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "vue-chartjs";

import notas from "../../../../data/json/NotasRaw.json";
import asignaturas from "../../../../data/json/processed/Profesores_GuiasDoc.json";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const props = defineProps({
    subjectCode: Number
});


const gradeData = computed(() =>

    notas.filter(
        item => item["Código"] === props.subjectCode
    )

);


const infoData = computed(() =>

    asignaturas.filter(
        item => Number(item.id_asignatura) === props.subjectCode
    )

);


const years = computed(() => {

    const gradeYears = gradeData.value.map(
        item => item["Curso Académico"]
    );

    const infoYears = infoData.value.map(
        item => item.anyo_academico
    );

    return [

        ...new Set([

            ...gradeYears,

            ...infoYears

        ])

    ].sort((a,b)=>b.localeCompare(a));

});


const selectedYear = ref("");

watch(

    years,

    (newYears)=>{

        if(newYears.length){

            selectedYear.value=newYears[0];

        }

    },

    {immediate:true}

);

const currentGrade = computed(()=>{

    return gradeData.value.find(

        item=>item["Curso Académico"]===selectedYear.value

    );

});


const currentInfo = computed(()=>{

    return infoData.value.find(

        item=>item.anyo_academico===selectedYear.value

    );

});


const enrolledStudents = computed(()=>{

    if(!currentGrade.value) return 0;

    return (

        Number(currentGrade.value["No pre"])+

        Number(currentGrade.value["Sus"])+

        Number(currentGrade.value["Apr"])+

        Number(currentGrade.value["Not"])+

        Number(currentGrade.value["Sob"])+

        Number(currentGrade.value["MH"])

    );

});


const professors = computed(()=>{

    return currentInfo.value?.profesores ?? [];

});


const webGuide = computed(()=>{

    const url=currentInfo.value?.guia_docente_web;

    return url && url!=="No disponible"

        ? url

        : null;

});

const pdfGuide = computed(()=>{

    const url=currentInfo.value?.guia_docente_pdf;

    return url && url!=="No disponible"

        ? url

        : null;

});


const chartData = computed(()=>{

    if(!currentGrade.value){

        return{

            labels:[],

            datasets:[]

        };

    }

    return{

        labels:[

            "No Pr",

            "Susp",

            "Apr",

            "Not",

            "Sob",

            "MH"

        ],

        datasets:[{

            data:[

                Number(currentGrade.value["No pre %"]),

                Number(currentGrade.value["Sus %"]),

                Number(currentGrade.value["Apr %"]),

                Number(currentGrade.value["Not %"]),

                Number(currentGrade.value["Sob %"]),

                Number(currentGrade.value["MH %"])

            ],

            backgroundColor:[

                "#64748b",

                "#ef4444",

                "#22c55e",

                "#3b82f6",

                "#a855f7",

                "#facc15"

            ],

            borderRadius:8,

            borderSkipped:false,

            barPercentage:.7,

            categoryPercentage:.7

        }]

    };

});

const chartOptions={

    responsive:true,

    maintainAspectRatio:false,

    plugins:{

        legend:{

            display:false

        }

    },

    scales:{

        x:{

            ticks:{

                color:"#cbd5e1"

            },

            grid:{

                display:false

            }

        },

        y:{

            beginAtZero:true,

            max:100,

            ticks:{

                color:"#94a3b8",

                stepSize:10,

                callback:value=>`${value}%`

            },

            grid:{

                color:"rgba(255,255,255,.08)"

            }

        }

    }

};

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Información de la asignatura</h2>

        <select
            v-model="selectedYear"
            class="yearSelector"
        >

            <option
                v-for="year in years"
                :key="year"
                :value="year"
            >
                {{ year }}
            </option>

        </select>

    </div>

    <div class="content">

        <div class="leftColumn">

            <template v-if="currentGrade">

                <div class="chartContainer">

                    <Bar
                        :data="chartData"
                        :options="chartOptions"
                    />

                </div>

                <div class="panelFooter">

                    <span>Matriculados</span>

                    <strong>{{ enrolledStudents }}</strong>

                </div>

            </template>

            <template v-else>

                <div class="noChart">

                    <p>

                        No existen estadísticas para este curso académico.

                    </p>

                </div>

            </template>

        </div>

        <div class="rightColumn">

            <template v-if="currentInfo">

                <h3>Profesores</h3>

                <ul class="teacherList">

                    <li
                        v-for="teacher in professors"
                        :key="teacher"
                    >
                        {{ teacher }}
                    </li>

                </ul>

                <h3>Guía docente</h3>

                <div class="links">

                    <a
                        v-if="webGuide"
                        :href="webGuide"
                        target="_blank"
                        rel="noopener"
                    >
                        Guía Docente Web
                    </a>

                    <a
                        v-if="pdfGuide"
                        :href="pdfGuide"
                        target="_blank"
                        rel="noopener"
                    >
                        Descargar Guía Docente PDF
                    </a>

                    <span
                        v-if="!webGuide && !pdfGuide"
                        class="noData"
                    >
                        No hay guía docente disponible.
                    </span>

                </div>

            </template>

            <template v-else>

                <div class="emptyInfo">

                    <p>

                        No hay información docente para este curso académico.

                    </p>

                </div>

            </template>

        </div>

    </div>

</div>

</template>

<style scoped>

.panel{

    width:900px;

    min-height:420px;

    padding:24px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    box-shadow:0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#38bdf8;

    box-shadow:0 15px 35px rgba(0,0,0,.35);

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:24px;

}

.panelHeader h2{

    margin:0;

    color:white;

    font-size:1.1rem;

    font-weight:600;

}

.yearSelector{

    background:#273358;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:8px 12px;

    font-size:.9rem;

    cursor:pointer;

}

.yearSelector:focus{

    outline:none;

    border-color:#38bdf8;

}

.content{

    display:grid;

    grid-template-columns:2fr 1fr;

    gap:30px;

    align-items:start;

}

.leftColumn{

    display:flex;

    flex-direction:column;

}

.chartContainer{

    width:100%;

    height:280px;

}

.panelFooter{

    margin-top:15px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding-top:14px;

    border-top:1px solid rgba(255,255,255,.08);

    color:#cbd5e1;

    font-size:.95rem;

}

.panelFooter strong{

    color:white;

    font-size:1.15rem;

    font-weight:700;

}

.rightColumn{

    border-left:1px solid rgba(255,255,255,.08);

    padding-left:24px;

}

.rightColumn h3{

    margin:0 0 12px;

    color:white;

    font-size:1rem;

    font-weight:600;

}

.teacherList{

    margin:0 0 28px;

    padding-left:20px;

    color:#cbd5e1;

    line-height:1.8;

}

.teacherList li{

    margin-bottom:4px;

}

.links{

    display:flex;

    flex-direction:column;

    gap:12px;

}

.links a{

    color:#38bdf8;

    text-decoration:none;

    font-weight:600;

    transition:.2s;

}

.links a:hover{

    color:#7dd3fc;

    transform:translateX(5px);

}

.noData{

    color:#94a3b8;

    font-style:italic;

}

.noChart,

.emptyInfo{

    height:320px;

    display:flex;

    justify-content:center;

    align-items:center;

    text-align:center;

    color:#94a3b8;

    font-style:italic;

    border:1px dashed rgba(255,255,255,.12);

    border-radius:12px;

}

@media(max-width:950px){

    .panel{

        width:100%;

        max-width:100%;

        margin:0 auto;

        padding:16px;

        box-sizing:border-box;

        overflow:hidden;

    }

    .content{

        display:grid;

        grid-template-columns:1fr;

        gap:20px;

    }

    .leftColumn{

        min-width:0;

    }

    .rightColumn{

        min-width:0;

        border-left:none;

        border-top:1px solid rgba(255,255,255,.08);

        padding-left:0;

        padding-top:20px;

    }

    .panelHeader{

        flex-direction:column;

        align-items:flex-start;

        gap:12px;

    }

    .panelFooter{

        flex-direction:column;

        align-items:flex-start;

        gap:10px;

    }

}

</style>