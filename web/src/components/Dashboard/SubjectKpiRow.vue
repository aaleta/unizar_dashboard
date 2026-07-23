<script setup>

import { computed } from "vue";

import KpiCard from "./KpiCard.vue";

import {
    METRICS,
    BASES,
    RECENT_YEARS,
    MIN_COHORT,
    subjectRow,
    subjectRateBefore,
    matriculados,
    averageEnrolment,
    averageSittings,
    officialResult,
    formatPct,
    formatNumber,
    isSmallCohort
} from "@/utils/metrics";

const props = defineProps({

    subjectCode: Number,

    year: String

});

const row = computed(() =>
    subjectRow(props.subjectCode, props.year)
);

const enrolled = computed(() =>
    row.value ? matriculados(row.value) : 0
);

const smallCohort = computed(() =>
    isSmallCohort(enrolled.value)
);

const reference = `la media de los ${RECENT_YEARS} cursos anteriores`;

// Métricas que encabezan la página, en orden de importancia para el alumno.
const KPI_KEYS = [
    "rendimiento",
    "exito",
    "noPresentados",
    "excelencia"
];

const kpis = computed(() =>

    KPI_KEYS.map(key => {

        const definition = METRICS[key];

        const value = row.value
            ? definition.compute(row.value)
            : null;

        const previous = subjectRateBefore(
            props.subjectCode,
            key,
            props.year
        );

        return {
            key,
            label: definition.label,
            definition: definition.definition,
            base: BASES[definition.base].caption,
            higherIsBetter: definition.higherIsBetter,
            value: formatPct(value),
            delta:
                value !== null && previous !== null
                    ? value - previous
                    : null
        };

    })

);

const enrolmentAverage = computed(() =>
    averageEnrolment(props.subjectCode)
);

/**
 * Convocatorias consumidas: cuántos intentos cuesta cerrar la asignatura.
 * No se puede deducir del reparto de notas, viene de los datos oficiales.
 *
 * Ahora sí sigue al selector de año de la página: los datos oficiales cubren
 * los mismos doce cursos que las calificaciones. Antes solo había uno y este
 * KPI enseñaba siempre ese, con su propia etiqueta de año para no engañar.
 *
 * Se sigue mostrando el curso al lado porque no todas las asignaturas tienen
 * dato todos los años: si el seleccionado no lo tiene, cae al más reciente que
 * sí, y hay que decir cuál es.
 */
const sittings = computed(() =>
    averageSittings(props.subjectCode, props.year)
        ?? averageSittings(props.subjectCode)
);

const sittingsYear = computed(() =>
    (officialResult(props.subjectCode, props.year)
        ?? officialResult(props.subjectCode))?.curso ?? null
);

</script>

<template>

<section
    class="kpiSection"
    aria-label="Indicadores principales"
>

    <div class="kpiGrid">

        <KpiCard
            label="Matriculados"
            :value="formatNumber(enrolled)"
            :base="`Media últimos ${RECENT_YEARS} cursos: ${formatNumber(enrolmentAverage)}`"
            definition="Alumnos matriculados en la asignatura este curso académico."
        />

        <KpiCard
            v-for="kpi in kpis"
            :key="kpi.key"
            :label="kpi.label"
            :value="kpi.value"
            :delta="kpi.delta"
            :higher-is-better="kpi.higherIsBetter"
            :definition="kpi.definition"
            :base="kpi.base"
            :reference="reference"
        />

        <KpiCard
            v-if="sittings !== null"
            label="Convocatorias"
            :value="formatNumber(sittings, 2)"
            :higher-is-better="false"
            definition="Media de convocatorias que consume un alumno para cerrar la asignatura. 1,00 significa que se aprueba a la primera."
            :base="`Dato oficial de ${sittingsYear}`"
        />

    </div>

    <p
        v-if="smallCohort"
        class="cohortWarning"
    >
        ⚠ Solo {{ enrolled }} matriculados este curso: con cohortes de menos de
        {{ MIN_COHORT }} alumnos los porcentajes varían mucho de un año a otro.
        Fíjate en los recuentos, no en las tasas.
    </p>

    <p
        v-else-if="!row"
        class="cohortWarning"
    >
        No hay estadísticas publicadas para el curso {{ year }}.
    </p>

</section>

</template>

<style scoped>

.kpiSection{

    display:flex;

    flex-direction:column;

    gap:14px;

}

.kpiGrid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(200px,1fr));

    gap:16px;

}

.cohortWarning{

    margin:0;

    padding:12px 16px;

    border-radius:12px;

    background:rgba(250,204,21,.1);

    border:1px solid rgba(250,204,21,.25);

    color:#fde68a;

    font-size:.9rem;

    line-height:1.5;

}

</style>
