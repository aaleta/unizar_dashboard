<script setup>
import { ref, computed } from "vue";

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

// Current selected course filter
const selectedCourse = ref("all");

// Internal copy of selected subjects
const localSelected = ref([
    ...props.selectedSubjects
]);


/*
|--------------------------------------------------------------------------
| Subject list generation
|--------------------------------------------------------------------------
|
| Converts:
|
| {
|   troncales:{
|       "1":[...],
|       "2":[...]
|   },
|   optativas:{
|       "3":[...]
|   }
| }
|
| into a flat list:
|
| [
|   {
|       code:26900,
|       name:"Fundamentos de física I",
|       type:"troncal",
|       course:"1"
|   }
| ]
|
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

    const index = localSelected.value.findIndex(
        s => s.code === subject.code
    );

    if (index === -1) {

        localSelected.value.push(subject);

    } else {

        localSelected.value.splice(index,1);

        // Remove possible group selection
        // when deselecting a subject
        const groups = {
            ...props.selectedGroups
        };

        delete groups[subject.code];

        emit(
            "update:selectedGroups",
            groups
        );

    }

    emit(
        "update:selectedSubjects",
        localSelected.value
    );

}

function isSelected(subject) {
    return localSelected.value.some(
        s => s.code === subject.code
    );
}

</script>

<template>
<div class="subject-selector">

    <h3>
        Select subjects
    </h3>

    <!-- Course selector -->
    <div class="course-filter">

        <label>
            Course:
        </label>

        <select v-model="selectedCourse">
            <option value="all">All</option>
            <option value="1">First</option>
            <option value="2">Second</option>
            <option value="3">Third</option>
            <option value="4">Fourth</option>
        </select>

    </div>

    <!-- Subject list -->
    <div class="subject-list">

        <label
            v-for="subject in filteredSubjects"
            :key="subject.code"
            class="subject-item"
            :class="{ selected: isSelected(subject) }"
        >

            <input
                type="checkbox"
                :checked="isSelected(subject)"
                @change="toggleSubject(subject)"
            />

            <span>
                {{ subject.name }}
            </span>

            <small>
                ({{ subject.type }}
            </small>

        </label>

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
    background:
        rgba(10,20,40,0.75);
    border:
        1px solid rgba(0,150,255,0.35);
    border-radius: 12px;
    box-shadow:
        0 0 15px rgba(0,150,255,0.25);
    color: white;
    overflow: hidden;
}

h3 {
    flex-shrink: 0;
    margin: 0 0 1rem;
    color: #4db8ff;
    text-shadow:
        0 0 10px rgba(0,150,255,0.8);
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
    border:
        1px solid rgba(0,150,255,0.5);
}

/*
Was capped with a viewport-relative max-height,
which didn't account for the space actually left
over by the header/filter or by sibling panels.
Now it simply fills whatever room the flex parent
gives it, and scrolls internally when needed.
*/
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

.subject-item {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background:
        rgba(255,255,255,0.04);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.subject-item:hover {
    background:
        rgba(0,150,255,0.15);
    box-shadow:
        0 0 10px rgba(0,150,255,0.25);
}

.subject-item.selected {
    background:
        rgba(0,170,255,0.18);
    border-color:
        rgba(0,170,255,0.5);
    box-shadow:
        0 0 10px rgba(0,150,255,0.35);
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

.subject-item.selected span {
    color: #eaf7ff;
}

.subject-item small {
    margin-left: auto;
    flex-shrink: 0;
    color: #8faac5;
    font-size: 0.7rem;
}

/* scrollbar */
.subject-list::-webkit-scrollbar {
    width: 6px;
}

.subject-list::-webkit-scrollbar-thumb {
    background: #009dff;
    border-radius: 10px;
}

/* mobile — matches Sidebar.vue's breakpoint, where the
   permanent nav collapses into a bottom bar */
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