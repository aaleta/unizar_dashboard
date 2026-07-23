<script setup>

/**
 * Chip de filtro u orden ("Todas", "Troncales", "Más fáciles"…).
 *
 * Es un <button>, no un <span> con @click: se alcanza con teclado, se anuncia
 * como control y responde a Enter y Espacio sin escribir nada. `aria-pressed`
 * dice si está activo, que es justo lo que el relleno navy indica en pantalla.
 *
 * El activo va relleno de navy porque un filtro es estructura, no un dato.
 */

defineProps({

    active: {
        type: Boolean,
        default: false
    },

    /**
     * Píldora para FILTRAR (quitar cosas de la lista), rectángulo para ORDENAR
     * (las mismas cosas en otro orden). Son gestos distintos y el diseño los
     * distingue por la forma, no solo por dónde están.
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

    padding:6px 11px;

    border:1px solid var(--line-chip);

    background:var(--surface);

    color:var(--ink-3);

    font-family:var(--font-sans);

    font-size:var(--text-body-sm);

    font-weight:600;

    line-height:1.4;

    white-space:nowrap;

    cursor:pointer;

    transition:background .15s,border-color .15s,color .15s;

}

.chip.pill{

    border-radius:var(--radius-pill);

}

.chip.rounded{

    border-radius:8px;

    padding:7px 11px;

}

.chip::after{

    content:"";

    position:absolute;

    inset:50% 0 auto;

    height:var(--touch-target);

    transform:translateY(-50%);

}

.chip.active{

    background:var(--navy);

    border-color:var(--navy);

    color:var(--ink-on-navy);

}

.chip:active{

    transform:scale(.97);

}

</style>
