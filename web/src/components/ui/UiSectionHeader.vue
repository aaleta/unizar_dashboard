<script setup>

/**
 * Cabecera de grupo dentro de una pantalla: "TRONCALES · 12" con su línea y,
 * a la derecha, el rótulo de la columna ("% que no aprueba").
 *
 * El contador va pegado al título y en carbón porque es estructura del grado
 * —cuántas asignaturas hay—, no una medida de nada. La misma cifra en la rampa
 * de dificultad diría algo falso.
 *
 * El tono `accent` es el de las optativas, que es como se distingue el bloque
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
        default: "carbon",
        validator: value => ["carbon", "accent", "muted"].includes(value)
    }

});

</script>

<template>

<div class="header">

    <span
        class="label"
        :class="tone"
    >
        {{ label }}<template v-if="count !== null"> · {{ count }}</template>
    </span>

    <div class="rule"></div>

    <span
        v-if="hint"
        class="hint"
    >
        {{ hint }}
    </span>

</div>

</template>

<style scoped>

/* La regla no acompaña al rótulo: lo continúa. Por eso el rótulo se pega a
   ella sin margen y la regla llega hasta el borde del contenido — es una
   cabecera de listado impreso, no un título con adorno. */
.header{

    display:flex;

    align-items:center;

    gap:8px;

}

.label{

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    white-space:nowrap;

}

.carbon{

    color:var(--carbon);

}

.accent{

    color:var(--accent-ink);

}

.muted{

    color:var(--ink-soft);

}

.rule{

    flex:1;

    height:var(--rule-strong);

    background:var(--line);

}

.hint{

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    letter-spacing:.06em;

    text-transform:uppercase;

    color:var(--ink-faint);

    white-space:nowrap;

}

</style>
