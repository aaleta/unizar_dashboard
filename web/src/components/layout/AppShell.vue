<script setup>
/**
 * La carcasa. Dos formas de la misma aplicación, no dos aplicaciones:
 *
 *   móvil       marca arriba, banda de título, contenido y pestañas abajo
 *   escritorio  lateral fija a la izquierda y, a su derecha, la misma banda
 *               de título y el mismo contenido
 *
 * Lo que cambia es la navegación —una barra de cuatro pestañas no tiene
 * sentido en 1440px, y una lateral de 244px no cabe en 402— y el ancho útil.
 * El contenido de las once pantallas es el mismo objeto en los dos casos: lo
 * reparte el CSS de cada vista, no una segunda copia de nada.
 *
 * El título de cada pantalla sale de `meta` en el router, no de la propia
 * vista. Así la lista entera de títulos se lee de un vistazo en un solo
 * fichero, en vez de estar repartida por once componentes.
 *
 * El desplazamiento es el del documento, no el de un contenedor interno: es lo
 * que permite que la barra de direcciones del móvil se recoja al bajar. Un
 * `overflow:auto` interno la deja fija y roba 60px de pantalla para siempre, y
 * en escritorio dejaría además sin efecto la cabecera pegajosa de la tabla.
 */

import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { pageHeader } from "@/composables/usePageHeader";
import { navigationLoading } from "@/composables/useNavigationProgress";
import { useViewport } from "@/composables/useViewport";

import AppHeader from "./AppHeader.vue";
import AppPageTitle from "./AppPageTitle.vue";
import AppSidebar from "./AppSidebar.vue";
import BottomTabBar from "./BottomTabBar.vue";
import MoreSheet from "./MoreSheet.vue";

const route = useRoute();

const { isDesktop } = useViewport();

/**
 * El `meta` de la ruta manda salvo que la pantalla afine su cabecera con
 * usePageHeader: hay títulos que no se saben hasta tener los datos delante,
 * como el nombre de la asignatura de una ficha, y migas que dependen de a qué
 * curso pertenece.
 */
const header = computed(() => ({
    title: pageHeader.value?.title ?? route.meta.title ?? null,
    eyebrow: pageHeader.value?.eyebrow ?? route.meta.eyebrow ?? null,
    breadcrumbs: pageHeader.value?.breadcrumbs ?? null,
    source: pageHeader.value?.source ?? route.meta.source ?? null,
    footer: pageHeader.value?.footer ?? route.meta.footer ?? null
}));

const sheetOpen = ref(false);

// Si se navega por cualquier otra vía (un enlace de dentro, el botón atrás del
// navegador), la hoja no debe quedarse abierta sobre una pantalla distinta.
watch(
    () => route.fullPath,
    () => {
        sheetOpen.value = false;
    }
);
</script>

<template>
    <div class="shell" :class="{ desktop: isDesktop }">
        <AppSidebar
            v-if="isDesktop"
            :source="header.source"
            :footer="header.footer"
        />
        <AppHeader v-else />

        <div class="column">
            <!-- Barra de carga: solo aparece si la pantalla tarda. `aria-hidden`
             a propósito — el cambio de página ya se anuncia solo, y un
             "cargando" hablado en cada toque sería ruido. -->
            <div
                v-if="navigationLoading"
                class="progress"
                aria-hidden="true"
            ></div>

            <main class="body">
                <AppPageTitle
                    :title="header.title"
                    :eyebrow="header.eyebrow"
                    :breadcrumbs="header.breadcrumbs"
                />
                <div class="content">
                    <slot />
                </div>
            </main>
        </div>

        <template v-if="!isDesktop">
            <BottomTabBar
                :sheet-open="sheetOpen"
                @toggle-sheet="sheetOpen = !sheetOpen"
            />

            <MoreSheet :open="sheetOpen" @close="sheetOpen = false" />
        </template>
    </div>
</template>

<style scoped>
.shell {
    display: flex;

    flex-direction: column;

    min-height: 100dvh;
}

.column {
    display: flex;

    flex-direction: column;

    flex: 1;

    min-width: 0;
}

/* Pegada bajo la cabecera, que es sticky: la barra tiene que verse aunque se
   haya bajado un poco antes de tocar el enlace. */
.progress {
    position: sticky;

    top: 0;

    z-index: 9;

    height: 2px;

    overflow: hidden;

    background: var(--line);
}

.progress::after {
    content: "";

    display: block;

    width: 40%;

    height: 100%;

    background: var(--navy);

    animation: slide 1s ease-in-out infinite;
}

@keyframes slide {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(350%);
    }
}

.body {
    flex: 1;

    /* Hueco para que la barra fija no tape el final del contenido: nadie
       debería tener que adivinar que queda una fila más debajo. */
    padding-bottom: calc(
        var(--tab-bar-height) + env(safe-area-inset-bottom) + 12px
    );
}

.content {
    max-width: var(--content-max);

    margin: 0 auto;
}

/**
 * Escritorio.
 *
 * Dos variables y ya está colocada la rejilla entera: --content-max deja de
 * valer 520px y --gutter pasa de 16 a 32, que es el margen del diseño. Como
 * las once vistas ya pintan su relleno horizontal con --gutter y su ancho con
 * --content-max, ninguna necesita saber que existe el escritorio para caer
 * donde toca.
 */
.shell.desktop {
    flex-direction: row;

    --content-max: var(--content-max-desktop);
    --gutter: 32px;
}

.shell.desktop .body {
    padding-bottom: 34px;
}
</style>
