<script setup>
/**
 * Una cifra con su rótulo: "21 / optativas", "267 / profesores".
 *
 * Se agrupan en filas de resumen bajo los títulos de pantalla. La cifra manda
 * y va en mono; el rótulo es pequeño y tenue, porque quien mira ya sabe lo que
 * busca y lee el número primero.
 *
 * `tone` tiñe el recuento de troncales en navy y el de optativas en oro, para
 * que la división del grado se lea sin explicarla. Sigue siendo estructura,
 * no una magnitud.
 */

defineProps({
    // Cifra ya formateada: aquí no se calcula ni se redondea nada.
    value: {
        type: [String, Number],
        required: true
    },

    label: {
        type: String,
        required: true
    },

    tone: {
        type: String,
        default: "ink",
        validator: value => ["ink", "navy", "gold"].includes(value)
    }
});
</script>

<template>
    <div class="stat">
        <div class="value num" :class="tone">
            {{ value }}
        </div>

        <div class="label">
            {{ label }}
        </div>
    </div>
</template>

<style scoped>
.stat {
    min-width: 0;
}

.value {
    font-size: 19px;

    line-height: 1.1;
}

.ink {
    color: var(--ink);
}

.navy {
    color: var(--navy);
}

.gold {
    color: var(--gold-ink);
}

.label {
    margin-top: 2px;

    font-size: var(--text-eyebrow);

    color: var(--ink-soft);
}

/* En escritorio la tira de cifras es la entradilla de la pantalla y manda
   sobre todo lo demás. */
@media (min-width: 900px) {
    .value {
        font-size: 32px;

        line-height: 1;
    }

    .label {
        margin-top: 7px;

        font-size: var(--text-body);
    }
}
</style>
