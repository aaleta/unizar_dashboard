<script setup>

/**
 * Ficha de asignatura: el final del camino mapa → curso → asignatura.
 *
 * Es la pantalla con más datos de la web, así que el orden importa más que en
 * ninguna otra. De arriba abajo responde a preguntas cada vez más finas:
 *
 *   ¿qué es esto y debería preocuparme?   tags + título + veredicto
 *   ¿cuánto cuesta, en números?           los seis indicadores
 *   ¿cómo se reparten las notas?          la barra apilada
 *   ¿siempre ha sido así?                 la serie curso a curso
 *   ¿es rara o es normal aquí?            frente a la media del curso
 *   ¿quién la da y dónde está la guía?    profesorado
 *
 * El selector de año cambia los indicadores y la distribución. La serie no,
 * porque es precisamente la vista de todos los años a la vez.
 */

import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useSubject } from "@/composables/useSubject";
import { usePageHeader } from "@/composables/usePageHeader";
import { subjectName } from "@/utils/metrics";
import { gradeColor } from "@/theme/gradePalette";
import { readableInk } from "@/theme/contrast";

import LineChart from "@/components/charts/LineChart.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiKpiCard from "@/components/ui/UiKpiCard.vue";
import UiMeterRow from "@/components/ui/UiMeterRow.vue";
import UiPill from "@/components/ui/UiPill.vue";

const route = useRoute();

/** Año elegido en el selector. Vacío = el más reciente con datos. */
const selectedYear = ref("");

const subject = useSubject(
    () => route.params.code,
    () => selectedYear.value
);

const {
    code,
    exists,
    name,
    info,
    course,
    courseName,
    years,
    year,
    enrolled,
    smallCohort,
    averageEnrolment,
    kpis,
    sittings,
    grades,
    history,
    ranking,
    courseAverage,
    teaching,
    recentYears
} = subject;

// Al saltar de una asignatura a otra, el año elegido puede no existir en la
// nueva. Se suelta y manda otra vez el más reciente.
watch(code, () => {
    selectedYear.value = "";
});

usePageHeader(() => ({
    header: "inner",
    eyebrow: courseName.value
        ? `El Grado · ${courseName.value}`
        : "El Grado",
    title: "Ficha de asignatura",
    back: course.value ? `/grado/${course.value}` : "/grado"
}));

const pct = (value, decimals = 0) =>
    value === null || value === undefined
        ? "—"
        : `${value.toFixed(decimals)}%`;

const isOptative = computed(() => info.value?.tipo === "optativa");

/** Con quién se alterna, si es una optativa de oferta bienal. */
const alternatesWith = computed(() => {

    const partner = info.value?.seAlternaCon;

    return partner
        ? { code: partner, name: subjectName(partner) }
        : null;

});

/** El indicador que encabeza la ficha: cuánta gente no la supera. */
const headline = computed(() =>
    kpis.value.find(kpi => kpi.key === "noSuperacion")?.value ?? null
);

/**
 * El veredicto solo aparece cuando hay algo que decir. Una troncal en mitad
 * de la tabla no necesita banner, y ponerlo igualmente convertiría un aviso en
 * decoración.
 */
const verdict = computed(() => {

    if (!ranking.value || ranking.value.position > 3) return null;

    const { position, total } = ranking.value;

    const ordinal = position === 1 ? "1ª" : `${position}ª`;

    return {
        title: position === 1
            ? `La troncal más dura de ${courseName.value?.toLowerCase()}`
            : `Entre las troncales más duras de ${courseName.value?.toLowerCase()}`,
        detail: `${ordinal} de ${total} troncales de ${course.value}º por no superación.`
    };

});

const shortYear = academicYear =>
    academicYear
        .split("-")
        .map(part => part.slice(-2))
        .join("-");

/**
 * La serie histórica como línea: la pregunta es "¿sube o baja?", y una línea
 * enseña la pendiente de un vistazo donde doce barras piden compararse una a
 * una. Un solo óxido fijo, porque una línea no puede subir por la rampa tramo
 * a tramo sin fragmentarse.
 */
const historyChart = computed(() => ({
    labels: history.value.map(point => shortYear(point.year)),
    series: [{
        label: "Suspensos + No presentados",
        values: history.value.map(point => point.value)
    }]
}));

const HISTORY_COLORS = ["var(--chart-line-difficulty)"];

const historyNote = computed(() => {

    if (history.value.length < 2) return null;

    const first = history.value[0];
    const last = history.value[history.value.length - 1];

    return `En ${first.year} no superaba el ${Math.round(first.value)}%; `
        + `en ${last.year}, el ${Math.round(last.value)}%.`;

});

/** Total sobre el que se reparten las notas, para los porcentajes de la barra. */
const gradeTotal = computed(() =>
    grades.value.reduce((sum, slice) => sum + slice.count, 0)
);

const comparison = computed(() => {

    if (!courseAverage.value || courseAverage.value.rendimiento === null) {
        return null;
    }

    const mine = kpis.value.find(kpi => kpi.key === "rendimiento")?.value;

    if (mine === null || mine === undefined) return null;

    const gap = mine - courseAverage.value.rendimiento;

    return {
        mine,
        average: courseAverage.value.rendimiento,
        gap,
        // Menos de 3 pp entre una asignatura y su curso es ruido, no una
        // diferencia que merezca una frase.
        meaningful: Math.abs(gap) >= 3
    };

});

</script>

<template>

<div
    v-if="exists"
    class="screen"
>

    <!-- Identidad ------------------------------------------------------ -->
    <header class="intro">

        <div class="tags">
            <UiPill>{{ isOptative ? "Optativa" : "Troncal" }}</UiPill>
            <UiPill v-if="info">
                {{ info.courses.map(c => `${c}º`).join(" y ") }} curso
            </UiPill>
            <UiPill tone="neutral">Cód. {{ code }}</UiPill>
        </div>

        <h1>{{ name }}</h1>

        <UiCallout
            v-if="verdict"
            tone="hard"
            :title="verdict.title"
            class="verdict"
        >
            {{ verdict.detail }}
        </UiCallout>

        <UiCallout
            v-if="smallCohort"
            tone="attention"
            class="verdict"
        >
            Solo {{ enrolled }} matriculados en {{ year }}: los porcentajes
            bailan mucho. Mejor mirar los recuentos absolutos.
        </UiCallout>

        <UiCallout
            v-if="alternatesWith"
            tone="structural"
            class="verdict"
        >
            No se oferta todos los cursos: se alterna año a año con
            <RouterLink :to="`/asignatura/${alternatesWith.code}`">{{
                alternatesWith.name
            }}</RouterLink>.
        </UiCallout>

    </header>

    <!-- Indicadores ---------------------------------------------------- -->
    <section class="section">

        <div class="sectionHead">

            <span class="eyebrow">Indicadores</span>

            <label class="yearPicker">
                <span class="visuallyHidden">Curso académico</span>
                <!-- Enlazado al año EFECTIVO, no al elegido a mano: mientras
                     no se toca, `selectedYear` está vacío y un v-model directo
                     dejaría el desplegable en blanco. -->
                <select
                    :value="year"
                    @change="selectedYear = $event.target.value"
                >
                    <option
                        v-for="option in [...years].reverse()"
                        :key="option"
                        :value="option"
                    >
                        {{ option }}
                    </option>
                </select>
            </label>

        </div>

        <div class="kpis">

            <UiKpiCard
                v-for="kpi in kpis"
                :key="kpi.key"
                :label="kpi.label"
                :value="pct(kpi.value)"
                :delta="kpi.delta"
                :higher-is-better="kpi.higherIsBetter"
                :tone="kpi.ramp ? 'difficulty' : 'ink'"
                :difficulty-value="kpi.value"
                :reference="kpi.hasReference
                    ? `vs. media de ${recentYears} cursos`
                    : 'sin cursos anteriores'"
            />

            <UiKpiCard
                label="Convocatorias"
                :value="sittings.value === null
                    ? '—'
                    : sittings.value.toFixed(2).replace('.', ',')"
                :delta="null"
                :reference="sittings.value === null
                    ? 'sin dato oficial'
                    : (sittings.exact ? 'dato oficial' : `dato oficial de ${sittings.year}`)"
            />

            <UiKpiCard
                label="Matriculados"
                :value="String(enrolled)"
                :delta="null"
                :reference="`media ${recentYears} cursos: ${Math.round(averageEnrolment)}`"
            />

        </div>

    </section>

    <!-- Distribución de calificaciones --------------------------------- -->
    <section
        v-if="gradeTotal"
        class="section"
    >

        <h2>Distribución de calificaciones</h2>

        <p class="lead">{{ enrolled }} matriculados · curso {{ year }}</p>

        <div class="stack">
            <div
                v-for="slice in grades"
                :key="slice.key"
                class="slice"
                :style="{
                    width: `${(slice.count / gradeTotal) * 100}%`,
                    background: gradeColor(slice.key)
                }"
                :title="`${slice.label}: ${slice.count}`"
            >
                <span
                    v-if="slice.count / gradeTotal > 0.12 && readableInk(gradeColor(slice.key))"
                    class="sliceValue num"
                    :style="{ color: readableInk(gradeColor(slice.key)) }"
                >{{ slice.count }}</span>
            </div>
        </div>

        <div class="legend">
            <div
                v-for="slice in grades"
                :key="slice.key"
                class="legendItem"
            >
                <span
                    class="swatch"
                    :style="{ background: gradeColor(slice.key) }"
                ></span>
                <span class="legendLabel">{{ slice.label }}</span>
                <span class="num legendCount">{{ slice.count }}</span>
            </div>
        </div>

    </section>

    <!-- Frente al curso ------------------------------------------------ -->
    <!-- Antes que la serie histórica: esta comparación depende del año
         elegido arriba y la serie no, así que lo que cambia con el selector
         queda junto a él. -->
    <section
        v-if="comparison"
        class="section"
    >

        <h2>Frente a las troncales de {{ course }}º</h2>

        <div class="panel">

            <UiMeterRow
                :label="name"
                :value="comparison.mine"
                :difficulty-value="headline"
                :label-width="88"
            />

            <UiMeterRow
                :label="`Media de ${course}º`"
                :value="comparison.average"
                tone="neutral"
                :label-width="88"
                muted
            />

            <p class="takeaway">
                <template v-if="comparison.meaningful">
                    Aprueban {{ Math.abs(Math.round(comparison.gap)) }} pp
                    {{ comparison.gap < 0 ? "menos" : "más" }}
                    que la media del curso.
                </template>
                <template v-else>
                    Aprueban prácticamente lo mismo que la media del curso.
                </template>
                <template v-if="ranking && ranking.position === 1">
                    Es la troncal de {{ course }}º con
                    <strong>más no superación</strong>.
                </template>
            </p>

        </div>

    </section>

    <!-- Serie histórica ------------------------------------------------ -->
    <section
        v-if="history.length > 1"
        class="section"
    >

        <h2>Evolución de no aprobados</h2>

        <p
            v-if="historyNote"
            class="lead"
        >
            {{ historyNote }}
        </p>

        <LineChart
            :series="historyChart.series"
            :labels="historyChart.labels"
            :colors="HISTORY_COLORS"
            :y-min="0"
            :format-value="value => `${Math.round(value)}%`"
        />

    </section>

    <!-- Profesorado ---------------------------------------------------- -->
    <section
        v-if="teaching"
        class="section"
    >

        <div class="sectionHead">
            <h2>Profesorado y guía</h2>
            <span class="num teachingYear">{{ teaching.anyo_academico }}</span>
        </div>

        <ul class="teachers">
            <li
                v-for="person in teaching.profesores"
                :key="person"
            >
                <span
                    class="teacherDot"
                    aria-hidden="true"
                ></span>
                {{ person }}
            </li>
        </ul>

        <div class="actions">
            <a
                v-if="teaching.guia_docente_web"
                class="button primary"
                :href="teaching.guia_docente_web"
                target="_blank"
                rel="noopener noreferrer"
            >
                Ver guía docente →
            </a>
            <a
                v-if="teaching.guia_docente_pdf"
                class="button"
                :href="teaching.guia_docente_pdf"
                target="_blank"
                rel="noopener noreferrer"
            >
                PDF
            </a>
        </div>

    </section>

</div>

<div
    v-else
    class="screen"
>
    <UiCallout
        tone="structural"
        title="No hay datos de esa asignatura"
    >
        El código {{ code }} no está en el catálogo del grado.
        <RouterLink to="/asignaturas">Ver todas las asignaturas →</RouterLink>
    </UiCallout>
</div>

</template>

<style scoped>

.screen{

    padding:15px var(--gutter) 10px;

}

/* Identidad ---------------------------------------------------------- */

.tags{

    display:flex;

    flex-wrap:wrap;

    gap:6px;

    margin-bottom:9px;

}

h1{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-h1-lg);

    font-weight:700;

    line-height:var(--leading-tight);

}

.verdict{

    margin-top:11px;

}

/* Secciones ---------------------------------------------------------- */

.section{

    margin-top:var(--gap-section);

}

.sectionHead{

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:10px;

    margin-bottom:9px;

}

h2{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

}

.section > h2{

    margin-bottom:4px;

}

.lead{

    margin:0 0 11px;

    font-size:var(--text-caption);

    color:var(--ink-soft);

}

.panel{

    padding:14px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    box-shadow:var(--shadow-card);

}

.panel > * + *{

    margin-top:10px;

}

/* Selector de año ----------------------------------------------------- */

.yearPicker select{

    /* Un <select> nativo y no un menú propio: se abre con el selector del
       sistema, funciona con teclado y con lector de pantalla sin escribir
       una línea, y en el móvil sale la rueda a la que la gente está hecha. */
    min-height:var(--touch-target);

    padding:4px 9px;

    border:1px solid var(--navy-line-soft);

    border-radius:var(--radius-control);

    background:var(--surface);

    color:var(--navy);

    font-family:var(--font-sans);

    font-size:var(--text-num-sm);

}

/* Indicadores --------------------------------------------------------- */

.kpis{

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:var(--gap-card);

}

/* Distribución -------------------------------------------------------- */

.stack{

    display:flex;

    height:34px;

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    overflow:hidden;

}

.slice{

    display:flex;

    align-items:center;

    justify-content:center;

    min-width:2px;

}

.sliceValue{

    font-size:var(--text-num-sm);

}

.legend{

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:6px 14px;

    margin-top:12px;

}

.legendItem{

    display:flex;

    align-items:center;

    gap:7px;

    font-size:var(--text-body-xs);

    color:var(--ink-2);

}

.swatch{

    width:8px;

    height:8px;

    flex:none;

    border-radius:var(--radius-xs);

}

.legendLabel{

    flex:1;

    min-width:0;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

}

.legendCount{

    font-weight:500;

    color:var(--ink-soft);

}

.takeaway{

    margin:0;

    padding-top:11px;

    border-top:1px solid var(--line-inner);

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

.takeaway strong{

    color:var(--warn-title);

}

/* Profesorado --------------------------------------------------------- */

.teachingYear{

    font-size:var(--text-eyebrow);

    font-weight:400;

    color:var(--ink-faint);

}

.teachers{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0 0 13px;

    padding:0;

    list-style:none;

}

.teachers li{

    display:flex;

    align-items:center;

    gap:9px;

    font-size:var(--text-body);

}

.teacherDot{

    width:6px;

    height:6px;

    flex:none;

    border-radius:var(--radius-dot);

    background:var(--navy);

}

.actions{

    display:flex;

    flex-wrap:wrap;

    gap:10px;

}

.button{

    display:inline-flex;

    align-items:center;

    min-height:var(--touch-target);

    padding:9px 14px;

    border:1px solid var(--navy-line-soft);

    border-radius:var(--radius-control);

    background:var(--surface);

    color:var(--navy);

    font-size:var(--text-body-sm);

    font-weight:600;

}

.button.primary{

    background:var(--navy);

    border-color:var(--navy);

    color:var(--ink-on-navy);

}

.visuallyHidden{

    position:absolute;

    width:1px;

    height:1px;

    overflow:hidden;

    clip-path:inset(50%);

    white-space:nowrap;

}

</style>
