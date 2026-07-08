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
import { callback } from "chart.js/helpers";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const props = defineProps({
    subjectCode:Number
})

const subjectData = computed(() => {

    return notas.filter(
        item => item["Código"] === props.subjectCode
    )

})

const years = computed(() => {

    return subjectData.value
        .map(item => item["Curso Académico"])
        .sort((a,b)=>b.localeCompare(a))

})

const selectedYear = ref("");

watch(years,(value)=>{

    if(value.length){

        selectedYear.value=value[0];

    }

},{immediate:true})

const currentData = computed(()=>{

    return subjectData.value.find(

        item=>item["Curso Académico"]===selectedYear.value

    )

})

const chartData = computed(()=>{

    if(!currentData.value){

        return{

            labels:[],
            datasets:[]

        }

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

        datasets:[

            {

                label:"Porcentaje",

                data:[

                    currentData.value["No pre %"],
                    currentData.value["Sus %"],
                    currentData.value["Apr %"],
                    currentData.value["Not %"],
                    currentData.value["Sob %"],
                    currentData.value["MH %"]

                ],

                backgroundColor:[
                    "#64748b", // No presentados
                    "#ef4444", // Suspensos
                    "#22c55e", // Aprobados
                    "#3b82f6", // Notables
                    "#a855f7", // Sobresalientes
                    "#facc15"  // MH
                ],

                borderRadius:8



            }

        ]

    }

})

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

            max: 100,

            ticks:{
                color:"#94a3b8",

                callback: function(value){
                    return value + "%";
                }
            },

            grid:{
                color:"rgba(255,255,255,.08)"
            }

        }

    }

}

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Distribución de calificaciones</h2>

        <select
            v-model="selectedYear"
        >

            <option
                v-for="year in years"
                :key="year"
                :value="year"
            >

                {{year}}

            </option>

        </select>

    </div>

    <div class="chartContainer">

        <Bar
            :data="chartData"
            :options="chartOptions"
        />

    </div>

</div>

</template>

<style scoped>

.panel{

    width:420px;
    height:340px;

    padding:22px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    box-shadow:
        0 10px 25px rgba(0,0,0,.25);

    transition:.25s;

}

.panel:hover{

    transform:translateY(-4px);

    border-color:#38bdf8;

    box-shadow:
        0 15px 35px rgba(0,0,0,.35);

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:18px;

}

.panelHeader h2{

    font-size:1rem;

    font-weight:600;

    color:white;

    margin:0;

}

.panelHeader select{

    background:#0f172a;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:8px 14px;

    cursor:pointer;

    transition:.2s;

}

.panelHeader select:hover{

    border-color:#38bdf8;

}

.panelHeader select:focus{

    outline:none;

    border-color:#38bdf8;

}

.chartContainer{

    width:100%;

    height:250px;

}

</style>