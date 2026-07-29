<script setup>
/**
 * Monta tu horario: clases y exámenes en una sola pantalla.
 *
 * Antes eran dos páginas con dos selectores idénticos, y quien quería ver si
 * "sus" asignaturas chocaban tenía que marcarlas dos veces. Aquí la selección
 * se hace una vez y dos pestañas la miran desde los dos lados: la semana de
 * clases y el calendario de exámenes.
 *
 * La pestaña viva viaja en la query (?vista=examenes) para poder compartir el
 * enlace apuntando a la vista que se quiere enseñar, sin ensuciar el
 * historial en cada cambio.
 */

import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
    convocatoriaLabel,
    useSchedule,
    WEEKDAYS
} from "@/composables/useSchedule";
import { useViewport } from "@/composables/useViewport";

import ExamCalendar from "@/components/schedule/ExamCalendar.vue";
import SchedulePicker from "@/components/schedule/SchedulePicker.vue";
import WeekTimetable from "@/components/schedule/WeekTimetable.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";

const route = useRoute();
const router = useRouter();

const { isDesktop } = useViewport();

const {
    selectedSubjects,
    semester,
    classEvents,
    classClashes,
    missingFromGrid,
    convocatorias,
    convocatoriaSpans,
    convocatoria,
    examPeriods,
    examClashes,
    examGaps,
    examSpan
} = useSchedule();

const tab = computed({
    get: () => (route.query.vista === "examenes" ? "examenes" : "clases"),
    set: value =>
        router.replace({
            query: {
                ...route.query,
                vista: value === "examenes" ? "examenes" : undefined
            }
        })
});

const hasSelection = computed(() => selectedSubjects.value.length > 0);

/** "Química y Álgebra I · lunes 12:00–13:00". */
const clashLine = clash => {
    // El tramo que se pisa de verdad: de la entrada más tardía a la salida
    // más temprana.
    const day = WEEKDAYS[clash.a.day - 1].toLowerCase();
    const start =
        clash.a.startMin >= clash.b.startMin ? clash.a.start : clash.b.start;
    const end = clash.a.endMin <= clash.b.endMin ? clash.a.end : clash.b.end;

    return `${clash.a.name} y ${clash.b.name} · ${day} ${start}–${end}`;
};

/** "16 · Química y Álgebra I". */
const examClashLine = date =>
    `${date.day} ${date.weekday} · ` +
    date.exams.map(exam => exam.name).join(" y ");
</script>

<template>
    <div class="screen">
        <p class="intro">
            Elige asignaturas una vez y compruébalas desde los dos lados: la
            semana de clases y las fechas de examen, con los choques a la vista.
        </p>

        <div class="layout">
            <SchedulePicker class="picker" />

            <div class="week">
                <!-- Las dos vistas de la misma selección. En escritorio caben las dos
         a la vez, así que no hay nada que conmutar. -->
                <div
                    v-if="!isDesktop"
                    class="switch"
                    role="tablist"
                    aria-label="Vista del horario"
                >
                    <button
                        type="button"
                        role="tab"
                        :aria-selected="tab === 'clases'"
                        class="switchTab"
                        :class="{ active: tab === 'clases' }"
                        @click="tab = 'clases'"
                    >
                        Clases
                    </button>

                    <button
                        type="button"
                        role="tab"
                        :aria-selected="tab === 'examenes'"
                        class="switchTab"
                        :class="{ active: tab === 'examenes' }"
                        @click="tab = 'examenes'"
                    >
                        Exámenes
                    </button>
                </div>

                <!-- ================= Clases ================= -->

                <template v-if="isDesktop || tab === 'clases'">
                    <div class="chips">
                        <UiChip
                            :active="semester === 'S1'"
                            @click="semester = 'S1'"
                        >
                            1º semestre
                        </UiChip>
                        <UiChip
                            :active="semester === 'S2'"
                            @click="semester = 'S2'"
                        >
                            2º semestre
                        </UiChip>
                    </div>

                    <UiCallout
                        v-if="classClashes.length"
                        tone="hard"
                        :title="
                            classClashes.length === 1
                                ? 'Un choque en el horario'
                                : `${classClashes.length} choques en el horario`
                        "
                    >
                        <p
                            v-for="(clash, index) in classClashes"
                            :key="index"
                            class="clashItem"
                        >
                            {{ clashLine(clash) }}
                        </p>
                    </UiCallout>

                    <UiCallout
                        v-else-if="hasSelection && classEvents.length"
                        tone="structural"
                    >
                        Sin choques: ninguna clase se pisa con otra este
                        semestre.
                    </UiCallout>

                    <WeekTimetable :events="classEvents" />

                    <p v-if="missingFromGrid.length" class="missing">
                        <template
                            v-for="subject in missingFromGrid"
                            :key="subject.code"
                        >
                            {{ subject.name }}: {{ subject.reason }}.<br />
                        </template>
                    </p>

                    <p v-if="!hasSelection" class="emptyState">
                        La rejilla está vacía porque aún no has marcado
                        asignaturas.
                    </p>

                    <UiCallout
                        tone="attention"
                        title="Las prácticas van aparte"
                    >
                        Aquí solo se tienen en cuenta las clases de teoría. Las
                        prácticas y los laboratorios cambian mucho a lo largo
                        del semestre y dependen de la asignatura, el grupo, etc.
                        Aconsejamos consultar la
                        <a
                            class="guideLink"
                            href="https://estudios.unizar.es/estudio/asignaturas?anyo_academico=2026&estudio_id=20260124&centro_id=100&plan_id_nk=447&sort=curso"
                            target="_blank"
                            rel="noopener"
                            >Guía Docente</a
                        >
                        o al profesorado de la asignatura en caso de duda.
                    </UiCallout>

                    <p class="footnote">
                        Clases de teoría del grupo elegido · horario oficial del
                        curso 2026-2027.
                    </p>
                </template>
            </div>
        </div>

        <div class="exams">
            <h2 class="onlyWide examsTitle">Exámenes</h2>

            <!-- ================= Exámenes ================= -->

            <template v-if="isDesktop || tab === 'examenes'">
                <div class="chips">
                    <UiChip
                        :active="convocatoria === 'all'"
                        @click="convocatoria = 'all'"
                    >
                        Todas
                    </UiChip>
                    <UiChip
                        v-for="conv in convocatorias"
                        :key="conv"
                        :active="convocatoria === conv"
                        @click="convocatoria = conv"
                    >
                        {{ convocatoriaLabel(conv) }}
                    </UiChip>
                </div>

                <UiCallout
                    v-if="examClashes.length"
                    tone="hard"
                    :title="
                        examClashes.length === 1
                            ? 'Dos exámenes el mismo día'
                            : `${examClashes.length} días con exámenes que coinciden`
                    "
                >
                    <p
                        v-for="date in examClashes"
                        :key="date.key"
                        class="clashItem"
                    >
                        {{ examClashLine(date) }}
                    </p>
                </UiCallout>

                <UiCallout
                    v-else-if="hasSelection && examPeriods.length"
                    tone="structural"
                >
                    Sin coincidencias: cada examen cae en un día
                    distinto.<template v-if="examSpan">
                        Del primero al último pasan
                        <strong>{{ examSpan.days }} días</strong>, y el hueco
                        más corto es de
                        <strong
                            >{{ examSpan.tightest }}
                            {{
                                examSpan.tightest === 1 ? "día" : "días"
                            }}</strong
                        >
                        ({{ examSpan.between }}).</template
                    >
                </UiCallout>

                <div class="examLayout">
                    <ExamCalendar
                        v-if="examPeriods.length"
                        :periods="examPeriods"
                    />

                    <!-- El calendario responde "¿me queda hueco?" por la forma del
                 mes; con sitio para una tabla se puede decir el número. -->
                    <section
                        v-if="examGaps.length > 1"
                        class="gaps onlyWide"
                        aria-label="Días entre exámenes"
                    >
                        <div class="gapsHead">
                            <span class="gapDay">Día</span>
                            <span class="gapName">Asignatura</span>
                            <span class="gapValue">Días de aire</span>
                        </div>

                        <div
                            v-for="entry in examGaps"
                            :key="entry.key"
                            class="gapsRow"
                        >
                            <span class="num gapDay">{{ entry.label }}</span>
                            <span class="gapName">{{ entry.names }}</span>
                            <span
                                class="gapValue"
                                :class="{
                                    tight: entry.gap !== null && entry.gap <= 1
                                }"
                            >
                                <template v-if="entry.gap === null">
                                    el primero
                                </template>
                                <span v-else class="num"
                                    >{{ entry.gap }}
                                    {{ entry.gap === 1 ? "día" : "días" }}</span
                                >
                            </span>
                        </div>
                    </section>
                </div>

                <p v-if="!examPeriods.length" class="emptyState">
                    {{
                        hasSelection
                            ? "Ninguna de tus asignaturas tiene examen en esta convocatoria."
                            : "Marca asignaturas arriba para ver sus fechas de examen."
                    }}
                </p>

                <p class="footnote">
                    {{
                        convocatorias
                            .map(
                                conv =>
                                    `${convocatoriaLabel(conv)} = ${convocatoriaSpans[conv]}`
                            )
                            .join(" · ")
                    }}
                    · fechas oficiales del centro, curso 2026-2027.
                </p>
            </template>
        </div>
    </div>
</template>

<style scoped>
.screen {
    display: flex;

    flex-direction: column;

    gap: 12px;

    padding: 14px var(--gutter) 20px;

    max-width: var(--content-max);

    margin: 0 auto;

    box-sizing: border-box;

    width: 100%;
}

.intro {
    margin: 0;

    font-size: var(--text-body);

    line-height: var(--leading-body);

    color: var(--ink-2);
}

/* Dos pestañas del mismo contenido: un conmutador segmentado, no chips
   sueltos — cambiar de vista no es filtrar. */
.switch {
    display: flex;

    padding: 3px;

    background: var(--surface);

    border: 1px solid var(--line-strong);

    border-radius: var(--radius-control);
}

.switchTab {
    flex: 1;

    min-height: 38px;

    border: none;

    border-radius: 7px;

    background: none;

    font-family: var(--font-sans);

    font-size: var(--text-body);

    font-weight: 600;

    color: var(--ink-3);

    cursor: pointer;
}

.switchTab.active {
    background: var(--navy);

    color: var(--ink-on-navy);
}

.chips {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;
}

.clashItem {
    margin: 0;
}

.clashItem + .clashItem {
    margin-top: 3px;
}

/* Al listado oficial de asignaturas del plan, donde cada una enlaza su guía.
   La URL lleva el curso (2026) codificado: al cambiar de curso hay que
   actualizarla junto con PUBLICACION en scripts/updater.py. */
.guideLink {
    color: var(--navy);

    font-weight: 600;

    text-decoration: underline;

    text-underline-offset: 2px;
}

.missing {
    margin: 0;

    font-family: var(--font-mono);

    font-size: var(--text-num-sm);

    line-height: 1.7;

    color: var(--ink-soft);
}

.emptyState {
    margin: 0;

    padding: 10px 0;

    text-align: center;

    font-size: var(--text-body);

    color: var(--ink-soft);
}

.footnote {
    margin: 2px 0 0;

    padding-top: 10px;

    border-top: 1px solid var(--line-rule);

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.6;

    color: var(--ink-soft);
}

/* Solo en escritorio ---------------------------------------------------- */

.onlyWide {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * Fuera las pestañas: la selección se hace una vez, a la izquierda, y las dos
 * lecturas —la semana y los exámenes— se ven a la vez. Era el motivo de ser de
 * la pantalla y en el móvil había que alternarlas porque no caben.
 */

@media (min-width: 900px) {
    .screen {
        gap: 16px;

        padding: 22px var(--gutter) 34px;
    }

    .onlyWide {
        display: block;
    }

    .hideWide {
        display: none;
    }

    .intro {
        max-width: 760px;

        font-size: var(--text-body);
    }

    /* El selector, permanente a la izquierda. */
    .layout {
        display: grid;

        grid-template-columns: 328px minmax(0, 1fr);

        gap: 16px;

        align-items: start;
    }

    .week {
        display: flex;

        flex-direction: column;

        gap: 12px;

        min-width: 0;
    }

    .exams {
        display: flex;

        flex-direction: column;

        gap: 12px;

        margin-top: 18px;

        padding-top: 12px;

        border-top: 1px solid var(--line-rule);
    }

    .examsTitle {
        margin: 0;

        font-family: var(--font-serif);

        font-size: 21px;

        font-weight: 600;
    }

    /* El calendario ocupa lo mismo que el selector; la tabla, el resto. */
    .examLayout {
        display: grid;

        grid-template-columns: 328px minmax(0, 1fr);

        gap: 16px;

        align-items: start;
    }

    /* La tabla de días de aire --------------------------------------------- */

    .gaps {
        background: var(--surface);

        border: 1px solid var(--line);

        border-radius: var(--radius-card);

        box-shadow: var(--shadow-card);

        overflow: clip;
    }

    .gapsHead,
    .gapsRow {
        display: flex;

        align-items: center;

        gap: 14px;

        padding: 9px 15px;
    }

    .gapsHead {
        background: var(--surface-sunken);

        border-bottom: 1px solid var(--line-strong);

        font-family: var(--font-mono);

        font-size: 9.5px;

        font-weight: 600;

        letter-spacing: 0.4px;

        text-transform: uppercase;

        /* Sobre el fondo hundido, los grises apagados no llegan a 4,5:1. */
        color: var(--ink-2);
    }

    .gapsRow {
        min-height: var(--touch-target);

        border-bottom: 1px solid var(--line-inner);
    }

    .gapsRow:last-child {
        border-bottom: none;
    }

    .gapDay {
        width: 78px;

        flex: none;

        font-size: var(--text-num);

        color: var(--ink-soft);
    }

    .gapName {
        flex: 1;

        min-width: 0;

        font-size: 13px;

        font-weight: 600;

        overflow: hidden;

        text-overflow: ellipsis;

        white-space: nowrap;
    }

    .gapsHead .gapName {
        font-size: 9.5px;

        font-weight: 600;
    }

    .gapValue {
        width: 110px;

        flex: none;

        text-align: right;

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--ink-soft);
    }

    .gapsRow .gapValue .num {
        font-size: var(--text-num);

        color: var(--ink-2);
    }

    /* Un día de aire entre dos exámenes es la advertencia de la tabla. */
    .gapValue.tight .num {
        color: var(--warn-title);
    }
}
</style>
