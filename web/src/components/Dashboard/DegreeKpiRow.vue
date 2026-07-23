<script setup>

import { computed } from "vue";

import KpiCard from "./KpiCard.vue";

import notasAcceso from "../../../../data/json/NotasDeCorteRaw.json";

import {
    RECENT_YEARS,
    METRICS,
    BASES,
    academicYears,
    degreeRateForPeriod,
    allCoreSubjects,
    averageSittings,
    officialYears,
    formatPct,
    formatNumber
} from "@/utils/metrics";

/**
 * Cifras de cabecera del grado. Un dashboard debe abrir con escalares, no con
 * gráficas: antes había que interpretar cuatro paneles para saber si el grado
 * va bien o mal.
 */

const recentPeriod = computed(() =>
    academicYears.slice(-RECENT_YEARS)
);

const previousPeriod = computed(() =>
    academicYears.slice(-2 * RECENT_YEARS, -RECENT_YEARS)
);

const rateKpi = key => {

    const definition = METRICS[key];

    const value = degreeRateForPeriod(key, recentPeriod.value);
    const previous = degreeRateForPeriod(key, previousPeriod.value);

    return {
        key,
        label: definition.label,
        definition: definition.definition,
        base: BASES[definition.base].caption,
        higherIsBetter: definition.higherIsBetter,
        value: formatPct(value),
        delta: value !== null && previous !== null ? value - previous : null
    };

};

const rateKpis = computed(() => [
    rateKpi("rendimiento"),
    rateKpi("noPresentados")
]);

/* --- Nota de corte: dato distinto, fuente distinta -------------------- */

const admission = computed(() => {

    const sorted = [...notasAcceso].sort((a, b) => a.anyo - b.anyo);

    const last = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    return {
        year: last?.anyo,
        value: last?.nota_corte ?? null,
        delta:
            last && previous
                ? last.nota_corte - previous.nota_corte
                : null
    };

});

/* --- Convocatorias: solo existe en los datos oficiales ---------------- */

const sittings = computed(() => {

    const values = allCoreSubjects
        .map(subject => averageSittings(subject.code))
        .filter(value => value !== null);

    if (!values.length) return null;

    return values.reduce((sum, value) => sum + value, 0) / values.length;

});

const reference = `los ${RECENT_YEARS} cursos anteriores`;

</script>

<template>

<section
    class="kpiGrid"
    aria-label="Indicadores generales del grado"
>

    <KpiCard
        label="Nota de corte"
        :value="formatNumber(admission.value, 3)"
        :delta="admission.delta"
        delta-unit="puntos"
        :delta-threshold="0.05"
        :higher-is-better="true"
        definition="Nota del último alumno admitido en el grado en la convocatoria general, sobre 14."
        :base="`Convocatoria de ${admission.year}`"
        reference="la convocatoria anterior"
    />

    <KpiCard
        v-for="kpi in rateKpis"
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
        label="Convocatorias por asignatura"
        :value="formatNumber(sittings, 2)"
        :higher-is-better="false"
        definition="Media de convocatorias que consume un alumno para cerrar una asignatura troncal. 1,00 significa que se aprueba a la primera."
        :base="`Dato oficial de ${officialYears.at(-1)}`"
    />

</section>

</template>

<style scoped>

.kpiGrid{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(210px,1fr));

    gap:18px;

    margin-bottom:34px;

}

</style>
