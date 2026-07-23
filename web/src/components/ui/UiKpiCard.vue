<script setup>

/**
 * Tarjeta de indicador: rótulo, cifra grande y variación.
 *
 * Se apilan en rejillas de dos columnas en la portada y en la ficha. La cifra
 * es lo único que importa aquí, así que ocupa el peso visual entero.
 *
 * Sobre el color de la variación: NO significa "sube" o "baja", significa
 * "mejor" o "peor". Que la no superación suba 19 pp es malo y va en rojo; que
 * los aprobados suban 2 pp es bueno y va en verde. Por eso hace falta
 * `higherIsBetter`: sin él, el color diría lo contrario en la mitad de los
 * casos. Es la misma decisión que ya tomaba el KpiCard de escritorio.
 *
 * `tone="difficulty"` pinta la cifra con la rampa. Solo vale para la tasa de
 * no superación: es la única que mide dificultad.
 */

import { computed } from "vue";

import { difficultyInk } from "@/theme/difficulty";

const props = defineProps({

    label: {
        type: String,
        required: true
    },

    // Cifra ya formateada ("61%", "1,57", "139").
    value: {
        type: String,
        required: true
    },

    // Variación numérica. null = no hay referencia con la que comparar.
    delta: {
        type: Number,
        default: null
    },

    deltaUnit: {
        type: String,
        default: "pp"
    },

    higherIsBetter: {
        type: Boolean,
        default: true
    },

    // Por debajo de esto la variación es ruido y se calla.
    deltaThreshold: {
        type: Number,
        default: 0.5
    },

    // Contra qué se compara ("vs. media de 3 cursos").
    reference: {
        type: String,
        default: null
    },

    tone: {
        type: String,
        default: "ink",
        validator: value => ["ink", "difficulty"].includes(value)
    },

    // Solo se lee cuando tone === 'difficulty'.
    difficultyValue: {
        type: Number,
        default: null
    }

});

const meaningful = computed(() =>
    props.delta !== null && Math.abs(props.delta) >= props.deltaThreshold
);

const deltaTone = computed(() => {

    if (!meaningful.value) return "flat";

    return props.delta > 0 === props.higherIsBetter ? "good" : "bad";

});

const deltaText = computed(() => {

    if (props.delta === null) return null;

    if (!meaningful.value) return "sin cambios";

    const arrow = props.delta > 0 ? "▲" : "▼";

    const decimals = props.deltaUnit === "pp" ? 0 : 2;

    return `${arrow} ${Math.abs(props.delta).toFixed(decimals)} ${props.deltaUnit}`;

});

const valueColor = computed(() =>
    props.tone === "difficulty"
        ? difficultyInk(props.difficultyValue)
        : "var(--ink)"
);

</script>

<template>

<div class="kpi">

    <div class="label">
        {{ label }}
    </div>

    <div class="line">

        <span
            class="value num"
            :style="{ color: valueColor }"
        >
            {{ value }}
        </span>

        <span
            v-if="deltaText"
            class="delta"
            :class="deltaTone"
        >
            {{ deltaText }}
        </span>

    </div>

    <div
        v-if="reference"
        class="reference"
    >
        {{ reference }}
    </div>

</div>

</template>

<style scoped>

.kpi{

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

    padding:12px 13px;

    min-width:0;

}

.label{

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow-sm);

    font-weight:500;

    letter-spacing:.4px;

    text-transform:uppercase;

    color:var(--ink-soft);

}

.line{

    display:flex;

    align-items:baseline;

    gap:6px;

    margin-top:5px;

}

.value{

    font-size:var(--text-kpi);

    line-height:1;

}

.delta{

    font-size:var(--text-num-sm);

    font-weight:700;

    white-space:nowrap;

}

.delta.good{

    color:var(--delta-good);

}

.delta.bad{

    color:var(--delta-bad);

}

.delta.flat{

    color:var(--delta-flat);

}

.reference{

    margin-top:4px;

    font-size:var(--text-eyebrow);

    color:var(--ink-faint);

}

</style>
