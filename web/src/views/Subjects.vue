<script setup>
/**
 * La lista maestra: todas las asignaturas del grado, planas y ordenables.
 *
 * Es lo contrario del mapa del grado a propósito. El mapa enseña la ESTRUCTURA
 * —qué va con qué, qué es obligatorio— y esconde el detalle; aquí no hay
 * estructura ninguna: una fila por asignatura, ordenadas por lo que se pida.
 * Quien quiere comparar dos asignaturas de cursos distintos no puede hacerlo
 * en el mapa, y quien quiere entender la carrera no puede hacerlo aquí.
 *
 * Filas densas, de dos líneas y un porcentaje: con más de cincuenta
 * asignaturas, tarjetas obligarían a cinco pantallas de scroll para lo que
 * aquí cabe en dos.
 */

import { computed, ref } from "vue";

import { SORTS, useSubjectList } from "@/composables/useSubjectList";
import { useViewport } from "@/composables/useViewport";
import { COHORT, EMPTY, SEARCH, weightedAverages } from "@/content/copy";
import { pct } from "@/utils/format";
import { difficultyFill, difficultyInk } from "@/theme/difficulty";

import SubjectsTable from "@/components/subjects/SubjectsTable.vue";
import UiChip from "@/components/ui/UiChip.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiSortHeader from "@/components/ui/UiSortHeader.vue";

/** Cuántas filas se ven antes de tener que pedir el resto. */
const PREVIEW = 12;

const { isDesktop } = useViewport();

const {
    query,
    tipo,
    course,
    sortKey,
    descending,
    sortBy,
    results,
    total,
    empty
} = useSubjectList();

/**
 * Las dos métricas que caben en la cabecera del móvil. El rótulo sale de
 * SORTS: la tabla de escritorio enseña estas mismas y no debería llamarlas de
 * otra manera.
 */
const SORT_METRICS = [SORTS.noSuperacion, SORTS.enrolment].map(sort => ({
    key: sort.key,
    label: sort.short ?? sort.label
}));

const TIPOS = [
    { value: "todas", label: "Todas" },
    { value: "troncal", label: "Troncales" },
    { value: "optativa", label: "Optativas" }
];

/** El filtro de curso, como grupo de botones: cinco opciones a la vista. */
const COURSES = ["todos", 1, 2, 3, 4];

const courseLabel = value => (value === "todos" ? "Todos" : `${value}º`);

const expanded = ref(false);

const visible = computed(() =>
    expanded.value ? results.value : results.value.slice(0, PREVIEW)
);

/**
 * La línea de metadatos cambia con el orden: si se ordena por matriculados, lo
 * que interesa ver al lado del nombre es cuánta gente la cursa, no la tasa de
 * aprobados.
 */
const meta = row =>
    [
        row.tipo === "troncal" ? "T" : "O",
        row.courses.map(c => `${c}º`).join("/"),
        `${Math.round(row.enrolment)} matr`,
        sortKey.value === "enrolment"
            ? `no superan ${pct(row.noSuperacion)}`
            : `aprueban ${pct(row.rendimiento)}`
    ].join(" · ");
</script>

<template>
    <div class="screen">
        <div class="controls">
            <!-- El buscador es el mismo objeto en las dos pantallas: en el
             móvil abre los filtros y en escritorio se va a la banda de
             título, que es donde el diseño pone los controles. -->
            <Teleport defer to="#pageActions" :disabled="!isDesktop">
                <UiSearchField
                    v-model="query"
                    class="search"
                    :placeholder="SEARCH.subjects(total)"
                    :label="SEARCH.subjectsLabel"
                />
            </Teleport>

            <div class="chips">
                <UiChip
                    v-for="option in TIPOS"
                    :key="option.value"
                    :active="tipo === option.value"
                    @click="tipo = option.value"
                >
                    {{ option.label }}
                </UiChip>
            </div>

            <span class="onlyWide divider" aria-hidden="true"></span>

            <div class="courses">
                <span class="eyebrow onlyWide courseLabel">Curso</span>

                <!-- Cinco botones no caben en 402px; el desplegable nativo sí,
                 y se abre con la rueda del sistema. -->
                <label v-if="!isDesktop" class="courseChip">
                    <span class="visuallyHidden">Filtrar por curso</span>
                    <select
                        v-model="course"
                        :class="{ active: course !== 'todos' }"
                    >
                        <option value="todos">Curso</option>
                        <option v-for="n in 4" :key="n" :value="n">
                            {{ n }}º
                        </option>
                    </select>
                </label>

                <div v-else class="courseButtons">
                    <button
                        v-for="option in COURSES"
                        :key="option"
                        type="button"
                        class="courseButton"
                        :class="{
                            active: course === option,
                            num: option !== 'todos'
                        }"
                        :aria-pressed="course === option"
                        @click="course = option"
                    >
                        {{ courseLabel(option) }}
                    </button>
                </div>
            </div>

            <span class="onlyWide num count">
                {{ results.length }} de {{ total }} · {{ weightedAverages() }}
            </span>
        </div>

        <template v-if="isDesktop">
            <p v-if="empty" class="emptyState">{{ EMPTY.subjects }}</p>

            <SubjectsTable
                v-else
                :rows="results"
                :sort-key="sortKey"
                :descending="descending"
                @sort="sortBy"
            />
        </template>

        <UiSortHeader
            v-if="!isDesktop"
            :metrics="SORT_METRICS"
            :active-key="sortKey"
            :descending="descending"
            @sort="sortBy"
        />

        <p v-if="!isDesktop && empty" class="emptyState">
            {{ EMPTY.subjects }}
        </p>

        <ul v-else-if="!isDesktop" class="rows">
            <li v-for="row in visible" :key="row.code">
                <RouterLink :to="`/asignatura/${row.code}`" class="row">
                    <span
                        class="dot"
                        :class="{ hollow: row.tipo === 'optativa' }"
                        :style="
                            row.tipo === 'optativa'
                                ? {
                                      borderColor: difficultyFill(
                                          row.noSuperacion
                                      )
                                  }
                                : {
                                      background: difficultyFill(
                                          row.noSuperacion
                                      )
                                  }
                        "
                    ></span>

                    <span class="identity">
                        <span class="name">
                            {{ row.name }}
                            <span
                                v-if="row.smallCohort"
                                class="warn"
                                :title="COHORT.warning"
                                >⚠</span
                            >
                        </span>
                        <span class="meta">{{ meta(row) }}</span>
                    </span>

                    <span
                        class="value num"
                        :style="{
                            color: difficultyInk(row.noSuperacion, true)
                        }"
                    >
                        {{ pct(row.noSuperacion) }}
                    </span>
                </RouterLink>
            </li>

            <li v-if="results.length > PREVIEW">
                <button
                    type="button"
                    class="more"
                    @click="expanded = !expanded"
                >
                    {{
                        expanded
                            ? "− ver menos"
                            : `＋ ${results.length - PREVIEW} asignaturas más`
                    }}
                </button>
            </li>
        </ul>

        <p class="footnote">{{ weightedAverages() }} · {{ COHORT.legend }}.</p>
    </div>
</template>

<style scoped>
/* Buscador arriba, ocupando su línea, y debajo los dos filtros en la misma:
   el de tipo y el de curso son la misma pregunta partida en dos y separarlos
   en dos filas los hacía parecer cosas distintas. */
.controls {
    display: flex;

    flex-wrap: wrap;

    align-items: center;

    row-gap: 9px;

    column-gap: 6px;

    padding: 13px var(--gutter) 11px;

    border-bottom: 1px solid var(--line-rule);
}

.controls > .search {
    flex-basis: 100%;
}

.chips {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;
}

/* El filtro de curso es un <select> disfrazado de chip: cinco opciones no
   merecen cinco chips, y el desplegable nativo se abre con la rueda del
   sistema y funciona con teclado sin escribir una línea. */
.courseChip select {
    min-height: var(--touch-target);

    padding: 6px 11px;

    border: 1px solid var(--line-chip);

    border-radius: var(--radius-pill);

    background: var(--surface);

    color: var(--ink-3);

    font-family: var(--font-sans);

    font-size: var(--text-body-sm);

    font-weight: 600;
}

.courseChip select.active {
    background: var(--navy);

    border-color: var(--navy);

    color: var(--ink-on-navy);
}

.rows {
    margin: 0;

    padding: 0;

    list-style: none;
}

.row {
    display: flex;

    align-items: center;

    gap: 11px;

    min-height: var(--touch-target);

    padding: 11px var(--gutter);

    border-bottom: 1px solid var(--line-row);

    color: var(--ink);
}

.row:active {
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

.identity {
    flex: 1;

    min-width: 0;
}

.name {
    display: block;

    font-size: 14px;

    font-weight: 600;

    line-height: 1.2;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

.warn {
    color: var(--attention);
}

.meta {
    display: block;

    margin-top: 2px;

    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    color: var(--ink-soft);
}

.value {
    flex: none;

    font-size: var(--text-metric);
}

.more {
    display: flex;

    align-items: center;

    width: 100%;

    min-height: var(--touch-target);

    padding: 0 var(--gutter);

    border: none;

    background: none;

    font-family: var(--font-mono);

    font-size: 10px;

    color: var(--ink-soft);

    cursor: pointer;
}

.more:active {
    color: var(--navy);
}

.emptyState {
    margin: 0;

    padding: 26px var(--gutter);

    text-align: center;

    font-size: var(--text-body);

    color: var(--ink-soft);
}

.footnote {
    margin: 12px 0 0;

    padding: 12px var(--gutter) 0;

    border-top: 1px solid var(--line-rule);

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.6;

    color: var(--ink-soft);
}

.visuallyHidden {
    position: absolute;

    width: 1px;

    height: 1px;

    overflow: hidden;

    clip-path: inset(50%);

    white-space: nowrap;
}

/* Solo en escritorio ---------------------------------------------------- */

.onlyWide {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * La lista se convierte en tabla y los filtros salen de la columna para
 * ocupar su propia banda, con el recuento a la derecha.
 */

@media (min-width: 900px) {
    .screen {
        padding: 0 var(--gutter) 30px;
    }

    /* El buscador vive en la banda de título, no aquí. */
    .search {
        width: 340px;
    }

    .controls {
        display: flex;

        align-items: center;

        gap: 22px;

        /* A sangre de la columna: es una banda de la pantalla, no un bloque
           del contenido. */
        margin: 0 calc(-1 * var(--gutter));

        padding: 14px var(--gutter) 13px;

        border-bottom: 1px solid var(--line-rule);
    }

    .chips {
        flex-wrap: nowrap;

        gap: 7px;
    }

    .onlyWide {
        display: block;
    }

    .divider {
        width: 1px;

        height: 22px;

        background: var(--line);
    }

    .courses {
        display: flex;

        align-items: center;

        gap: 9px;
    }

    .courseLabel {
        font-size: var(--text-eyebrow);
    }

    .courseButtons {
        display: flex;

        gap: 6px;
    }

    .courseButton {
        min-width: 36px;

        padding: 7px 10px;

        border: 1px solid var(--line-chip);

        border-radius: var(--radius-pill);

        background: var(--surface);

        color: var(--ink-3);

        font-family: var(--font-sans);

        font-size: 12px;

        font-weight: 600;

        cursor: pointer;
    }

    .courseButton.num {
        font-family: var(--font-mono);
    }

    .courseButton:hover {
        border-color: var(--line-strong);
    }

    .courseButton.active {
        background: var(--navy);

        border-color: var(--navy);

        color: var(--ink-on-navy);
    }

    .count {
        margin-left: auto;

        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    .table {
        margin-top: 18px;
    }

    .emptyState {
        padding: 40px var(--gutter);
    }

    .hideWide {
        display: none;
    }

    /* La leyenda ---------------------------------------------------------- */

    .legend {
        display: flex;

        align-items: center;

        gap: 24px;

        margin-top: 16px;

        padding-top: 14px;

        border-top: 1px solid var(--line-rule);
    }

    .legendItem {
        display: flex;

        align-items: center;

        gap: 7px;

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--ink-muted);
    }

    .legendDot {
        width: 9px;

        height: 9px;

        border-radius: 50%;

        background: var(--ink-icon);
    }

    .legendDot.hollow {
        background: transparent;

        border: 2px solid var(--ink-icon);

        box-sizing: border-box;
    }

    .legendWarn {
        color: var(--attention);
    }

    .legendNote {
        margin-left: auto;

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--ink-soft);
    }
}
</style>
