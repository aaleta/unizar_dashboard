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

const pct = value =>
    value === null ? "—" : `${Math.round(value)}%`;

const headline = computed(() => difficultyInk(props.noSuperacion, false));

const metaLine = computed(() =>
    props.meta
        ?? (props.enrolment === null
            ? null
            : `${Math.round(props.enrolment)} matriculados`)
);

</script>

<template>

<RouterLink
    :to="`/asignatura/${code}`"
    class="card"
    :class="{ optative }"
>

    <div class="top">

        <div class="identity">

            <div class="name">{{ name }}</div>

            <div
                v-if="metaLine"
                class="meta"
            >
                {{ metaLine }}
            </div>

        </div>

        <div class="headline">

            <div
                class="value num"
                :style="{ color: headline }"
            >
                {{ pct(noSuperacion) }}
            </div>

            <div class="caption">no superan</div>

        </div>

    </div>

    <p
        v-if="smallCohort"
        class="cohort"
    >
        ⚠ Menos de 10 alumnos: los porcentajes bailan mucho.
    </p>

    <div class="foot">

        <span class="stat">
            aprueban <strong class="num">{{ pct(rendimiento) }}</strong>
        </span>

        <span class="stat">
            no pres. <strong class="num">{{ pct(noPresentados) }}</strong>
        </span>

        <span class="go">Ver ficha →</span>

    </div>

</RouterLink>

</template>

<style scoped>

.card{

    display:block;

    padding:13px 14px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:12px;

    box-shadow:var(--shadow-card);

    color:var(--ink);

}

.card:active{

    border-color:var(--line-strong);

}

.card.optative{

    background:var(--surface-alt);

    border-style:dashed;

    border-color:var(--line-dashed);

    box-shadow:none;

}

.top{

    display:flex;

    align-items:flex-start;

    justify-content:space-between;

    gap:10px;

}

.identity{

    flex:1;

    min-width:0;

}

.name{

    font-family:var(--font-serif);

    font-size:15px;

    font-weight:600;

    line-height:1.2;

}

.meta{

    margin-top:3px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    color:var(--ink-soft);

}

.headline{

    flex:none;

    text-align:right;

}

.headline .value{

    font-size:var(--text-metric);

    line-height:1;

}

.caption{

    margin-top:2px;

    font-size:8px;

    color:var(--ink-faint);

}

.cohort{

    margin:9px 0 0;

    font-size:9.5px;

    line-height:var(--leading-snug);

    color:var(--attention-ink);

}

.foot{

    display:flex;

    align-items:center;

    gap:16px;

    margin-top:11px;

    padding-top:10px;

    border-top:1px solid var(--line-inner);

}

.stat{

    font-size:10.5px;

    color:var(--ink-muted);

}

.stat strong{

    color:var(--ink);

    font-weight:600;

}

.go{

    margin-left:auto;

    font-size:var(--text-body-xs);

    font-weight:600;

    color:var(--navy);

}

</style>
