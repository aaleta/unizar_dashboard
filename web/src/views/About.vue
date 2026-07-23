<script setup>

/**
 * Acerca de — quién lo hace, cómo y por qué.
 *
 * ANDAMIO DE LA FASE 2: existe para que el cuarto destino de la hoja "Más"
 * lleve a algo. El contenido llega en la fase 7d, con el crédito real y los
 * huecos de colaborador sin rellenar. No se inventan nombres.
 */

import UiCallout from "@/components/ui/UiCallout.vue";

const REPO = "https://github.com/aaleta/unizar_dashboard";

</script>

<template>

<div class="screen">

    <p class="mission">
        Estadísticas del Grado en Física de la Universidad de Zaragoza,
        calculadas a partir de la información oficial que publica la propia
        Universidad. La idea es sencilla: que lo que se sabe de oídas sobre qué
        asignaturas cuestan más se pueda mirar en datos abiertos.
    </p>

    <UiCallout
        tone="structural"
        title="Pendiente: la página completa"
    >
        Quién mantiene el proyecto, cómo se hizo y el descargo de
        responsabilidad llegan en la fase 7d.
    </UiCallout>

    <a
        class="repo"
        :href="REPO"
        target="_blank"
        rel="noopener noreferrer"
    >
        Ver el código en GitHub →
    </a>

</div>

</template>

<style scoped>

.screen{

    display:flex;

    flex-direction:column;

    gap:var(--gap-section);

    padding:15px var(--gutter);

}

.mission{

    margin:0;

    font-size:var(--text-body);

    line-height:var(--leading-body);

    color:var(--ink-2);

}

.repo{

    font-weight:600;

}

</style>
