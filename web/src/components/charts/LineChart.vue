<script setup>

/**
 * Gráfica de líneas, en SVG a mano.
 *
 * Por qué no chart.js, que ya es dependencia: en el móvil hay UNA gráfica de
 * líneas. Traer una librería de dibujo entera —y su capa de tematizado, y su
 * canvas— para un solo gráfico sale caro en bytes y en peleas con el estilo:
 * este diseño quiere ejes en mono, sin rejilla y con los tonos del papel, que
 * en chart.js es media hora de opciones y aquí son cuatro atributos.
 *
 * En SVG además el texto es texto: se puede seleccionar, lo lee un lector de
 * pantalla y escala con el zoom del navegador. Un canvas es un mapa de bits.
 *
 * (chart.js sigue instalado porque lo usan los paneles de escritorio que aún
 * no se han migrado. Al terminar el rediseño habrá que mirar si se puede
 * quitar del todo.)
 */

import { computed } from "vue";

const props = defineProps({

    // [{ label, values: [n, n, …] }] — una entrada por línea.
    series: {
        type: Array,
        required: true
    },

    // Etiquetas del eje X, tantas como puntos.
    labels: {
        type: Array,
        required: true
    },

    // Colores, en el mismo orden que `series`.
    colors: {
        type: Array,
        required: true
    },

    // Cuántas etiquetas del eje X se pintan como mucho.
    maxTicks: {
        type: Number,
        default: 6
    },

    formatValue: {
        type: Function,
        default: value => String(Math.round(value))
    }

});

const WIDTH = 300;
const HEIGHT = 118;
const PAD = { left: 30, right: 12, top: 8, bottom: 20 };

const flat = computed(() =>
    props.series.flatMap(item => item.values).filter(value => value !== null)
);

/**
 * El eje NO arranca en cero: estas notas se mueven entre 5 y 13, y forzar el
 * cero aplastaría seis años de variación en una franja de nada. Se añade un
 * margen del 8 % arriba y abajo para que las líneas no toquen los bordes.
 */
const bounds = computed(() => {

    const min = Math.min(...flat.value);
    const max = Math.max(...flat.value);
    const margin = (max - min) * 0.08 || 1;

    return { min: min - margin, max: max + margin };

});

const x = index => {

    const count = props.labels.length;

    if (count <= 1) return PAD.left;

    const span = WIDTH - PAD.left - PAD.right;

    return PAD.left + (index / (count - 1)) * span;

};

const y = value => {

    const { min, max } = bounds.value;
    const span = HEIGHT - PAD.top - PAD.bottom;

    return PAD.top + span - ((value - min) / (max - min)) * span;

};

const paths = computed(() =>
    props.series.map((item, index) => ({
        color: props.colors[index],
        label: item.label,
        points: item.values
            .map((value, i) => (value === null ? null : `${x(i)},${y(value)}`))
            .filter(Boolean)
            .join(" "),
        last: {
            x: x(item.values.length - 1),
            y: y(item.values[item.values.length - 1])
        }
    }))
);

/** Tres marcas en el eje Y: abajo, en medio y arriba. */
const yTicks = computed(() => {

    const { min, max } = bounds.value;

    return [max, (max + min) / 2, min].map(value => ({
        value,
        y: y(value),
        text: props.formatValue(value)
    }));

});

/**
 * Con dieciséis años no caben dieciséis etiquetas en 300px: se reparten
 * uniformemente las que quepan, siempre incluyendo la primera y la última,
 * que son las que sitúan la serie.
 */
const xTicks = computed(() => {

    const count = props.labels.length;

    if (count <= props.maxTicks) {
        return props.labels.map((label, index) => ({ label, x: x(index) }));
    }

    const step = (count - 1) / (props.maxTicks - 1);

    return Array.from({ length: props.maxTicks }, (_, i) => {
        const index = Math.round(i * step);
        return { label: props.labels[index], x: x(index) };
    });

});

const describe = computed(() =>
    props.series
        .map(item => {
            const values = item.values.filter(value => value !== null);
            return `${item.label}: de ${props.formatValue(values[0])} `
                + `a ${props.formatValue(values[values.length - 1])}`;
        })
        .join(". ")
);

</script>

<template>

<figure class="chart">

    <figcaption class="legend">
        <span
            v-for="(item, index) in series"
            :key="item.label"
            class="legendItem"
        >
            <span
                class="swatch"
                :style="{ background: colors[index] }"
            ></span>
            {{ item.label }}
        </span>
    </figcaption>

    <svg
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        role="img"
        :aria-label="describe"
    >

        <line
            :x1="PAD.left"
            :y1="PAD.top"
            :x2="PAD.left"
            :y2="HEIGHT - PAD.bottom"
            class="axis"
        />
        <line
            :x1="PAD.left"
            :y1="HEIGHT - PAD.bottom"
            :x2="WIDTH - PAD.right"
            :y2="HEIGHT - PAD.bottom"
            class="axis"
        />

        <text
            v-for="tick in yTicks"
            :key="`y-${tick.value}`"
            :x="PAD.left - 6"
            :y="tick.y + 2.5"
            text-anchor="end"
            class="tick"
        >{{ tick.text }}</text>

        <polyline
            v-for="path in paths"
            :key="path.label"
            :points="path.points"
            :stroke="path.color"
            fill="none"
            stroke-width="2.4"
            stroke-linejoin="round"
            stroke-linecap="round"
        />

        <!-- Un punto en el último valor: es el que la gente busca. -->
        <circle
            v-for="path in paths"
            :key="`dot-${path.label}`"
            :cx="path.last.x"
            :cy="path.last.y"
            r="3"
            :fill="path.color"
        />

        <text
            v-for="tick in xTicks"
            :key="`x-${tick.label}`"
            :x="tick.x"
            :y="HEIGHT - PAD.bottom + 12"
            text-anchor="middle"
            class="tick"
        >{{ tick.label }}</text>

    </svg>

</figure>

</template>

<style scoped>

.chart{

    margin:0;

}

.legend{

    display:flex;

    flex-wrap:wrap;

    gap:14px;

    margin:9px 0 12px;

}

.legendItem{

    display:flex;

    align-items:center;

    gap:5px;

    font-size:var(--text-num-sm);

    color:var(--ink-muted);

}

.swatch{

    width:14px;

    height:3px;

    border-radius:2px;

}

svg{

    display:block;

    width:100%;

    height:auto;

}

.axis{

    stroke:var(--line);

    stroke-width:1;

}

.tick{

    font-family:var(--font-mono);

    font-size:7.5px;

    fill:var(--ink-faint);

}

</style>
