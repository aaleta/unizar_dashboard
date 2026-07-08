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
            "No Presentados",
            "Suspensos",
            "Aprobados",
            "Notables",
            "Sobresalientes",
            "MH"
        ],

        datasets:[

            {

                label:"Número de alumnos",

                data:[

                    currentData.value["No pre"],
                    currentData.value["Sus"],
                    currentData.value["Apr"],
                    currentData.value["Not"],
                    currentData.value["Sob"],
                    currentData.value["MH"]

                ]

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

        y:{

            beginAtZero:true

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

    width:100%;

    background:white;

    border-radius:15px;

    padding:25px;

    box-shadow:0 4px 12px rgba(0,0,0,.08);

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

}

.panelHeader h2{

    margin:0;

    font-size:22px;

}

.panelHeader select{

    padding:8px 12px;

    font-size:16px;

    border-radius:8px;

}

.chartContainer{

    width:100%;

    height:450px;

}

</style>