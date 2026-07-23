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

    border:1px solid var(--line);

}

.dashed{

    background:var(--surface-alt);

    border:1px dashed var(--line-dashed);

    /* Sin sombra: lo discontinuo debe parecer más ligero, no igual. */
    box-shadow:none;

}

.structural{

    background:var(--navy-wash);

    border:1px solid var(--navy-wash-line);

    box-shadow:none;

}

/* Cuando la tarjeta es un enlace, tiene que responder al dedo. */
a.card{

    color:inherit;

    transition:border-color .15s,transform .15s;

}

a.card:active{

    transform:scale(.995);

    border-color:var(--line-strong);

}

</style>
