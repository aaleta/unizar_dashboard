<script setup>
import { ref, computed } from "vue";

// TODO: ajusta esta ruta a la ubicación real de tu Examenes.json
import examData from "../../../data/json/processed/Examenes.json";

import ExamSubjSelector from "@/components/Dashboard/SubjSelectorExams.vue";
import ExamCalendar from "@/components/Dashboard/ExamBoard.vue";
import SummarySelectedSubjTimetable from "@/components/Dashboard/SummarySelectedExams.vue";

/*
|--------------------------------------------------------------------------
| Reactive state
|--------------------------------------------------------------------------
*/

// Subjects selected by the user (same shape {code, name, ...} as MountYourCourse)
const selectedSubjects = ref([]);

// Active period tab. "all" shows every convocatoria at once.
const selectedConvocatoria = ref("all");

/*
|--------------------------------------------------------------------------
| Convocatorias available (tab-E1, tab-E2, tab-E3, ...)
|--------------------------------------------------------------------------
*/

const convocatorias = computed(() => Object.keys(examData));

/*
|--------------------------------------------------------------------------
| Subject catalogue, derived straight from Examenes.json
|--------------------------------------------------------------------------
|
| Examenes.json stores "asignatura" as "CODE - Name", so it's split
| here into { code, name, course } for every subject that appears
| at least once across any convocatoria.
|
*/

const allSubjects = computed(() => {
    const map = new Map();

    Object.values(examData).forEach(entries => {
        entries.forEach(entry => {
            const parts = entry.asignatura.split(" - ");
            const code = parts[0];
            const name = parts.slice(1).join(" - ");

            if (!map.has(code)) {
                map.set(code, {
                    code,
                    name,
                    course: entry.curso
                });
            }
        });
    });

    return Array.from(map.values()).sort(
        (a, b) => a.code.localeCompare(b.code)
    );
});

/*
|--------------------------------------------------------------------------
| Raw entries for the active convocatoria (or all of them combined)
|--------------------------------------------------------------------------
*/

const relevantEntries = computed(() => {
    if (selectedConvocatoria.value === "all") {
        return Object.entries(examData).flatMap(([convocatoria, entries]) =>
            entries.map(entry => ({ ...entry, convocatoria }))
        );
    }

    const entries = examData[selectedConvocatoria.value] || [];

    return entries.map(entry => ({
        ...entry,
        convocatoria: selectedConvocatoria.value
    }));
});

/*
|--------------------------------------------------------------------------
| Generate exam events for the selected subjects
|--------------------------------------------------------------------------
*/

const selectedEvents = computed(() => {
    const events = [];

    // Some rows in the source data are duplicated (same subject,
    // same date, same convocatoria) -- collapse them into one event.
    const seen = new Set();

    for (const subject of selectedSubjects.value) {
        const code = String(subject.code);

        relevantEntries.value.forEach(entry => {
            const parts = entry.asignatura.split(" - ");
            const entryCode = parts[0];

            if (entryCode !== code) return;

            const dedupeKey = `${entryCode}|${entry.fecha_examen}|${entry.convocatoria}`;
            if (seen.has(dedupeKey)) return;
            seen.add(dedupeKey);

            events.push({
                code: entryCode,
                name: parts.slice(1).join(" - "),
                course: entry.curso,
                date: entry.fecha_examen, // "DD-MM-YYYY"
                convocatoria: entry.convocatoria
            });
        });
    }

    return events;
});

/*
|--------------------------------------------------------------------------
| Collision detection: two different subjects examined the same day
|--------------------------------------------------------------------------
*/

const collisions = computed(() => {
    const result = [];
    const events = selectedEvents.value;

    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            const first = events[i];
            const second = events[j];

            // Same subject appearing twice (e.g. lab + theory) isn't a clash
            if (first.code === second.code) continue;

            if (first.date === second.date) {
                result.push({ first, second });
            }
        }
    }

    return result;
});
</script>

<template>
<div class="mount-exams">
    <aside class="course-sidebar">
        <h2>Horario de Exámenes</h2>

        <ExamSubjSelector
            class="selector-flex"
            :subjects="allSubjects"
            :convocatorias="convocatorias"
            v-model:selectedSubjects="selectedSubjects"
            v-model:selectedConvocatoria="selectedConvocatoria"
        />

        <SummarySelectedSubjTimetable
            class="collision-flex"
            :selected-subjects="selectedSubjects"
            @update:selectedSubjects="selectedSubjects = $event"
        />
    </aside>

    <main class="content">
        <ExamCalendar
            :events="selectedEvents"
            :collisions="collisions"
            :convocatoria="selectedConvocatoria"
        />
    </main>
</div>
</template>

<style scoped>
.mount-exams {
    margin-left: 220px;
    height: 100vh;
    display: grid;
    grid-template-columns:
        minmax(260px, 22%)
        minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    gap: 1.25rem;
    padding: 1.25rem;
    box-sizing: border-box;
    overflow: hidden;
    background: #050b18;
}

.course-sidebar {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
}

.course-sidebar h2 {
    flex-shrink: 0;
    margin: 0;
    color: #4db8ff;
    text-shadow: 0 0 12px rgba(0,150,255,.8);
}

.selector-flex {
    flex: 3 1 0;
    min-height: 0;
}

.collision-flex {
    flex: 2 1 0;
    min-height: 0;
}

.content {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.content :deep(.exam-calendar) {
    flex: 1;
    min-height: 0;
}

.course-sidebar::-webkit-scrollbar {
    width: 6px;
}

.course-sidebar::-webkit-scrollbar-thumb {
    background: #009dff;
    border-radius: 10px;
}

@media(max-width:1200px){
    .mount-exams {
        grid-template-columns:
            minmax(220px,25%)
            minmax(0,1fr);
    }
}

@media(max-width:768px){
    .mount-exams {
        display: flex;
        flex-direction: column;
        margin-left: 0;
        height: auto;
        min-height: 100vh;
        overflow: visible;
        padding: .8rem;
        padding-bottom: calc(64px + .8rem);
    }

    .course-sidebar {
        width: 100%;
        height: auto;
        overflow: visible;
    }

    .selector-flex,
    .collision-flex {
        flex: none;
        min-height: auto;
    }

    .content {
        width: 100%;
        height: auto;
        min-height: 650px;
        overflow: visible;
    }

    .content :deep(.exam-calendar) {
        height: auto;
        min-height: 600px;
    }
}
</style>