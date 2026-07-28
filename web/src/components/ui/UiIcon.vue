<script setup>

/**
 * Iconos de línea, en un solo sitio.
 *
 * Van dibujados a mano y no como fuente de iconos ni paquete de npm: son diez,
 * pesan unos cientos de bytes y así no se arrastra una dependencia entera —ni
 * su hoja de estilos, ni su licencia— para pintar una casa y tres puntos.
 *
 * Todos comparten lienzo de 24×24 y `currentColor`, de modo que el color lo
 * decide quien los coloca. Un icono que trae su propio color no se puede
 * reutilizar en la barra de pestañas, donde el activo es tinta y el resto gris.
 *
 * La dirección "Ficha técnica" les quita las puntas redondeadas y los radios:
 * remates a escuadra, esquinas en ángulo y trazo de 2px. Un icono con la
 * punta redondeada al lado de una caja con esquina de 90° canta muchísimo.
 */

defineProps({

    name: {
        type: String,
        required: true
    },

    size: {
        type: [Number, String],
        default: 20
    },

    width: {
        type: Number,
        default: 2
    },

    // Un icono decorativo se oculta a los lectores de pantalla; uno que ES la
    // etiqueta (un botón sin texto) necesita título.
    title: {
        type: String,
        default: null
    }

});

const PATHS = {

    // Barra de pestañas
    home: '<path d="M3 11l9-7 9 7M5 10v9h14v-9" />',
    layers:
        '<path d="M12 3l9 5-9 5-9-5 9-5z" />' +
        '<path d="M3 12l9 5 9-5M3 16.5l9 5 9-5" stroke-linecap="square" />',
    bookmark: '<path d="M6 3.5h12V21l-6-4-6 4V3.5z" />',
    dots:
        '<rect x="3.4" y="4.4" width="3.2" height="3.2" fill="currentColor" stroke="none" />' +
        '<rect x="3.4" y="10.4" width="3.2" height="3.2" fill="currentColor" stroke="none" />' +
        '<rect x="3.4" y="16.4" width="3.2" height="3.2" fill="currentColor" stroke="none" />' +
        '<path d="M9 6h11M9 12h11M9 18h11" stroke-linecap="square" />',

    // Navegación
    chevronLeft: '<path d="M15 4l-7 8 7 8" stroke-linecap="square" stroke-linejoin="miter" />',
    chevronRight: '<path d="M9 4l7 8-7 8" stroke-linecap="square" stroke-linejoin="miter" />',
    close: '<path d="M5 5l14 14M19 5L5 19" stroke-linecap="square" />',

    // Destinos del menú "Más"
    calendar:
        '<rect x="4" y="5" width="16" height="15.5" />' +
        '<path d="M4 9.5h16M8.5 3v4M15.5 3v4" stroke-linecap="square" />',
    teachers:
        '<circle cx="7" cy="8" r="3" />' +
        '<circle cx="17" cy="8" r="3" />' +
        '<path d="M2 20c0-3 2.5-5 5-5s5 2 5 5M12 20c0-3 2.5-5 5-5s5 2 5 5" stroke-linecap="square" />',
    document:
        '<path d="M5 4h11l3 3v13H5z" stroke-linejoin="miter" />' +
        '<path d="M8 10h8M8 14h8M8 17h5" stroke-linecap="square" />',
    info:
        '<rect x="3" y="3" width="18" height="18" />' +
        '<path d="M12 11v5" stroke-linecap="square" />' +
        '<rect x="10.9" y="6.7" width="2.2" height="2.2" fill="currentColor" stroke="none" />',

    search:
        '<circle cx="11" cy="11" r="7" stroke-width="2" />' +
        '<path d="M20 20l-3.5-3.5" stroke-width="2" stroke-linecap="square" />'

};

</script>

<template>

<svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="width"
    stroke-linejoin="miter"
    :role="title ? 'img' : undefined"
    :aria-hidden="title ? undefined : 'true'"
    :aria-label="title || undefined"
>
    <!-- eslint-disable-next-line vue/no-v-html -- Cadenas literales de este
         mismo fichero, nunca datos: no hay superficie de inyección. -->
    <g v-html="PATHS[name]"></g>
</svg>

</template>
