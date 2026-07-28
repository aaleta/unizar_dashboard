<script setup>

/**
 * Chip de filtro u orden ("Todas", "Troncales", "Más fáciles"…).
 *
 * Es un <button>, no un <span> con @click: se alcanza con teclado, se anuncia
 * como control y responde a Enter y Espacio sin escribir nada. `aria-pressed`
 * dice si está activo, que es justo lo que el relleno de tinta indica en
 * pantalla.
 *
 * El activo va entintado del todo porque un filtro es estructura, no un dato.
 * Y entintado del todo significa eso: fondo carbón y texto en papel, sin
 * medias tintas.
 */

defineProps({

    active: {
        type: Boolean,
        default: false
    },

    /**
     * `pill` para FILTRAR (quitar cosas de la lista), `rounded` para ORDENAR
     * (las mismas cosas en otro orden). Son gestos distintos y el diseño los
     * distingue por la forma, no solo por dónde están.
     *
     * Sin radios que los separen, la distinción pasa al encuadre: el filtro
     * es una casilla cerrada con regla de dos píxeles —marcas o no marcas—;
     * el orden es un rótulo con una barra debajo, como la pestaña de un
     * archivador. Los nombres de la prop se quedan como estaban: describen el
     * papel, no la geometría.
     */
    shape: {
        type: String,
        default: "pill",
        validator: value => ["pill", "rounded"].includes(value)
    }

});

</script>

<template>

<button
    type="button"
    class="chip"
    :class="[shape, { active }]"
    :aria-pressed="active"
>
    <slot />
</button>

</template>

<style scoped>

.chip{

    display:inline-flex;

    align-items:center;

    /* El chip mide 30px de alto, pero el área que responde al dedo llega a los
       44px con el pseudo-elemento de abajo. Agrandar el chip visible rompería
       la fila; dejarlo en 30px reales haría fallar a la mitad de los toques. */
    position:relative;

    padding:6px 10px;

    border:var(--rule-strong) solid var(--line-chip);

    background:var(--surface);

    color:var(--ink-3);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    line-height:1.4;

    white-space:nowrap;

    cursor:pointer;

    transition:background .1s steps(1),border-color .1s steps(1),color .1s steps(1);

}

.chip.pill{

    border-radius:var(--radius-pill);

}

/* El de ordenar no lleva casilla: solo el rótulo y su barra. Al activarse la
   barra se entinta y engorda, que es lo que hace una pestaña de archivador
   cuando la sacas. */
.chip.rounded{

    border-radius:0;

    padding:6px 2px;

    border:none;

    border-bottom:var(--rule-strong) solid var(--line-inner);

    background:none;

}

.chip::after{

    content:"";

    position:absolute;

    inset:50% 0 auto;

    height:var(--touch-target);

    transform:translateY(-50%);

}

.chip.pill.active{

    background:var(--carbon);

    border-color:var(--carbon);

    color:var(--on-carbon);

}

.chip.rounded.active{

    border-bottom-color:var(--accent);

    color:var(--ink);

}

.chip:active{

    transform:translate(1px,1px);

}

</style>
