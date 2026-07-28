<script setup>

/**
 * Una cifra con su rótulo: "21 / optativas", "267 / profesores".
 *
 * Se agrupan en filas de resumen bajo los títulos de pantalla. La cifra manda
 * y va en mono; el rótulo es pequeño y tenue, porque quien mira ya sabe lo que
 * busca y lee el número primero.
 *
 * `tone` sirve para lo que el handoff pide en varias pantallas: el recuento de
 * troncales en carbón y el de optativas en rojo, para que la división del grado
 * se lea sin explicarla. Sigue siendo estructura, no una magnitud.
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
        validator: value => ["ink", "carbon", "accent"].includes(value)
    }

});

</script>

<template>

<div class="stat">

    <div
        class="value num"
        :class="tone"
    >
        {{ value }}
    </div>

    <div class="label">
        {{ label }}
    </div>

</div>

</template>

<style scoped>

.stat{

    min-width:0;

}

.value{

    font-size:22px;

    letter-spacing:-.03em;

    line-height:1;

}

.ink{

    color:var(--ink);

}

.carbon{

    color:var(--ink);

}

.accent{

    color:var(--accent-ink);

}

.label{

    margin-top:3px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--ink-soft);

}

</style>
