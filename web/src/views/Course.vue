<script setup>
/**
 * Vista de curso: la capa intermedia entre el mapa del grado y la ficha.
 *
 * El mapa dice qué cursos hay y cuál duele; la ficha lo cuenta todo de una
 * asignatura. Aquí se responde a lo que queda en medio: cómo va ESTE curso y
 * qué asignaturas lo componen, con lo justo de cada una para decidir en cuál
 * entrar.
 *
 * Una sola vista para los cuatro cursos: antes eran ocho ficheros casi
 * idénticos (firstYear…forthYear + dashboardYear) para el mismo contenido.
 *
 * El orden es siempre por dificultad descendente. Alfabético sería más
 * neutral, pero nadie llega aquí preguntándose qué asignatura empieza por A.
 */

import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useCourse } from "@/composables/useCourse";
import { usePageHeader } from "@/composables/usePageHeader";
import { weightedAverages } from "@/content/copy";
import { pct, thousands } from "@/utils/format";
import { courseSeries } from "@/utils/metrics";

import LineChart from "@/components/charts/LineChart.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiMeterRow from "@/components/ui/UiMeterRow.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";
import UiStat from "@/components/ui/UiStat.vue";
import UiSubjectCard from "@/components/ui/UiSubjectCard.vue";

/** Cuántas tarjetas se ven antes de tener que pedir el resto. */
const PREVIEW = 3;

const route = useRoute();

const {
    number,
    valid,
    name,
    troncales,
    optativas,
    avgPass,
    avgNoShow,
    enrolment,
    poolOptatives,
    alsoInCourses,
    recentYears
} = useCourse(() => route.params.curso);

const COURSES = [1, 2, 3, 4];

/** Las dos rejillas de tarjetas van ordenadas igual, y conviene decirlo. */
const ORDER_HINT = "ordenadas de más dura a más asequible";

usePageHeader(() => ({
    title: name.value ? `Curso ${name.value.toLowerCase()}` : "Vista de curso",
    // En escritorio la banda enseña de dónde cuelga la pantalla; el curso no
    // se llega desde ningún otro sitio que no sea el mapa del grado.
    breadcrumbs: [
        { label: "El Grado", to: "/grado" },
        { label: name.value ?? "Curso" }
    ]
}));

const showAllCore = ref(false);
const showAllOptional = ref(false);

const ordinal = course => `${course}º`;

const shortYear = academicYear =>
    academicYear
        .split("-")
        .map(part => part.slice(-2))
        .join("-");

/**
 * Cómo ha evolucionado la dificultad del curso entero: la media ponderada de
 * no superación de sus troncales, año a año. La línea responde a la pregunta
 * que las tarjetas no pueden: ¿este curso siempre fue así?
 */
const difficultyHistory = computed(() =>
    courseSeries(String(number.value), "noSuperacion").filter(
        point => point.value !== null
    )
);

const historyChart = computed(() => ({
    labels: difficultyHistory.value.map(point => shortYear(point.year)),
    series: [
        {
            label: "No superan las troncales",
            values: difficultyHistory.value.map(point => point.value)
        }
    ]
}));

const HISTORY_COLORS = ["var(--chart-line-2)"];

/**
 * De dónde a dónde ha ido la dificultad del curso. Se dice con los dos
 * extremos de la serie y sin adjetivos de más: si un año se da la vuelta, la
 * frase se da la vuelta con él.
 */
const historyNote = computed(() => {
    const points = difficultyHistory.value;

    if (points.length < 2) return null;

    const first = points[0];
    const last = points[points.length - 1];

    return {
        easier: last.value < first.value,
        first: pct(first.value),
        firstYear: first.year,
        last: pct(last.value),
        lastYear: last.year
    };
});
</script>

<template>
    <div v-if="valid" class="screen">
        <!-- Cambiar de curso sin volver al mapa. En el móvil no cabe y se
         vuelve con la pestaña "El Grado". -->
        <Teleport defer to="#pageActions">
            <div class="switcher">
                <span class="num switchLabel">Cambiar de curso</span>

                <RouterLink
                    v-for="option in COURSES"
                    :key="option"
                    :to="`/grado/${option}`"
                    class="num courseButton"
                    :class="{ current: option === number }"
                    :aria-current="option === number ? 'page' : undefined"
                >
                    {{ option }}º
                </RouterLink>
            </div>
        </Teleport>

        <header class="intro">
            <p class="lead">
                Estadísticas del curso y acceso a la ficha de cada
                asignatura.<span class="onlyWide">
                    Las medias son ponderadas y solo de las troncales: son las
                    que cursa todo el mundo.</span
                >
            </p>

            <div class="stats">
                <UiStat :value="pct(avgPass)" label="aprueban de media" />
                <UiStat :value="pct(avgNoShow)" label="no se presentan" />
                <UiStat
                    :value="troncales.length"
                    label="troncales"
                    tone="navy"
                />
                <UiStat
                    v-if="optativas.length"
                    :value="optativas.length"
                    :label="
                        poolOptatives ? 'optativas' : 'optativas especiales'
                    "
                    tone="gold"
                />
                <UiStat
                    class="onlyWide"
                    :value="thousands(enrolment)"
                    label="matrículas por curso académico"
                />
            </div>

            <p class="footnote">
                {{ weightedAverages("las troncales", recentYears) }}.
            </p>
        </header>

        <div class="pair">
            <section class="section">
                <div class="sectionHead">
                    <h2>Dificultad de las troncales</h2>
                    <span class="num sectionMeta onlyWide">
                        % que no aprueba · {{ recentYears }} cursos
                    </span>
                </div>

                <div class="panel">
                    <UiMeterRow
                        v-for="subject in troncales"
                        :key="subject.code"
                        :label="subject.name"
                        :value="subject.noSuperacion"
                        :label-width="labelWidth"
                    />
                </div>
            </section>

            <section v-if="difficultyHistory.length > 1" class="section">
                <div class="sectionHead">
                    <h2>Dificultad del curso</h2>
                    <span class="num sectionMeta onlyWide">
                        {{ difficultyHistory[0].year }} –
                        {{
                            difficultyHistory[difficultyHistory.length - 1].year
                        }}
                    </span>
                </div>

                <div class="panel">
                    <LineChart
                        :series="historyChart.series"
                        :labels="historyChart.labels"
                        :colors="HISTORY_COLORS"
                        :desktop-width="470"
                        :desktop-height="190"
                        :y-min="0"
                        :format-value="value => `${Math.round(value)}%`"
                    />
                    <p class="chartNote">
                        % que no supera las troncales de {{ ordinal(number) }},
                        media ponderada de cada curso académico.
                    </p>

                    <p v-if="historyNote" class="takeaway onlyWide">
                        {{ name }} se ha
                        {{ historyNote.easier ? "suavizado" : "endurecido" }}:
                        no superaba el
                        <strong>{{ historyNote.first }}</strong> en
                        {{ historyNote.firstYear }} y el
                        <strong>{{ historyNote.last }}</strong> en
                        {{ historyNote.lastYear }}.
                    </p>
                </div>
            </section>
        </div>

        <section class="section">
            <UiSectionHeader
                label="Troncales"
                :count="troncales.length"
                variant="band"
                :hint="ORDER_HINT"
                class="bandHead"
            />

            <div class="cards" :class="{ collapsed: !showAllCore }">
                <!-- Props explícitas: v-bind del objeto entero cuela campos
                 sueltos como atributos del <a>. Ver la nota en Optatives.vue. -->
                <UiSubjectCard
                    v-for="subject in troncales"
                    :key="subject.code"
                    :code="subject.code"
                    :name="subject.name"
                    :no-superacion="subject.noSuperacion"
                    :rendimiento="subject.rendimiento"
                    :no-presentados="subject.noPresentados"
                    :enrolment="subject.enrolment"
                    :small-cohort="subject.smallCohort"
                />

                <button
                    v-if="troncales.length > PREVIEW"
                    type="button"
                    class="more moreCard"
                    @click="showAllCore = !showAllCore"
                >
                    {{
                        showAllCore
                            ? "− ver menos"
                            : `＋ ${troncales.length - PREVIEW} troncales más`
                    }}
                </button>
            </div>
        </section>

        <section v-if="optativas.length" class="section">
            <UiSectionHeader
                :label="poolOptatives ? 'Optativas' : 'Optativas especiales'"
                :count="optativas.length"
                tone="gold"
                variant="band"
                :hint="
                    poolOptatives
                        ? ORDER_HINT
                        : 'se cursan fuera de la bolsa de optativas de 3º y 4º'
                "
                class="bandHead"
            />

            <!-- En 1º las optativas son las especiales (Biología, Geología,
             Grafos), que no están en la bolsa: enlazar ahí a una lista donde
             no aparecen solo despistaría. -->
            <p class="note">
                <template v-if="alsoInCourses.length">
                    Muchas se ofertan también en
                    {{ alsoInCourses.map(ordinal).join(" y ") }}.
                </template>
                <!-- En escritorio esto ya lo dice la pista de la cabecera. -->
                <span v-if="!poolOptatives" class="hideWide">
                    Optativas especiales de primero: se cursan fuera de la bolsa
                    de optativas de 3º y 4º.
                </span>
                <RouterLink v-else to="/optativas"
                    >Ver todas las optativas →</RouterLink
                >
            </p>

            <div class="cards" :class="{ collapsed: !showAllOptional }">
                <UiSubjectCard
                    v-for="subject in optativas"
                    :key="subject.code"
                    :code="subject.code"
                    :name="subject.name"
                    :no-superacion="subject.noSuperacion"
                    :rendimiento="subject.rendimiento"
                    :no-presentados="subject.noPresentados"
                    :enrolment="subject.enrolment"
                    :small-cohort="subject.smallCohort"
                    optative
                />

                <button
                    v-if="optativas.length > PREVIEW"
                    type="button"
                    class="more moreCard"
                    @click="showAllOptional = !showAllOptional"
                >
                    {{
                        showAllOptional
                            ? "− ver menos"
                            : `＋ ${optativas.length - PREVIEW} optativas más`
                    }}
                </button>
            </div>
        </section>
    </div>

    <div v-else class="screen">
        <UiCallout tone="structural" title="Ese curso no existe">
            El grado tiene cuatro cursos.
            <RouterLink to="/grado">Volver al mapa del grado →</RouterLink>
        </UiCallout>
    </div>
</template>

<style scoped>
.screen {
    padding: 16px var(--gutter) 8px;
}

.lead {
    margin: 0 0 14px;

    font-size: var(--text-body-sm);

    color: var(--ink-soft);
}

.stats {
    display: flex;

    flex-wrap: wrap;

    gap: 22px;
}

.footnote {
    margin: 12px 0 0;

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.5;

    color: var(--ink-soft);
}

.section {
    margin-top: 18px;
}

h2 {
    margin: 0 0 11px;

    font-family: var(--font-serif);

    font-size: var(--text-section);

    font-weight: 600;
}

.panel {
    display: flex;

    flex-direction: column;

    gap: 9px;

    padding: 14px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: 12px;

    box-shadow: var(--shadow-card);
}

.chartNote {
    margin: 2px 0 0;

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.5;

    color: var(--ink-soft);
}

.note {
    margin: 6px 0 10px;

    font-size: var(--text-num-sm);

    line-height: 1.5;

    color: var(--ink-soft);
}

.note a {
    font-weight: 600;
}

.cards {
    display: flex;

    flex-direction: column;

    gap: 9px;

    margin-top: 10px;
}

.more {
    display: flex;

    align-items: center;

    min-height: var(--touch-target);

    padding: 2px;

    border: none;

    background: none;

    font-family: var(--font-mono);

    font-size: 10px;

    color: var(--ink-soft);

    cursor: pointer;
}

.more:active {
    color: var(--navy);
}

/* Solo en escritorio ---------------------------------------------------- */

.onlyWide {
    display: none;
}

/* El recorte del móvil: PREVIEW + 1. Si allí cambia, aquí también. */
.cards.collapsed > *:nth-child(n + 4):not(.moreCard) {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * La tira de cinco cifras abre la pantalla, y debajo las dos lecturas de la
 * dificultad —asignatura a asignatura y curso a curso— se leen a la vez en
 * lugar de a dos pantallazos de distancia.
 */

@media (min-width: 900px) {
    .screen {
        padding: 22px var(--gutter) 34px;
    }

    .lead {
        max-width: 720px;

        margin-bottom: 18px;

        font-size: var(--text-body);

        line-height: 1.55;

        color: var(--ink-muted);
    }

    .lead .onlyWide {
        display: inline;
    }

    /* Las cifras dejan de ser una fila suelta y pasan a ser una tira, con su
       filete entre cada dos: a este ancho, veintidós píxeles de hueco no
       separan nada. */
    .stats {
        flex-wrap: nowrap;

        align-items: stretch;

        gap: 0;

        padding: 18px 0;

        border-top: 1px solid var(--line-strong);

        border-bottom: 1px solid var(--line-strong);
    }

    .stats > * {
        flex: 1;

        min-width: 0;

        padding: 0 28px;

        border-left: 1px solid var(--line-rule);
    }

    .stats > *:first-child {
        padding-left: 0;

        border-left: none;
    }

    .stats > *:last-child {
        padding-right: 0;
    }

    .onlyWide {
        display: block;
    }

    .footnote {
        margin-top: 10px;

        font-size: var(--text-num-sm);
    }

    .pair {
        display: grid;

        grid-template-columns: minmax(0, 1fr);

        gap: 16px;

        margin-top: 22px;

        align-items: start;
    }

    .pair .section {
        margin-top: 0;
    }

    .section {
        margin-top: 30px;
    }

    .sectionHead {
        display: flex;

        align-items: baseline;

        justify-content: space-between;

        gap: 12px;
    }

    h2 {
        margin: 0;

        font-size: 18px;
    }

    .sectionMeta {
        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    .panel {
        gap: 11px;

        margin-top: 16px;

        padding: 17px 18px 15px;

        border-radius: var(--radius-card-lg);

        /* Los nombres de las troncales no caben en los 118px del móvil. */
        --meter-label-width: 186px;
    }

    /* Deja de ser una nota al pie en mono y pasa a ser la entradilla de la
       gráfica: va antes que ella y en la tipografía del cuerpo. */
    .chartNote {
        margin-top: 4px;

        font-family: var(--font-sans);

        font-size: var(--text-body);

        color: var(--ink-soft);
    }

    /* El orden importa: el pie metodológico va pegado al título de la gráfica
       y la lectura, debajo de ella. */
    .pair .panel {
        display: flex;

        flex-direction: column;
    }

    .pair .panel .chartNote {
        order: -1;

        margin: 0 0 4px;
    }

    .takeaway {
        margin: 12px 0 0;

        padding-top: 12px;

        border-top: 1px solid var(--line-inner);

        font-size: var(--text-body);

        line-height: 1.5;

        color: var(--ink-muted);
    }

    .takeaway strong {
        color: var(--ink);
    }

    .bandHead {
        margin-bottom: 14px;
    }

    .note {
        margin: 0 0 14px;

        font-size: var(--text-body-sm);
    }

    .cards {
        display: grid;

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 12px;

        margin-top: 0;
    }

    /* Aquí caben todas: el "＋ N más" es del móvil. */
    .cards.collapsed > *:nth-child(n + 4):not(.moreCard) {
        display: block;
    }

    .moreCard,
    .hideWide {
        display: none;
    }

    /* Los botones de curso de la banda de título. */
    .switcher {
        display: flex;

        align-items: center;

        gap: 8px;
    }

    .switchLabel {
        margin-right: 8px;

        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    .courseButton {
        display: inline-flex;

        align-items: center;

        justify-content: center;

        min-width: 38px;

        min-height: 38px;

        border: 1px solid var(--navy-line-soft);

        border-radius: var(--radius-control);

        background: var(--surface);

        font-size: 12px;

        color: var(--navy);
    }

    .courseButton:hover {
        border-color: var(--navy);
    }

    .courseButton.current {
        background: var(--navy);

        border-color: var(--navy);

        color: var(--ink-on-navy);
    }
}

/* La rejilla del diseño: las dos lecturas de la dificultad, lado a lado. */
@media (min-width: 1200px) {
    .pair {
        grid-template-columns: minmax(0, 1fr) 520px;
    }

    .cards {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
</style>
