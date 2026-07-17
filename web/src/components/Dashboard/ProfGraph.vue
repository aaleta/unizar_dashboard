<script setup>

import { ref, watch, onMounted } from "vue";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.css";

import cache from "@/utils/NodesEdges";

const props = defineProps({

    year: String

});

const networkContainer = ref(null);

let network = null;

const options = {

    autoResize: true,

    nodes: {

        shape: "dot",

        scaling: {

            min: 12,

            max: 40

        },

        font: {

            color: "white",

            size: 16,

            face: "Inter"

        },

        color: {

            background: "#3b82f6",

            border: "#60a5fa",

            highlight: {

                background: "#2563eb",

                border: "#93c5fd"

            }

        },

        borderWidth: 2

    },

    edges: {

        color: "#64748b",

        smooth: {

            type: "dynamic"

        },

        width: 1

    },

    interaction: {

        hover: true,

        navigationButtons: true,

        zoomView: true,

        dragView: true

    },

    physics: {

        stabilization: {

            enabled: true,

            iterations: 300

        },

        barnesHut: {

            gravitationalConstant: -7000,

            springLength: 180,

            springConstant: 0.03

        }

    }

};

const drawGraph = () => {

    if(!networkContainer.value)
        return;

    const data = cache[props.year];

    if(!data)
        return;

    if(!network){

        network = new Network(

            networkContainer.value,

            data,

            options

        );

    }else{

        network.setData(data);

    }

};

onMounted(() => {

    drawGraph();

});

watch(

    () => props.year,

    () => {

        drawGraph();

    }

);

</script>

<template>

    <div class="graph">

        <div

            ref="networkContainer"

            class="network"

        ></div>

    </div>

</template>

<style scoped>

    .graph {
        flex:1;
        min-height:0;
        width:100%;
    }

    .network {
        width: 100%;
        height: 100%;
        background: #111827;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.08);
    }


    @media(max-width:768px){

        .graph {
            height: calc(100vh - 60px);
        }

        .network {
            height: calc(100vh - 60px);
            border-radius: 0;
        }

    }

</style>
