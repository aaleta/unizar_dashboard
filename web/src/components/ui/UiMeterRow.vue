<script setup>
/**
 * Fila de barra horizontal: rótulo, barra y cifra.
 *
 * Dos tonos, y la distinción no es estética:
 *
 *   difficulty → la barra sube por la rampa. Solo para tasas de dificultad.
 *   neutral    → gris. Para referencias y medias, que no son la dificultad de
 *                nadie: la media de un curso no es una asignatura dura, es la
 *                línea contra la que se compara.
 *
 * `difficultyValue` va aparte de `value` a propósito. Al comparar una
 * asignatura con su curso se dibuja el % que APRUEBA (barra larga = bueno)
 * pero se colorea por el % que NO SUPERA (rojo = duro). Longitud y color
 * responden a preguntas distintas, y colapsarlas en un solo número obligaría
 * a elegir cuál de las dos se cuenta mal.
 */

import { computed } from "vue";

import { difficultyFill, difficultyInk } from "@/theme/difficulty";

const props = defineProps({
    label: {
        type: String,
        required: true
    },

    // Lo que mide la LONGITUD de la barra, en %.
    value: {
        type: Number,
        default: null
    },

    // Cifra ya formateada. Sin ella se usa el propio value redondeado.
    display: {
        type: String,
        default: null
    },

    tone: {
        type: String,
        default: "difficulty",
        validator: value => ["difficulty", "neutral"].includes(value)
    },

    // Lo que decide el COLOR. Por defecto, el mismo que la longitud.
    difficultyValue: {
        type: Number,
        default: undefined
    },

    // Ancho del rótulo: fijo para que todas las barras arranquen alineadas.
    labelWidth: {
        type: Number,
        default: 118
    },

    muted: {
        type: Boolean,
        default: false
    }
});

const source = computed(() =>
    props.difficultyValue === undefined ? props.value : props.difficultyValue
);

const fill = computed(() =>
    props.tone === "neutral"
        ? "var(--count-fill)"
        : difficultyFill(source.value)
);

const ink = computed(() =>
    props.tone === "neutral"
        ? "var(--ink-soft)"
        : difficultyInk(source.value, true)
);

const width = computed(() =>
    props.value === null ? 0 : Math.max(0, Math.min(100, props.value))
);

const text = computed(
    () =>
        props.display ??
        (props.value === null ? "—" : `${Math.round(props.value)}%`)
);
</script>

<template>
    <!-- El `title` es para el ratón: la cifra ya está a la derecha, pero con
     el rótulo cortado por el ancho conviene poder leer de qué es. -->
    <div class="row" :title="`${label}: ${text}`">
        <span
            class="label"
            :class="{ muted }"
            :style="{ '--meter-label-default': `${labelWidth}px` }"
        >
            {{ label }}
        </span>

        <div class="track">
            <div
                class="fill"
                :style="{ width: `${width}%`, background: fill }"
            ></div>
        </div>

        <span class="value num" :style="{ color: ink }">
            {{ text }}
        </span>
    </div>
</template>

<style scoped>
.row {
    display: flex;

    align-items: center;

    gap: 9px;
}

.label {
    flex: none;

    /* El ancho lo fija quien la coloca con la prop, pero una pantalla puede
       cambiarlo por CSS —en escritorio los nombres tienen más sitio— y para
       eso no vale un estilo en línea: se gana con la variable. */
    width: var(--meter-label-width, var(--meter-label-default));

    font-size: var(--text-body-xs);

    color: var(--ink);

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

.label.muted {
    color: var(--ink-muted);
}

.track {
    flex: 1;

    height: 9px;

    border-radius: 5px;

    background: var(--count-track);

    overflow: hidden;
}

.fill {
    height: 100%;

    /* Una barra a 0 % desaparece y parece un fallo de carga; 2px dicen
       "medido, y sale casi nada". */
    min-width: 2px;
}

.value {
    flex: none;

    width: 34px;

    text-align: right;

    font-size: var(--text-num-sm);
}
</style>
