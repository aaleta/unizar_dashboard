<script setup>

/**
 * Catálogo de optativas: la pantalla para ELEGIR, que es una tarea distinta de
 * consultar.
 *
 * Por eso no es una tabla ordenable como la lista maestra sino tarjetas con
 * cuatro órdenes con nombre propio. Quien elige optativas no piensa "ordéname
 * por tasa de excelencia descendente"; piensa "cuáles son las más fáciles" o
 * "en cuáles cae más matrícula de honor".
 *
 * Las barras de "las más elegidas" van en GRIS y no en la rampa. Cuánta gente
 * se matricula es un recuento, no una dificultad: pintar de rojo la más
 * elegida diría que es la más dura, que es justo lo contrario de lo que pasa.
 *
 * Antes esto eran dos páginas (/Optional y /dashboardGeneralOpts) contando lo
 * mismo por separado.
 */

import { computed, ref } from "vue";

import { useSubjectList } from "@/composables/useSubjectList";
import {
    allOptionalSubjects,
    weightedRate,
    subjectRows,
    lastYears
} from "@/utils/metrics";

import UiChip from "@/components/ui/UiChip.vue";
import UiCountBar from "@/components/ui/UiCountBar.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiStat from "@/components/ui/UiStat.vue";
import UiSubjectCard from "@/components/ui/UiSubjectCard.vue";

/** Cuántas tarjetas se ven antes de tener que pedir el resto. */
const PREVIEW = 4;

/** Cuántas barras tiene "las más elegidas". */
const TOP_ENROLLED = 5;

const {
    query,
    applySort,
    isSort,
    results,
    rows,
    total,
    empty
} = useSubjectList({
    source: allOptionalSubjects,
    sort: "enrolment",
    descending: true
});

/**
 * Los cuatro órdenes, con la dirección explícita. "Más fáciles" es no
 * superación ASCENDENTE: la que menos gente suspende, arriba.
 */
const ORDERS = [
    { label: "Populares", key: "enrolment", descending: true },
    { label: "Más fáciles", key: "noSuperacion", descending: false },
    { label: "＋ Sob·MH", key: "excelencia", descending: true },
    { label: "A–Z", key: "name", descending: false }
];

const expanded = ref(false);

const visible = computed(() =>
    expanded.value ? results.value : results.value.slice(0, PREVIEW)
);

/** Media ponderada de aprobados de TODAS las optativas del grado. */
const averagePass = computed(() => {

    const allRows = allOptionalSubjects.flatMap(subject =>
        lastYears(subjectRows(subject.code))
    );

    return weightedRate(allRows, "rendimiento");

});

/** Matrículas al año: la suma de las medias de matriculados de cada una. */
const enrolmentPerYear = computed(() =>
    Math.round(
        rows.value.reduce((sum, row) => sum + row.enrolment, 0)
    )
);

const mostEnrolled = computed(() =>
    [...rows.value]
        .sort((a, b) => b.enrolment - a.enrolment)
        .slice(0, TOP_ENROLLED)
);

const topEnrolment = computed(() =>
    mostEnrolled.value[0]?.enrolment ?? 1
);

const pct = value =>
    value === null ? "—" : `${Math.round(value)}%`;

/** "OPTATIVA · 3º y 4º · 58 matr." */
const meta = row => [
    "Optativa",
    row.courses.map(c => `${c}º`).join(" y "),
    `${Math.round(row.enrolment)} matr.`
].join(" · ");

</script>

<template>

<div class="screen">

    <header class="intro">

        <h1>Optativas</h1>

        <p class="lead">
            Todas las del grado, con sus estadísticas y su ficha.
        </p>

        <div class="stats">
            <UiStat
                :value="total"
                label="optativas"
                tone="gold"
            />
            <UiStat
                :value="enrolmentPerYear"
                label="matrículas al año"
            />
            <UiStat
                :value="pct(averagePass)"
                label="aprueban de media"
            />
        </div>

    </header>

    <section class="section">

        <h2>Las más elegidas</h2>

        <div class="panel">
            <UiCountBar
                v-for="row in mostEnrolled"
                :key="row.code"
                :label="row.name"
                :value="row.enrolment"
                :max="topEnrolment"
                :display="String(Math.round(row.enrolment))"
            />
        </div>

    </section>

    <div class="controls">

        <UiSearchField
            v-model="query"
            placeholder="Buscar optativa…"
            label="Buscar optativa"
        />

        <p class="eyebrow orderLabel">Ordenar por</p>

        <div class="chips">
            <UiChip
                v-for="order in ORDERS"
                :key="order.label"
                shape="rounded"
                :active="isSort(order.key, order.descending)"
                @click="applySort(order.key, order.descending)"
            >
                {{ order.label }}
            </UiChip>
        </div>

    </div>

    <p
        v-if="empty"
        class="emptyState"
    >
        Ninguna optativa coincide con la búsqueda.
    </p>

    <div
        v-else
        class="cards"
    >

        <!-- Props explícitas, NUNCA v-bind="row".
             El resumen trae campos que la tarjeta no declara y que se cuelan
             como atributos en el <a>. Uno de ellos, `search`, es además una
             propiedad del DOM en los enlaces: asignarla REESCRIBE la query del
             href y deja URLs con "?gravitacion y cosmologia 26937" pegado. -->
        <UiSubjectCard
            v-for="row in visible"
            :key="row.code"
            :code="row.code"
            :name="row.name"
            :no-superacion="row.noSuperacion"
            :rendimiento="row.rendimiento"
            :excelencia="row.excelencia"
            :small-cohort="row.smallCohort"
            :meta="meta(row)"
            secondary="excelencia"
            optative
        />

        <button
            v-if="results.length > PREVIEW"
            type="button"
            class="more"
            @click="expanded = !expanded"
        >
            {{ expanded
                ? "− ver menos"
                : `＋ ${results.length - PREVIEW} optativas más` }}
        </button>

    </div>

    <p class="footnote">
        Debes cursar un mínimo de optativas · medias de 3 cursos ·
        ⚠ = menos de 10 alumnos.
    </p>

</div>

</template>

<style scoped>

.screen{

    padding:15px var(--gutter) 8px;

}

h1{

    margin:0 0 3px;

    font-family:var(--font-serif);

    font-size:var(--text-h1-lg);

    font-weight:700;

}

.lead{

    margin:0 0 13px;

    font-size:var(--text-body-sm);

    color:var(--ink-soft);

}

.stats{

    display:flex;

    flex-wrap:wrap;

    gap:22px;

}

.section{

    margin-top:16px;

}

h2{

    margin:0 0 10px;

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

}

.panel{

    display:flex;

    flex-direction:column;

    gap:9px;

    padding:14px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:12px;

    box-shadow:var(--shadow-card);

}

.controls{

    margin-top:16px;

}

.orderLabel{

    margin:11px 0 7px;

    font-size:var(--text-footnote);

}

.chips{

    display:flex;

    flex-wrap:wrap;

    gap:6px;

}

.cards{

    display:flex;

    flex-direction:column;

    gap:9px;

    margin-top:12px;

}

.more{

    display:flex;

    align-items:center;

    min-height:var(--touch-target);

    padding:2px;

    border:none;

    background:none;

    font-family:var(--font-mono);

    font-size:10px;

    color:var(--ink-faint-2);

    cursor:pointer;

}

.more:active{

    color:var(--navy);

}

.emptyState{

    margin:0;

    padding:26px 0;

    text-align:center;

    font-size:var(--text-body);

    color:var(--ink-soft);

}

.footnote{

    margin:14px 0 0;

    padding-top:12px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

</style>
