<script setup>
/**
 * La lista maestra de escritorio: una tabla de verdad.
 *
 * En el móvil cada asignatura es una fila de dos líneas y la segunda cambia
 * según el orden, porque solo cabe un dato al lado del nombre. Aquí caben los
 * cinco a la vez, así que dejan de turnarse y pasan a ser columnas fijas: se
 * puede recorrer una columna de arriba abajo, que es lo que una tabla sirve
 * para hacer y una lista no.
 *
 * No decide nada: el filtrado y el orden siguen viniendo de `useSubjectList`,
 * el mismo que usa el móvil. Esto es solo la otra forma de enseñarlo.
 */

import { COHORT } from "@/content/copy";
import { SORTS } from "@/composables/useSubjectList";
import { pct } from "@/utils/format";
import { difficultyFill, difficultyInk } from "@/theme/difficulty";

import UiIcon from "@/components/ui/UiIcon.vue";
import UiSortHeader from "@/components/ui/UiSortHeader.vue";

defineProps({
    rows: {
        type: Array,
        required: true
    },

    sortKey: {
        type: String,
        required: true
    },

    descending: {
        type: Boolean,
        default: true
    }
});

defineEmits(["sort"]);

/**
 * Las columnas, con su ancho. La cabecera y las filas leen esta misma lista:
 * es la única forma de que sigan cuadrando cuando alguien cambie un ancho.
 *
 * El rótulo sale de SORTS, que es donde se decide cómo se llama cada métrica.
 */
const COLUMNS = [
    {
        key: "course",
        label: "Curso",
        width: 44,
        sortable: false,
        tone: "soft",
        text: row => row.courses.map(course => `${course}º`).join("/")
    },
    {
        key: "enrolment",
        width: 56,
        text: row => String(Math.round(row.enrolment))
    },
    {
        key: "noSuperacion",
        width: 84,
        // La cifra que manda en la pantalla, y la única que va en la rampa.
        strong: true,
        color: row => difficultyInk(row.noSuperacion, true),
        text: row => pct(row.noSuperacion)
    },
    {
        key: "rendimiento",
        width: 76,
        text: row => pct(row.rendimiento)
    },
    {
        key: "excelencia",
        width: 70,
        tone: "soft",
        text: row => pct(row.excelencia)
    }
].map(column => ({
    ...column,
    label: column.label ?? SORTS[column.key].short ?? SORTS[column.key].label
}));
</script>

<template>
    <div class="table">
        <UiSortHeader
            variant="table"
            :metrics="COLUMNS"
            :active-key="sortKey"
            :descending="descending"
            @sort="$emit('sort', $event)"
        />

        <RouterLink
            v-for="row in rows"
            :key="row.code"
            :to="`/asignatura/${row.code}`"
            class="row"
        >
            <span
                class="dot"
                :class="{ hollow: row.tipo === 'optativa' }"
                :style="
                    row.tipo === 'optativa'
                        ? { borderColor: difficultyFill(row.noSuperacion) }
                        : { background: difficultyFill(row.noSuperacion) }
                "
            ></span>

            <span class="name">
                {{ row.name }}
                <span
                    v-if="row.smallCohort"
                    class="warn"
                    :title="COHORT.warning"
                    >⚠</span
                >
            </span>

            <span
                v-for="column in COLUMNS"
                :key="column.key"
                class="cell"
                :class="[column.tone, { strong: column.strong }]"
                :style="{
                    width: `${column.width}px`,
                    color: column.color ? column.color(row) : null
                }"
            >
                {{ column.text(row) }}
            </span>

            <UiIcon name="chevronRight" :size="14" :width="2" class="chevron" />
        </RouterLink>
    </div>
</template>

<style scoped>
/* `clip` y no `hidden`: con `hidden`, la tarjeta se convierte en contenedor de
   desplazamiento y la cabecera pegajosa deja de pegarse. */
.table {
    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: var(--radius-card-lg);

    box-shadow: var(--shadow-card);

    overflow: clip;
}

.row {
    display: flex;

    align-items: center;

    gap: 12px;

    min-height: var(--touch-target);

    padding: 0 16px;

    border-bottom: 1px solid var(--line-row);

    color: var(--ink);

    /* Las cifras de la fila son mono y tabulares por defecto; el nombre se
       sale de esa regla más abajo, que es texto. */
    font-family: var(--font-mono);

    font-variant-numeric: tabular-nums;

    font-size: var(--text-body-sm);
}

.row:last-child {
    border-bottom: none;
}

.row:hover {
    background: var(--navy-wash);
}

.dot {
    width: 9px;

    height: 9px;

    flex: none;

    border-radius: 50%;
}

.dot.hollow {
    background: transparent;

    border: 2px solid;

    box-sizing: border-box;
}

.name {
    flex: 1;

    min-width: 0;

    font-family: var(--font-sans);

    font-size: 13px;

    font-weight: 600;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;
}

.warn {
    color: var(--attention);
}

.cell {
    flex: none;

    text-align: right;

    color: var(--ink-2);
}

.cell.soft {
    color: var(--ink-soft);
}

.cell.strong {
    font-size: 13px;

    font-weight: 600;
}

.chevron {
    flex: none;

    color: var(--ink-chevron);
}
</style>
