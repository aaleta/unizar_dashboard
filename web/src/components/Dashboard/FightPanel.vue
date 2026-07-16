<script setup>

import { ref, computed } from "vue";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

const emit = defineEmits(["fight"]);

// Lista de asignaturas
const allSubjects = [];

Object.values(subjects.troncales).forEach(course => {
    allSubjects.push(...course);
});

Object.values(subjects.optativas).forEach(course => {
    allSubjects.push(...course);
});

const subjectList = [
    ...new Map(
        allSubjects.map(subject => [subject.code, subject])
    ).values()
].sort((a, b) => a.name.localeCompare(b.name));

const fighter1 = ref("");
const fighter2 = ref("");

const subject1 = computed(() =>
    subjectList.find(subject => subject.name === fighter1.value)
);

const subject2 = computed(() =>
    subjectList.find(subject => subject.name === fighter2.value)
);

const startFight = () => {

    if (!subject1.value || !subject2.value) return;

    emit("fight", {
        first: subject1.value,
        second: subject2.value
    });

};


</script>

<template>

<div class="panel">

    <h1>

        Fight Mode

    </h1>

    <p class="subtitle">

        Selecciona las dos asignaturas que quieres enfrentar.

    </p>

    <div class="form">

        <div class="field">

            <label>

                Primera asignatura

            </label>

            <input
                v-model="fighter1"
                list="subjects"
                placeholder="Buscar asignatura..."
            >

        </div>

        <div class="field">

            <label>

                Segunda asignatura

            </label>

            <input
                v-model="fighter2"
                list="subjects"
                placeholder="Buscar asignatura..."
            >

        </div>

    </div>

    <datalist id="subjects">

        <option
            v-for="subject in subjectList"
            :key="subject.code"
            :value="subject.name"
        />

    </datalist>

    <button
        class="fightButton"
        :disabled="!subject1 || !subject2"
        @click="startFight"
    >

        Fight

    </button>

</div>

</template>

<style scoped>

.panel{

    width:100%;
    max-width:700px;

    margin:auto;

    padding:36px;

    background:#1f2937;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    display:flex;

    flex-direction:column;

    gap:28px;

    margin-left: 30%;

}

h1{

    margin:0;

    text-align:center;

    color:white;

    font-size:2rem;

}

.subtitle{

    margin:0;

    text-align:center;

    color:#94a3b8;

}

.form{

    display:grid;

    gap:22px;

}

.field{

    display:flex;

    flex-direction:column;

    gap:8px;

}

label{

    color:white;

    font-weight:600;

}

input{

    padding:14px 16px;

    border-radius:10px;

    border:1px solid #334155;

    background:#0f172a;

    color:white;

    font-size:1rem;

}

input:focus{

    outline:none;

    border-color:#3b82f6;

}

.fightButton{

    align-self:center;

    padding:14px 40px;

    border:none;

    border-radius:10px;

    background:#2563eb;

    color:white;

    font-size:1rem;

    font-weight:600;

    cursor:pointer;

    transition:.2s;

}

.fightButton:hover:not(:disabled){

    background:#1d4ed8;

}

.fightButton:disabled{

    opacity:.5;

    cursor:not-allowed;

}

</style>