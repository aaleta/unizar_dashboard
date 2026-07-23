<script setup>

/**
 * Mapa del grado — "la espina dorsal". La pantalla que organiza toda la web.
 *
 * La idea: ver la forma del grado de una vez. Una línea vertical con los
 * cuatro cursos colgando, y dentro de cada uno lo que cuesta cada asignatura.
 * Quien entra buscando "¿qué me espera en segundo?" lo tiene en un vistazo,
 * sin filtrar ni ordenar nada.
 *
 * Dos ejes, dos codificaciones que no se pisan:
 *   - el COLOR del punto y de la cifra es la dificultad (rampa);
 *   - la FORMA distingue troncal (relleno) de optativa (anillo).
 * El navy de los nodos y de los contadores es estructura, nunca magnitud.
 *
 * Cada curso muestra las más duras primero y esconde el resto tras un "＋ N
 * más". Es lo contrario de una tabla: aquí no se viene a consultar las 54,
 * se viene a ver dónde está lo gordo.
 */

import { ref } from "vue";

import { useDegreeMap } from "@/composables/useDegreeMap";
import { difficultyFill, difficultyInk } from "@/theme/difficulty";

import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";

/** Cuántas asignaturas se ven antes de tener que pedir el resto. */
const PREVIEW = 4;

const { courses, kindestCourse, totals } = useDegreeMap();

// Qué grupos ha desplegado el usuario. La clave es "3-optativas" y similares.
const expanded = ref(new Set());

const toggle = key => {

    const next = new Set(expanded.value);

    if (next.has(key)) {
        next.delete(key);
    } else {
        next.add(key);
    }

    // Un Set nuevo, no el mismo mutado: Vue compara por referencia.
    expanded.value = next;

};

const shown = (list, key) =>
    expanded.value.has(key) ? list : list.slice(0, PREVIEW);

/** Redondeo a entero: "aprueban 76,6 % de media" es precisión fingida. */
const pct = value =>
    value === null ? "—" : `${Math.round(value)}%`;

/**
 * Cuarto se colapsa en una tarjeta en lugar de listar sus asignaturas: casi
 * todas rondan el 5 % de no superación y una lista de seis filas verdes no
 * dice nada que no diga la frase. Sus asignaturas siguen a un toque, en la
 * vista de curso.
 */
const isCollapsed = course => course.number === 4;

const kindestNote = course =>
    course.number === kindestCourse ? " · el curso más amable" : "";

</script>

<template>

<div class="screen">

    <!-- Continúa la banda navy de la cabecera: son las cifras estructurales
         del grado, no datos que haya que comparar. Se va con el scroll y la
         cabecera se queda, que es lo que hace falta al bajar. -->
    <div class="totals fullBleed">
        <div class="totalsInner">
            <span>{{ totals.courses }} cursos</span>
            <span>{{ totals.troncales }} troncales</span>
            <span>{{ totals.optativas }} optativas</span>
        </div>
    </div>

    <div class="spine">

        <div
            class="line"
            aria-hidden="true"
        ></div>

        <section
            v-for="course in courses"
            :key="course.number"
            class="course"
        >

            <RouterLink
                :to="`/grado/${course.number}`"
                class="node"
                :aria-label="`Ver ${course.name}`"
            >
                {{ course.number }}
            </RouterLink>

            <div class="heading">

                <h2>
                    <RouterLink :to="`/grado/${course.number}`">
                        {{ course.name }}
                    </RouterLink>
                </h2>

                <span
                    v-if="!isCollapsed(course)"
                    class="caption"
                >
                    aprueban {{ pct(course.avgPass) }} de media
                </span>

            </div>

            <!-- Cuarto: una frase en vez de seis filas. -->
            <p
                v-if="isCollapsed(course)"
                class="summary"
            >
                {{ course.troncales.length }} troncales · aprueban
                <strong>{{ pct(course.avgPass) }}</strong>
                de media{{ kindestNote(course) }}
            </p>

            <template v-else>

                <UiSectionHeader
                    label="Troncales"
                    :count="course.troncales.length"
                    hint="% que no aprueba"
                    class="group"
                />

                <ul class="rows">

                    <li
                        v-for="subject in shown(course.troncales, `${course.number}-t`)"
                        :key="subject.code"
                    >
                        <RouterLink
                            :to="`/asignatura/${subject.code}`"
                            class="row"
                        >
                            <span
                                class="dot"
                                :style="{ background: difficultyFill(subject.noSuperacion) }"
                            ></span>
                            <span class="name">{{ subject.name }}</span>
                            <span
                                v-if="subject.smallCohort"
                                class="warn"
                                title="Menos de 10 matriculados: el porcentaje baila mucho"
                            >⚠</span>
                            <span
                                class="value num"
                                :style="{ color: difficultyInk(subject.noSuperacion, true) }"
                            >{{ pct(subject.noSuperacion) }}</span>
                        </RouterLink>
                    </li>

                    <li v-if="course.troncales.length > PREVIEW">
                        <button
                            type="button"
                            class="more"
                            @click="toggle(`${course.number}-t`)"
                        >
                            {{ expanded.has(`${course.number}-t`)
                                ? "− ver menos"
                                : `＋ ${course.troncales.length - PREVIEW} troncales más` }}
                        </button>
                    </li>

                </ul>

                <template v-if="course.optativas.length">

                    <UiSectionHeader
                        label="Optativas"
                        :count="course.optativas.length"
                        hint="% que no aprueba"
                        tone="gold"
                        class="group"
                    />

                    <ul class="rows">

                        <li
                            v-for="subject in shown(course.optativas, `${course.number}-o`)"
                            :key="subject.code"
                        >
                            <RouterLink
                                :to="`/asignatura/${subject.code}`"
                                class="row optative"
                            >
                                <span
                                    class="dot hollow"
                                    :style="{ borderColor: difficultyFill(subject.noSuperacion) }"
                                ></span>
                                <span class="name">{{ subject.name }}</span>
                                <span
                                    v-if="subject.smallCohort"
                                    class="warn"
                                    title="Menos de 10 matriculados: el porcentaje baila mucho"
                                >⚠</span>
                                <span
                                    class="value num"
                                    :style="{ color: difficultyInk(subject.noSuperacion, true) }"
                                >{{ pct(subject.noSuperacion) }}</span>
                            </RouterLink>
                        </li>

                        <li v-if="course.optativas.length > PREVIEW">
                            <button
                                type="button"
                                class="more"
                                @click="toggle(`${course.number}-o`)"
                            >
                                {{ expanded.has(`${course.number}-o`)
                                    ? "− ver menos"
                                    : `＋ ${course.optativas.length - PREVIEW} optativas más` }}
                            </button>
                        </li>

                    </ul>

                </template>

            </template>

        </section>

    </div>

    <RouterLink
        to="/asignaturas"
        class="asList"
    >
        Ver las {{ totals.troncales + totals.optativas }} asignaturas como lista →
    </RouterLink>

</div>

</template>

<style scoped>

.screen{

    padding-bottom:8px;

}

.totals{

    background:var(--navy);

    padding-bottom:12px;

    /* Sube 1px para tapar cualquier costura con la cabecera al hacer zoom. */
    margin-top:-1px;

    padding-top:1px;

}

.totalsInner{

    display:flex;

    flex-wrap:wrap;

    gap:14px;

    max-width:var(--content-max);

    margin:0 auto;

    font-family:var(--font-mono);

    font-size:9.5px;

    letter-spacing:.3px;

    text-transform:uppercase;

    color:var(--navy-faint);

}

.spine{

    position:relative;

    padding:22px var(--gutter) 4px;

}

/* La línea de la espina. Arranca y acaba dentro del primer y último nodo para
   que no sobresalga por los extremos como un cable suelto. */
.line{

    position:absolute;

    left:calc(var(--gutter) + 10px);

    top:32px;

    bottom:14px;

    width:2px;

    background:var(--line-spine);

}

.course{

    position:relative;

    padding-left:34px;

}

.course + .course{

    margin-top:20px;

}

.node{

    position:absolute;

    left:0;

    top:0;

    display:flex;

    align-items:center;

    justify-content:center;

    width:21px;

    height:21px;

    border-radius:50%;

    background:var(--navy);

    color:var(--ink-on-navy);

    font-family:var(--font-serif);

    font-size:11px;

    font-weight:700;

    /* Por encima de la línea, que le pasa justo por detrás. */
    z-index:1;

}

/* El nodo mide 21px; lo que responde al dedo, 44. */
.node::after{

    content:"";

    position:absolute;

    left:50%;

    top:50%;

    width:var(--touch-target);

    height:var(--touch-target);

    transform:translate(-50%,-50%);

}

.heading{

    display:flex;

    align-items:baseline;

    flex-wrap:wrap;

    gap:8px;

    /* Alinea la línea base del título con el centro del nodo. */
    min-height:21px;

}

.heading h2{

    margin:0;

    font-family:var(--font-serif);

    font-size:18px;

    font-weight:700;

    line-height:1.1;

}

.heading h2 a{

    color:var(--navy);

}

.caption{

    font-family:var(--font-mono);

    font-size:9.5px;

    color:var(--ink-soft);

}

.summary{

    margin:9px 0 0;

    padding:11px 13px;

    background:var(--navy-wash);

    border:1px solid var(--navy-wash-line);

    border-radius:9px;

    font-size:12px;

    line-height:var(--leading-snug);

    color:var(--navy-soft);

}

.group{

    margin:9px 0 7px;

}

.rows{

    display:flex;

    flex-direction:column;

    gap:6px;

    margin:0;

    padding:0;

    list-style:none;

}

.row{

    display:flex;

    align-items:center;

    gap:9px;

    /* El mock dibuja estas filas a unos 31px, pero el handoff exige 44px de
       objetivo táctil "en todas partes, incluidas las filas de lista". Cuando
       las dos cosas se contradicen manda la regla de accesibilidad: la lista
       queda algo más larga, y a cambio nadie falla el toque. */
    min-height:var(--touch-target);

    padding:7px 11px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-row);

    color:var(--ink);

}

.row:active{

    border-color:var(--line-strong);

}

.row.optative{

    background:transparent;

    border-style:dashed;

    border-color:var(--line-dashed);

    color:var(--ink-2);

}

.dot{

    width:8px;

    height:8px;

    flex:none;

    border-radius:50%;

}

.dot.hollow{

    background:transparent;

    border:2px solid;

    box-sizing:border-box;

}

.name{

    flex:1;

    min-width:0;

    font-size:var(--text-body);

}

.warn{

    flex:none;

    font-size:10px;

    color:var(--attention);

}

.value{

    flex:none;

    font-size:var(--text-num);

}

.more{

    display:block;

    width:100%;

    min-height:var(--touch-target);

    padding:2px;

    border:none;

    background:none;

    text-align:left;

    font-family:var(--font-mono);

    font-size:10px;

    color:var(--ink-faint-2);

    cursor:pointer;

}

.more:active{

    color:var(--navy);

}

.asList{

    display:flex;

    align-items:center;

    min-height:var(--touch-target);

    padding:0 var(--gutter);

    font-size:var(--text-body-sm);

    font-weight:600;

}

</style>
