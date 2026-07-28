<script setup>

import { ref, computed, watch } from "vue";

import asignaturas from "../../../../data/json/processed/profesores_guias_doc.json";

const props = defineProps({

    subjectCode: Number

});

/**
 * Ojo: las guías docentes cubren cursos (hasta 2026-2027) para los que todavía
 * no hay estadísticas de notas. Por eso este panel lleva su propio selector,
 * en lugar de compartir el de la página: antes elegir un curso futuro dejaba
 * media pantalla vacía.
 */
const entries = computed(() =>
    asignaturas
        .filter(item => Number(item.id_asignatura) === props.subjectCode)
        .sort((a, b) =>
            b.anyo_academico.localeCompare(a.anyo_academico)
        )
);

const years = computed(() =>
    entries.value.map(entry => entry.anyo_academico)
);

const selectedYear = ref("");

watch(

    years,

    newYears => {

        if (newYears.length && !newYears.includes(selectedYear.value)) {

            selectedYear.value = newYears[0];

        }

    },

    { immediate: true }

);

const current = computed(() =>
    entries.value.find(
        entry => entry.anyo_academico === selectedYear.value
    ) ?? null
);

const UNASSIGNED = "no asignados / no encontrados";

const professors = computed(() =>
    (current.value?.profesores ?? []).filter(
        name => name.trim().toLowerCase() !== UNASSIGNED
    )
);

const usableLink = url =>
    url && url !== "No disponible" ? url : null;

const webGuide = computed(() =>
    usableLink(current.value?.guia_docente_web)
);

const pdfGuide = computed(() =>
    usableLink(current.value?.guia_docente_pdf)
);

</script>

<template>

<div class="panel">

    <div class="panelHeader">

        <h2>Profesorado y guía docente</h2>

        <select
            v-if="years.length"
            v-model="selectedYear"
            class="yearSelector"
            aria-label="Curso académico de la guía docente"
        >

            <option
                v-for="year in years"
                :key="year"
                :value="year"
            >
                {{ year }}
            </option>

        </select>

    </div>

    <template v-if="current">

        <h3>Profesores</h3>

        <ul
            v-if="professors.length"
            class="teacherList"
        >
            <li
                v-for="teacher in professors"
                :key="teacher"
            >
                {{ teacher }}
            </li>
        </ul>

        <p
            v-else
            class="noData"
        >
            Profesorado sin asignar para este curso.
        </p>

        <h3>Guía docente</h3>

        <div class="links">

            <a
                v-if="webGuide"
                :href="webGuide"
                target="_blank"
                rel="noopener"
            >
                Ver guía docente
            </a>

            <a
                v-if="pdfGuide"
                :href="pdfGuide"
                target="_blank"
                rel="noopener"
            >
                Descargar en PDF
            </a>

            <span
                v-if="!webGuide && !pdfGuide"
                class="noData"
            >
                No hay guía docente disponible.
            </span>

        </div>

    </template>

    <div
        v-else
        class="empty"
    >
        No hay información docente para esta asignatura.
    </div>

</div>

</template>

<style scoped>

.panel{

    display:flex;

    flex-direction:column;

    padding:24px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    min-width:0;

}

.panelHeader{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:12px;

    margin-bottom:20px;

}

.panelHeader h2{

    margin:0;

    color:white;

    font-size:1.1rem;

    font-weight:600;

}

.yearSelector{

    background:#273358;

    color:white;

    border:1px solid #334155;

    border-radius:10px;

    padding:8px 12px;

    font-size:.9rem;

    cursor:pointer;

}

.yearSelector:focus{

    outline:none;

    border-color:#38bdf8;

}

h3{

    margin:0 0 12px;

    color:white;

    font-size:1rem;

    font-weight:600;

}

.teacherList{

    margin:0 0 24px;

    padding-left:20px;

    color:#cbd5e1;

    line-height:1.8;

}

.links{

    display:flex;

    flex-wrap:wrap;

    gap:16px;

}

.links a{

    color:#38bdf8;

    text-decoration:none;

    font-weight:600;

}

.links a:hover{

    color:#7dd3fc;

}

.noData{

    color:#94a3b8;

    font-style:italic;

}

.empty{

    display:flex;

    align-items:center;

    justify-content:center;

    min-height:160px;

    color:#94a3b8;

    font-style:italic;

    border:1px dashed rgba(255,255,255,.12);

    border-radius:12px;

}

</style>
