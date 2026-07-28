<script setup>

/**
 * Las cuatro pestañas fijas de abajo.
 *
 * Tres navegan y la cuarta —"Más"— abre la hoja desplegable sin cambiar de
 * ruta. Es deliberado: las cuatro secundarias (profesorado, fight mode,
 * metodología, acerca de) no merecen una pestaña cada una, pero tampoco
 * merecen estar escondidas. Un menú que se despliega sobre lo que estabas
 * mirando no te hace perder el sitio.
 *
 * "El Grado" se queda activa también en la lista de asignaturas y en la ficha:
 * son la misma rama del árbol vista con más o menos zoom, y ver la pestaña
 * apagarse al abrir una asignatura da la sensación de haberte salido de la
 * sección.
 */

import { computed } from "vue";
import { useRoute } from "vue-router";

import UiIcon from "@/components/ui/UiIcon.vue";

defineProps({

    sheetOpen: {
        type: Boolean,
        default: false
    }

});

defineEmits(["toggle-sheet"]);

const route = useRoute();

const TABS = [
    {
        key: "inicio",
        label: "Inicio",
        icon: "home",
        to: "/",
        matches: path => path === "/"
    },
    {
        key: "grado",
        label: "El Grado",
        icon: "layers",
        to: "/grado",
        matches: path =>
            path.startsWith("/grado")
            || path.startsWith("/asignatura")
            || path.startsWith("/curso")
    },
    {
        key: "optativas",
        label: "Optativas",
        icon: "bookmark",
        to: "/optativas",
        matches: path => path.startsWith("/optativas")
    }
];

const activeKey = computed(() =>
    TABS.find(tab => tab.matches(route.path))?.key ?? null
);

</script>

<template>

<nav
    class="bar"
    aria-label="Secciones"
>

  <div class="inner">

    <RouterLink
        v-for="tab in TABS"
        :key="tab.key"
        :to="tab.to"
        class="tab"
        :class="{ active: !sheetOpen && activeKey === tab.key }"
        :aria-current="activeKey === tab.key ? 'page' : undefined"
    >
        <UiIcon :name="tab.icon" />
        <span class="label">{{ tab.label }}</span>
    </RouterLink>

    <button
        type="button"
        class="tab"
        :class="{ active: sheetOpen }"
        aria-haspopup="dialog"
        :aria-expanded="sheetOpen"
        @click="$emit('toggle-sheet')"
    >
        <UiIcon name="dots" />
        <span class="label">Más</span>
    </button>

  </div>

</nav>

</template>

<style scoped>

.bar{

    position:fixed;

    left:0;

    right:0;

    bottom:0;

    z-index:20;

    /* El alto son 62px de barra más lo que ocupe la barra de gestos del
       teléfono, que si no se come la fila de etiquetas. */
    height:calc(var(--tab-bar-height) + env(safe-area-inset-bottom));

    padding-bottom:env(safe-area-inset-bottom);

    background:var(--surface);

    border-top:var(--rule-strong) solid var(--line-tab);

}

/* La banda cruza toda la pantalla, pero las cuatro pestañas se agrupan
   en el ancho del contenido: repartidas por 1400px quedarían tan separadas que
   dejarían de leerse como una barra. */
.inner{

    display:flex;

    align-items:stretch;

    height:100%;

    max-width:var(--content-max);

    margin:0 auto;

    padding:0 6px;

}

/* Rejilla de un píxel: las pestañas se separan con la regla que deja el
   propio hueco entre ellas, no con espacio en blanco. Es el mismo recurso que
   usa una tabla impresa para no tener que dibujar cada celda. */
.inner .tab + .tab{

    border-left:var(--rule) solid var(--line-inner);

}

.tab{

    flex:1;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    gap:3px;

    padding:0;

    border:none;

    background:none;

    color:var(--ink-tab);

    font-family:var(--font-mono);

    text-decoration:none;

    cursor:pointer;

}

.label{

    font-size:var(--text-nav);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

}

/* La activa no cambia de color: se entinta. La barra roja de arriba la ata a
   la regla roja de la cabecera, que es el otro extremo de la pantalla. */
.tab.active{

    color:var(--ink);

    box-shadow:inset 0 3px 0 var(--accent);

}

.tab.active .label{

    font-weight:700;

}

</style>
