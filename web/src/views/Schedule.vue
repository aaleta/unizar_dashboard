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

import { convocatoriaLabel, useSchedule, WEEKDAYS } from "@/composables/useSchedule";

import ExamCalendar from "@/components/Dashboard/ExamCalendar.vue";
import SchedulePicker from "@/components/Dashboard/SchedulePicker.vue";
import WeekTimetable from "@/components/Dashboard/WeekTimetable.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";

const route = useRoute();
const router = useRouter();

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
    examClashes
} = useSchedule();

const tab = computed({
    get: () => (route.query.vista === "examenes" ? "examenes" : "clases"),
    set: value => router.replace({
        query: { ...route.query, vista: value === "examenes" ? "examenes" : undefined }
    })
});

const hasSelection = computed(() => selectedSubjects.value.length > 0);

/** "Química y Álgebra I · lunes 12:00–13:00". */
const clashLine = clash => {

    // El tramo que se pisa de verdad: de la entrada más tardía a la salida
    // más temprana.
    const day = WEEKDAYS[clash.a.day - 1].toLowerCase();
    const start = clash.a.startMin >= clash.b.startMin ? clash.a.start : clash.b.start;
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
        Elige asignaturas una vez y compruébalas desde los dos lados:
        la semana de clases y las fechas de examen, con los choques a la vista.
    </p>

    <SchedulePicker />

    <!-- Las dos vistas de la misma selección -->
    <div
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

    <template v-if="tab === 'clases'">

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
            :title="classClashes.length === 1
                ? 'Un choque en el horario'
                : `${classClashes.length} choques en el horario`"
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
            Sin choques: ninguna clase se pisa con otra este semestre.
        </UiCallout>

        <WeekTimetable :events="classEvents" />

        <p
            v-if="missingFromGrid.length"
            class="missing"
        >
            <template
                v-for="subject in missingFromGrid"
                :key="subject.code"
            >
                {{ subject.name }}: {{ subject.reason }}.<br>
            </template>
        </p>

        <p
            v-if="!hasSelection"
            class="emptyState"
        >
            La rejilla está vacía porque aún no has marcado asignaturas.
        </p>

        <UiCallout
            tone="attention"
            title="Las prácticas van aparte"
        >
            Aquí solo se tienen en cuenta las clases de teoría. Las prácticas
            y los laboratorios cambian mucho a lo largo del semestre y
            dependen de la asignatura, el grupo, etc. Aconsejamos consultar la
            <a
                class="guideLink"
                href="https://estudios.unizar.es/estudio/asignaturas?anyo_academico=2026&estudio_id=20260124&centro_id=100&plan_id_nk=447&sort=curso"
                target="_blank"
                rel="noopener"
            >Guía Docente</a>
            o al profesorado de la asignatura en caso de duda.
        </UiCallout>

        <p class="footnote">
            Clases de teoría del grupo elegido · horario oficial del curso
            2026-2027.
        </p>

    </template>

    <!-- ================= Exámenes ================= -->

    <template v-else>

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
            :title="examClashes.length === 1
                ? 'Dos exámenes el mismo día'
                : `${examClashes.length} días con exámenes que coinciden`"
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
            Sin coincidencias: cada examen cae en un día distinto.
        </UiCallout>

        <ExamCalendar
            v-if="examPeriods.length"
            :periods="examPeriods"
        />

        <p
            v-else
            class="emptyState"
        >
            {{ hasSelection
                ? "Ninguna de tus asignaturas tiene examen en esta convocatoria."
                : "Marca asignaturas arriba para ver sus fechas de examen." }}
        </p>

        <p class="footnote">
            {{ convocatorias
                .map(conv => `${convocatoriaLabel(conv)} = ${convocatoriaSpans[conv]}`)
                .join(" · ") }}
            · fechas oficiales del centro, curso 2026-2027.
        </p>

    </template>

</div>

</template>

<style scoped>

.screen{

    display:flex;

    flex-direction:column;

    gap:12px;

    padding:14px var(--gutter) 20px;

    max-width:var(--content-max);

    margin:0 auto;

    box-sizing:border-box;

    width:100%;

}

.intro{

    margin:0;

    font-size:var(--text-body);

    line-height:var(--leading-body);

    color:var(--ink-2);

}

/* Dos pestañas del mismo contenido: un conmutador segmentado, no chips
   sueltos — cambiar de vista no es filtrar. */
.switch{

    display:flex;

    padding:3px;

    background:var(--surface);

    border:1px solid var(--line-strong);

    border-radius:var(--radius-control);

}

.switchTab{

    flex:1;

    min-height:38px;

    border:none;

    border-radius:var(--radius-control);

    background:none;

    font-family:var(--font-sans);

    font-size:var(--text-body);

    font-weight:600;

    color:var(--ink-3);

    cursor:pointer;

}

.switchTab.active{

    background:var(--navy);

    color:var(--ink-on-navy);

}

.chips{

    display:flex;

    flex-wrap:wrap;

    gap:6px;

}

.clashItem{

    margin:0;

}

.clashItem + .clashItem{

    margin-top:3px;

}

/* Al listado oficial de asignaturas del plan, donde cada una enlaza su guía.
   La URL lleva el curso (2026) codificado: al cambiar de curso hay que
   actualizarla junto con PUBLICACION en scripts/updater.py. */
.guideLink{

    color:var(--navy);

    font-weight:600;

    text-decoration:underline;

    text-underline-offset:2px;

}

.missing{

    margin:0;

    font-family:var(--font-sans);

    font-size:var(--text-num-sm);

    line-height:var(--leading-relaxed);

    color:var(--ink-soft);

}

.emptyState{

    margin:0;

    padding:10px 0;

    text-align:center;

    font-size:var(--text-body);

    color:var(--ink-soft);

}

.footnote{

    margin:2px 0 0;

    padding-top:10px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-sans);

    font-size:var(--text-footnote);

    line-height:var(--leading-relaxed);

    color:var(--ink-faint);

}

</style>
