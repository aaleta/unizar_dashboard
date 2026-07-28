<script setup>

/**
 * La superficie sobre la que se apoya casi todo.
 *
 * La variante `dashed` es la de las optativas: borde discontinuo y fondo
 * ligeramente distinto. No es decoración, es información — al hojear la
 * pantalla se ve de un vistazo qué es obligatorio y qué se elige, sin leer.
 *
 * Sin márgenes propios a propósito: quien la coloca decide el espacio. Una
 * primitiva que trae su propio margen se pelea con todos los layouts.
 */

defineProps({

    variant: {
        type: String,
        default: "solid",
        validator: value => ["solid", "dashed", "structural"].includes(value)
    },

    // `false` para tarjetas densas que ponen su propio padding.
    padded: {
        type: Boolean,
        default: true
    },

    // Etiqueta del elemento: `article`, `li`, `RouterLink`…
    as: {
        type: [String, Object],
        default: "div"
    }

});

</script>

<template>

<component
    :is="as"
    class="card"
    :class="[variant, { padded }]"
>
    <slot />
</component>

</template>

<style scoped>

/* Nada de sombras: lo que delimita una tarjeta es su regla de tinta. Por eso
   el borde es de dos píxeles y del color del texto — es la misma tinta, y el
   ojo lo lee como una caja dibujada, no como una superficie flotando. */

.card{

    display:block;

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

    min-width:0;

}

.card.padded{

    padding:var(--pad-card);

}

.solid{

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

}

.dashed{

    background:var(--surface-alt);

    border:var(--rule) dashed var(--line-dashed);

    /* Regla fina y discontinua: lo elegible tiene que pesar menos que lo
       obligatorio, y aquí el peso es literalmente el grosor del trazo. */
    box-shadow:none;

}

.structural{

    background:var(--carbon-wash);

    border:var(--rule-strong) solid var(--carbon-wash-line);

    box-shadow:none;

}

/* Cuando la tarjeta es un enlace, tiene que responder al dedo. */
a.card{

    color:inherit;

    text-decoration:none;

    transition:border-color .1s steps(1),transform .1s steps(1);

}

/* Al pulsar, la tarjeta se desplaza un píxel y su regla pasa a rojo: el gesto
   de un sello que se apoya, no el de un botón de goma. `steps(1)` corta la
   interpolación — aquí nada se desliza. */
a.card:active{

    transform:translate(1px,1px);

    border-color:var(--accent);

}

</style>
