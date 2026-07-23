<script setup>

/**
 * Mapa del grado — "la espina dorsal". La pantalla principal del rediseño:
 * los cuatro cursos en una línea de tiempo, con sus troncales y sus optativas.
 *
 * ANDAMIO DE LA FASE 2. Aquí solo hay lo justo para que la pestaña "El Grado"
 * lleve a algún sitio y se pueda probar la navegación completa. El contenido
 * de verdad llega en la fase 3 (ver MOBILE_REDESIGN_PLAN.md).
 */

import { allCoreSubjects, allOptionalSubjects } from "@/utils/metrics";

import UiCallout from "@/components/ui/UiCallout.vue";
import UiStat from "@/components/ui/UiStat.vue";

const COURSES = 4;

</script>

<template>

<div class="screen">

    <div class="stats">
        <UiStat
            :value="COURSES"
            label="cursos"
            tone="navy"
        />
        <UiStat
            :value="allCoreSubjects.length"
            label="troncales"
            tone="navy"
        />
        <UiStat
            :value="allOptionalSubjects.length"
            label="optativas"
            tone="gold"
        />
    </div>

    <UiCallout
        tone="structural"
        title="Pendiente: el mapa del grado"
    >
        La línea de tiempo con los cuatro cursos, sus troncales y sus optativas
        llega en la fase 3. Las cifras de arriba ya salen de los datos reales.
    </UiCallout>

</div>

</template>

<style scoped>

.screen{

    display:flex;

    flex-direction:column;

    gap:var(--gap-section);

    padding:15px var(--gutter);

}

.stats{

    display:flex;

    flex-wrap:wrap;

    gap:22px;

}

</style>
