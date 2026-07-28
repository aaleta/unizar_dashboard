<script setup>

/**
 * El punto de dificultad que precede a cada asignatura.
 *
 * Dos informaciones en un solo glifo:
 *   - el COLOR es la tasa de no superación (rampa de dificultad);
 *   - la FORMA es el carácter: relleno = troncal, anillo hueco = optativa.
 *
 * Separar así los dos ejes es lo que permite leer el mapa del grado de un
 * vistazo sin leyenda.
 */

import { computed } from "vue";

import { difficultyFill, difficultyInk, difficultyLabel } from "@/theme/difficulty";

const props = defineProps({

    // Tasa de no superación en %. null = sin datos (gris neutro, no verde).
    value: {
        type: Number,
        default: null
    },

    // Las optativas se dibujan huecas.
    hollow: {
        type: Boolean,
        default: false
    },

    size: {
        type: Number,
        default: 8
    }

});

const color = computed(() => difficultyFill(props.value));

/**
 * El contorno va con el tono OSCURO del mismo tramo, no con el relleno.
 *
 * Es lo que salva la parte baja de la rampa: un punto de "asequible" es un
 * barro claro que sobre papel contrasta 2:1, o sea, un punto que se adivina
 * más que se ve. Un filete de su propia familia le da un borde de 3:1 sin
 * cambiar de color ni sacar el punto de la escala.
 */
const edge = computed(() => difficultyInk(props.value));

const style = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    // El anillo se hace con el borde, así el hueco deja ver el fondo real de
    // la fila (blanco en troncales, papel en optativas) sin tener que saberlo.
    background: props.hollow ? "transparent" : color.value,
    border: props.hollow ? `2px solid ${edge.value}` : `1px solid ${edge.value}`
}));

</script>

<template>

<span
    class="dot"
    :style="style"
    role="img"
    :aria-label="`Dificultad: ${difficultyLabel(value)}`"
></span>

</template>

<style scoped>

.dot{

    display:inline-block;

    border-radius:var(--radius-dot);

    flex:none;

}

</style>
