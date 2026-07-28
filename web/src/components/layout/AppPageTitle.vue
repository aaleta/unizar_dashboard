<script setup>

/**
 * La banda de título: dice en qué pantalla estás, justo debajo de la marca.
 *
 * Es el h1 del documento. Antes cada vista abría con su propio titular y no
 * había dos iguales —unas con antetítulo, otras con una tesela, otras con un
 * párrafo de entrada—, así que la parte de arriba de la aplicación cambiaba
 * de forma en cada pantalla. Ahora el titular sale de un solo sitio y todas
 * las pantallas empiezan igual.
 *
 * Sigue el mismo navy que la cabecera para que las dos bandas se lean como
 * una sola pieza, pero NO es sticky: se va al bajar y deja la pantalla para
 * el contenido, que es lo que se ha venido a ver.
 */

defineProps({

    title: {
        type: String,
        default: null
    }

});

</script>

<template>

<div
    v-if="title"
    class="band"
>
    <h1 class="title">{{ title }}</h1>
</div>

</template>

<style scoped>

.band{

    background:var(--navy-surface);

    padding:15px var(--gutter) 17px;

    /* Sube 1px para que no se vea costura con la cabecera al hacer zoom. El
       filete de oro no se tapa: la cabecera es sticky y pinta por encima. */
    margin-top:-1px;

}

.title{

    max-width:var(--content-max);

    margin:0 auto;

    font-family:var(--font-serif);

    font-size:var(--text-h1);

    font-weight:700;

    line-height:1.15;

    color:var(--ink-on-navy);

    /* Los títulos largos —el nombre de una asignatura— parten mejor por
       donde el sentido lo pide que por donde cae el ancho. */
    text-wrap:pretty;

}

</style>
