<script setup>

/**
 * Portada. Abre con números, no con gráficas.
 *
 * Cuatro escalares dicen si el grado va bien antes de que nadie interprete un
 * eje; las gráficas vienen después, para quien quiera el porqué. El orden es
 * deliberado: cifras → cómo se entra → dónde duele → si mejora con los años →
 * de cuándo son los datos.
 *
 * La última sección es la que hace honesta a toda la web: cada fuente se
 * actualiza por su cuenta y decir "datos de 2024-2025" para las cuatro sería
 * mentira en tres de ellas.
 */

import { computed } from "vue";

import { useDegree } from "@/composables/useDegree";
import { DATA_SOURCES } from "@/utils/dataSources";
import { difficultyInk } from "@/theme/difficulty";
import { courseRate } from "@/utils/metrics";

import LineChart from "@/components/charts/LineChart.vue";
import UiKpiCard from "@/components/ui/UiKpiCard.vue";
import UiMeterRow from "@/components/ui/UiMeterRow.vue";

const {
    cutoff,
    rates,
    sittings,
    sittingsYear,
    admission,
    hardest,
    recentYears
} = useDegree();

/**
 * La dificultad estimada de cada curso: el % que no supera sus troncales.
 * Es la adaptación del panel de escritorio que comparaba los cuatro cursos,
 * y responde antes que ninguna serie temporal a la pregunta del visitante
 * nuevo: ¿dónde está lo gordo?
 */
const yearDifficulty = ["1", "2", "3", "4"].map(course => ({
    label: `${course}º`,
    course,
    value: courseRate(course, "noSuperacion")
}));

const hardestYear = yearDifficulty.reduce(
    (worst, year) => (year.value > worst.value ? year : worst)
).course;

/** Coma decimal: es una web en español y las notas se escriben con coma. */
const decimal = (value, digits = 2) =>
    value === null || value === undefined
        ? "—"
        : value.toFixed(digits).replace(".", ",");

const pct = value =>
    value === null ? "—" : `${Math.round(value)}%`;

const chart = computed(() => ({
    labels: admission.map(row => String(row.anyo).slice(-2)),
    series: [
        {
            label: "Nota media",
            values: admission.map(row => row.nota_media_admision)
        },
        {
            label: "Nota de corte",
            values: admission.map(row => row.nota_corte)
        }
    ]
}));

const CHART_COLORS = ["var(--chart-line-1)", "var(--chart-line-2)"];

/**
 * La frase de la gráfica. Se construye con los datos en vez de escribirse,
 * porque una nota de corte que baja este año puede subir el siguiente y la
 * frase quedaría al revés.
 */
const admissionNote = computed(() => {

    if (!cutoff.value || cutoff.value.delta === null) return null;

    const direction = cutoff.value.delta < 0 ? "bajó" : "subió";

    const lowest = Math.min(...admission.map(row => row.nota_corte));

    const isLowestInYears = cutoff.value.value === lowest;

    return {
        direction,
        amount: decimal(Math.abs(cutoff.value.delta)),
        value: decimal(cutoff.value.value, 3),
        year: cutoff.value.year,
        isLowestInYears
    };

});

</script>

<template>

<div class="screen">

    <!-- Héroe: continúa la banda de tinta de la cabecera ---------------- -->
    <section class="hero fullBleed">

        <div class="motif" aria-hidden="true">
            <span class="ring big"></span>
            <span class="ring small"></span>
        </div>

        <div class="heroInner">
            <h1>Estadísticas del<br>Grado en Física</h1>
            <p>
                Calculadas a partir de la información oficial que publica la
                propia Universidad de Zaragoza.
            </p>
        </div>

    </section>

    <div class="body">

        <!-- Cuatro cifras -------------------------------------------- -->
        <section class="kpis">

            <UiKpiCard
                label="Nota de corte"
                :value="decimal(cutoff?.value, 3)"
                :delta="cutoff?.delta ?? null"
                delta-unit=""
                :delta-threshold="0.05"
                :reference="cutoff?.previousYear ? `vs. ${cutoff.previousYear}` : null"
            />

            <UiKpiCard
                v-for="rate in rates"
                :key="rate.key"
                :label="rate.label"
                :value="pct(rate.value)"
                :delta="rate.delta"
                :higher-is-better="rate.higherIsBetter"
                :reference="`vs. los ${recentYears} cursos anteriores`"
            />

            <UiKpiCard
                label="Convocatorias"
                :value="decimal(sittings)"
                :delta="null"
                :reference="`media por troncal · ${sittingsYear ?? 'dato oficial'}`"
            />

        </section>

        <!-- Notas de acceso ------------------------------------------ -->
        <section class="panel">

            <div class="panelHead">
                <h2>Notas de acceso</h2>
                <span class="num range">
                    {{ admission[0].anyo }} – {{ admission[admission.length - 1].anyo }}
                </span>
            </div>

            <LineChart
                :labels="chart.labels"
                :series="chart.series"
                :colors="CHART_COLORS"
                :format-value="value => decimal(value, 1)"
            />

            <p
                v-if="admissionNote"
                class="takeaway"
            >
                La nota de corte {{ admissionNote.direction }} a
                <strong>{{ admissionNote.value }}</strong>
                en {{ admissionNote.year }}<template v-if="admissionNote.isLowestInYears">
                    — la más baja de toda la serie</template>.
            </p>

        </section>

        <!-- La más dura ---------------------------------------------- -->
        <RouterLink
            v-if="hardest"
            :to="`/asignatura/${hardest.code}`"
            class="hardest"
        >

            <div class="hardestValue">
                <span
                    class="num"
                    :style="{ color: difficultyInk(hardest.value) }"
                >{{ pct(hardest.value) }}</span>
                <span class="hardestCaption">no superan</span>
            </div>

            <div class="hardestBody">
                <span class="eyebrow hardestEyebrow">La más dura ahora mismo</span>
                <span class="hardestName">{{ hardest.name }}</span>
                <span class="hardestMeta">
                    Troncal de {{ hardest.course }}º ·
                    media de {{ recentYears }} cursos.
                    <span class="hardestGo">Ver ficha →</span>
                </span>
            </div>

        </RouterLink>

        <!-- Dificultad por curso -------------------------------------- -->
        <section class="panel">

            <h2>¿Qué curso cuesta más?</h2>

            <p class="lead">
                % que no supera las troncales de cada curso, de media.
            </p>

            <div class="yearBars">
                <UiMeterRow
                    v-for="year in yearDifficulty"
                    :key="year.label"
                    :label="year.label"
                    :value="year.value"
                    :label-width="26"
                />
            </div>

            <p class="yearNote">
                Media ponderada de los últimos {{ recentYears }} cursos.
                <RouterLink :to="`/grado/${hardestYear}`">
                    Ver {{ hardestYear }}º →
                </RouterLink>
            </p>

        </section>

        <!-- Frescura ------------------------------------------------- -->
        <section class="freshness">

            <p class="eyebrow">Actualización de los datos</p>

            <ul class="sources">
                <li
                    v-for="source in DATA_SOURCES"
                    :key="source.key"
                >
                    <span class="sourceLabel">{{ source.label }}</span>
                    <span class="num sourceYear">{{ source.ultimo_curso }}</span>
                </li>
            </ul>

            <p class="methodology">
                <RouterLink to="/metodologia">
                    Cómo se calcula cada indicador →
                </RouterLink>
            </p>

        </section>

    </div>

</div>

</template>

<style scoped>

/* Héroe --------------------------------------------------------------- */

.hero{

    position:relative;

    overflow:hidden;

    background:var(--carbon);

    padding-top:6px;

    padding-bottom:22px;

    /* Sube 1px para que no se vea costura con la cabecera. */
    margin-top:-1px;

    /* Cierra el bloque de tinta contra el papel con la misma regla roja que lo
       abre bajo la cabecera. Entre las dos, la portada es una banda cerrada. */
    border-bottom:3px solid var(--accent);

}

.heroInner{

    position:relative;

    max-width:var(--content-max);

    margin:0 auto;

    /* El mismo margen lateral que el contenido: la banda llega al borde,
       pero el texto no. */
    padding-inline:var(--gutter);

}

/* Marcas de registro: decoración, no dato. Dos cuadros concéntricos girados
   45°, como las cruces de registro que llevan las planchas de imprenta en la
   esquina del pliego. En rojo tenue porque el rojo es justo lo que aquí no
   está midiendo nada. */
.motif{

    position:absolute;

    inset:0;

    pointer-events:none;

}

.ring{

    position:absolute;

    border:var(--rule-strong) solid var(--accent);

    opacity:.45;

    transform:rotate(45deg);

}

.ring.big{

    right:-30px;

    top:-34px;

    width:118px;

    height:118px;

}

.ring.small{

    right:2px;

    top:-2px;

    width:70px;

    height:70px;

    opacity:.25;

}

/* El titular de portada es el elemento más grande de toda la web y no compite
   con nada: cruza la pantalla de lado a lado, en mayúsculas y apretado hasta
   que las letras forman un bloque. Toda la jerarquía tipográfica se mide
   contra esto. */
h1{

    margin:18px 0 10px;

    font-family:var(--font-display);

    font-size:var(--text-h1-lg);

    font-weight:900;

    letter-spacing:var(--track-display-tight);

    text-transform:uppercase;

    line-height:.92;

    color:var(--on-carbon);

}

.hero p{

    margin:0;

    max-width:300px;

    padding-top:9px;

    border-top:var(--rule) solid var(--carbon-faint);

    font-family:var(--font-mono);

    font-size:10.5px;

    line-height:1.6;

    color:var(--on-carbon-soft);

}

/* Cuerpo -------------------------------------------------------------- */

.body{

    padding:16px var(--gutter) 8px;

}

.kpis{

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:var(--gap-card);

}

.panel{

    margin-top:var(--gap-section);

    padding:14px 14px 12px;

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

    border-radius:var(--radius-card-lg);

    box-shadow:var(--shadow-card);

}

.panelHead{

    display:flex;

    align-items:baseline;

    justify-content:space-between;

    gap:10px;

    padding-bottom:7px;

    border-bottom:var(--rule-strong) solid var(--line);

}

h2{

    margin:0;

    font-family:var(--font-display);

    font-size:var(--text-section);

    font-weight:900;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1;

}

.range{

    font-size:var(--text-footnote);

    font-weight:600;

    letter-spacing:.06em;

    color:var(--ink-faint);

}

.lead{

    margin:7px 0 13px;

    font-size:10.5px;

    line-height:1.45;

    color:var(--ink-soft);

}

.takeaway{

    margin:10px 0 0;

    padding-top:10px;

    border-top:var(--rule) solid var(--line-inner);

    font-size:10.5px;

    line-height:1.45;

    color:var(--ink-muted);

}

.takeaway strong{

    color:var(--ink);

}

/* La más dura --------------------------------------------------------- */

/* El único aviso con peso de la portada. Va marcado con la trama diagonal de
   seguridad en el canto izquierdo: es la señal que en cualquier manual
   industrial significa "esto de aquí es lo que hay que mirar". */
.hardest{

    text-decoration:none;

    display:flex;

    gap:12px;

    margin-top:var(--gap-section);

    padding:13px 14px 13px 12px;

    background:var(--warn-bg);

    border:var(--rule-strong) solid var(--warn-line);

    border-left-width:0;

    border-radius:var(--radius-card-lg);

    background-image:var(--hazard-stripes);

    background-size:8px 100%;

    background-repeat:repeat-y;

    color:var(--ink);

}

.hardestValue{

    flex:none;

    width:46px;

    margin-left:8px;

    text-align:center;

}

.hardestValue .num{

    font-size:26px;

    letter-spacing:-.04em;

    line-height:1;

}

.hardestCaption{

    display:block;

    margin-top:4px;

    font-family:var(--font-mono);

    font-size:8px;

    letter-spacing:.08em;

    text-transform:uppercase;

    line-height:1.2;

    color:var(--warn-caption);

}

.hardestBody{

    display:flex;

    flex-direction:column;

    padding-left:12px;

    border-left:var(--rule) solid var(--warn-line);

}

.hardestEyebrow{

    font-size:8px;

    letter-spacing:var(--track-label-wide);

    color:var(--delta-bad);

}

.hardestName{

    margin-top:3px;

    font-family:var(--font-display);

    font-size:17px;

    font-weight:800;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1;

}

.hardestMeta{

    margin-top:3px;

    font-size:10.5px;

    line-height:1.4;

    color:var(--warn-body);

}

.hardestGo{

    margin-top:5px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--warn-title);

}

/* Dificultad por curso ------------------------------------------------- */

.yearBars{

    display:flex;

    flex-direction:column;

    gap:8px;

}

.yearNote{

    margin:10px 0 0;

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    color:var(--ink-faint);

}

.yearNote a{

    color:var(--accent-ink);

    font-weight:600;

}

/* Frescura ------------------------------------------------------------ */

.freshness{

    margin-top:var(--gap-section);

}

.freshness .eyebrow{

    margin:0 0 8px;

    font-size:var(--text-footnote);

}

.sources{

    margin:0;

    padding:0;

    list-style:none;

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

    border-radius:var(--radius-card);

    overflow:hidden;

}

.sources li{

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:10px;

    padding:9px 13px;

}

.sources li + li{

    border-top:var(--rule) solid var(--line-inner);

}

.sourceLabel{

    font-size:var(--text-body-sm);

    color:var(--ink-2);

}

.sourceYear{

    font-size:var(--text-num-sm);

    letter-spacing:.02em;

    color:var(--ink);

}

.methodology{

    margin:11px 0 0;

    text-align:center;

}

.methodology a{

    display:inline-flex;

    align-items:center;

    min-height:var(--touch-target);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

}

</style>
