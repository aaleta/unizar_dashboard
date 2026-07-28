<script setup>

/**
 * Etiqueta de metadato: TRONCAL, 1º CURSO, CÓD. 26907, ÷ matriculados.
 *
 * Solo informa; no se pulsa (para eso está UiChip). Pequeña y con tracking
 * ancho porque es metadato, no prosa.
 *
 * El tono navy marca lo estructural —el carácter de la asignatura, el curso,
 * el denominador de un indicador—; el neutro, lo accesorio, como el código.
 */

defineProps({

    tone: {
        type: String,
        default: "navy",
        validator: value => ["navy", "neutral", "verd"].includes(value)
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

    padding:3px 8px;

    border-radius:var(--radius-pill);

    border:1px solid;

    font-family:var(--font-sans);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--tracking-eyebrow);

    line-height:var(--leading-body);

    white-space:nowrap;

}

.navy{

    border-color:var(--navy-line);

    color:var(--navy);

}

.neutral{

    border-color:var(--line-strong);

    color:var(--ink-soft);

}

.verd{

    border-color:var(--verd);

    color:var(--verd-ink);

}

</style>
