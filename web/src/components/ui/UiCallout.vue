<script setup>
/**
 * Aviso destacado. Tres tonos, tres significados distintos:
 *
 *   structural → contexto neutro ("6 troncales, aprueban el 94%"). Navy,
 *                porque es estructura, no un dato malo.
 *   hard       → la advertencia con peso ("la troncal más dura del grado").
 *                Usa la paleta cálida de la rampa, que es lo que describe.
 *   attention  → cohorte pequeña, datos poco fiables. Amarillo: pide cautela,
 *                no alarma. Un suspenso alto con 6 alumnos no es una asignatura
 *                dura, es una muestra pequeña, y decirlo en rojo mentiría.
 */

defineProps({
    tone: {
        type: String,
        default: "structural",
        validator: value => ["structural", "hard", "attention"].includes(value)
    },

    title: {
        type: String,
        default: null
    }
});
</script>

<template>
    <div class="callout" :class="tone">
        <span class="marker"></span>

        <div class="body">
            <div v-if="title" class="title">
                {{ title }}
            </div>

            <div class="text">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
.callout {
    display: flex;

    align-items: flex-start;

    gap: 9px;

    padding: 11px 13px;

    border-radius: var(--radius-card);

    border: 1px solid;
}

.marker {
    width: 9px;

    height: 9px;

    border-radius: 50%;

    flex: none;

    /* Alineado con la primera línea de texto, no con el borde de la caja. */
    margin-top: 3px;
}

.body {
    min-width: 0;
}

.title {
    font-size: var(--text-body);

    font-weight: 700;

    line-height: var(--leading-snug);
}

.text {
    font-size: var(--text-body-xs);

    line-height: var(--leading-snug);
}

/* Sin título, el texto es el mensaje y carga el peso. */
.body:not(:has(.title)) .text {
    font-weight: 500;
}

.structural {
    background: var(--navy-wash);

    border-color: var(--navy-wash-line);
}

.structural .marker {
    background: var(--navy);
}

.structural .title {
    color: var(--navy);
}

.structural .text {
    color: var(--navy-soft);
}

.hard {
    background: var(--warn-bg);

    border-color: var(--warn-line);
}

.hard .marker {
    background: var(--warn-title);
}

.hard .title {
    color: var(--warn-title);
}

.hard .text {
    color: var(--warn-body);
}

.attention {
    background: var(--attention-bg);

    border-color: var(--attention-line);
}

.attention .marker {
    background: var(--attention);
}

.attention .title,
.attention .text {
    color: var(--attention-ink);
}
</style>
