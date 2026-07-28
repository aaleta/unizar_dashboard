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
 * Va en tinta sobre el papel, no en una segunda banda navy: la banda de arriba
 * es la marca y se queda fija, y el título es de la página, así que pertenece
 * a la página y se va con ella al bajar.
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

/* Sin relleno inferior: el hueco hasta el contenido lo pone el `padding-top`
   que cada pantalla ya tenía. Poner otro aquí los sumaría a los dos. */
.band{

    padding:18px var(--gutter) 0;

}

.title{

    max-width:var(--content-max);

    margin:0 auto;

    font-family:var(--font-serif);

    font-size:var(--text-h1-lg);

    font-weight:700;

    line-height:1.15;

    color:var(--ink);

    /* Los títulos largos —el nombre de una asignatura— parten mejor por
       donde el sentido lo pide que por donde cae el ancho. */
    text-wrap:pretty;

}

</style>
