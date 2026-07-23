<script setup>

/**
 * La banda navy de arriba, en dos versiones:
 *
 *   identidad → la marca. Tesela dorada con la "F" y el nombre del grado.
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

    background:var(--navy);

    color:var(--ink-on-navy);

    /* El relleno superior absorbe la muesca del móvil. En un navegador de
       escritorio env() vale 0 y no se nota. */
    padding:calc(12px + env(safe-area-inset-top)) var(--gutter) 13px;

}

/* La banda navy ocupa todo el ancho, pero su contenido se alinea con el del
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

    width:24px;

    height:24px;

    flex:none;

    border-radius:6px;

    background:var(--gold);

    color:var(--navy);

    font-family:var(--font-serif);

    font-size:14px;

    font-weight:700;

}

.brand{

    font-family:var(--font-serif);

    font-size:17px;

    font-weight:600;

}

.back{

    display:flex;

    align-items:center;

    justify-content:center;

    position:relative;

    width:30px;

    height:30px;

    flex:none;

    padding:0;

    border:none;

    border-radius:8px;

    background:rgba(255,255,255,.12);

    color:var(--navy-faint);

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

    background:rgba(255,255,255,.2);

}

.titles{

    display:flex;

    flex-direction:column;

    min-width:0;

    line-height:var(--leading-tight);

}

.titles .eyebrow{

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow-sm);

    font-weight:500;

    letter-spacing:.4px;

    text-transform:uppercase;

    /* Sobre navy el gris del papel no se ve: este azul claro es el que el
       diseño reserva para el texto secundario dentro de la banda. */
    color:var(--navy-faint);

}

.title{

    font-family:var(--font-serif);

    font-size:14px;

    font-weight:600;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

</style>
