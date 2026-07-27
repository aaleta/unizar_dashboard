<script setup>
import { ref, computed } from "vue";
import timetableData from "../../../../data/json/processed/TimeTableData.json";

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
const props = defineProps({
    subjects: {
        type: Object,
        required: true
    },
    selectedSubjects: {
        type: Array,
        default: () => []
    },
    selectedGroups: {
        type: Object,
        default: () => ({})
    }
});

/*
|--------------------------------------------------------------------------
| Emits
|--------------------------------------------------------------------------
*/
const emit = defineEmits([
    "update:selectedSubjects",
    "update:selectedGroups"
]);

/*
|--------------------------------------------------------------------------
| Local state
|--------------------------------------------------------------------------
*/
const selectedCourse = ref("all");



/*
|--------------------------------------------------------------------------
| Dynamic Group Extraction
|--------------------------------------------------------------------------
*/
function getAvailableGroups(subjectCode) {
    const code = String(subjectCode);
    const groups = new Set();

    timetableData.forEach(event => {
        if (
            event.Asignatura.startsWith(code) && 
            event.TipoActividad === "T" && 
            event["Curso-Grupo"]
        ) {
            groups.add(event["Curso-Grupo"]);
        }
    });

    return Array.from(groups).sort();
}

/*
|--------------------------------------------------------------------------
| Subject list generation
|--------------------------------------------------------------------------
*/
const allSubjects = computed(() => {
    const result = [];

    // Mandatory subjects
    Object.entries(props.subjects.troncales).forEach(
        ([course, subjects]) => {
            subjects.forEach(subject => {
                result.push({
                    ...subject,
                    type: "troncal",
                    course: course
                });
            });
        }
    );

    // Optional subjects
    Object.entries(props.subjects.optativas).forEach(
        ([course, subjects]) => {
            subjects.forEach(subject => {
                result.push({
                    ...subject,
                    type: "optativa",
                    course: course
                });
            });
        }
    );

    return result;
});

/*
|--------------------------------------------------------------------------
| Filtered subjects
|--------------------------------------------------------------------------
*/
const filteredSubjects = computed(() => {
    if (selectedCourse.value === "all") {
        return allSubjects.value;
    }
    return allSubjects.value.filter(
        subject => subject.course === selectedCourse.value
    );
});

/*
|--------------------------------------------------------------------------
| Selection handling
|--------------------------------------------------------------------------
*/
function toggleSubject(subject) {

    const selected = [...props.selectedSubjects];
    const groups = { ...props.selectedGroups };

    const index = selected.findIndex(
        s => s.code === subject.code
    );

    if (index === -1) {

        selected.push(subject);

        const available = getAvailableGroups(subject.code);

        if (available.length > 0) {
            groups[subject.code] = available[0];
        }

    } else {

        selected.splice(index, 1);
        delete groups[subject.code];

    }

    emit("update:selectedGroups", groups);
    emit("update:selectedSubjects", selected);

}

function updateGroup(code, groupVal) {
    const groups = { ...props.selectedGroups };
    groups[code] = groupVal;
    emit("update:selectedGroups", groups);
}

function isSelected(subject) {
    return props.selectedSubjects.some(
        s => s.code === subject.code
    );
}

</script>

<template>
<div class="subject-selector">

    <h3>Elige tus asignaturas</h3>

    <!-- Course selector -->
    <div class="course-filter">
        <label>Curso:</label>
        <select v-model="selectedCourse">
            <option value="all">Todas</option>
            <option value="1">1º</option>
            <option value="2">2º</option>
            <option value="3">3º</option>
            <option value="4">4º</option>
        </select>
    </div>

    <!-- Subject list -->
    <div class="subject-list">

        <div
            v-for="subject in filteredSubjects"
            :key="subject.code"
            class="subject-card"
            :class="{ selected: isSelected(subject) }"
        >
            <label class="subject-item">
                <input
                    type="checkbox"
                    :checked="isSelected(subject)"
                    @change="toggleSubject(subject)"
                />
                <span>{{ subject.name }}</span>
                <small>({{ subject.type }})</small>
            </label>

            <!-- Render dynamic group dropdown if selected -->
            <div 
                class="group-select" 
                v-if="isSelected(subject) && getAvailableGroups(subject.code).length > 0"
            >
                <select 
                    :value="selectedGroups[subject.code]"
                    @change="updateGroup(subject.code, $event.target.value)"
                >
                    <option 
                        v-for="grp in getAvailableGroups(subject.code)" 
                        :key="grp" 
                        :value="grp"
                    >
                        {{ grp }}
                    </option>
                </select>
            </div>
        </div>

    </div>
</div>
</template>

<style scoped>
.subject-selector {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    box-sizing: border-box;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    background: rgba(10,20,40,0.75);
    border: 1px solid rgba(0,150,255,0.35);
    border-radius: 12px;
    box-shadow: 0 0 15px rgba(0,150,255,0.25);
    color: white;
    overflow: hidden;
}

h3 {
    flex-shrink: 0;
    margin: 0 0 1rem;
    color: #4db8ff;
    text-shadow: 0 0 10px rgba(0,150,255,0.8);
    font-size: 1.1rem;
}

.course-filter {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.course-filter label {
    color: #cceeff;
    font-size: 0.9rem;
}

.course-filter select {
    flex: 1;
    min-width: 0;
    padding: 0.4rem;
    border-radius: 6px;
    background: #081426;
    color: white;
    border: 1px solid rgba(0,150,255,0.5);
}

.subject-list {
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-right: 0.3rem;
}

.subject-card {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid transparent;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.subject-card:hover {
    background: rgba(0,150,255,0.15);
    box-shadow: 0 0 10px rgba(0,150,255,0.25);
}

.subject-card.selected {
    background: rgba(0,170,255,0.18);
    border-color: rgba(0,170,255,0.5);
    box-shadow: 0 0 10px rgba(0,150,255,0.35);
}

.subject-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.subject-item input {
    flex-shrink: 0;
    accent-color: #00aaff;
}

.subject-item span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.subject-card.selected .subject-item span {
    color: #eaf7ff;
}

.subject-item small {
    margin-left: auto;
    flex-shrink: 0;
    color: #8faac5;
    font-size: 0.7rem;
}

.group-select {
    display: flex;
    justify-content: flex-end;
}

.group-select select {
    background: rgba(0, 150, 255, 0.1);
    color: white;
    border: 1px solid rgba(0, 150, 255, 0.4);
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;
}

.subject-list::-webkit-scrollbar {
    width: 6px;
}

.subject-list::-webkit-scrollbar-thumb {
    background: #009dff;
    border-radius: 10px;
}

@media(max-width:768px){
    .subject-selector {
        height: auto;
    }
    .subject-list {
        flex: none;
        max-height: 40vh;
    }
}
</style>