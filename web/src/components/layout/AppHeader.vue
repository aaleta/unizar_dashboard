<script setup>

/**
 * La banda de marca de arriba. Es la misma en todas las pantallas: logotipo
 * de la Universidad en negativo, filete y el nombre de la aplicación.
 *
 * No lleva props a propósito. Antes tenía dos versiones —marca en las
 * pantallas raíz, chevron y título en las de dentro— y el resultado era que
 * la cabecera cambiaba de forma según dónde estuvieras. Ahora la cabecera es
 * un punto fijo y quien dice en qué pantalla estás es la banda de título que
 * va justo debajo (AppPageTitle).
 *
 * Sin flecha de volver: se vuelve con el gesto o el botón atrás del sistema,
 * y a las pantallas raíz con la barra de pestañas de abajo.
 */

// Pasa por Vite para que el fichero se versione y se cachee como el resto.
import logoNegativo from "@/assets/logo-unizar-negativo.svg";

</script>

<template>

<header class="header">

    <div class="inner">

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

        <span class="brand">Dashboard del Grado en Física</span>

    </div>

</header>

</template>

<style scoped>

.header{

    /* Pegada arriba: es el único elemento que no se mueve en toda la
       aplicación, y eso es justo lo que la hace servir de referencia. */
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

/* Separa la marca de la Universidad del nombre de la aplicación: son dos
   cosas distintas y sin la línea se leen como un solo bloque. */
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

    /* En una pantalla estrecha el nombre completo no cabe en una línea y
       partirlo dejaría la banda de dos alturas. Antes que eso, se recorta. */
    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

</style>
