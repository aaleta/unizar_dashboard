<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.css";

import cache from "@/utils/NodesLinks";

const props = defineProps({
    year: String,

    // Peso mínimo de colaboración para dibujar una arista.
    minWeight: {
        type: Number,
        default: 0
    }
});

const networkContainer = ref(null);

let network = null;

/**
 * El grafo agregado tiene ~2000 aristas: sin filtrar es una madeja ilegible.
 * Se ocultan las colaboraciones por debajo del umbral y los profesores que
 * se quedan sin ninguna.
 */
const graph = computed(() => {
    const data = cache[props.year];

    if (!data) return { nodes: [], edges: [] };

    const edges = data.edges.filter(edge => edge.value >= props.minWeight);

    const connected = new Set(edges.flatMap(edge => [edge.from, edge.to]));

    return {
        nodes: data.nodes.filter(node => connected.has(node.id)),
        edges
    };
});

const stats = computed(() => ({
    professors: graph.value.nodes.length,
    links: graph.value.edges.length
}));

const options = {
    autoResize: true,

    nodes: {
        shape: "dot",

        scaling: {
            min: 10,
            max: 38
        },

        font: {
            color: "white",
            size: 15,
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
        // El grosor sale de edge.value = peso de colaboración.
        scaling: {
            min: 1,
            max: 12
        },

        color: {
            color: "#475569",
            highlight: "#38bdf8",
            hover: "#94a3b8"
        },

        // Las curvas cuestan muy caro con miles de aristas.
        smooth: false
    },

    interaction: {
        hover: true,
        navigationButtons: true,
        zoomView: true,
        dragView: true,
        tooltipDelay: 150
    },

    physics: {
        stabilization: {
            enabled: true,
            iterations: 200
        },

        barnesHut: {
            gravitationalConstant: -7000,
            springLength: 180,
            springConstant: 0.03
        }
    }
};

const drawGraph = () => {
    if (!networkContainer.value) return;

    if (!network) {
        network = new Network(networkContainer.value, graph.value, options);

        return;
    }

    network.setData(graph.value);
};

onMounted(drawGraph);

watch(graph, drawGraph);

onBeforeUnmount(() => {
    network?.destroy();
    network = null;
});
</script>

<template>
    <div class="graph">
        <div class="legend">
            <div class="legendItem">
                <span class="legendDot"></span>
                <span>
                    Tamaño del nodo = nº de asignaturas distintas que imparte
                </span>
            </div>

            <div class="legendItem">
                <span class="legendLines">
                    <span class="thin"></span>
                    <span class="thick"></span>
                </span>
                <span> Grosor del enlace = peso de la colaboración </span>
            </div>

            <div class="legendCount">
                {{ stats.professors }} profesores ·
                {{ stats.links }} colaboraciones
            </div>
        </div>

        <div
            v-show="stats.professors"
            ref="networkContainer"
            class="network"
        ></div>

        <p v-if="!stats.professors" class="empty">
            Ninguna colaboración supera el peso mínimo seleccionado. Baja el
            filtro para ver más.
        </p>
    </div>
</template>

<style scoped>
.graph {
    display: flex;

    flex-direction: column;

    gap: 14px;

    width: 100%;
}

.legend {
    display: flex;

    flex-wrap: wrap;

    align-items: center;

    gap: 22px;

    padding: 14px 18px;

    background: #1e293b;

    border: 1px solid rgba(255, 255, 255, 0.08);

    border-radius: 14px;

    color: #94a3b8;

    font-size: 0.82rem;
}

.legendItem {
    display: flex;

    align-items: center;

    gap: 10px;
}

.legendDot {
    width: 14px;

    height: 14px;

    border-radius: 50%;

    background: #3b82f6;

    border: 2px solid #60a5fa;

    flex-shrink: 0;
}

.legendLines {
    display: flex;

    flex-direction: column;

    gap: 4px;

    width: 26px;

    flex-shrink: 0;
}

.legendLines span {
    display: block;

    background: #475569;

    border-radius: 2px;
}

.legendLines .thin {
    height: 1px;
}

.legendLines .thick {
    height: 5px;
}

.legendCount {
    margin-left: auto;

    color: #cbd5e1;

    font-weight: 600;

    font-variant-numeric: tabular-nums;
}

.network {
    width: 100%;

    height: 70vh;

    min-height: 460px;

    background: #0b1220;

    border: 1px solid rgba(255, 255, 255, 0.08);

    border-radius: 16px;
}

.empty {
    display: flex;

    align-items: center;

    justify-content: center;

    min-height: 300px;

    margin: 0;

    color: #94a3b8;

    font-style: italic;

    border: 1px dashed rgba(255, 255, 255, 0.12);

    border-radius: 16px;
}
</style>
