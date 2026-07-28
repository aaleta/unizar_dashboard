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

import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";
import UiCountBar from "@/components/ui/UiCountBar.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiStat from "@/components/ui/UiStat.vue";

const FullGraph = defineAsyncComponent(() =>
    import("@/components/Dashboard/ProfWeb.vue")
);

/** Cuántas personas se ven antes de tener que pedir el resto. */
const PREVIEW = 4;

const { isDesktop } = useViewport();

const query = ref("");
const selectedId = ref("");

/**
 * En el móvil se arranca con el claustro ACTIVO —quien aparece en la última
 * guía docente publicada—: la pregunta habitual es "¿con quién voy a dar
 * clase?", no "¿quién la dio hace ocho años?". El histórico queda a un toque.
 * (En escritorio el modo se cambia con el selector de curso del grafo.)
 */
const activeOnly = ref(true);

const { results, selected, totals } = useProfessorNetwork(
    () => query.value,
    () => selectedId.value,
    () => activeOnly.value
);

const expanded = ref(false);

const visible = computed(() =>
    expanded.value ? results.value : results.value.slice(0, PREVIEW)
);

const topWeight = computed(() =>
    selected.value?.topCollaborators[0]?.weight ?? 1
);

const decimal = value => value.toFixed(2).replace(".", ",");

/**
 * 2003 → "2.003".
 *
 * A mano y no con toLocaleString("es-ES"): hay navegadores compilados con ICU
 * reducido que reconocen el locale pero no aplican el separador, y devuelven
 * "2003" tan tranquilos. Para meter un punto cada tres dígitos en una web que
 * solo está en español, la dependencia no compensa el riesgo.
 */
const thousands = value =>
    String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

</script>

<template>

<!-- Pantalla ancha: la madeja completa, tal cual estaba. -->
<FullGraph v-if="isDesktop" />

<div
    v-else
    class="screen"
>

    <header class="intro">

        <p class="lead">
            Quién comparte asignatura con quién. Cada colaboración pesa 1/n por
            asignatura y curso.
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
            <UiStat
                :value="totals.years"
                label="cursos"
            />
        </div>

    </header>

    <UiCallout
        tone="structural"
        class="hint"
    >
        La <strong>red completa</strong> se explora mejor en pantalla
        grande. Aquí solo se muestra persona a persona.
    </UiCallout>

    <div class="finder">

        <UiSearchField
            v-model="query"
            placeholder="Buscar profesor…"
            label="Buscar profesor"
        />

        <div class="modes">
            <UiChip
                :active="activeOnly"
                @click="activeOnly = true"
            >
                En activo · {{ thousands(totals.active) }}
            </UiChip>
            <UiChip
                :active="!activeOnly"
                @click="activeOnly = false"
            >
                Todos · {{ thousands(totals.professors) }}
            </UiChip>
        </div>

        <p
            v-if="!results.length"
            class="emptyState"
        >
            Ningún profesor coincide con la búsqueda.
        </p>

        <ul
            v-else
            class="people"
        >
            <li
                v-for="person in visible"
                :key="person.id"
            >
                <button
                    type="button"
                    class="person"
                    :class="{ active: selected && person.id === selected.id }"
                    :aria-pressed="selected ? person.id === selected.id : false"
                    @click="selectedId = person.id"
                >
                    <span class="personBody">
                        <span class="personName">{{ person.name }}</span>
                        <span class="personMeta num">
                            índice {{ decimal(person.totalWeight) }} ·
                            {{ person.nSubjects }} asignaturas ·
                            {{ person.nCollaborations }} colaboraciones
                        </span>
                    </span>
                </button>
            </li>

            <li v-if="results.length > PREVIEW">
                <button
                    type="button"
                    class="more"
                    @click="expanded = !expanded"
                >
                    {{ expanded
                        ? "− ver menos"
                        : `＋ ${results.length - PREVIEW} profesores más` }}
                </button>
            </li>
        </ul>

    </div>

    <section
        v-if="selected"
        class="sheet"
    >

        <p class="eyebrow sheetEyebrow">Ficha abierta</p>

        <div class="card">

            <h2>{{ selected.name }}</h2>

            <p class="cardMeta num">
                {{ selected.nSubjects }} asignaturas ·
                {{ selected.years.length }} cursos ·
                {{ selected.nCollaborators }} colaboradores
            </p>

            <template v-if="selected.currentSubjectItems.length">

                <p class="eyebrow blockLabel">Imparte este curso</p>

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

                <p class="eyebrow blockLabel">Ha impartido alguna vez</p>

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

                <p class="eyebrow blockLabel">Colabora más con</p>

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

    <p class="footnote">
        Índice = suma de 1/n por asignatura y curso, donde n es el número de
        profesores de esa asignatura ese año · en activo = aparecen en la guía
        docente más reciente · el TFG se excluye porque lo firma medio
        departamento.
    </p>

</div>

</template>

<style scoped>

.screen{

    padding:15px var(--gutter) 8px;

}

.lead{

    margin:0 0 13px;

    font-size:var(--text-body-sm);

    line-height:1.5;

    color:var(--ink-soft);

}

.stats{

    display:flex;

    flex-wrap:wrap;

    gap:22px;

}

.hint{

    margin-top:14px;

}

.finder{

    margin-top:14px;

}

.modes{

    display:flex;

    gap:6px;

    margin-top:9px;

}

.people{

    margin:11px 0 0;

    padding:0;

    list-style:none;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:12px;

    overflow:hidden;

}

.people li + li .person,
.people li + li .more{

    border-top:1px solid var(--line-inner);

}

.person{

    display:flex;

    align-items:center;

    width:100%;

    min-height:var(--touch-target);

    padding:11px 13px;

    border:none;

    background:none;

    text-align:left;

    cursor:pointer;

}

.person.active{

    background:var(--navy-wash);

    /* Por dentro, para que seleccionar no desplace el contenido de la fila. */
    box-shadow:inset 3px 0 0 var(--navy);

}

.personBody{

    flex:1;

    min-width:0;

}

.personName{

    display:block;

    font-size:13px;

    font-weight:600;

    color:var(--ink);

}

.personMeta{

    display:block;

    margin-top:2px;

    font-size:var(--text-eyebrow);

    font-weight:400;

    color:var(--ink-soft);

}

.person.active .personMeta{

    color:var(--navy-meta);

}

.more{

    display:flex;

    align-items:center;

    width:100%;

    min-height:var(--touch-target);

    padding:9px 13px;

    border:none;

    background:none;

    font-family:var(--font-mono);

    font-size:9.5px;

    color:var(--ink-faint-2);

    cursor:pointer;

}

.sheet{

    margin-top:14px;

}

.sheetEyebrow{

    margin:0 0 8px;

    color:var(--navy);

}

.card{

    padding:15px 15px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    box-shadow:var(--shadow-card);

}

h2{

    margin:0;

    font-family:var(--font-serif);

    font-size:17px;

    font-weight:600;

    line-height:1.2;

}

.cardMeta{

    margin:4px 0 0;

    font-size:9.5px;

    font-weight:400;

    color:var(--ink-soft);

}

.blockLabel{

    margin:14px 0 8px;

    font-size:var(--text-footnote);

}

.pills{

    display:flex;

    flex-wrap:wrap;

    gap:6px;

}

/* Como una UiPill, pero pulsable: lleva a la ficha de la asignatura. */
.subjectPill{

    display:inline-flex;

    align-items:center;

    padding:4px 9px;

    border:1px solid var(--navy-line);

    border-radius:var(--radius-pill);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:.4px;

    text-transform:uppercase;

    text-decoration:none;

    color:var(--navy);

}

.subjectPill:active{

    background:var(--navy-wash);

}

/* El histórico, en gris: sigue siendo enlace, pero ya no es docencia actual. */
.subjectPill.past{

    border-color:var(--line);

    color:var(--ink-soft);

}

.bars{

    display:flex;

    flex-direction:column;

    gap:10px;

}

.footnote{

    margin:16px 0 0;

    padding-top:12px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

.emptyState{

    margin:16px 0 0;

    text-align:center;

    font-size:var(--text-body);

    color:var(--ink-soft);

}

</style>
