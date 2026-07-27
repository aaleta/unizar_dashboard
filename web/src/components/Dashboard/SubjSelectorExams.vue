<script setup>
import { ref, computed } from "vue";

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
const props = defineProps({
    subjects: {
        type: Array,
        required: true
    },
    convocatorias: {
        type: Array,
        default: () => []
    },
    selectedSubjects: {
        type: Array,
        default: () => []
    },
    selectedConvocatoria: {
        type: String,
        default: "all"
    }
});

/*
|--------------------------------------------------------------------------
| Emits
|--------------------------------------------------------------------------
*/
const emit = defineEmits([
    "update:selectedSubjects",
    "update:selectedConvocatoria"
]);

/*
|--------------------------------------------------------------------------
| Local state
|--------------------------------------------------------------------------
*/
const selectedCourse = ref("all");

/*
|--------------------------------------------------------------------------
| Convocatoria label helper ("tab-E1" -> "E1")
|--------------------------------------------------------------------------
*/
function convocatoriaLabel(key) {
    return key.replace(/^tab-/, "");
}

/*
|--------------------------------------------------------------------------
| Filtered subjects
|--------------------------------------------------------------------------
*/
const filteredSubjects = computed(() => {
    if (selectedCourse.value === "all") {
        return props.subjects;
    }
    return props.subjects.filter(
        subject => String(subject.course) === selectedCourse.value
    );
});

/*
|--------------------------------------------------------------------------
| Selection handling
|--------------------------------------------------------------------------
*/
function toggleSubject(subject) {
    const selected = [...props.selectedSubjects];

    const index = selected.findIndex(
        s => s.code === subject.code
    );

    if (index === -1) {
        selected.push(subject);
    } else {
        selected.splice(index, 1);
    }

    emit("update:selectedSubjects", selected);
}

function isSelected(subject) {
    return props.selectedSubjects.some(
        s => s.code === subject.code
    );
}

function updateConvocatoria(value) {
    emit("update:selectedConvocatoria", value);
}
</script>

<template>
<div class="subject-selector">

    <h3>Elige tus asignaturas</h3>

    <!-- Convocatoria selector -->
    <div class="course-filter">
        <label>Convocatoria:</label>
        <select
            :value="selectedConvocatoria"
            @change="updateConvocatoria($event.target.value)"
        >
            <option value="all">Todas</option>
            <option
                v-for="conv in convocatorias"
                :key="conv"
                :value="conv"
            >
                {{ convocatoriaLabel(conv) }}
            </option>
        </select>
    </div>

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
                <small>{{ subject.course }}º</small>
            </label>
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