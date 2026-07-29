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
 *
 * `variant="band"` es la misma cabecera cuando en escritorio encabeza una banda
 * entera y no un grupo dentro de una columna: el rótulo crece a titular, el
 * recuento se queda en mono y la línea pasa de atravesarla a cerrarla por
 * abajo. En el móvil las dos variantes se ven igual, porque allí no hay bandas.
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
    },

    variant: {
        type: String,
        default: "rule",
        validator: value => ["rule", "band"].includes(value)
    }
});
</script>

<template>
    <div class="header" :class="[variant, `on-${tone}`]">
        <span class="label" :class="tone">
            {{ label
            }}<template v-if="count !== null"
                ><span class="separator"> · </span
                ><span class="count num" :class="tone">{{
                    count
                }}</span></template
            >
        </span>

        <div class="divider"></div>

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
    /* Sin encogerse: con `flex` por defecto, en una columna estrecha el rótulo
       se comprime, el texto se sale de su caja y la línea le pasa por encima.
       Quien cede sitio es la línea, que para eso es un filete. */
    flex: none;

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

/* El filete que va entre el rótulo y la pista. NO se llama `rule`: ese es el
   nombre de la variante, y la variante viaja como clase en la raíz — un
   `.rule` aquí le pegaba también a la cabecera entera, que se quedaba en 1px
   de alto y con el filete cruzándola de lado a lado por detrás del texto. */
.divider {
    flex: 1;

    min-width: 8px;

    height: 1px;

    background: var(--line);
}

.hint {
    flex: 0 1 auto;

    overflow: hidden;

    text-overflow: ellipsis;

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    color: var(--ink-soft);

    white-space: nowrap;
}

/* La pista de una cabecera de banda es de escritorio: en el móvil no hay banda
   —ni ancho— y la frase se come el rótulo. Las cabeceras de grupo sí la
   enseñan, que para eso caben en una línea. */
.header.band .hint {
    display: none;
}

/* La banda de escritorio: un titular de verdad, con la línea cerrándola por
   abajo en vez de atravesarla. */
@media (min-width: 900px) {
    .header.band {
        align-items: baseline;

        justify-content: space-between;

        gap: 20px;

        padding-bottom: 10px;

        border-bottom: 1px solid var(--line-rule);
    }

    .header.band.on-gold {
        border-bottom-color: var(--gold-line);
    }

    .header.band .label {
        font-family: var(--font-serif);

        font-size: 21px;

        font-weight: 600;

        letter-spacing: 0;

        text-transform: none;

        color: var(--ink);
    }

    .header.band .count {
        margin-left: 8px;

        font-size: 15px;
    }

    /* El punto separa dos cosas del mismo tamaño; aquí el recuento ya se
       distingue por la familia y el color. */
    .header.band .separator,
    .header.band .divider {
        display: none;
    }

    .header.band .hint {
        display: block;

        font-size: var(--text-num-sm);
    }
}
</style>
