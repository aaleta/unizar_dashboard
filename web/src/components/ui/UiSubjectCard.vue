<script setup>
/**
 * Tarjeta de asignatura: la unidad que se repite en la vista de curso y en el
 * catálogo de optativas.
 *
 * Jerarquía: el nombre manda, la tasa de no superación es lo segundo que se
 * lee y va grande y en la rampa, y el resto —matriculados, aprueban, no
 * presentados— es letra pequeña de apoyo.
 *
 * Las optativas van con borde discontinuo y fondo distinto: al hojear una
 * lista mezclada se ve qué es obligatorio y qué se elige sin leer ni una
 * palabra.
 *
 * La cohorte pequeña no se esconde. Con menos de diez matriculados un solo
 * alumno mueve el porcentaje diez puntos, y una web que presume de datos
 * abiertos tiene que decirlo justo al lado de la cifra, no en una nota al pie
 * de otra página.
 */

import { computed } from "vue";

import { difficultyInk } from "@/theme/difficulty";

const props = defineProps({
    code: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    noSuperacion: {
        type: Number,
        default: null
    },

    rendimiento: {
        type: Number,
        default: null
    },

    noPresentados: {
        type: Number,
        default: null
    },

    excelencia: {
        type: Number,
        default: null
    },

    /**
     * Qué se enseña como segundo dato del pie. En la vista de curso interesa
     * cuánta gente ni se presenta; eligiendo optativas interesa cuántas
     * matrículas de honor caen, que es media razón para escoger una.
     */
    secondary: {
        type: String,
        default: "noPresentados",
        validator: value => ["noPresentados", "excelencia"].includes(value)
    },

    // Media de matriculados de los últimos cursos.
    enrolment: {
        type: Number,
        default: null
    },

    // Línea de metadatos alternativa ("OPTATIVA · 3º y 4º · 58 matr.").
    meta: {
        type: String,
        default: null
    },

    optative: {
        type: Boolean,
        default: false
    },

    smallCohort: {
        type: Boolean,
        default: false
    }
});

const pct = value => (value === null ? "—" : `${Math.round(value)}%`);

// El titular va a 15,5px. No llega a "texto grande" (18,66px en negrita),
// así que necesita 4,5:1 y le toca el tono oscurecido de la rampa.
const headline = computed(() => difficultyInk(props.noSuperacion, true));

const metaLine = computed(
    () =>
        props.meta ??
        (props.enrolment === null
            ? null
            : `${Math.round(props.enrolment)} matriculados`)
);

const secondaryStat = computed(() =>
    props.secondary === "excelencia"
        ? { label: "Sob+MH", value: props.excelencia }
        : { label: "no pres.", value: props.noPresentados }
);
</script>

<template>
    <RouterLink :to="`/asignatura/${code}`" class="card" :class="{ optative }">
        <div class="top">
            <div class="identity">
                <div class="name">
                    {{ name }}
                    <!-- El aviso va pegado al nombre y no solo en el pie: quien
                     ordena por "más fáciles" se encuentra estas arriba del
                     todo, y tiene que ver por qué antes de creerse el 0 %. -->
                    <span
                        v-if="smallCohort"
                        class="warn"
                        title="Menos de 10 alumnos: los porcentajes bailan mucho"
                        >⚠</span
                    >
                </div>

                <div v-if="metaLine" class="meta">
                    {{ metaLine }}
                </div>
            </div>

            <div class="headline">
                <div class="value num" :style="{ color: headline }">
                    {{ pct(noSuperacion) }}
                </div>

                <div class="caption">no superan</div>
            </div>
        </div>

        <!-- Con cohorte pequeña el pie NO enseña porcentajes: repetir "aprueban
         el 100 %" debajo del aviso de que los porcentajes no valen sería
         contradecirse en dos líneas. -->
        <div v-if="smallCohort" class="foot">
            <span class="cohort">
                Menos de 10 alumnos: los porcentajes bailan mucho.
            </span>
            <span class="go">Ver ficha →</span>
        </div>

        <div v-else class="foot">
            <span class="stat">
                aprueban <strong class="num">{{ pct(rendimiento) }}</strong>
            </span>

            <span class="stat">
                {{ secondaryStat.label }}
                <strong class="num">{{ pct(secondaryStat.value) }}</strong>
            </span>

            <span class="go">Ver ficha →</span>
        </div>
    </RouterLink>
</template>

<style scoped>
.card {
    display: block;

    padding: 13px 14px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: 12px;

    box-shadow: var(--shadow-card);

    color: var(--ink);
}

.card:active {
    border-color: var(--line-strong);
}

.card.optative {
    background: var(--surface-alt);

    border-style: dashed;

    border-color: var(--line-dashed);

    box-shadow: none;
}

.top {
    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 10px;
}

.identity {
    flex: 1;

    min-width: 0;
}

.name {
    font-family: var(--font-serif);

    font-size: 15px;

    font-weight: 600;

    line-height: 1.2;
}

.warn {
    color: var(--attention);

    font-size: 12px;
}

.meta {
    margin-top: 3px;

    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    color: var(--ink-soft);
}

.headline {
    flex: none;

    text-align: right;
}

.headline .value {
    font-size: var(--text-metric);

    line-height: 1;
}

.caption {
    margin-top: 2px;

    font-size: 8px;

    color: var(--ink-faint);
}

.cohort {
    flex: 1;

    min-width: 0;

    font-size: 9.5px;

    line-height: var(--leading-snug);

    color: var(--attention-ink);
}

.foot {
    display: flex;

    align-items: center;

    gap: 16px;

    margin-top: 11px;

    padding-top: 10px;

    border-top: 1px solid var(--line-inner);
}

.stat {
    font-size: 10.5px;

    color: var(--ink-muted);
}

.stat strong {
    color: var(--ink);

    font-weight: 600;
}

.go {
    margin-left: auto;

    font-size: var(--text-body-xs);

    font-weight: 600;

    color: var(--navy);
}
</style>
