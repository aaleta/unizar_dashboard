<script setup>

/**
 * La rejilla semanal de clases. Lunes a viernes en columnas, las horas en
 * vertical, cada clase colocada al minuto (hay teorías de hora y media y de
 * media en media hora; encajarlas a la hora entera las haría desaparecer o
 * mentir sobre su duración).
 *
 * Cuando dos clases coinciden NO se tapan: se reparten la anchura de la
 * columna y se pintan lado a lado con el tono de aviso. El propósito de la
 * pantalla es precisamente ver el choque, y un bloque encima de otro esconde
 * justo lo que hay que enseñar.
 *
 * La rejilla cabe entera en el ancho del teléfono: cinco columnas estrechas se
 * leen peor que una tabla ancha, pero un horario se mira para ver la forma de
 * la semana y los huecos, y eso exige verla completa sin scroll lateral.
 */

import { computed } from "vue";

import { WEEKDAYS } from "@/composables/useSchedule";

const props = defineProps({

    // Eventos de clase ya filtrados por semestre y grupo:
    // { code, name, tipo, day (1-5), start, end, startMin, endMin }
    events: {
        type: Array,
        required: true
    }

});

/** Altura de una hora en píxeles. */
const HOUR = 44;

/**
 * Rango horario visible. De 8 a 20 siempre —una rejilla que cambia de alto al
 * marcar asignaturas desorienta— y se ensancha solo si algún evento se sale.
 */
const firstHour = computed(() =>
    Math.min(8, ...props.events.map(event => Math.floor(event.startMin / 60)))
);

const lastHour = computed(() =>
    Math.max(20, ...props.events.map(event => Math.ceil(event.endMin / 60)))
);

const hours = computed(() => {

    const list = [];

    for (let hour = firstHour.value; hour <= lastHour.value; hour++) {
        list.push(hour);
    }

    return list;

});

const trackHeight = computed(() => (lastHour.value - firstHour.value) * HOUR);

/**
 * Coloca los eventos de un día. Los solapados se reparten la anchura: cada
 * grupo de eventos que se tocan en el tiempo forma un "racimo", dentro del
 * racimo cada evento ocupa la primera subcolumna libre, y todos se dividen el
 * ancho entre las subcolumnas que hayan hecho falta.
 */
const placeDay = events => {

    const sorted = [...events].sort(
        (a, b) => a.startMin - b.startMin || a.endMin - b.endMin
    );

    const placed = [];

    let cluster = [];
    let clusterEnd = -1;

    const closeCluster = () => {

        const columns = [];

        for (const event of cluster) {

            let col = columns.findIndex(end => end <= event.startMin);

            if (col === -1) {
                col = columns.length;
                columns.push(0);
            }

            columns[col] = event.endMin;
            event.col = col;

        }

        for (const event of cluster) {
            event.cols = columns.length;
            placed.push(event);
        }

        cluster = [];

    };

    for (const event of sorted) {

        if (cluster.length && event.startMin >= clusterEnd) closeCluster();

        cluster.push({ ...event });
        clusterEnd = Math.max(clusterEnd, event.endMin);

    }

    if (cluster.length) closeCluster();

    return placed;

};

const days = computed(() =>
    WEEKDAYS.map((name, index) => ({
        name,
        events: placeDay(props.events.filter(event => event.day === index + 1))
    }))
);

/** Un evento choca si comparte subcolumna con otro, es decir, si su racimo se partió. */
const clashes = event => event.cols > 1;

const eventStyle = event => ({
    top: `${((event.startMin - firstHour.value * 60) / 60) * HOUR}px`,
    height: `${((event.endMin - event.startMin) / 60) * HOUR - 2}px`,
    left: `calc(${(event.col / event.cols) * 100}% + 1px)`,
    width: `calc(${100 / event.cols}% - 2px)`
});

const label = hour => `${String(hour).padStart(2, "0")}:00`;

</script>

<template>

<div
    class="week"
    role="img"
    :aria-label="`Horario semanal con ${events.length} clases`"
>

    <!-- Cabecera de días -->
    <div class="head">

        <span class="corner"></span>

        <span
            v-for="day in days"
            :key="day.name"
            class="dayName"
            :title="day.name"
        >
            {{ day.name.slice(0, 3) }}
        </span>

    </div>

    <div class="body">

        <!-- Regleta de horas -->
        <div
            class="gutter"
            :style="{ height: `${trackHeight}px` }"
        >
            <span
                v-for="hour in hours.slice(0, -1)"
                :key="hour"
                class="hour num"
                :style="{ top: `${(hour - firstHour) * HOUR}px` }"
            >
                {{ label(hour) }}
            </span>
        </div>

        <!-- Columnas de días -->
        <div
            v-for="day in days"
            :key="day.name"
            class="track"
            :style="{ height: `${trackHeight}px` }"
        >

            <div
                v-for="event in day.events"
                :key="`${event.code}-${event.startMin}-${event.col}`"
                class="event"
                :class="{
                    clash: clashes(event),
                    optativa: event.tipo === 'optativa'
                }"
                :style="eventStyle(event)"
                :title="`${event.name} · ${event.start}–${event.end}`"
            >
                <span class="eventName">{{ event.name }}</span>
                <span class="eventTime num">{{ event.start }}</span>
            </div>

        </div>

    </div>

</div>

</template>

<style scoped>

.week{

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

    overflow:hidden;

}

.head{

    display:flex;

    border-bottom:var(--rule-strong) solid var(--line-strong);

    background:var(--surface-sunken);

}

.corner{

    flex:none;

    width:34px;

}

.dayName{

    flex:1;

    min-width:0;

    padding:7px 0 6px;

    text-align:center;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--ink-soft);

}

.body{

    display:flex;

}

.gutter{

    position:relative;

    flex:none;

    width:34px;

}

.hour{

    position:absolute;

    right:4px;

    transform:translateY(-45%);

    font-family:var(--font-mono);

    font-size:8px;

    font-weight:600;

    letter-spacing:.02em;

    color:var(--ink-faint);

}

/* La primera etiqueta pegada al borde superior no se trunca. */
.hour:first-child{

    transform:none;

}

.track{

    position:relative;

    flex:1;

    min-width:0;

    border-left:var(--rule) solid var(--line-inner);

    /* Una línea tenue por hora, sin un elemento por celda. */
    background-image:linear-gradient(var(--line-inner) 1px,transparent 1px);

    background-size:100% 44px;

}

.event{

    position:absolute;

    display:flex;

    flex-direction:column;

    gap:1px;

    padding:3px 4px;

    box-sizing:border-box;

    overflow:hidden;

    border-radius:0;

    border:var(--rule) solid var(--carbon-wash-line);

    /* El canto izquierdo, más grueso, es lo que hace legible una rejilla de
       bloques pequeños: se distingue el tipo de clase sin leer nada. */
    border-left:4px solid var(--carbon);

    background:var(--carbon-wash);

}

.event.optativa{

    border-style:dashed;

    border-left-style:solid;

    border-color:var(--line-dashed);

    border-left:4px solid var(--accent-ink);

    background:var(--surface-alt);

}

/* El choque: mismo tono de aviso que el resto de la web, y los dos bloques
   visibles a la vez repartiéndose la columna. */
.event.clash{

    border-color:var(--warn-line);

    border-left:4px solid var(--warn-title);

    background:var(--warn-bg);

}

.eventName{

    font-size:9.5px;

    font-weight:700;

    letter-spacing:-.01em;

    line-height:1.2;

    color:var(--ink);

    display:-webkit-box;

    -webkit-box-orient:vertical;

    -webkit-line-clamp:3;

    overflow:hidden;

}

.event.clash .eventName{

    color:var(--warn-title);

}

.eventTime{

    margin-top:auto;

    font-family:var(--font-mono);

    font-size:8px;

    font-weight:600;

    color:var(--ink-soft);

}

</style>
