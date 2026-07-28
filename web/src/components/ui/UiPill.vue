<script setup>

/**
 * Etiqueta de metadato: TRONCAL, 1º CURSO, CÓD. 26907, ÷ matriculados.
 *
 * Solo informa; no se pulsa (para eso está UiChip). En mono y mayúsculas
 * porque es metadato, no prosa.
 *
 * El tono carbón marca lo estructural —el carácter de la asignatura, el curso,
 * el denominador de un indicador—; el neutro, lo accesorio, como el código; y
 * el rojo, lo elegible (las optativas), que es la única familia de la web que
 * no es obligatoria y merece la única tinta directa que hay.
 */

defineProps({

    tone: {
        type: String,
        default: "carbon",
        validator: value => ["carbon", "neutral", "accent"].includes(value)
    }

});

</script>

<template>

<span
    class="pill"
    :class="tone"
>
    <slot />
</span>

</template>

<style scoped>

.pill{

    display:inline-flex;

    align-items:center;

    padding:3px 7px;

    border-radius:var(--radius-pill);

    border:var(--rule) solid;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    line-height:1.5;

    white-space:nowrap;

}

.carbon{

    border-color:var(--carbon-line);

    color:var(--ink);

}

.neutral{

    border-color:var(--line-dashed);

    color:var(--ink-soft);

}

.accent{

    border-color:var(--accent);

    color:var(--accent-ink);

}

</style>
