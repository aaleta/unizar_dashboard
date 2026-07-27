<script setup>
import { ref, computed } from "vue";

import timetableData from "../../../data/json/processed/TimeTableData.json";
import subjects from "../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

import SubjSelectorSchedule from "@/components/Dashboard/SubjSelectorSchedule.vue";
import TimeTable from "@/components/Dashboard/TimeTable.vue";
import SummarySelectedSubjTimetable from "@/components/Dashboard/SummarySelectedSubjTimetable.vue";

/*
|--------------------------------------------------------------------------
| Reactive state
|--------------------------------------------------------------------------
*/

// Subjects selected by the user
const selectedSubjects = ref([]);

/*
Groups selected by the user.

Structure maps subject code to the selected group:
{
    26901: "447-1-0",
    26902: "447-1-1"
}
*/
const selectedGroups = ref({});

/*
|--------------------------------------------------------------------------
| Generate timetable events
|--------------------------------------------------------------------------
*/

const selectedEvents = computed(() => {
    const events = [];

    for (const subject of selectedSubjects.value) {
        const code = String(subject.code);
        const targetGroup = selectedGroups.value[code];

        /*
        Find all timetable entries belonging to this subject
        that are Theory ("T") and belong to the chosen group.
        */
        const subjectTimetable = timetableData.filter(event => {
            return (
                event.Asignatura.startsWith(code) &&
                event.TipoActividad === "T" &&
                event["Curso-Grupo"] === targetGroup
            );
        });

        subjectTimetable.forEach(event => {
            events.push({
                subject: event.Asignatura,
                code: code,
                group: event["Curso-Grupo"],
                semester: event.Semestre,
                day: event.Dia,
                start: event.HoraIni,
                end: event.HoraFin
            });
        });
    }

    return events;
});

/*
|--------------------------------------------------------------------------
| Collision detection
|--------------------------------------------------------------------------
*/

function timeToMinutes(time){
    const [hour,minute] = time
        .split(":")
        .map(Number);

    return hour*60 + minute;
}

function overlap(a,b){
    return (
        a.day === b.day &&
        timeToMinutes(a.start) < timeToMinutes(b.end) &&
        timeToMinutes(b.start) < timeToMinutes(a.end)
    );
}

const collisions = computed(() => {
    const result = [];
    const events = selectedEvents.value;

    for(let i=0;i<events.length;i++){
        for(let j=i+1;j<events.length;j++){
            const first = events[i];
            const second = events[j];

            /*
            Avoid comparing the same timetable event
            */
            if(
                first.code === second.code &&
                first.group === second.group
            ){
                continue;
            }

            if(overlap(first,second)){
                result.push({
                    first,
                    second
                });
            }
        }
    }

    return result;
});
</script>

<template>
<div class="mount-course">
    <aside class="course-sidebar">
        <h2>Monta tu horario</h2>

        <SubjSelectorSchedule
            class="selector-flex"
            :subjects="subjects"
            v-model:selectedSubjects="selectedSubjects"
            v-model:selectedGroups="selectedGroups"
        />

        <SummarySelectedSubjTimetable
            class="collision-flex"
            :selected-subjects="selectedSubjects"
            @update:selectedSubjects="selectedSubjects = $event"
        />
    </aside>

    <main class="content">
        <TimeTable
            :events="selectedEvents"
            :collisions="collisions"
        />
    </main>
</div>
</template>

<style scoped>
.mount-course {
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

.content :deep(.timetable) {
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
    .mount-course {
        grid-template-columns:
            minmax(220px,25%)
            minmax(0,1fr);
    }
}

@media(max-width:768px){
    .mount-course {
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

    .content :deep(.timetable) {
        height: auto;
        min-height: 600px;
    }
}
</style>