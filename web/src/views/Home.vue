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

import LineChart from "@/components/charts/LineChart.vue";
import UiKpiCard from "@/components/ui/UiKpiCard.vue";

const {
    cutoff,
    rates,
    sittings,
    admission,
    passTrend,
    hardest,
    recentYears
} = useDegree();

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

const trendMax = computed(() =>
    Math.max(...passTrend.map(point => point.value))
);

const trendHeight = value =>
    Math.max(4, Math.round((value / trendMax.value) * 74));

const shortYear = year =>
    year.split("-").map(part => part.slice(-2)).join("-");

const trendEnds = computed(() => ({
    first: passTrend[0],
    last: passTrend[passTrend.length - 1]
}));

</script>

<template>

<div class="screen">

    <!-- Héroe: continúa la banda navy de la cabecera ------------------- -->
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
                reference="media por troncal · dato oficial"
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

        <!-- Tendencia ------------------------------------------------ -->
        <section class="panel">

            <h2>¿Aprueba más gente que antes?</h2>

            <p class="lead">Tasa de las troncales, curso a curso.</p>

            <div class="trend">
                <div
                    v-for="(point, index) in passTrend"
                    :key="point.year"
                    class="trendBar"
                    :class="{ latest: index === passTrend.length - 1 }"
                    :style="{ height: `${trendHeight(point.value)}px` }"
                    :title="`${point.year}: ${pct(point.value)}`"
                ></div>
            </div>

            <div class="trendAxis num">
                <span>{{ shortYear(trendEnds.first.year) }} · {{ pct(trendEnds.first.value) }}</span>
                <span>{{ shortYear(trendEnds.last.year) }} · {{ pct(trendEnds.last.value) }}</span>
            </div>

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

        <p class="disclaimer">
            Cada fuente se actualiza por su cuenta: una sola fecha para todas
            sería falsa · cálculo propio, código abierto.
        </p>

    </div>

</div>

</template>

<style scoped>

/* Héroe --------------------------------------------------------------- */

.hero{

    position:relative;

    overflow:hidden;

    background:var(--navy);

    padding-top:2px;

    padding-bottom:18px;

    /* Sube 1px para que no se vea costura con la cabecera. */
    margin-top:-1px;

}

.heroInner{

    position:relative;

    max-width:var(--content-max);

    margin:0 auto;

}

/* Círculos concéntricos: decoración, no dato. En oro tenue porque el oro es
   justo lo que en esta web no significa nada. */
.motif{

    position:absolute;

    inset:0;

    pointer-events:none;

}

.ring{

    position:absolute;

    border-radius:50%;

    border:1.5px solid rgba(201,162,75,.35);

}

.ring.big{

    right:-24px;

    top:-28px;

    width:120px;

    height:120px;

}

.ring.small{

    right:6px;

    top:2px;

    width:74px;

    height:74px;

    border-color:rgba(201,162,75,.22);

}

h1{

    margin:16px 0 8px;

    font-family:var(--font-serif);

    font-size:24px;

    font-weight:700;

    line-height:1.15;

    color:var(--ink-on-navy);

}

.hero p{

    margin:0;

    max-width:290px;

    font-size:12px;

    line-height:1.55;

    color:var(--on-navy-soft);

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

    margin-top:16px;

    padding:15px 15px 12px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    box-shadow:var(--shadow-card);

}

.panelHead{

    display:flex;

    align-items:baseline;

    justify-content:space-between;

    gap:10px;

}

h2{

    margin:0;

    font-family:var(--font-serif);

    font-size:15px;

    font-weight:600;

}

.range{

    font-size:var(--text-footnote);

    font-weight:400;

    color:var(--ink-faint);

}

.lead{

    margin:3px 0 13px;

    font-size:10.5px;

    color:var(--ink-soft);

}

.takeaway{

    margin:10px 0 0;

    padding-top:10px;

    border-top:1px solid var(--line-inner);

    font-size:10.5px;

    line-height:1.45;

    color:var(--ink-muted);

}

.takeaway strong{

    color:var(--ink);

}

/* La más dura --------------------------------------------------------- */

.hardest{

    display:flex;

    gap:12px;

    margin-top:16px;

    padding:14px 15px;

    background:var(--warn-bg);

    border:1px solid var(--warn-line);

    border-radius:var(--radius-card-lg);

    color:var(--ink);

}

.hardestValue{

    flex:none;

    width:46px;

    text-align:center;

}

.hardestValue .num{

    font-size:21px;

    line-height:1;

}

.hardestCaption{

    display:block;

    margin-top:3px;

    font-size:8px;

    line-height:1.2;

    color:var(--warn-caption);

}

.hardestBody{

    display:flex;

    flex-direction:column;

    padding-left:12px;

    border-left:1px solid var(--warn-line);

}

.hardestEyebrow{

    font-size:8px;

    color:var(--delta-bad);

}

.hardestName{

    margin-top:2px;

    font-family:var(--font-serif);

    font-size:16px;

    font-weight:600;

    line-height:1.15;

}

.hardestMeta{

    margin-top:3px;

    font-size:10.5px;

    line-height:1.4;

    color:var(--warn-body);

}

.hardestGo{

    color:var(--warn-title);

    font-weight:600;

}

/* Tendencia ----------------------------------------------------------- */

.trend{

    display:flex;

    align-items:flex-end;

    gap:5px;

    height:74px;

}

.trendBar{

    flex:1;

    border-radius:3px 3px 0 0;

    /* Gris de recuento: la altura ya dice la tasa, el color no añade nada y
       usar la rampa aquí diría que un curso entero "es difícil". */
    background:var(--count-fill);

    opacity:.55;

}

/* Solo el último se destaca: es el "ahora" contra el que se lee el resto. */
.trendBar.latest{

    opacity:1;

}

.trendAxis{

    display:flex;

    justify-content:space-between;

    margin-top:6px;

    font-size:7.5px;

    font-weight:400;

    color:var(--ink-faint);

}

/* Frescura ------------------------------------------------------------ */

.freshness{

    margin-top:16px;

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

    border:1px solid var(--line);

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

    border-top:1px solid var(--line-inner);

}

.sourceLabel{

    font-size:var(--text-body-sm);

    color:var(--ink-2);

}

.sourceYear{

    font-size:var(--text-num-sm);

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

    font-size:12px;

    font-weight:600;

}

.disclaimer{

    margin:14px 0 0;

    padding-top:14px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

</style>
