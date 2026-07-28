<script setup>
/**
 * Etiqueta de metadato: TRONCAL, 1º CURSO, CÓD. 26907, ÷ matriculados.
 *
 * Solo informa; no se pulsa (para eso está UiChip). En mono y mayúsculas
 * porque es metadato, no prosa.
 *
 * El tono navy marca lo estructural —el carácter de la asignatura, el curso,
 * el denominador de un indicador—; el neutro, lo accesorio, como el código.
 */

defineProps({
    tone: {
        type: String,
        default: "navy",
        validator: value => ["navy", "neutral", "gold"].includes(value)
    }
});
</script>

<template>
    <span class="pill" :class="tone">
        <slot />
    </span>
</template>

<style scoped>
.pill {
    display: inline-flex;

    align-items: center;

    padding: 3px 8px;

    border-radius: var(--radius-pill);

    border: 1px solid;

    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    font-weight: 600;

    line-height: 1.5;

    white-space: nowrap;
}

.navy {
    border-color: var(--navy-line);

    color: var(--navy);
}

.neutral {
    border-color: var(--line-strong);

    color: var(--ink-soft);
}

.gold {
    border-color: var(--gold);

    color: var(--gold-ink);
}
</style>
