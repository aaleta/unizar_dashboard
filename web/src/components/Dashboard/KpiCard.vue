<script setup>

import { computed } from "vue";

const props = defineProps({

    label: String,

    // Valor ya formateado ("78.2 %", "99")
    value: String,

    // Variación frente a la referencia, en puntos porcentuales. null = sin referencia.
    delta: {
        type: Number,
        default: null
    },

    // Si es false, un delta positivo se pinta como algo malo.
    higherIsBetter: {
        type: Boolean,
        default: true
    },

    // Definición de la métrica: qué se divide entre qué.
    definition: String,

    // Unidad de la variación. "pp" solo vale para tasas: la nota de corte se
    // mueve en puntos de la nota de acceso, no en puntos porcentuales.
    deltaUnit: {
        type: String,
        default: "pp"
    },

    // Umbral por debajo del cual la variación es ruido, en unidades de delta.
    deltaThreshold: {
        type: Number,
        default: 0.5
    },

    // Denominador ("% sobre matriculados"), siempre visible.
    base: String,

    // Texto de la referencia con la que se compara el delta.
    reference: String

});

// Variaciones por debajo del umbral son ruido, no tendencia.
const meaningfulDelta = computed(() =>
    props.delta !== null && Math.abs(props.delta) >= props.deltaThreshold
);

const deltaTone = computed(() => {

    if (!meaningfulDelta.value) return "flat";

    const improving = props.delta > 0 === props.higherIsBetter;

    return improving ? "good" : "bad";

});

const deltaText = computed(() => {

    if (props.delta === null) return "";

    if (!meaningfulDelta.value) return "Sin cambios";

    const sign = props.delta > 0 ? "+" : "−";

    const decimals = props.deltaUnit === "pp" ? 1 : 2;

    return `${sign}${Math.abs(props.delta).toFixed(decimals)} ${props.deltaUnit}`.trim();

});

</script>

<template>

<div class="kpi">

    <div class="kpiLabel">

        <span>{{ label }}</span>

        <span
            v-if="definition"
            class="info"
            :title="definition"
            tabindex="0"
            role="note"
            :aria-label="definition"
        >
            ⓘ
        </span>

    </div>

    <div class="kpiValue">
        {{ value }}
    </div>

    <div class="kpiFooter">

        <span
            v-if="delta !== null"
            class="delta"
            :class="deltaTone"
            :title="reference ? `Frente a ${reference}` : ''"
        >
            {{ deltaText }}
        </span>

        <span
            v-if="base"
            class="base"
        >
            {{ base }}
        </span>

    </div>

</div>

</template>

<style scoped>

.kpi{

    display:flex;

    flex-direction:column;

    gap:8px;

    padding:20px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:16px;

    min-width:0;

}

.kpiLabel{

    display:flex;

    align-items:center;

    gap:6px;

    color:#94a3b8;

    font-size:.85rem;

    font-weight:600;

    text-transform:uppercase;

    letter-spacing:.5px;

}

.info{

    cursor:help;

    color:#64748b;

    font-size:.9rem;

}

.info:hover,
.info:focus{

    color:#38bdf8;

}

.kpiValue{

    color:white;

    font-size:2rem;

    font-weight:700;

    line-height:1.1;

}

.kpiFooter{

    display:flex;

    flex-wrap:wrap;

    align-items:baseline;

    gap:10px;

    font-size:.78rem;

}

.delta{

    font-weight:700;

}

.delta.good{

    color:#22c55e;

}

.delta.bad{

    color:#ef4444;

}

.delta.flat{

    color:#94a3b8;

}

.base{

    color:#64748b;

}

</style>
