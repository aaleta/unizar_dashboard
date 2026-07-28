<script setup>
/**
 * Fila pulsable de una lista: asignatura, profesor, destino del menú "Más".
 *
 * Tres huecos —`lead`, el centro, `trail`— y el chevron opcional. Con eso se
 * montan la fila del mapa del grado (punto + nombre + %), la del buscador de
 * profesores (nombre + alcance) y las del menú, sin que cada pantalla se
 * invente su propio alto y su propio padding.
 *
 * Alto mínimo de 44px: es una lista para el dedo, y una fila de 30px se falla
 * más de lo que se acierta. Que el contenido sea corto no es motivo para
 * encoger el objetivo táctil.
 */

defineProps({
    // RouterLink si navega; sin `to`, un <div> que no finge ser pulsable.
    to: {
        type: [String, Object],
        default: null
    },

    variant: {
        type: String,
        default: "solid",
        validator: value => ["solid", "dashed", "plain"].includes(value)
    },

    chevron: {
        type: Boolean,
        default: false
    },

    // Marca la fila abierta: borde navy a la izquierda y fondo estructural.
    selected: {
        type: Boolean,
        default: false
    }
});
</script>

<template>
    <component
        :is="to ? 'RouterLink' : 'div'"
        :to="to || undefined"
        class="row"
        :class="[variant, { selected, tappable: !!to }]"
    >
        <slot name="lead" />

        <div class="main">
            <slot />
        </div>

        <slot name="trail" />

        <svg
            v-if="chevron"
            class="chevron"
            width="7"
            height="12"
            viewBox="0 0 8 14"
            aria-hidden="true"
        >
            <path
                d="M1 1l6 6-6 6"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    </component>
</template>

<style scoped>
.row {
    display: flex;

    align-items: center;

    gap: 9px;

    min-height: var(--touch-target);

    padding: 7px 11px;

    border-radius: var(--radius-row);

    color: var(--ink);

    text-decoration: none;
}

.main {
    flex: 1;

    min-width: 0;

    font-size: var(--text-body);
}

.solid {
    background: var(--surface);

    border: 1px solid var(--line);
}

.dashed {
    background: transparent;

    border: 1px dashed var(--line-dashed);
}

.plain {
    background: none;

    border: 1px solid transparent;
}

.tappable {
    transition:
        background 0.15s,
        border-color 0.15s;
}

.tappable:active {
    background: var(--navy-wash);
}

.selected {
    background: var(--navy-wash);

    border-color: var(--navy-wash-line);

    /* El borde izquierdo marca la fila abierta sin desplazar el contenido:
       se pinta por dentro, así la fila no cambia de tamaño al seleccionarse. */
    box-shadow: inset 3px 0 0 var(--navy);
}

.chevron {
    flex: none;

    color: var(--ink-faint);
}
</style>
