<script setup>
/**
 * Cabecera de columna ordenable de la lista maestra de asignaturas.
 *
 * La métrica activa lleva la flecha de dirección; pulsar otra reordena. El
 * orden por defecto de la web saca primero lo más duro (no superación
 * descendente), que es lo que la gente viene a mirar.
 *
 * Se queda pegada arriba al hacer scroll: una tabla de 54 filas en la que no
 * se ve qué columna manda no es una tabla, es una lista de números.
 */

defineProps({
    // Rótulo fijo de la izquierda.
    label: {
        type: String,
        default: "Asignatura"
    },

    // [{ key, label }] — las métricas por las que se puede ordenar.
    metrics: {
        type: Array,
        required: true
    },

    activeKey: {
        type: String,
        required: true
    },

    descending: {
        type: Boolean,
        default: true
    }
});

defineEmits(["sort"]);
</script>

<template>
    <div class="header">
        <span class="label">{{ label }}</span>

        <div class="metrics">
            <button
                v-for="metric in metrics"
                :key="metric.key"
                type="button"
                class="metric"
                :class="{ active: metric.key === activeKey }"
                :aria-pressed="metric.key === activeKey"
                :aria-label="
                    metric.key === activeKey
                        ? `${metric.label}, ordenado ${
                              descending
                                  ? 'de mayor a menor'
                                  : 'de menor a mayor'
                          }`
                        : `Ordenar por ${metric.label}`
                "
                @click="$emit('sort', metric.key)"
            >
                {{ metric.label }}
                <span v-if="metric.key === activeKey" aria-hidden="true">{{
                    descending ? "↓" : "↑"
                }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.header {
    display: flex;

    align-items: center;

    gap: 10px;

    position: sticky;

    top: 0;

    z-index: 2;

    padding: 8px var(--gutter);

    background: var(--surface-sunken);

    border-bottom: 1px solid var(--line-strong);
}

.label,
.metric {
    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    font-weight: 600;

    letter-spacing: 0.4px;

    text-transform: uppercase;
}

.label {
    flex: 1;

    min-width: 0;

    /* Sobre el fondo hundido, más oscuro que el papel, los grises apagados se
       quedan cortos: aquí se usa la tinta secundaria, que sí cumple. */
    color: var(--ink-2);
}

.metrics {
    display: flex;

    gap: 10px;

    flex: none;
}

.metric {
    display: inline-flex;

    align-items: center;

    gap: 4px;

    position: relative;

    padding: 0;

    border: none;

    background: none;

    color: var(--ink-2);

    cursor: pointer;
}

/* Como en los chips: el rótulo es pequeño, pero lo que responde al dedo no. */
.metric::after {
    content: "";

    position: absolute;

    inset: 50% -6px auto;

    height: var(--touch-target);

    transform: translateY(-50%);
}

.metric.active {
    color: var(--navy);
}
</style>
