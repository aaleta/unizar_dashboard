<script setup>
/**
 * Profesorado. La ÚNICA pantalla del rediseño que diverge de verdad entre
 * móvil y escritorio.
 *
 * El grafo completo son 267 nodos y 2.003 aristas: en una pantalla grande es
 * una madeja que se explora, y en un móvil es una mancha. Así que el móvil da
 * la vuelta a la pregunta —de "cómo es la red" a "con quién trabaja esta
 * persona"— y el grafo se queda para pantalla ancha.
 *
 * El componente del grafo se carga en diferido: cytoscape y vis-network pesan
 * más de medio mega entre los dos, y un teléfono no debería descargarlos para
 * ver una lista de nombres.
 *
 * Este es el patrón a repetir si el escritorio agrega más cosas que el móvil
 * no puede tener: composable de datos compartido, componente de presentación
 * por viewport, carga diferida. Nunca una segunda copia de la aplicación.
 */

import { computed, defineAsyncComponent, ref } from "vue";

import { useProfessorNetwork } from "@/composables/useProfessorNetwork";
import { useViewport } from "@/composables/useViewport";
import { EMPTY, FACULTY, SEARCH } from "@/content/copy";
import { decimal, thousands } from "@/utils/format";

import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";
import UiCountBar from "@/components/ui/UiCountBar.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiStat from "@/components/ui/UiStat.vue";

/**
 * El lienzo se carga en diferido: `vis-network` pesa medio mega y un teléfono,
 * que no lo enseña, no debería descargarlo.
 */
const FullGraph = defineAsyncComponent(
    () => import("@/components/network/ProfGraph.vue")
);

/** Cuántas personas se ven antes de tener que pedir el resto. */
const PREVIEW = 4;

const { isDesktop } = useViewport();

const query = ref("");
const selectedId = ref("");

/** Para poder pedirle al grafo que vuelva a encuadrarlo todo. */
const graph = ref(null);

/**
 * En el móvil se arranca con el claustro ACTIVO —quien aparece en la última
 * guía docente publicada—: la pregunta habitual es "¿con quién voy a dar
 * clase?", no "¿quién la dio hace ocho años?". El histórico queda a un toque.
 * (En escritorio el modo se cambia con el selector de curso del grafo.)
 */
const activeOnly = ref(true);

const {
    results,
    selected,
    totals,
    year,
    minWeight,
    aggregated,
    years,
    allYears,
    visibleGraph,
    graphStats,
    histogram
} = useProfessorNetwork(
    () => query.value,
    () => selectedId.value,
    () => activeOnly.value
);

/** Cuántos no llegan a un índice de 2. Se calcula: hoy es la mitad justa. */
const lowIndexShare = Math.round(
    ((histogram[0].count + histogram[1].count) / totals.professors) * 100
);

const topBucket = Math.max(...histogram.map(bucket => bucket.count));

const expanded = ref(false);

const topWeight = computed(
    () => selected.value?.topCollaborators[0]?.weight ?? 1
);
</script>

<template>
    <div class="screen">
        <!-- Los mandos del grafo. No tocan la lista: dicen qué curso se dibuja
         y por debajo de qué peso una colaboración es ruido. -->
        <Teleport defer to="#pageActions">
            <div class="controls">
                <label class="control">
                    <span class="eyebrow controlLabel">Curso académico</span>

                    <select v-model="year" class="num">
                        <option :value="allYears">
                            Todos los años (agregado)
                        </option>

                        <option
                            v-for="option in years"
                            :key="option"
                            :value="option"
                        >
                            {{ option }}
                        </option>
                    </select>
                </label>

                <label class="control weight">
                    <span class="eyebrow controlLabel">
                        Peso mínimo de colaboración ·
                        <span class="num">{{ decimal(minWeight) }}</span>
                    </span>

                    <input
                        v-model.number="minWeight"
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                    />
                </label>
            </div>
        </Teleport>

        <header class="intro">
            <p class="lead">
                {{ FACULTY.lead
                }}<span class="onlyWide">&nbsp;{{ FACULTY.leadMore }}</span>
            </p>

            <div class="stats">
                <UiStat
                    :value="thousands(totals.professors)"
                    label="profesores"
                    tone="navy"
                />
                <UiStat
                    :value="thousands(totals.active)"
                    label="en activo"
                    tone="navy"
                />
                <UiStat
                    :value="thousands(totals.collaborations)"
                    label="colaboraciones"
                />
                <UiStat :value="totals.years" label="cursos" />
            </div>
        </header>

        <UiCallout tone="structural" class="hint hideWide">
            La <strong>red completa</strong> se explora mejor en pantalla
            grande. Aquí solo se muestra persona a persona.
        </UiCallout>

        <div class="pair">
            <!-- La madeja. Solo en escritorio: 267 nodos en 402px son una
             mancha, y el móvil da la vuelta a la pregunta. -->
            <section v-if="isDesktop" id="red" class="panel graphPanel">
                <div class="graphLegend">
                    <span class="legendItem">
                        <span class="legendDot"></span>
                        {{ FACULTY.legendSize }}
                    </span>

                    <span class="legendItem">
                        <span class="legendLines">
                            <span class="thin"></span>
                            <span class="thick"></span>
                        </span>
                        {{ FACULTY.legendWidth }}
                    </span>

                    <span class="num legendCount">
                        {{ thousands(graphStats.professors) }} profesores ·
                        {{ thousands(graphStats.links) }} colaboraciones
                    </span>

                    <button
                        type="button"
                        class="showAll"
                        @click="graph?.showAll()"
                    >
                        ver todo
                    </button>
                </div>

                <FullGraph
                    ref="graph"
                    :graph="visibleGraph"
                    :selected-id="selectedId"
                    @select="selectedId = $event"
                />

                <p class="graphNote">
                    {{
                        aggregated
                            ? `Vista agregada de los ${totals.years} cursos`
                            : `Curso ${year}`
                    }}, con las colaboraciones de peso ≥
                    {{ decimal(minWeight) }}. Sube el filtro para quedarte solo
                    con las estrechas y repetidas.
                </p>
            </section>

            <div class="finder">
                <UiSearchField
                    v-model="query"
                    :placeholder="SEARCH.professor"
                    :label="SEARCH.professorLabel"
                />

                <div class="modes">
                    <UiChip :active="activeOnly" @click="activeOnly = true">
                        {{ FACULTY.activeChip(thousands(totals.active)) }}
                    </UiChip>
                    <UiChip :active="!activeOnly" @click="activeOnly = false">
                        {{ FACULTY.allChip(thousands(totals.professors)) }}
                    </UiChip>
                </div>

                <p v-if="!results.length" class="emptyState">
                    {{ EMPTY.professors }}
                </p>

                <ul v-else class="people" :class="{ collapsed: !expanded }">
                    <li v-for="person in results" :key="person.id">
                        <button
                            type="button"
                            class="person"
                            :class="{
                                active: selected && person.id === selected.id
                            }"
                            :aria-pressed="
                                selected ? person.id === selected.id : false
                            "
                            @click="selectedId = person.id"
                        >
                            <span class="personBody">
                                <span class="personName">{{
                                    person.name
                                }}</span>
                                <span class="personMeta num">
                                    índice {{ decimal(person.totalWeight) }} ·
                                    {{ person.nSubjects }} asignaturas ·
                                    {{ person.nCollaborations }} colaboraciones
                                </span>
                            </span>
                        </button>
                    </li>

                    <li v-if="results.length > PREVIEW" class="moreRow">
                        <button
                            type="button"
                            class="more"
                            @click="expanded = !expanded"
                        >
                            {{
                                expanded
                                    ? "− ver menos"
                                    : `＋ ${results.length - PREVIEW} profesores más`
                            }}
                        </button>
                    </li>
                </ul>

                <p class="listNote onlyWide">
                    {{ activeOnly ? totals.active : totals.professors }}
                    {{ activeOnly ? "en activo" : "en total" }}, ordenados por
                    índice · la lista se desplaza; para ir a alguien concreto usa
                    el buscador.
                </p>

                <section class="panel histogram onlyWide">
                    <p class="eyebrow panelTitle">Reparto del índice</p>

                    <p class="panelLead">
                        Cuántos profesores hay en cada tramo.
                        <strong>{{ lowIndexShare }}%</strong> no llega a 2.
                    </p>

                    <div class="buckets">
                        <UiCountBar
                            v-for="bucket in histogram"
                            :key="bucket.label"
                            :label="bucket.label"
                            :value="bucket.count"
                            :max="topBucket"
                            :display="String(bucket.count)"
                        />
                    </div>
                </section>
            </div>
        </div>

        <section v-if="selected" class="sheet">
            <p class="eyebrow sheetEyebrow">Ficha abierta</p>

            <div class="card">
                <h2>{{ selected.name }}</h2>

                <p class="cardMeta num">
                    {{ selected.nSubjects }} asignaturas ·
                    {{ selected.years.length }} cursos ·
                    {{ selected.nCollaborators }} colaboradores
                </p>

                <template v-if="selected.currentSubjectItems.length">
                    <p class="eyebrow blockLabel">
                        {{ FACULTY.currentSubjects }}
                    </p>

                    <div class="pills">
                        <RouterLink
                            v-for="subject in selected.currentSubjectItems"
                            :key="subject.code"
                            :to="`/asignatura/${subject.code}`"
                            class="subjectPill"
                        >
                            {{ subject.name }} →
                        </RouterLink>
                    </div>
                </template>

                <template v-if="selected.pastSubjectItems.length">
                    <p class="eyebrow blockLabel">{{ FACULTY.pastSubjects }}</p>

                    <div class="pills">
                        <RouterLink
                            v-for="subject in selected.pastSubjectItems"
                            :key="subject.code"
                            :to="`/asignatura/${subject.code}`"
                            class="subjectPill past"
                        >
                            {{ subject.name }} →
                        </RouterLink>
                    </div>
                </template>

                <template v-if="selected.topCollaborators.length">
                    <p class="eyebrow blockLabel">
                        {{ FACULTY.topCollaborators }}
                    </p>

                    <div class="bars">
                        <UiCountBar
                            v-for="mate in selected.topCollaborators"
                            :key="mate.id"
                            :label="mate.name"
                            :value="mate.weight"
                            :max="topWeight"
                            :display="decimal(mate.weight)"
                            :sub="`${mate.shared} comp.`"
                        />
                    </div>
                </template>
            </div>
        </section>

        <p class="footnote">{{ FACULTY.footnote }}</p>
    </div>
</template>

<style scoped>
.screen {
    padding: 15px var(--gutter) 8px;
}

.lead {
    margin: 0 0 13px;

    font-size: var(--text-body-sm);

    line-height: 1.5;

    color: var(--ink-soft);
}

.stats {
    display: flex;

    flex-wrap: wrap;

    gap: 22px;
}

.hint {
    margin-top: 14px;
}

.finder {
    margin-top: 14px;
}

.modes {
    display: flex;

    gap: 6px;

    margin-top: 9px;
}

.people {
    margin: 11px 0 0;

    padding: 0;

    list-style: none;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: 12px;

    overflow: hidden;
}

.people li + li .person,
.people li + li .more {
    border-top: 1px solid var(--line-inner);
}

.person {
    display: flex;

    align-items: center;

    width: 100%;

    min-height: var(--touch-target);

    padding: 11px 13px;

    border: none;

    background: none;

    text-align: left;

    cursor: pointer;
}

.person.active {
    background: var(--navy-wash);

    /* Por dentro, para que seleccionar no desplace el contenido de la fila. */
    box-shadow: inset 3px 0 0 var(--navy);
}

.personBody {
    flex: 1;

    min-width: 0;
}

.personName {
    display: block;

    font-size: 13px;

    font-weight: 600;

    color: var(--ink);
}

.personMeta {
    display: block;

    margin-top: 2px;

    font-size: var(--text-eyebrow);

    font-weight: 400;

    color: var(--ink-soft);
}

.person.active .personMeta {
    color: var(--navy-meta);
}

.more {
    display: flex;

    align-items: center;

    width: 100%;

    min-height: var(--touch-target);

    padding: 9px 13px;

    border: none;

    background: none;

    font-family: var(--font-mono);

    font-size: 9.5px;

    color: var(--ink-soft);

    cursor: pointer;
}

.sheet {
    margin-top: 14px;
}

.sheetEyebrow {
    margin: 0 0 8px;

    color: var(--navy);
}

.card {
    padding: 15px 15px 13px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: var(--radius-card-lg);

    box-shadow: var(--shadow-card);
}

h2 {
    margin: 0;

    font-family: var(--font-serif);

    font-size: 17px;

    font-weight: 600;

    line-height: 1.2;
}

.cardMeta {
    margin: 4px 0 0;

    font-size: 9.5px;

    font-weight: 400;

    color: var(--ink-soft);
}

.blockLabel {
    margin: 14px 0 8px;

    font-size: var(--text-footnote);
}

.pills {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;
}

/* Como una UiPill, pero pulsable: lleva a la ficha de la asignatura. */
.subjectPill {
    display: inline-flex;

    align-items: center;

    padding: 4px 9px;

    border: 1px solid var(--navy-line);

    border-radius: var(--radius-pill);

    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    font-weight: 600;

    letter-spacing: 0.4px;

    text-transform: uppercase;

    text-decoration: none;

    color: var(--navy);
}

.subjectPill:active {
    background: var(--navy-wash);
}

/* El histórico, en gris: sigue siendo enlace, pero ya no es docencia actual. */
.subjectPill.past {
    border-color: var(--line);

    color: var(--ink-soft);
}

.bars {
    display: flex;

    flex-direction: column;

    gap: 10px;
}

.footnote {
    margin: 16px 0 0;

    padding-top: 12px;

    border-top: 1px solid var(--line-rule);

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.6;

    color: var(--ink-soft);
}

.emptyState {
    margin: 16px 0 0;

    text-align: center;

    font-size: var(--text-body);

    color: var(--ink-soft);
}

/* El recorte del móvil: PREVIEW + 1. */
.people.collapsed > li:nth-child(n + 5):not(.moreRow) {
    display: none;
}

.onlyWide {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * Las dos vistas a la vez: la madeja a la izquierda y, a la derecha, la misma
 * lista persona a persona del móvil. Elegir en una marca en la otra.
 */

@media (min-width: 900px) {
    .screen {
        padding: 20px var(--gutter) 30px;
    }

    .onlyWide {
        display: block;
    }

    .lead .onlyWide {
        display: inline;
    }

    .hideWide {
        display: none;
    }

    /* La explicación del peso 1/n entra en la tira de cifras, que es donde se
       pregunta qué significan. */
    .intro {
        display: flex;

        align-items: stretch;

        padding: 16px 0;

        border-top: 1px solid var(--line-strong);

        border-bottom: 1px solid var(--line-strong);
    }

    .lead {
        order: 1;

        flex: 1;

        max-width: 640px;

        margin: 0;

        padding-left: 26px;

        border-left: 1px solid var(--line-rule);

        font-size: var(--text-body-sm);
    }

    .stats {
        gap: 0;

        flex-wrap: nowrap;
    }

    .stats > * {
        flex: none;

        padding: 0 26px;

        border-left: 1px solid var(--line-rule);
    }

    .stats > *:first-child {
        padding-left: 0;

        border-left: none;
    }

    /* Las dos columnas acaban a la vez: el panel de la madeja se estira hasta
       donde llega el histograma. */
    .pair {
        display: grid;

        grid-template-columns: minmax(0, 1fr);

        gap: 16px;

        margin-top: 20px;

        align-items: stretch;
    }

    .panel {
        padding: 15px 16px 12px;

        background: var(--surface);

        border: 1px solid var(--line);

        border-radius: var(--radius-card-lg);

        box-shadow: var(--shadow-card);
    }

    /* El grafo ----------------------------------------------------------- */

    .graphPanel {
        display: flex;

        flex-direction: column;

        min-width: 0;

        /* Para que el lienzo pueda encoger con la columna. */
        min-height: 0;
    }

    .graphLegend {
        display: flex;

        align-items: center;

        gap: 22px;

        padding-bottom: 12px;

        border-bottom: 1px solid var(--line-inner);
    }

    .legendItem {
        display: flex;

        align-items: center;

        gap: 8px;

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--ink-muted);
    }

    .legendDot {
        width: 13px;

        height: 13px;

        border-radius: 50%;

        background: var(--navy);
    }

    .legendLines {
        display: flex;

        flex-direction: column;

        gap: 3px;

        width: 22px;
    }

    .legendLines span {
        display: block;

        background: var(--navy-line);
    }

    .legendLines .thin {
        height: 1px;
    }

    .legendLines .thick {
        height: 4px;
    }

    /* Después de acercarse a alguien, la vuelta atrás a un clic. */
    .showAll {
        padding: 3px 9px;

        border: 1px solid var(--navy-line-soft);

        border-radius: var(--radius-pill);

        background: var(--surface);

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--navy);

        cursor: pointer;
    }

    .showAll:hover {
        border-color: var(--navy);
    }

    .legendCount {
        margin-left: auto;

        font-size: 10.5px;

        color: var(--ink-2);
    }

    .graphNote {
        margin: 10px 0 0;

        padding-top: 10px;

        border-top: 1px solid var(--line-inner);

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        line-height: 1.6;

        color: var(--ink-soft);
    }

    /* La columna de la lista --------------------------------------------- */

    .finder {
        display: flex;

        flex-direction: column;

        gap: 12px;

        margin-top: 0;

        min-width: 0;
    }

    .modes {
        margin-top: 0;
    }

    /* La lista se desplaza dentro de su caja en vez de crecer: desplegar 267
       filas descuadraría la página entera. */
    .people {
        margin: 0;

        max-height: 492px;

        overflow-y: auto;
    }

    .people.collapsed > li:nth-child(n + 5):not(.moreRow) {
        display: block;
    }

    .moreRow {
        display: none;
    }

    .listNote {
        margin: 0;

        font-family: var(--font-mono);

        font-size: 9.5px;

        line-height: 1.6;

        color: var(--ink-soft);
    }

    .panelTitle {
        margin: 0;
    }

    .panelLead {
        margin: 5px 0 12px;

        font-size: var(--text-body-sm);

        line-height: 1.45;

        color: var(--ink-muted);
    }

    .panelLead strong {
        color: var(--ink);
    }

    .buckets {
        display: flex;

        flex-direction: column;

        gap: 8px;

        --count-label-width: 52px;
    }

    /* Los mandos de la banda de título. */
    .controls {
        display: flex;

        align-items: flex-end;

        gap: 24px;
    }

    .control {
        display: flex;

        flex-direction: column;

        gap: 7px;
    }

    .control.weight {
        width: 240px;
    }

    .controlLabel {
        color: var(--ink-soft);
    }

    .controlLabel .num {
        font-size: var(--text-num-sm);

        color: var(--navy);
    }

    .control select {
        height: 38px;

        padding: 0 10px;

        border: 1px solid var(--navy-line-soft);

        border-radius: var(--radius-control);

        background: var(--surface);

        font-size: 12px;

        font-weight: 600;

        color: var(--navy);
    }

    .control input[type="range"] {
        width: 100%;

        height: 38px;

        accent-color: var(--navy);

        cursor: pointer;
    }

    /* La ficha abierta, a todo el ancho bajo las dos columnas. */
    .sheet {
        margin-top: 20px;
    }

    .card {
        padding: 17px 18px 15px;
    }

    /* A todo el ancho, los nombres completos caben. */
    .bars {
        --count-label-width: 220px;
    }

    .pills {
        gap: 7px;
    }
}

/* La rejilla del diseño: la madeja y, al lado, la lista. */
@media (min-width: 1200px) {
    .pair {
        grid-template-columns: minmax(0, 1fr) 396px;
    }
}
</style>
