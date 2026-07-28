<script setup>

/**
 * El selector de asignaturas del horario. Una sola selección para toda la
 * pantalla: lo que se marca aquí alimenta la vista de clases Y la de
 * exámenes, que es la razón de que esta pantalla exista unificada.
 *
 * Dos estados: plegado enseña lo elegido como chips quitables (lo que se
 * consulta a diario); desplegado añade buscador, filtro de curso y la lista
 * completa para marcar. Se abre solo cuando no hay nada elegido, porque
 * entonces elegir ES la tarea.
 *
 * Si la asignatura tiene más de un grupo de teoría, al marcarla aparecen sus
 * grupos como chips: el horario depende del grupo y callárselo pintaría el
 * horario de otro.
 */

import { computed, ref } from "vue";

import { useSchedule } from "@/composables/useSchedule";

import UiChip from "@/components/ui/UiChip.vue";
import UiIcon from "@/components/ui/UiIcon.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";

const {
    catalogue,
    publicationYear,
    selectedSubjects,
    isSelected,
    toggle,
    clear,
    groupChoice,
    groupsFor,
    setGroup,
    semestersFor,
    rotateGroups
} = useSchedule();

/** Cuántas filas se ven antes de tener que pedir el resto. */
const PREVIEW = 8;

const open = ref(selectedSubjects.value.length === 0);
const query = ref("");
const course = ref("todos");
const expanded = ref(false);

const normalize = text =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const results = computed(() => {

    const needle = normalize(query.value.trim());

    return catalogue.filter(subject => {

        // Los chips de curso enseñan solo las troncales de ese año: las
        // optativas no son "de un curso" de verdad (se ofertan en 3º y 4º a
        // la vez) y tienen su propio chip.
        if (course.value === "optativas") {
            if (subject.tipo !== "optativa") return false;
        } else if (course.value !== "todos") {
            if (subject.tipo !== "troncal" || !subject.courses.includes(course.value)) {
                return false;
            }
        }

        return !needle || normalize(subject.name).includes(needle);

    });

});

const visible = computed(() =>
    expanded.value ? results.value : results.value.slice(0, PREVIEW)
);

const meta = subject => {

    const semesters = semestersFor(subject.code);

    return [
        subject.tipo === "troncal" ? "Troncal" : "Optativa",
        subject.courses.map(c => `${c}º`).join(" y "),
        semesters.length ? semesters.join(" y ") : null
    ].filter(Boolean).join(" · ");

};

/** Con un solo grupo por asignatura no hay nada que intercambiar. */
const canRotate = computed(() =>
    selectedSubjects.value.some(subject => groupsFor(subject.code).length > 1)
);

/** "447-3-6" → "Grupo 6". */
const groupLabel = group => `Grupo ${group.split("-").pop()}`;

</script>

<template>

<section class="picker">

    <button
        type="button"
        class="head"
        :aria-expanded="open"
        @click="open = !open"
    >

        <span class="headLabel eyebrow">
            Tus asignaturas<template v-if="selectedSubjects.length"> · {{ selectedSubjects.length }}</template>
        </span>

        <span class="headAction">{{ open ? "cerrar" : "editar" }}</span>

        <UiIcon
            name="chevronRight"
            :size="11"
            :width="2"
            class="chevron"
            :class="{ down: open }"
        />

    </button>

    <!-- Lo elegido, siempre visible: quitable con un toque. -->
    <div
        v-if="selectedSubjects.length"
        class="selection"
    >

        <span
            v-for="subject in selectedSubjects"
            :key="subject.code"
            class="picked"
        >

            <span class="pickedName">{{ subject.name }}</span>

            <select
                v-if="groupsFor(subject.code).length > 1"
                class="group num"
                :value="groupChoice[subject.code]"
                :aria-label="`Grupo de ${subject.name}`"
                @change="setGroup(subject.code, $event.target.value)"
            >
                <option
                    v-for="group in groupsFor(subject.code)"
                    :key="group"
                    :value="group"
                >
                    {{ groupLabel(group) }}
                </option>
            </select>

            <button
                type="button"
                class="remove"
                :aria-label="`Quitar ${subject.name}`"
                @click="toggle(subject.code)"
            >
                <UiIcon
                    name="close"
                    :size="8"
                    :width="2.2"
                />
            </button>

        </span>

        <button
            type="button"
            class="clear"
            @click="clear"
        >
            vaciar
        </button>

        <!-- Quien va de tardes, va de tardes a todo: un toque cambia el
             grupo de todas las asignaturas a la vez. -->
        <button
            v-if="canRotate"
            type="button"
            class="rotate"
            @click="rotateGroups"
        >
            ⇄ cambiar todos de grupo
        </button>

    </div>

    <p
        v-else
        class="hint"
    >
        Marca asignaturas para montar tu semana y tu calendario de exámenes.
    </p>

    <div
        v-if="open"
        class="chooser"
    >

        <UiSearchField
            v-model="query"
            :placeholder="`Buscar entre ${catalogue.length} asignaturas…`"
            label="Buscar asignatura"
        />

        <div class="chips">
            <UiChip
                :active="course === 'todos'"
                @click="course = 'todos'"
            >
                Todas
            </UiChip>
            <UiChip
                v-for="n in 4"
                :key="n"
                :active="course === n"
                @click="course = n"
            >
                {{ n }}º
            </UiChip>
            <UiChip
                :active="course === 'optativas'"
                @click="course = 'optativas'"
            >
                <!-- En pantallas muy estrechas la palabra completa echa la
                     fila de chips a dos líneas. -->
                <span class="optFull">Optativas</span>
                <span class="optShort" aria-hidden="true">Opt.</span>
            </UiChip>
        </div>

        <p
            v-if="!results.length"
            class="emptyState"
        >
            Ninguna asignatura coincide con la búsqueda.
        </p>

        <ul
            v-else
            class="rows"
        >

            <li
                v-for="subject in visible"
                :key="subject.code"
            >
                <!-- Las optativas que no están en la publicación de este curso
                     se ven pero no se marcan: que existan es información; que
                     entraran al horario sería mentira. -->
                <button
                    type="button"
                    class="row"
                    :class="{ off: !subject.available }"
                    :disabled="!subject.available"
                    :aria-pressed="isSelected(subject.code)"
                    @click="toggle(subject.code)"
                >

                    <span
                        class="check"
                        :class="{ on: isSelected(subject.code) }"
                        aria-hidden="true"
                    >
                        <svg
                            v-if="isSelected(subject.code)"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M4 12.5l5.5 5.5L20 6.5"
                                stroke="currentColor"
                                stroke-width="3.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </span>

                    <span class="identity">
                        <span class="name">{{ subject.name }}</span>
                        <span class="meta">
                            {{ meta(subject) }}<template
                                v-if="!subject.available"
                            > · <span class="unavailable">no se oferta en
                            {{ publicationYear }}</span></template>
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
                        : `＋ ${results.length - PREVIEW} asignaturas más` }}
                </button>
            </li>

        </ul>

    </div>

</section>

</template>

<style scoped>

.picker{

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

}

.head{

    display:flex;

    align-items:center;

    gap:8px;

    width:100%;

    min-height:var(--touch-target);

    padding:0 13px;

    border:none;

    background:none;

    text-align:left;

    cursor:pointer;

}

.headLabel{

    flex:1;

}

.headAction{

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    color:var(--navy);

}

.chevron{

    color:var(--ink-chevron);

    transition:transform .15s;

}

.chevron.down{

    transform:rotate(90deg);

}

.selection{

    display:flex;

    flex-wrap:wrap;

    align-items:center;

    gap:6px;

    padding:0 13px 11px;

}

.picked{

    display:inline-flex;

    align-items:center;

    gap:6px;

    max-width:100%;

    padding:5px 6px 5px 10px;

    background:var(--navy-wash);

    border:1px solid var(--navy-wash-line);

    border-radius:var(--radius-pill);

}

.pickedName{

    min-width:0;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

    font-size:var(--text-body-sm);

    font-weight:600;

    color:var(--navy-soft);

}

.group{

    flex:none;

    padding:2px 4px;

    border:1px solid var(--navy-line-soft);

    border-radius:6px;

    background:var(--surface);

    color:var(--navy);

    font-size:var(--text-num-sm);

}

.remove{

    display:flex;

    align-items:center;

    justify-content:center;

    flex:none;

    position:relative;

    width:18px;

    height:18px;

    padding:0;

    border:none;

    border-radius:50%;

    background:var(--surface);

    color:var(--ink-soft);

    cursor:pointer;

}

/* El aspa mide 18px; el dedo necesita más. */
.remove::after{

    content:"";

    position:absolute;

    left:50%;

    top:50%;

    width:36px;

    height:36px;

    transform:translate(-50%,-50%);

}

.clear{

    min-height:30px;

    padding:0 7px;

    border:none;

    background:none;

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    color:var(--ink-faint);

    cursor:pointer;

}

.clear:active{

    color:var(--navy);

}

/* En la misma familia tipográfica que "vaciar", pero en navy: es la acción
   útil del bloque, no una limpieza. */
.rotate{

    min-height:30px;

    padding:0 7px;

    border:none;

    background:none;

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    font-weight:600;

    color:var(--navy);

    cursor:pointer;

}

.rotate:active{

    color:var(--ink);

}

.hint{

    margin:0;

    padding:0 13px 12px;

    font-size:var(--text-body);

    color:var(--ink-muted);

}

.chooser{

    padding:11px 13px 6px;

    border-top:1px solid var(--line-inner);

}

.chips{

    display:flex;

    flex-wrap:wrap;

    gap:6px;

    margin-top:9px;

}

.optShort{

    display:none;

}

/* Por debajo de ~380px los seis chips no caben en una línea: "Optativas"
   pasa a "Opt." y los chips se aprietan lo justo para que la fila aguante
   entera hasta los 320px. */
@media (max-width:379px){

    .optFull{

        display:none;

    }

    .optShort{

        display:inline;

    }

    .chips{

        gap:4px;

    }

    .chips :deep(.chip){

        padding-left:7px;

        padding-right:7px;

    }

}

.rows{

    margin:6px 0 0;

    padding:0;

    list-style:none;

}

.row{

    display:flex;

    align-items:center;

    gap:10px;

    width:100%;

    min-height:var(--touch-target);

    padding:8px 2px;

    border:none;

    border-bottom:1px solid var(--line-row);

    background:none;

    text-align:left;

    cursor:pointer;

}

li:last-child .row{

    border-bottom:none;

}

.check{

    display:flex;

    align-items:center;

    justify-content:center;

    flex:none;

    width:17px;

    height:17px;

    border:1.5px solid var(--line-chip);

    border-radius:5px;

    background:var(--surface);

    color:var(--ink-on-navy);

}

.check.on{

    background:var(--navy);

    border-color:var(--navy);

}

.identity{

    flex:1;

    min-width:0;

}

.row.off{

    cursor:default;

}

.row.off .name{

    color:var(--ink-faint);

}

.row.off .check{

    border-style:dashed;

}

.unavailable{

    color:var(--delta-bad);

}

.name{

    display:block;

    font-size:13.5px;

    font-weight:600;

    line-height:1.25;

}

.meta{

    display:block;

    margin-top:1px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    color:var(--ink-soft);

}

.more{

    display:flex;

    align-items:center;

    width:100%;

    min-height:var(--touch-target);

    padding:0 2px;

    border:none;

    background:none;

    font-family:var(--font-mono);

    font-size:10px;

    color:var(--ink-faint);

    cursor:pointer;

}

.more:active{

    color:var(--navy);

}

.emptyState{

    margin:0;

    padding:18px 2px;

    text-align:center;

    font-size:var(--text-body);

    color:var(--ink-soft);

}

</style>
