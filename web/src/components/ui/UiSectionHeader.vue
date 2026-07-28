<script setup>
/**
 * Cabecera de grupo dentro de una pantalla: "TRONCALES · 12" con su línea y,
 * a la derecha, el rótulo de la columna ("% que no aprueba").
 *
 * El contador va pegado al título y en navy porque es estructura del grado
 * —cuántas asignaturas hay—, no una medida de nada. La misma cifra en la rampa
 * de dificultad diría algo falso.
 *
 * El tono `gold` es el de las optativas, que es como se distingue el bloque
 * elegible del obligatorio sin repetir la palabra en cada fila.
 */

defineProps({
    label: {
        type: String,
        required: true
    },

    // Nº de elementos del grupo. Se pinta detrás del título, tras un punto.
    count: {
        type: [Number, String],
        default: null
    },

    // Rótulo tenue alineado a la derecha (qué mide la columna).
    hint: {
        type: String,
        default: null
    },

    tone: {
        type: String,
        default: "navy",
        validator: value => ["navy", "gold", "muted"].includes(value)
    }
});
</script>

<template>
    <div class="header">
        <span class="label" :class="tone">
            {{ label }}<template v-if="count !== null"> · {{ count }}</template>
        </span>

        <div class="rule"></div>

        <span v-if="hint" class="hint">
            {{ hint }}
        </span>
    </div>
</template>

<style scoped>
.header {
    display: flex;

    align-items: center;

    gap: 7px;
}

.label {
    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    font-weight: 600;

    letter-spacing: 0.5px;

    text-transform: uppercase;

    white-space: nowrap;
}

.navy {
    color: var(--navy);
}

.gold {
    color: var(--gold-ink);
}

.muted {
    color: var(--ink-soft);
}

.rule {
    flex: 1;

    height: 1px;

    background: var(--line);
}

.hint {
    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    color: var(--ink-faint);

    white-space: nowrap;
}
</style>
