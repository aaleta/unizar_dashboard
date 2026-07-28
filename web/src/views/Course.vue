<script setup>

/**
 * Vista de curso: la capa intermedia entre el mapa del grado y la ficha.
 *
 * El mapa dice qué cursos hay y cuál duele; la ficha lo cuenta todo de una
 * asignatura. Aquí se responde a lo que queda en medio: cómo va ESTE curso y
 * qué asignaturas lo componen, con lo justo de cada una para decidir en cuál
 * entrar.
 *
 * Una sola vista para los cuatro cursos: antes eran ocho ficheros casi
 * idénticos (firstYear…forthYear + dashboardYear) para el mismo contenido.
 *
 * El orden es siempre por dificultad descendente. Alfabético sería más
 * neutral, pero nadie llega aquí preguntándose qué asignatura empieza por A.
 */

import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useCourse } from "@/composables/useCourse";
import { usePageHeader } from "@/composables/usePageHeader";
import { courseSeries } from "@/utils/metrics";

import LineChart from "@/components/charts/LineChart.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiMeterRow from "@/components/ui/UiMeterRow.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";
import UiStat from "@/components/ui/UiStat.vue";
import UiSubjectCard from "@/components/ui/UiSubjectCard.vue";

/** Cuántas tarjetas se ven antes de tener que pedir el resto. */
const PREVIEW = 3;

const route = useRoute();

const {
    number,
    valid,
    name,
    troncales,
    optativas,
    avgPass,
    avgNoShow,
    alsoInCourses,
    recentYears
} = useCourse(() => route.params.curso);

usePageHeader(() => ({
    header: "inner",
    eyebrow: "El Grado",
    title: name.value ? `${name.value} · vista de curso` : "Vista de curso",
    back: "/grado"
}));

const showAllCore = ref(false);
const showAllOptional = ref(false);

const visibleCore = computed(() =>
    showAllCore.value ? troncales.value : troncales.value.slice(0, PREVIEW)
);

const visibleOptional = computed(() =>
    showAllOptional.value ? optativas.value : optativas.value.slice(0, PREVIEW)
);

const pct = value =>
    value === null ? "—" : `${Math.round(value)}%`;

const ordinal = course => `${course}º`;

const shortYear = academicYear =>
    academicYear
        .split("-")
        .map(part => part.slice(-2))
        .join("-");

/**
 * Cómo ha evolucionado la dificultad del curso entero: la media ponderada de
 * no superación de sus troncales, año a año. La línea responde a la pregunta
 * que las tarjetas no pueden: ¿este curso siempre fue así?
 */
const difficultyHistory = computed(() =>
    courseSeries(String(number.value), "noSuperacion")
        .filter(point => point.value !== null)
);

const historyChart = computed(() => ({
    labels: difficultyHistory.value.map(point => shortYear(point.year)),
    series: [{
        label: "No superan las troncales",
        values: difficultyHistory.value.map(point => point.value)
    }]
}));

/** La serie habla de no superación, así que va en óxido, no en el ocre de las
    notas de acceso: el ocre está reservado a la cautela estadística. */
const HISTORY_COLORS = ["var(--chart-line-difficulty)"];

</script>

<template>

<div
    v-if="valid"
    class="screen"
>

    <header class="intro">

        <div class="title">
            <span
                class="badge"
                aria-hidden="true"
            >{{ number }}</span>
            <h1>{{ name }}</h1>
        </div>

        <p class="lead">
            Estadísticas del curso y acceso a la ficha de cada asignatura.
        </p>

        <div class="stats">
            <UiStat
                :value="pct(avgPass)"
                label="aprueban de media"
            />
            <UiStat
                :value="pct(avgNoShow)"
                label="no se presentan"
            />
            <UiStat
                :value="troncales.length"
                label="troncales"
                tone="navy"
            />
            <UiStat
                v-if="optativas.length"
                :value="optativas.length"
                label="optativas"
                tone="verd"
            />
        </div>

        <p class="footnote">
            Medias ponderadas de las troncales · últimos {{ recentYears }} cursos.
        </p>

    </header>

    <section class="section">

        <h2>Dificultad de las troncales</h2>

        <div class="panel">
            <UiMeterRow
                v-for="subject in troncales"
                :key="subject.code"
                :label="subject.name"
                :value="subject.noSuperacion"
            />
        </div>

    </section>

    <section
        v-if="difficultyHistory.length > 1"
        class="section"
    >

        <h2>Dificultad del curso</h2>

        <div class="panel">
            <LineChart
                :series="historyChart.series"
                :labels="historyChart.labels"
                :colors="HISTORY_COLORS"
                :y-min="0"
                :format-value="value => `${Math.round(value)}%`"
            />
            <p class="chartNote">
                % que no supera las troncales de {{ ordinal(number) }},
                media ponderada de cada curso académico.
            </p>
        </div>

    </section>

    <section class="section">

        <UiSectionHeader
            label="Troncales"
            :count="troncales.length"
        />

        <div class="cards">

            <!-- Props explícitas: v-bind del objeto entero cuela campos
                 sueltos como atributos del <a>. Ver la nota en Optatives.vue. -->
            <UiSubjectCard
                v-for="subject in visibleCore"
                :key="subject.code"
                :code="subject.code"
                :name="subject.name"
                :no-superacion="subject.noSuperacion"
                :rendimiento="subject.rendimiento"
                :no-presentados="subject.noPresentados"
                :enrolment="subject.enrolment"
                :small-cohort="subject.smallCohort"
            />

            <button
                v-if="troncales.length > PREVIEW"
                type="button"
                class="more"
                @click="showAllCore = !showAllCore"
            >
                {{ showAllCore
                    ? "− ver menos"
                    : `＋ ${troncales.length - PREVIEW} troncales más` }}
            </button>

        </div>

    </section>

    <section
        v-if="optativas.length"
        class="section"
    >

        <UiSectionHeader
            label="Optativas"
            :count="optativas.length"
            tone="verd"
        />

        <!-- En 1º las optativas son las especiales (Biología, Geología,
             Grafos), que no están en la bolsa: enlazar ahí a una lista donde
             no aparecen solo despistaría. -->
        <p class="note">
            <template v-if="alsoInCourses.length">
                Muchas se ofertan también en
                {{ alsoInCourses.map(ordinal).join(" y ") }}.
            </template>
            <template v-if="number === 1">
                Optativas especiales de primero: se cursan fuera de la bolsa
                de optativas de 3º y 4º.
            </template>
            <RouterLink
                v-else
                to="/optativas"
            >Ver todas las optativas →</RouterLink>
        </p>

        <div class="cards">

            <UiSubjectCard
                v-for="subject in visibleOptional"
                :key="subject.code"
                :code="subject.code"
                :name="subject.name"
                :no-superacion="subject.noSuperacion"
                :rendimiento="subject.rendimiento"
                :no-presentados="subject.noPresentados"
                :enrolment="subject.enrolment"
                :small-cohort="subject.smallCohort"
                optative
            />

            <button
                v-if="optativas.length > PREVIEW"
                type="button"
                class="more"
                @click="showAllOptional = !showAllOptional"
            >
                {{ showAllOptional
                    ? "− ver menos"
                    : `＋ ${optativas.length - PREVIEW} optativas más` }}
            </button>

        </div>

    </section>

</div>

<div
    v-else
    class="screen"
>
    <UiCallout
        tone="structural"
        title="Ese curso no existe"
    >
        El grado tiene cuatro cursos.
        <RouterLink to="/grado">Volver al mapa del grado →</RouterLink>
    </UiCallout>
</div>

</template>

<style scoped>

.screen{

    padding:16px var(--gutter) 8px;

}

.intro .title{

    display:flex;

    align-items:center;

    gap:9px;

    margin-bottom:8px;

}

.badge{

    display:flex;

    align-items:center;

    justify-content:center;

    width:26px;

    height:26px;

    flex:none;

    border-radius:var(--radius-dot);

    background:var(--navy);

    color:var(--ink-on-navy);

    font-family:var(--font-serif);

    font-size:var(--text-body);

    font-weight:700;

}

h1{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-h1-lg);

    font-weight:700;

    line-height:var(--leading-none);

}

.lead{

    margin:0 0 14px;

    font-size:var(--text-body-sm);

    color:var(--ink-soft);

}

.stats{

    display:flex;

    flex-wrap:wrap;

    gap:22px;

}

.footnote{

    margin:12px 0 0;

    font-family:var(--font-sans);

    font-size:var(--text-footnote);

    line-height:var(--leading-body);

    color:var(--ink-faint);

}

.section{

    margin-top:var(--gap-section);

}

h2{

    margin:0 0 11px;

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

    border-radius:var(--radius-card-lg);

    box-shadow:var(--shadow-card);

}

.chartNote{

    margin:2px 0 0;

    font-family:var(--font-sans);

    font-size:var(--text-footnote);

    line-height:var(--leading-body);

    color:var(--ink-faint);

}

.note{

    margin:6px 0 10px;

    font-size:var(--text-num-sm);

    line-height:var(--leading-body);

    color:var(--ink-soft);

}

.note a{

    font-weight:600;

}

.cards{

    display:flex;

    flex-direction:column;

    gap:9px;

    margin-top:10px;

}

.more{

    display:flex;

    align-items:center;

    min-height:var(--touch-target);

    padding:2px;

    border:none;

    background:none;

    font-family:var(--font-sans);

    font-size:var(--text-num-sm);

    color:var(--ink-faint-2);

    cursor:pointer;

}

.more:active{

    color:var(--navy);

}

</style>
