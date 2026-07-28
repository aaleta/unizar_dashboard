<script setup>
/**
 * Barra de RECUENTO: matrículas, peso de colaboración, cuántos alumnos.
 *
 * Siempre gris. Una cantidad no es una dificultad: pintar de rojo la optativa
 * más matriculada diría que es dura cuando solo dice que es popular. Por eso
 * este componente no acepta color — si hiciera falta uno, el dato no es un
 * recuento y la barra no es esta.
 */

import { computed } from "vue";

const props = defineProps({
    value: {
        type: Number,
        default: 0
    },

    // Valor que llena la barra entera. Normalmente el máximo de la lista.
    max: {
        type: Number,
        default: 100
    },

    // Cifra ya formateada a la derecha. Sin ella, solo se pinta la barra.
    display: {
        type: String,
        default: null
    },

    // Apunte bajo la cifra ("13 comp."). Cuando el peso por sí solo no basta:
    // un 2,53 no dice si son trece asignaturas juntas o dos muy estrechas.
    sub: {
        type: String,
        default: null
    },

    label: {
        type: String,
        default: null
    }
});

const pct = computed(() => {
    if (!props.max || props.value === null) return 0;

    return Math.max(0, Math.min(100, (props.value / props.max) * 100));
});
</script>

<template>
    <div class="row">
        <span v-if="label" class="label">
            {{ label }}
        </span>

        <div
            class="track"
            role="img"
            :aria-label="
                label
                    ? `${label}: ${display ?? value}`
                    : String(display ?? value)
            "
        >
            <div class="fill" :style="{ width: `${pct}%` }"></div>
        </div>

        <span v-if="display !== null" class="value">
            <span class="num">{{ display }}</span>
            <span v-if="sub" class="sub">{{ sub }}</span>
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
    /* Ancho fijo para que todas las barras de la lista arranquen alineadas:
       una barra que empieza donde acaba el texto no se puede comparar. */
    width: 132px;

    flex: none;

    font-size: var(--text-body-xs);

    color: var(--ink);

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

.track {
    flex: 1;

    height: 8px;

    border-radius: 5px;

    background: var(--count-track);

    overflow: hidden;
}

.fill {
    height: 100%;

    background: var(--count-fill);
}

.value {
    flex: none;

    width: 46px;

    text-align: right;

    font-size: var(--text-num-sm);

    font-weight: 500;

    color: var(--ink-muted);
}

.sub {
    display: block;

    font-size: 7.5px;

    color: var(--ink-soft);
}
</style>
