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
import { useViewport } from "@/composables/useViewport";
import { COHORT } from "@/content/copy";
import { pct } from "@/utils/format";
import { RECENT_YEARS } from "@/utils/metrics";
import {
    difficultyFill,
    difficultyInk,
    difficultyRamp
} from "@/theme/difficulty";

import UiIcon from "@/components/ui/UiIcon.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";

/**
 * Cuántas asignaturas se ven antes de tener que pedir el resto. Es un límite
 * del móvil: en escritorio caben las treinta troncales a la vez y el "＋ N más"
 * sobra, así que el recorte lo hace el CSS y no una rebanada en JavaScript.
 * Ojo: el número está también en el selector `nth-child` de la hoja de abajo.
 */
const PREVIEW = 4;

const { courses, pool, kindestCourse, totals } = useDegreeMap();

const { isDesktop } = useViewport();

const recentYears = RECENT_YEARS;

/**
 * El salto a la bolsa es un desplazamiento dentro de la misma pantalla, no una
 * ruta: con el enrutado por hash, un ancla "#bolsa" se leería como una URL y
 * acabaría en la portada.
 */
const poolBand = ref(null);

const scrollToPool = () => poolBand.value?.scrollIntoView({ block: "start" });

/**
 * La escala, de más fácil a más dura, para explicarla al pie. Con 54 puntos de
 * color en la misma pantalla hay que decir qué significa cada tono.
 */
const rampLegend = [...difficultyRamp].reverse().map((band, index, bands) => ({
    label: band.label,
    fill: band.fill,
    range: index ? `${band.from}%` : `<${bands[1].from}%`
}));

/** Cuánto mejor aprueba el curso más amable que primero. */
const kindestGap = Math.round(
    (courses.find(course => course.number === kindestCourse)?.avgPass ?? 0) -
        (courses[0].avgPass ?? 0)
);

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
</script>

<template>
    <div class="screen">
        <Teleport defer to="#pageActions">
            <p class="pageMeta num">
                {{ totals.courses }} cursos · {{ totals.troncales }} troncales ·
                {{ totals.optativas }} optativas<br />
                % que no aprueba, media de {{ recentYears }} cursos
            </p>
        </Teleport>

        <div class="spine">
            <div class="line" aria-hidden="true"></div>

            <section
                v-for="course in courses"
                :key="course.number"
                class="course"
            >
                <div class="nodeRow">
                    <RouterLink
                        :to="`/grado/${course.number}`"
                        class="node"
                        :aria-label="`Ver ${course.name}`"
                    >
                        {{ course.number }}
                    </RouterLink>

                    <!-- El tramo horizontal de la espina, que en escritorio
                     sustituye a la línea vertical. Se estira hasta meterse en
                     el hueco de la rejilla para llegar al nodo siguiente; el
                     último curso no lleva, que ahí acaba la carrera. -->
                    <div
                        v-if="course.number < courses.length"
                        class="rail"
                        aria-hidden="true"
                    ></div>
                </div>

                <div class="heading">
                    <h2>
                        <!-- La flecha dice "esto se abre": el título solo, en
                         navy, se leía como un rótulo y nadie lo tocaba. -->
                        <RouterLink :to="`/grado/${course.number}`">
                            {{ course.name }}
                            <UiIcon
                                name="chevronRight"
                                :size="12"
                                :width="2.4"
                                class="headingChevron"
                            />
                        </RouterLink>
                    </h2>

                    <span class="caption">
                        <span>aprueban {{ pct(course.avgPass) }} de media</span
                        ><span class="onlyWide">
                            · no se presentan {{ pct(course.avgNoShow) }}</span
                        >
                    </span>
                </div>

                <UiSectionHeader
                    label="Troncales"
                    :count="course.troncales.length"
                    hint="% que no aprueba"
                    class="group"
                />

                <ul
                    class="rows"
                    :class="{ collapsed: !expanded.has(`${course.number}-t`) }"
                >
                    <li v-for="subject in course.troncales" :key="subject.code">
                        <RouterLink
                            :to="`/asignatura/${subject.code}`"
                            class="row"
                        >
                            <span
                                class="dot"
                                :style="{
                                    background: difficultyFill(
                                        subject.noSuperacion
                                    )
                                }"
                            ></span>
                            <span class="name">{{ subject.name }}</span>
                            <span
                                v-if="subject.smallCohort"
                                class="warn"
                                :title="COHORT.warning"
                                >⚠</span
                            >
                            <span
                                class="value num"
                                :style="{
                                    color: difficultyInk(
                                        subject.noSuperacion,
                                        true
                                    )
                                }"
                                >{{ pct(subject.noSuperacion) }}</span
                            >
                            <UiIcon
                                name="chevronRight"
                                :size="11"
                                :width="2"
                                class="rowChevron"
                            />
                        </RouterLink>
                    </li>

                    <li
                        v-if="course.troncales.length > PREVIEW"
                        class="moreRow"
                    >
                        <button
                            type="button"
                            class="more"
                            @click="toggle(`${course.number}-t`)"
                        >
                            {{
                                expanded.has(`${course.number}-t`)
                                    ? "− ver menos"
                                    : `＋ ${course.troncales.length - PREVIEW} troncales más`
                            }}
                        </button>
                    </li>
                </ul>

                <!-- Las optativas de la bolsa no se repiten bajo 3.º y 4.º en
                 escritorio: van juntas en su banda, al pie. -->
                <div
                    v-if="course.optativas.length"
                    class="optatives"
                    :class="{ hideWide: course.poolOptatives }"
                >
                    <UiSectionHeader
                        :label="
                            course.poolOptatives
                                ? 'Optativas'
                                : 'Optativas especiales'
                        "
                        :count="course.optativas.length"
                        hint="% que no aprueba"
                        tone="gold"
                        class="group"
                    />

                    <ul
                        class="rows"
                        :class="{
                            collapsed: !expanded.has(`${course.number}-o`)
                        }"
                    >
                        <li
                            v-for="subject in course.optativas"
                            :key="subject.code"
                        >
                            <RouterLink
                                :to="`/asignatura/${subject.code}`"
                                class="row optative"
                            >
                                <span
                                    class="dot hollow"
                                    :style="{
                                        borderColor: difficultyFill(
                                            subject.noSuperacion
                                        )
                                    }"
                                ></span>
                                <span class="name">{{ subject.name }}</span>
                                <span
                                    v-if="subject.smallCohort"
                                    class="warn"
                                    :title="COHORT.warning"
                                    >⚠</span
                                >
                                <span
                                    class="value num"
                                    :style="{
                                        color: difficultyInk(
                                            subject.noSuperacion,
                                            true
                                        )
                                    }"
                                    >{{ pct(subject.noSuperacion) }}</span
                                >
                                <UiIcon
                                    name="chevronRight"
                                    :size="11"
                                    :width="2"
                                    class="rowChevron"
                                />
                            </RouterLink>
                        </li>

                        <li
                            v-if="course.optativas.length > PREVIEW"
                            class="moreRow"
                        >
                            <button
                                type="button"
                                class="more"
                                @click="toggle(`${course.number}-o`)"
                            >
                                {{
                                    expanded.has(`${course.number}-o`)
                                        ? "− ver menos"
                                        : `＋ ${course.optativas.length - PREVIEW} optativas más`
                                }}
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Lo que hay que saber de cada columna cuando se leen las
                 cuatro a la vez. En el móvil los cursos se leen de uno en uno
                 y estas notas sobran. -->
                <p
                    v-if="!course.poolOptatives && course.optativas.length"
                    class="note onlyWide"
                >
                    Se cursan fuera de la bolsa de 3º y 4º.
                </p>

                <p v-else-if="!course.optativas.length" class="note onlyWide">
                    {{ course.name }} no tiene optativas: sus
                    {{ course.troncales.length }} troncales ocupan el curso
                    entero.
                </p>

                <p
                    v-else-if="course.number === 3"
                    class="note callout onlyWide"
                >
                    Más <strong>{{ pool.total }} optativas</strong> de la bolsa,
                    que se comparten con 4º.
                    <button type="button" class="jump" @click="scrollToPool">
                        Ver abajo ↓
                    </button>
                </p>

                <p
                    v-else-if="course.number === kindestCourse"
                    class="note callout onlyWide"
                >
                    {{ course.name }} es el curso más amable del grado: aprueban
                    <strong class="num">{{ kindestGap }}</strong> puntos más que
                    en 1º.
                </p>
            </section>
        </div>

        <!-- La bolsa, una sola vez y a todo el ancho. -->
        <section id="bolsa" ref="poolBand" class="pool onlyWide">
            <div class="poolHead">
                <h2>
                    La bolsa de optativas
                    <span class="num poolCount">{{ pool.total }}</span>
                </h2>

                <span class="num poolMeta">
                    se eligen en 3º y 4º · {{ pool.inBothCourses }} de las
                    {{ pool.total }} se ofertan en los dos cursos
                </span>
            </div>

            <p class="poolLead">
                Van juntas y no repetidas bajo cada curso: son casi las mismas
                asignaturas en 3º y en 4º, y verlas dos veces haría creer que
                hay cuarenta. Ninguna pasa del {{ pool.hardest }}% de no
                superación — la dificultad del grado está en las troncales.
            </p>

            <div class="poolGrid">
                <RouterLink
                    v-for="subject in pool.subjects"
                    :key="subject.code"
                    :to="`/asignatura/${subject.code}`"
                    class="row optative"
                >
                    <span
                        class="dot hollow"
                        :style="{
                            borderColor: difficultyFill(subject.noSuperacion)
                        }"
                    ></span>
                    <span class="name">{{ subject.name }}</span>
                    <span
                        v-if="subject.smallCohort"
                        class="warn"
                        :title="COHORT.warning"
                        >⚠</span
                    >
                    <span
                        class="value num"
                        :style="{
                            color: difficultyInk(subject.noSuperacion, true)
                        }"
                        >{{ pct(subject.noSuperacion) }}</span
                    >
                </RouterLink>
            </div>
        </section>

        <!-- Con 54 puntos de color a la vez hay que explicar la escala en la
         propia pantalla; en el móvil se ven de cuatro en cuatro y no hace
         falta. -->
        <div class="legend onlyWide">
            <span class="eyebrow legendTitle">% que no aprueba</span>

            <div class="bands">
                <span
                    v-for="band in rampLegend"
                    :key="band.label"
                    class="legendItem"
                >
                    <span class="dot" :style="{ background: band.fill }"></span>
                    {{ band.label }} {{ band.range }}
                </span>
            </div>

            <span class="legendItem optativeKey">
                <span class="dot hollow"></span>
                anillo = optativa
            </span>
        </div>

        <!-- El mismo enlace en los dos sitios: en el móvil cierra la pantalla y
         en escritorio es el botón de la banda de título. -->
        <Teleport defer to="#pageActions" :disabled="!isDesktop">
            <RouterLink to="/asignaturas" class="asList">
                Ver las {{ totals.troncales + totals.optativas }} asignaturas
                como lista →
            </RouterLink>
        </Teleport>
    </div>
</template>

<style scoped>
.screen {
    padding-bottom: 8px;
}

.spine {
    position: relative;

    padding: 22px var(--gutter) 4px;
}

/* La línea de la espina. Arranca y acaba dentro del primer y último nodo para
   que no sobresalga por los extremos como un cable suelto. */
.line {
    position: absolute;

    left: calc(var(--gutter) + 10px);

    top: 32px;

    bottom: 14px;

    width: 2px;

    background: var(--line-spine);
}

.course {
    position: relative;

    padding-left: 34px;
}

.course + .course {
    margin-top: 20px;
}

.node {
    position: absolute;

    left: 0;

    top: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    width: 21px;

    height: 21px;

    border-radius: 50%;

    background: var(--navy);

    color: var(--ink-on-navy);

    font-family: var(--font-serif);

    font-size: 11px;

    font-weight: 700;

    /* Por encima de la línea, que le pasa justo por detrás. */
    z-index: 1;
}

/* El nodo mide 21px; lo que responde al dedo, 44. */
.node::after {
    content: "";

    position: absolute;

    left: 50%;

    top: 50%;

    width: var(--touch-target);

    height: var(--touch-target);

    transform: translate(-50%, -50%);
}

.heading {
    display: flex;

    align-items: baseline;

    flex-wrap: wrap;

    gap: 8px;

    /* Alinea la línea base del título con el centro del nodo. */
    min-height: 21px;
}

.heading h2 {
    margin: 0;

    font-family: var(--font-serif);

    font-size: 18px;

    font-weight: 700;

    line-height: 1.1;
}

.heading h2 a {
    color: var(--navy);
}

.caption {
    font-family: var(--font-mono);

    font-size: 9.5px;

    color: var(--ink-soft);
}

.headingChevron {
    vertical-align: -1px;

    color: var(--navy);
}

.rowChevron {
    flex: none;

    margin-left: -2px;

    color: var(--ink-chevron);
}

.group {
    margin: 9px 0 7px;
}

.rows {
    display: flex;

    flex-direction: column;

    gap: 6px;

    margin: 0;

    padding: 0;

    list-style: none;
}

.row {
    display: flex;

    align-items: center;

    gap: 9px;

    /* 44px de objetivo táctil también aquí: la lista queda algo más larga y a
       cambio nadie falla el toque. */
    min-height: var(--touch-target);

    padding: 7px 11px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: var(--radius-row);

    color: var(--ink);
}

.row:active {
    border-color: var(--line-strong);
}

.row.optative {
    background: transparent;

    border-style: dashed;

    border-color: var(--line-dashed);

    color: var(--ink-2);
}

.dot {
    width: 8px;

    height: 8px;

    flex: none;

    border-radius: 50%;
}

.dot.hollow {
    background: transparent;

    border: 2px solid;

    box-sizing: border-box;
}

.name {
    flex: 1;

    min-width: 0;

    font-size: var(--text-body);
}

.warn {
    flex: none;

    font-size: 10px;

    color: var(--attention);
}

.value {
    flex: none;

    font-size: var(--text-num);
}

.more {
    display: block;

    width: 100%;

    min-height: var(--touch-target);

    padding: 2px;

    border: none;

    background: none;

    text-align: left;

    font-family: var(--font-mono);

    font-size: 10px;

    color: var(--ink-soft);

    cursor: pointer;
}

.more:active {
    color: var(--navy);
}

.asList {
    display: flex;

    align-items: center;

    min-height: var(--touch-target);

    padding: 0 var(--gutter);

    font-size: var(--text-body-sm);

    font-weight: 600;
}

/* En el móvil los metadatos de la banda de título no se pintan: la banda es
   una línea y el destino del teleport está oculto. */
.pageMeta {
    display: none;
}

/* Solo en escritorio, y al revés: lo que el móvil no enseña. ---------- */

.onlyWide {
    display: none;
}

/* El recorte del móvil. El 5 es PREVIEW + 1: si allí cambia, aquí también.
   Se hace con CSS y no rebanando la lista para que el escritorio pueda
   enseñarlas todas sin un segundo camino en el JavaScript. */
.rows.collapsed > li:nth-child(n + 5):not(.moreRow) {
    display: none;
}

/* Escritorio ---------------------------------------------------------- *
 * La espina se gira 90 grados: los cuatro cursos en paralelo, cada uno con su
 * tramo de línea hasta el siguiente. Las treinta troncales se ven a la vez, y
 * la bolsa de optativas baja a una banda propia al pie.
 */

@media (min-width: 900px) {
    .screen {
        padding-bottom: 34px;
    }

    /* Cuatro columnas necesitan 1200px para que los nombres no se corten; por
       debajo, dos y dos. Es el mismo escalón que la portada. */
    .spine {
        display: grid;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 16px 16px;

        align-items: start;

        padding: 24px var(--gutter) 0;
    }

    /* La línea deja de ser vertical: ahora la dibuja cada cabecera. */
    .line {
        display: none;
    }

    .course {
        padding-left: 0;
    }

    .course + .course {
        margin-top: 0;
    }

    .nodeRow {
        display: flex;

        align-items: center;
    }

    /* `relative` y no `static`: el nodo lleva un ::after de 44px para el dedo,
       y sin posicionar se lo queda `.course` como contenedor — un cuadrado
       invisible en mitad de la columna que se tragaba los clics de dos filas. */
    .node {
        position: relative;

        width: 30px;

        height: 30px;

        font-size: 14px;
    }

    /* Se mete en el hueco de la rejilla para llegar hasta el nodo siguiente.
       Por delante del texto no: en el prototipo se probó y tachaba los
       títulos. */
    /* En dos columnas, el tramo de la derecha no lleva a ninguna parte. */
    .course:nth-of-type(2n) .rail {
        display: none;
    }

    .rail {
        flex: 1;

        height: 2px;

        margin-right: -16px;

        background: var(--line-spine);
    }

    .heading {
        display: block;

        margin-top: 13px;

        min-height: 0;
    }

    .heading h2 {
        font-size: 20px;
    }

    .caption {
        display: block;

        margin-top: 5px;

        font-size: var(--text-num-sm);
    }

    .caption .onlyWide {
        display: inline;
    }

    .group {
        margin: 18px 0 9px;
    }

    .rows {
        gap: 5px;
    }

    /* El nombre no parte la fila en dos: con cuatro columnas, una asignatura
       de tres líneas descuadra la comparación entre cursos. */
    .name {
        overflow: hidden;

        text-overflow: ellipsis;

        white-space: nowrap;
    }

    /* Aquí no hay nada plegado: caben las treinta. */
    .rows.collapsed > li:nth-child(n + 5):not(.moreRow) {
        display: block;
    }

    .moreRow,
    .rowChevron,
    .hideWide {
        display: none;
    }

    .onlyWide {
        display: block;
    }

    .note {
        margin: 9px 0 0;

        font-family: var(--font-mono);

        font-size: 9.5px;

        line-height: 1.5;

        color: var(--ink-soft);
    }

    /* Lo que no es una nota al pie sino un aviso con destino: sale del gris y
       se apoya en el lavado navy. */
    .note.callout {
        margin-top: 12px;

        padding: 11px 12px;

        background: var(--navy-wash);

        border: 1px solid var(--navy-wash-line);

        border-radius: var(--radius-control);

        font-family: var(--font-sans);

        font-size: var(--text-body-sm);

        color: var(--ink-2);
    }

    .jump {
        padding: 0;

        border: none;

        background: none;

        font-family: inherit;

        font-size: inherit;

        font-weight: 600;

        color: var(--navy);

        cursor: pointer;
    }

    /* La bolsa ---------------------------------------------------------- */

    .pool {
        margin: 30px var(--gutter) 0;

        padding-top: 22px;

        border-top: 1px solid var(--line-strong);
    }

    .poolHead {
        display: flex;

        align-items: baseline;

        justify-content: space-between;

        gap: 20px;
    }

    .poolHead h2 {
        margin: 0;

        font-family: var(--font-serif);

        font-size: 21px;

        font-weight: 600;
    }

    .poolCount {
        font-size: 15px;

        color: var(--gold-ink);
    }

    .poolMeta {
        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    /* La prosa se contiene aunque haya 1196px: una línea de 1.100px no se
       lee. */
    .poolLead {
        max-width: 840px;

        margin: 8px 0 16px;

        font-size: var(--text-body);

        line-height: 1.55;

        color: var(--ink-muted);
    }

    .poolGrid {
        display: grid;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 6px 16px;
    }

    /* La leyenda de la rampa --------------------------------------------- */

    .legend {
        display: flex;

        align-items: center;

        gap: 24px;

        margin: 26px var(--gutter) 0;

        padding-top: 16px;

        border-top: 1px solid var(--line-rule);
    }

    .legendTitle {
        font-size: 9.5px;
    }

    .bands {
        display: flex;

        flex-wrap: wrap;

        align-items: center;

        gap: 8px 18px;
    }

    .legendItem {
        display: flex;

        align-items: center;

        gap: 7px;

        font-family: var(--font-mono);

        font-size: var(--text-num-sm);

        color: var(--ink-muted);
    }

    .legend .dot {
        width: 9px;

        height: 9px;
    }

    .legend .dot.hollow {
        border-color: var(--ink-icon);
    }

    .optativeKey {
        margin-left: auto;
    }

    /* El enlace a la lista se va a la banda de título: allí es un botón. */
    .asList {
        min-height: 38px;

        padding: 0 14px;

        border: 1px solid var(--navy-line-soft);

        border-radius: var(--radius-control);

        background: var(--surface);

        font-size: var(--text-body);

        white-space: nowrap;
    }

    /* Metadatos de la banda de título. */
    .pageMeta {
        display: block;

        margin: 0;

        font-size: var(--text-num-sm);

        font-weight: 400;

        line-height: 1.6;

        text-align: right;

        color: var(--ink-soft);
    }
}

/* La rejilla del diseño: los cuatro cursos en paralelo, la bolsa a tres. */
@media (min-width: 1200px) {
    .spine {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .course:nth-of-type(2n) .rail {
        display: block;
    }

    /* La espina acaba en el cuarto nodo: ahí se termina la carrera. */
    .course:last-of-type .rail {
        display: none;
    }

    .poolGrid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
