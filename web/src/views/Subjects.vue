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

import { useSubjectList } from "@/composables/useSubjectList";
import { difficultyFill, difficultyInk } from "@/theme/difficulty";

import UiChip from "@/components/ui/UiChip.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiSortHeader from "@/components/ui/UiSortHeader.vue";

/** Cuántas filas se ven antes de tener que pedir el resto. */
const PREVIEW = 12;

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

const SORT_METRICS = [
    { key: "noSuperacion", label: "No superan" },
    { key: "enrolment", label: "Matr." }
];

const TIPOS = [
    { value: "todas", label: "Todas" },
    { value: "troncal", label: "Troncales" },
    { value: "optativa", label: "Optativas" }
];

const expanded = ref(false);

const visible = computed(() =>
    expanded.value ? results.value : results.value.slice(0, PREVIEW)
);

const pct = value => (value === null ? "—" : `${Math.round(value)}%`);

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
            <UiSearchField
                v-model="query"
                :placeholder="`Buscar entre ${total} asignaturas…`"
                label="Buscar asignatura"
            />

            <div class="chips">
                <UiChip
                    v-for="option in TIPOS"
                    :key="option.value"
                    :active="tipo === option.value"
                    @click="tipo = option.value"
                >
                    {{ option.label }}
                </UiChip>

                <label class="courseChip">
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
            </div>
        </div>

        <UiSortHeader
            :metrics="SORT_METRICS"
            :active-key="sortKey"
            :descending="descending"
            @sort="sortBy"
        />

        <p v-if="empty" class="emptyState">
            Ninguna asignatura coincide con la búsqueda.
        </p>

        <ul v-else class="rows">
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
                                title="Menos de 10 alumnos: los porcentajes bailan mucho"
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

        <p class="footnote">
            Medias ponderadas de los últimos 3 cursos · ⚠ = menos de 10 alumnos.
        </p>
    </div>
</template>

<style scoped>
.controls {
    padding: 13px var(--gutter) 11px;

    border-bottom: 1px solid var(--line-rule);
}

.chips {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;

    margin-top: 9px;
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
</style>
