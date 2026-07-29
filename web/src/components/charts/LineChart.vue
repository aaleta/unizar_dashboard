<script setup>
/**
 * Gráfica de líneas, en SVG a mano.
 *
 * Por qué no chart.js, que ya es dependencia: en el móvil hay UNA gráfica de
 * líneas. Traer una librería de dibujo entera —y su capa de tematizado, y su
 * canvas— para un solo gráfico sale caro en bytes y en peleas con el estilo:
 * este diseño quiere ejes en mono, guías de puntos y los tonos del papel, que
 * en chart.js es media hora de opciones y aquí son cuatro atributos.
 *
 * En SVG además el texto es texto: se puede seleccionar, lo lee un lector de
 * pantalla y escala con el zoom del navegador. Un canvas es un mapa de bits.
 *
 * (chart.js sigue instalado porque lo usan los paneles de escritorio que aún
 * no se han migrado. Al terminar el rediseño habrá que mirar si se puede
 * quitar del todo.)
 */

import { computed, ref } from "vue";

import { useViewport } from "@/composables/useViewport";

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
    },

    /**
     * Mínimo fijo del eje Y. Sin él, el eje se ajusta a los datos (lo que
     * quieren las notas de acceso, que viven entre 5 y 13); con él, la serie
     * se lee sobre una base absoluta (un porcentaje contra 0 no exagera la
     * variación).
     */
    yMin: {
        type: Number,
        default: null
    },

    /**
     * El lienzo del viewBox, no el tamaño en pantalla: el SVG siempre se
     * estira al ancho de su hueco. Lo que fija es la PROPORCIÓN y, con ella,
     * cuánto aire queda entre las guías. Los valores por defecto son los del
     * móvil, donde la gráfica ocupa una tarjeta de una columna.
     *
     * Ojo al cambiarlos: los tamaños de letra de los ejes están en unidades
     * del viewBox, así que un lienzo más ancho encoge la letra en pantalla.
     */
    width: {
        type: Number,
        default: 300
    },

    height: {
        type: Number,
        default: 118
    },

    /**
     * El lienzo de escritorio, donde el hueco es dos veces más ancho. No se
     * puede resolver con una media query —el viewBox es un atributo, no un
     * estilo—, así que el conmutador vive aquí y no en cada pantalla: una
     * gráfica que sabe medirse ahorra un consumidor de useViewport por vista.
     */
    desktopWidth: {
        type: Number,
        default: null
    },

    desktopHeight: {
        type: Number,
        default: null
    }
});

const { isDesktop } = useViewport();

/** ¿Estamos pintando en el lienzo ancho? */
const wide = computed(() => isDesktop.value && props.desktopWidth !== null);

const canvas = computed(() => ({
    width: wide.value ? props.desktopWidth : props.width,
    height: wide.value ? (props.desktopHeight ?? props.height) : props.height
}));

/**
 * Márgenes y tamaño de las etiquetas, en unidades del viewBox. En el lienzo
 * ancho el SVG se pinta casi a escala 1:1, así que las mismas cifras que en el
 * móvil se verían la mitad de grandes; en el estrecho el navegador lo estira
 * 1,6 veces y hay que compensar al revés.
 */
const pad = computed(() =>
    wide.value
        ? { left: 38, right: 16, top: 12, bottom: 26 }
        : { left: 30, right: 12, top: 8, bottom: 20 }
);

const tickSize = computed(() => (wide.value ? 9.5 : 7.5));

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

    return {
        min: props.yMin ?? min - margin,
        max: max + margin
    };
});

const x = index => {
    const count = props.labels.length;

    if (count <= 1) return pad.value.left;

    const span = canvas.value.width - pad.value.left - pad.value.right;

    return pad.value.left + (index / (count - 1)) * span;
};

const y = value => {
    const { min, max } = bounds.value;
    const span = canvas.value.height - pad.value.top - pad.value.bottom;

    return pad.value.top + span - ((value - min) / (max - min)) * span;
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
 * Guías horizontales, a la altura de cada marca del eje Y. Sin ellas hay que
 * estimar a ojo dónde cae un punto entre dos números del eje, y con un lienzo
 * de este alto ese ojo se equivoca.
 *
 * La de abajo se cae: su altura es exactamente la del eje X, así que solo
 * serviría para ensuciar de puntos una línea que ya está pintada.
 */
const yGrid = computed(() => yTicks.value.slice(0, -1));

/**
 * Con dieciséis años no caben dieciséis etiquetas en el ancho del lienzo: se
 * reparten
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

/* ------------------------------------------------------------------ *
 * Interacción
 * ------------------------------------------------------------------ *
 * En una gráfica de dieciséis años, la pregunta que no responde el dibujo es
 * "¿cuánto exactamente?". Con ratón se puede contestar sin ensuciar el lienzo:
 * al pasar por encima se marca el año y se dicen sus cifras. Sin ratón no hay
 * nada que hacer —ni nada que perder—: los ejes siguen ahí.
 */

const svg = ref(null);

const hovered = ref(null);

const track = event => {
    const box = svg.value?.getBoundingClientRect();

    if (!box || !props.labels.length) return;

    // De píxeles de pantalla a unidades del viewBox.
    const units = ((event.clientX - box.left) / box.width) * canvas.value.width;

    const span = canvas.value.width - pad.value.left - pad.value.right;

    const step = props.labels.length > 1 ? span / (props.labels.length - 1) : 1;

    const index = Math.round((units - pad.value.left) / step);

    hovered.value = Math.min(Math.max(index, 0), props.labels.length - 1);
};

const readings = computed(() => {
    if (hovered.value === null) return null;

    const index = hovered.value;

    const points = props.series
        .map((item, order) => ({
            label: item.label,
            color: props.colors[order],
            value: item.values[index]
        }))
        .filter(point => point.value !== null && point.value !== undefined);

    if (!points.length) return null;

    return {
        index,
        x: x(index),
        label: props.labels[index],
        points: points.map(point => ({
            ...point,
            y: y(point.value),
            text: props.formatValue(point.value)
        }))
    };
});

/** Posición del globo en porcentaje del ancho, para que escale con el SVG. */
const tooltipStyle = computed(() => {
    if (!readings.value) return null;

    const share = (readings.value.x / canvas.value.width) * 100;

    return {
        left: `${share}%`,
        // Cerca de los bordes el globo se apoya en el lado que le queda libre.
        transform: `translateX(${share > 80 ? -100 : share < 20 ? 0 : -50}%)`
    };
});

const describe = computed(() =>
    props.series
        .map(item => {
            const values = item.values.filter(value => value !== null);
            return (
                `${item.label}: de ${props.formatValue(values[0])} ` +
                `a ${props.formatValue(values[values.length - 1])}`
            );
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
            ref="svg"
            :viewBox="`0 0 ${canvas.width} ${canvas.height}`"
            :style="{ '--tick-size': `${tickSize}px` }"
            role="img"
            :aria-label="describe"
            @pointermove="track"
            @pointerleave="hovered = null"
        >
            <line
                :x1="pad.left"
                :y1="pad.top"
                :x2="pad.left"
                :y2="canvas.height - pad.bottom"
                class="axis"
            />
            <line
                :x1="pad.left"
                :y1="canvas.height - pad.bottom"
                :x2="canvas.width - pad.right"
                :y2="canvas.height - pad.bottom"
                class="axis"
            />

            <!-- Antes que las líneas: la rejilla va detrás del dato, no encima. -->
            <line
                v-for="tick in yGrid"
                :key="`grid-${tick.value}`"
                :x1="pad.left"
                :y1="tick.y"
                :x2="canvas.width - pad.right"
                :y2="tick.y"
                class="grid"
            />

            <text
                v-for="tick in yTicks"
                :key="`y-${tick.value}`"
                :x="pad.left - 6"
                :y="tick.y + 2.5"
                text-anchor="end"
                class="tick"
            >
                {{ tick.text }}
            </text>

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

            <!-- La lectura del punto sobre el que está el ratón. -->
            <template v-if="readings">
                <line
                    :x1="readings.x"
                    :y1="pad.top"
                    :x2="readings.x"
                    :y2="canvas.height - pad.bottom"
                    class="guide"
                />

                <circle
                    v-for="point in readings.points"
                    :key="`hover-${point.label}`"
                    :cx="readings.x"
                    :cy="point.y"
                    r="4"
                    fill="var(--surface)"
                    :stroke="point.color"
                    stroke-width="2.4"
                />
            </template>

            <text
                v-for="tick in xTicks"
                :key="`x-${tick.label}`"
                :x="tick.x"
                :y="canvas.height - pad.bottom + 12"
                text-anchor="middle"
                class="tick"
            >
                {{ tick.label }}
            </text>
        </svg>
        <div
            v-if="readings"
            class="tooltip num"
            :style="tooltipStyle"
            aria-hidden="true"
        >
            <span class="tooltipLabel">{{ readings.label }}</span>

            <span
                v-for="point in readings.points"
                :key="`read-${point.label}`"
                class="tooltipRow"
            >
                <span
                    class="tooltipDot"
                    :style="{ background: point.color }"
                ></span>
                {{ point.text }}
            </span>
        </div>
    </figure>
</template>

<style scoped>
.chart {
    position: relative;

    margin: 0;
}

.legend {
    display: flex;

    flex-wrap: wrap;

    gap: 14px;

    margin: 9px 0 12px;
}

.legendItem {
    display: flex;

    align-items: center;

    gap: 5px;

    font-size: var(--text-num-sm);

    color: var(--ink-muted);
}

.swatch {
    width: 14px;

    height: 3px;

    border-radius: 2px;
}

svg {
    display: block;

    width: 100%;

    height: auto;
}

.axis {
    stroke: var(--line);

    stroke-width: 1;
}

/* Mismo color que el eje: lo que la separa es el trazo discontinuo, que a
   igualdad de tinta pesa la mitad. La guía orienta, no compite. */
.grid {
    stroke: var(--line);

    stroke-width: 1;

    stroke-dasharray: 2 4;
}

/* La guía del punto señalado: la misma tinta que la rejilla, entera en vez de
   punteada, para que se distinga sin pesar más que el dato. */
.guide {
    stroke: var(--line-strong);

    stroke-width: 1;
}

.tooltip {
    position: absolute;

    top: 0;

    z-index: 1;

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 5px 9px;

    background: var(--surface);

    border: 1px solid var(--line-strong);

    border-radius: var(--radius-row);

    box-shadow: var(--shadow-card);

    font-size: var(--text-num-sm);

    white-space: nowrap;

    pointer-events: none;
}

.tooltipLabel {
    font-weight: 400;

    color: var(--ink-soft);
}

.tooltipRow {
    display: flex;

    align-items: center;

    gap: 5px;

    color: var(--ink);
}

.tooltipDot {
    width: 8px;

    height: 3px;

    border-radius: 2px;
}

.tick {
    font-family: var(--font-mono);

    font-size: var(--tick-size);

    fill: var(--ink-soft);
}
</style>
