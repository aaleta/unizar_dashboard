<script setup>

/**
 * La banda navy de arriba, en dos versiones:
 *
 *   identidad → la marca. Logotipo de la Universidad en negativo, un filete
 *               vertical y el nombre del grado. Es para las pantallas raíz,
 *               a las que se llega por pestaña.
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

// Pasa por Vite para que el fichero se versione y se cachee como el resto.
import logoNegativo from "@/assets/logo-unizar-negativo.svg";

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

            <!-- El alt es información, no adorno: quien no ve el logotipo
                 tiene que saber igualmente de qué universidad se trata. -->
            <img
                class="logo"
                :src="logoNegativo"
                alt="Universidad de Zaragoza"
            >

            <span
                class="divider"
                aria-hidden="true"
            ></span>

            <span class="brand">{{ title || "Grado en Física" }}</span>

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

    background:var(--navy-surface);

    color:var(--ink-on-navy);

    /* Filete de oro: cierra la banda por abajo y marca dónde acaba el cromo
       institucional y empieza el contenido. */
    border-bottom:2px solid var(--gold-rule);

    /* El relleno superior absorbe la muesca del móvil. En un navegador de
       escritorio env() vale 0 y no se nota. */
    padding:calc(13px + env(safe-area-inset-top)) var(--gutter) 12px;

}

/* La banda navy ocupa todo el ancho, pero su contenido se alinea con el del
   resto de la pantalla: en un portátil, el logotipo pegado al borde izquierdo
   mientras el contenido va centrado se ve como un fallo. */
.inner{

    display:flex;

    align-items:center;

    gap:13px;

    max-width:var(--content-max);

    margin:0 auto;

}

/* Alto fijo y ancho libre: el logotipo es vertical y lo que hay que fijar es
   la línea de la banda, no la caja. */
.logo{

    height:28px;

    width:auto;

    flex:none;

}

/* Separa la marca de la Universidad del nombre del grado: son dos cosas
   distintas y sin la línea se leen como un solo bloque. */
.divider{

    width:1px;

    height:22px;

    flex:none;

    background:var(--on-navy-divider);

}

.brand{

    font-family:var(--font-serif);

    font-size:17px;

    font-weight:600;

    color:var(--ink-on-navy);

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
