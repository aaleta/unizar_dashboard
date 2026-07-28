<script setup>
import { ref, computed, watch } from "vue";

import ProfGraph from "./ProfGraph.vue";

import { ALL_YEARS, availableYears } from "@/utils/NodesLinks";

const years = [...availableYears].sort((a, b) => b.localeCompare(a));

// Por defecto, la vista agregada: es la que responde "quién trabaja con quién".
const selectedYear = ref(ALL_YEARS);

const isAggregated = computed(() => selectedYear.value === ALL_YEARS);

const minWeight = ref(0.5);

/**
 * En un solo curso los pesos son pequeños (una asignatura de 2 profesores vale
 * 0,5), así que el umbral por defecto del agregado escondería casi todo.
 */
watch(isAggregated, aggregated => {
    minWeight.value = aggregated ? 0.5 : 0;
});
</script>

<template>
    <div class="page">
        <header class="hero">
            <h1>Red de colaboración docente</h1>

            <p>
                Cada nodo es un profesor y cada enlace, una asignatura
                compartida. Compartir una asignatura de dos profesores pesa más
                que compartir una de veinte: cada pareja suma
                <strong>1/n</strong> por asignatura y curso, donde <em>n</em> es
                el número de profesores de esa asignatura ese año.
            </p>
        </header>

        <div class="controls">
            <label class="control">
                <span class="controlLabel">Curso académico</span>

                <select v-model="selectedYear">
                    <option :value="ALL_YEARS">
                        Todos los años (agregado)
                    </option>

                    <option v-for="year in years" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>
            </label>

            <label class="control grow">
                <span class="controlLabel">
                    Peso mínimo de colaboración: {{ minWeight.toFixed(2) }}
                </span>

                <input
                    v-model.number="minWeight"
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                />

                <span class="hint">
                    Sube el filtro para quedarte solo con las colaboraciones
                    estrechas y repetidas.
                </span>
            </label>
        </div>

        <ProfGraph :year="selectedYear" :min-weight="minWeight" />
    </div>
</template>

<style scoped>
.page {
    width: 100%;

    min-height: 100vh;

    padding: 50px;

    box-sizing: border-box;

    background: #0f172a;

    color: white;
}

.hero {
    max-width: 1400px;

    margin: 0 auto 26px;
}

.hero h1 {
    margin: 0 0 12px;

    font-size: 2.6rem;
}

.hero p {
    max-width: 820px;

    margin: 0;

    color: #94a3b8;

    font-size: 1rem;

    line-height: 1.65;
}

.hero strong {
    color: white;
}

.controls {
    display: flex;

    flex-wrap: wrap;

    gap: 28px;

    max-width: 1400px;

    margin: 0 auto 22px;
}

.control {
    display: flex;

    flex-direction: column;

    gap: 8px;
}

.control.grow {
    flex: 1;

    min-width: 260px;

    max-width: 460px;
}

.controlLabel {
    color: #94a3b8;

    font-size: 0.75rem;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.5px;
}

.control select {
    background: #1e293b;

    color: white;

    border: 1px solid #334155;

    border-radius: 10px;

    padding: 10px 14px;

    font-size: 0.95rem;

    cursor: pointer;
}

.control select:focus {
    outline: none;

    border-color: #38bdf8;
}

.control input[type="range"] {
    accent-color: #38bdf8;

    cursor: pointer;
}

.hint {
    color: #64748b;

    font-size: 0.75rem;

    line-height: 1.4;
}

@media (max-width: 768px) {
    .page {
        margin-left: 0;

        width: 100%;

        padding: 24px 16px 90px;
    }

    .hero h1 {
        font-size: 1.9rem;
    }

    .controls {
        gap: 18px;
    }
}
</style>
