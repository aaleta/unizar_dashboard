<script setup>

/**
 * Tarjeta de indicador: rótulo, cifra grande y variación.
 *
 * Se apilan en rejillas de dos columnas en la portada y en la ficha. La cifra
 * es lo único que importa aquí, así que ocupa el peso visual entero.
 *
 * Sobre el color de la variación: NO significa "sube" o "baja", significa
 * "mejor" o "peor". Que la no superación suba 19 pp es malo y va en rojo; que
 * los aprobados suban 2 pp es bueno y se queda en carbón. Por eso hace falta
 * `higherIsBetter`: sin él, el color diría lo contrario en la mitad de los
 * casos. Es la misma decisión que ya tomaba el KpiCard de escritorio.
 *
 * Que "mejor" no tenga tinta propia es deliberado (ver --delta-good en
 * tokens.css): la paleta solo tiene una tinta directa y se la lleva el
 * deterioro. La flecha ▲/▼ va escrita al lado, así que la dirección no
 * depende del color en ningún caso.
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

    // Coma decimal: toda la web está en español y "1.79" se lee como otra cosa.
    const amount = Math.abs(props.delta).toFixed(decimals).replace(".", ",");

    return `${arrow} ${amount} ${props.deltaUnit}`.trim();

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

    border:var(--rule-strong) solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

    padding:11px 12px 12px;

    min-width:0;

}

/* El rótulo va separado de su cifra por una regla, como la casilla de un
   formulario técnico: primero cómo se llama el dato, luego el dato. */
.label{

    padding-bottom:5px;

    border-bottom:var(--rule) solid var(--line-inner);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow-sm);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--ink-soft);

}

/* La variación baja de línea cuando no cabe al lado de la cifra: a 320px de
   ancho, "10,375" y su delta no entran juntos en media columna, y la cifra no
   se recorta ni se encoge por nada. */
.line{

    display:flex;

    flex-wrap:wrap;

    align-items:baseline;

    gap:2px 6px;

    margin-top:6px;

}

.value{

    font-size:var(--text-kpi);

    letter-spacing:-.03em;

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

    margin-top:5px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    letter-spacing:.04em;

    color:var(--ink-faint);

}

</style>
