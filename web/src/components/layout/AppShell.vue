<script setup>

/**
 * La carcasa: cabecera navy arriba, contenido en medio, pestañas abajo.
 *
 * Qué cabecera lleva cada pantalla sale de `meta` en el router, no de la
 * propia vista. Así el mapa de navegación —quién cuelga de quién, qué eyebrow
 * lleva cada rama— se lee de un vistazo en un solo fichero, en vez de estar
 * repartido por once componentes.
 *
 * El desplazamiento es el del documento, no el de un contenedor interno: es lo
 * que permite que la barra de direcciones del móvil se recoja al bajar. Un
 * `overflow:auto` interno la deja fija y roba 60px de pantalla para siempre.
 *
 * Nota del rediseño: por ahora la barra de pestañas se usa en cualquier ancho.
 * El escritorio tendrá su propia navegación cuando le toque; hasta entonces el
 * contenido se limita a --content-max y se centra, para que en un portátil se
 * vea contenido y no una columna estirada.
 */

import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { pageHeader } from "@/composables/usePageHeader";

import AppHeader from "./AppHeader.vue";
import BottomTabBar from "./BottomTabBar.vue";
import MoreSheet from "./MoreSheet.vue";

const route = useRoute();

/**
 * El `meta` de la ruta manda salvo que la pantalla afine su cabecera con
 * usePageHeader: hay títulos que no se saben hasta tener los datos delante.
 */
const header = computed(() => ({
    variant: "identity",
    back: "/",
    ...route.meta,
    ...pageHeader.value
}));

const sheetOpen = ref(false);

// Si se navega por cualquier otra vía (un enlace de dentro, el botón atrás del
// navegador), la hoja no debe quedarse abierta sobre una pantalla distinta.
watch(() => route.fullPath, () => {
    sheetOpen.value = false;
});

</script>

<template>

<div class="shell">

    <AppHeader
        :variant="header.header || header.variant"
        :title="header.title"
        :eyebrow="header.eyebrow"
        :back="header.back"
    />

    <main class="body">
        <div class="content">
            <slot />
        </div>
    </main>

    <BottomTabBar
        :sheet-open="sheetOpen"
        @toggle-sheet="sheetOpen = !sheetOpen"
    />

    <MoreSheet
        :open="sheetOpen"
        @close="sheetOpen = false"
    />

</div>

</template>

<style scoped>

.shell{

    display:flex;

    flex-direction:column;

    min-height:100dvh;

}

.body{

    flex:1;

    /* Hueco para que la barra fija no tape el final del contenido: nadie
       debería tener que adivinar que queda una fila más debajo. */
    padding-bottom:calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 12px);

}

.content{

    max-width:var(--content-max);

    margin:0 auto;

}

</style>
