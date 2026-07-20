<script setup>

import { ref, computed } from "vue";
import subjects from "../../../../data/json/processed/AsignaturasClasificadasOptTronc.json";

const emit = defineEmits(["fight"]);

const allSubjects = [];

Object.values(subjects.troncales).forEach(course => {
    allSubjects.push(...course);
});

Object.values(subjects.optativas).forEach(course => {
    allSubjects.push(...course);
});

const subjectList = [
    ...new Map(
        allSubjects.map(s => [s.code, s])
    ).values()
].sort((a,b)=>a.name.localeCompare(b.name));

const fighter1 = ref("");
const fighter2 = ref("");

const show1 = ref(false);
const show2 = ref(false);

const normalize = text =>

    text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase();

const filtered1 = computed(() => {

    if(!fighter1.value)
        return [];

    return subjectList.filter(subject =>

        normalize(subject.name).includes(
            normalize(fighter1.value)
        )

    ).slice(0,8);

});

const filtered2 = computed(() => {

    if(!fighter2.value)
        return [];

    return subjectList.filter(subject =>

        normalize(subject.name).includes(
            normalize(fighter2.value)
        )

    ).slice(0,8);

});

const subject1 = computed(()=>

    subjectList.find(s=>s.name===fighter1.value)

);

const subject2 = computed(()=>

    subjectList.find(s=>s.name===fighter2.value)

);

const select1 = subject=>{

    fighter1.value=subject.name;

    show1.value=false;

};

const select2 = subject=>{

    fighter2.value=subject.name;

    show2.value=false;

};

const startFight=()=>{

    if(!subject1.value || !subject2.value)
        return;

    emit("fight",{

        first:subject1.value,

        second:subject2.value

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

            <label>Primera asignatura</label>

            <div class="autocomplete">

                <input

                    v-model="fighter1"

                    @focus="show1=true"

                    @input="show1=true"

                    placeholder="Buscar asignatura..."

                >

                <div

                    v-if="show1 && filtered1.length"

                    class="suggestions"

                >

                    <div

                        v-for="subject in filtered1"

                        :key="subject.code"

                        class="suggestion"

                        @mousedown="select1(subject)"

                    >

                        {{ subject.name }}

                    </div>

                </div>

            </div>

        </div>

        <div class="field">

            <label>Segunda asignatura</label>

            <div class="autocomplete">

                <input

                    v-model="fighter2"

                    @focus="show2=true"

                    @input="show2=true"

                    placeholder="Buscar asignatura..."

                >

                <div

                    v-if="show2 && filtered2.length"

                    class="suggestions"

                >

                    <div

                        v-for="subject in filtered2"

                        :key="subject.code"

                        class="suggestion"

                        @mousedown="select2(subject)"

                    >

                        {{ subject.name }}

                    </div>

                </div>

            </div>

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

    margin:40px auto;

    padding:36px;

    background:#1f2937;

    border-radius:18px;

    border:1px solid rgba(255,255,255,.08);

    display:flex;

    flex-direction:column;

    gap:28px;

    box-sizing:border-box;

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

    width:100%;

    padding:14px 16px;

    border-radius:10px;

    border:1px solid #334155;

    background:#0f172a;

    color:white;

    font-size:1rem;

    box-sizing:border-box;

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

/* ========================= */
/*          MÓVIL            */
/* ========================= */

@media(max-width:768px){

    .panel{

        max-width:100%;

        margin:20px auto;

        padding:22px 18px;

        border-radius:14px;

        gap:20px;

    }

    h1{

        font-size:1.6rem;

    }

    .subtitle{

        font-size:.95rem;

        line-height:1.5;

    }

    input{

        font-size:16px; /* evita el zoom automático en iPhone */

    }

    .fightButton{

        width:100%;

        align-self:stretch;

        padding:14px;

    }

}

.autocomplete{

    position:relative;

}

.suggestions{

    position:absolute;

    top:100%;

    left:0;

    right:0;

    background:#1e293b;

    border:1px solid #334155;

    border-radius:10px;

    margin-top:6px;

    max-height:240px;

    overflow-y:auto;

    z-index:100;

}

.suggestion{

    padding:12px 16px;

    color:white;

    cursor:pointer;

    transition:.15s;

}

.suggestion:hover{

    background:#2563eb;

}

</style>