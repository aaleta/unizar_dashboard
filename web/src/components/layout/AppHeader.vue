<script setup>

/**
 * La banda de tinta de arriba, en dos versiones:
 *
 *   identidad → la marca. Cuadro rojo con la "F" y el nombre del grado.
 *               Es para las pantallas raíz, a las que se llega por pestaña.
 *   interior  → chevron de vuelta, eyebrow con la ruta padre y título.
 *               Es para las pantallas a las que se llega desde otra.
 *
 * El eyebrow existe porque el título solo no dice de dónde vienes: "Ficha de
 * asignatura" puede haberse abierto desde el mapa del grado, desde la lista o
 * desde optativas, y saber en qué rama estás es la mitad de la orientación.
 *
 * La flecha de vuelta usa el historial cuando lo hay y cae a la ruta padre
 * cuando no: alguien que entra directo por un enlace compartido no tiene
 * historial, y un botón "atrás" que no hace nada es peor que no ponerlo.
 */

import { useRouter } from "vue-router";

import UiIcon from "@/components/ui/UiIcon.vue";

const props = defineProps({

    variant: {
        type: String,
        default: "identity",
        validator: value => ["identity", "inner"].includes(value)
    },

    title: {
        type: String,
        default: null
    },

    eyebrow: {
        type: String,
        default: null
    },

    // Ruta padre a la que volver si no hay historial propio.
    back: {
        type: String,
        default: "/"
    }

});

const router = useRouter();

const goBack = () => {

    if (window.history.state?.back) {
        router.back();
        return;
    }

    router.push(props.back);

};

</script>

<template>

<header class="header">

    <div class="inner">

        <template v-if="variant === 'identity'">

            <span
                class="mark"
                aria-hidden="true"
            >F</span>

            <span class="brand">{{ title || "El Grado en Física" }}</span>

        </template>

        <template v-else>

            <button
                type="button"
                class="back"
                aria-label="Volver"
                @click="goBack"
            >
                <UiIcon
                    name="chevronLeft"
                    :size="14"
                    :width="2"
                />
            </button>

            <span class="titles">
                <span
                    v-if="eyebrow"
                    class="eyebrow"
                >{{ eyebrow }}</span>
                <span class="title">{{ title }}</span>
            </span>

        </template>

    </div>

</header>

</template>

<style scoped>

.header{

    /* Pegada arriba: en una lista de 54 asignaturas, perder de vista de qué
       pantalla se trata en cuanto bajas un poco desorienta. */
    position:sticky;

    top:0;

    z-index:10;

    background:var(--carbon);

    color:var(--on-carbon);

    /* La única regla roja que aparece en TODAS las pantallas. Es la firma de
       la dirección: bloque de tinta cortado por la tinta directa. */
    border-bottom:3px solid var(--accent);

    /* El relleno superior absorbe la muesca del móvil. En un navegador de
       escritorio env() vale 0 y no se nota. */
    padding:calc(12px + env(safe-area-inset-top)) var(--gutter) 12px;

}

/* La banda de tinta ocupa todo el ancho, pero su contenido se alinea con el del
   resto de la pantalla: en un portátil, el logotipo pegado al borde izquierdo
   mientras el contenido va centrado se ve como un fallo. */
.inner{

    display:flex;

    align-items:center;

    gap:9px;

    max-width:var(--content-max);

    margin:0 auto;

}

.mark{

    display:flex;

    align-items:center;

    justify-content:center;

    width:26px;

    height:26px;

    flex:none;

    background:var(--accent);

    color:var(--on-carbon);

    font-family:var(--font-display);

    font-size:16px;

    font-weight:900;

    letter-spacing:-.04em;

    line-height:1;

}

.brand{

    font-family:var(--font-display);

    font-size:16px;

    font-weight:900;

    letter-spacing:var(--track-display-tight);

    text-transform:uppercase;

    line-height:1;

}

.back{

    display:flex;

    align-items:center;

    justify-content:center;

    position:relative;

    width:28px;

    height:28px;

    flex:none;

    padding:0;

    border:var(--rule) solid var(--carbon-faint);

    background:none;

    color:var(--carbon-faint);

    cursor:pointer;

}

/* El botón mide 30px, pero lo que responde al dedo llega a 44px. */
.back::after{

    content:"";

    position:absolute;

    left:50%;

    top:50%;

    width:var(--touch-target);

    height:var(--touch-target);

    transform:translate(-50%,-50%);

}

.back:active{

    background:var(--accent);

    border-color:var(--accent);

    color:var(--on-carbon);

}

.titles{

    display:flex;

    flex-direction:column;

    min-width:0;

    line-height:1.15;

}

.titles .eyebrow{

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow-sm);

    font-weight:600;

    letter-spacing:var(--track-label-wide);

    text-transform:uppercase;

    /* Sobre el bloque de tinta, el gris del papel se apaga: este es el tono
       que el diseño reserva para el texto secundario dentro de la banda. */
    color:var(--carbon-faint);

}

.title{

    font-family:var(--font-display);

    font-size:15px;

    font-weight:800;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

</style>
