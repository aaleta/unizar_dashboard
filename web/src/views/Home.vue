<script setup>
/**
 * Portada. Abre con números, no con gráficas.
 *
 * Unos pocos escalares dicen si el grado va bien antes de que nadie interprete
 * un eje; las gráficas vienen después, para quien quiera el porqué. El orden es
 * deliberado: cifras → cómo se entra → dónde duele → si mejora con los años →
 * de cuándo son los datos.
 *
 * La última sección es la que hace honesta a toda la web: cada fuente se
 * actualiza por su cuenta y decir "datos de 2024-2025" para las cuatro sería
 * mentira en tres de ellas.
 *
 * El escritorio no cuenta nada distinto: cuenta más a la vez. Cabe una quinta
 * cifra (la excelencia) y dos paneles que en el móvil no llegaron a entrar —el
 * reparto de calificaciones del grado y la tendencia curso a curso—, y las
 * tres bandas se leen sin desplazar la página.
 */

import { computed } from "vue";

import { useDegree } from "@/composables/useDegree";
import { DATA_SOURCES } from "@/utils/dataSources";
import { decimal, pct, thousands } from "@/utils/format";
import { weightedAverages } from "@/content/copy";
import { difficultyInk } from "@/theme/difficulty";
import { gradeColor } from "@/theme/gradePalette";
import { allCoreSubjects, courseRate } from "@/utils/metrics";

import LineChart from "@/components/charts/LineChart.vue";
import UiKpiCard from "@/components/ui/UiKpiCard.vue";
import UiMeterRow from "@/components/ui/UiMeterRow.vue";

const {
    cutoff,
    rates,
    excellence,
    sittings,
    sittingsYear,
    admission,
    passTrend,
    gradeDistribution,
    totalEnrolment,
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

const hardestYear = yearDifficulty.reduce((worst, year) =>
    year.value > worst.value ? year : worst
).course;

const coreCount = allCoreSubjects.length;

const chart = computed(() => ({
    labels: admission.map(row => String(row.anyo).slice(-2)),
    series: [
        {
            label: "Nota media de admisión",
            values: admission.map(row => row.nota_media_admision)
        },
        {
            label: "Nota de corte",
            values: admission.map(row => row.nota_corte)
        }
    ]
}));

const CHART_COLORS = ["var(--chart-line-1)", "var(--chart-line-2)"];

const TREND_COLORS = ["var(--chart-line-1)"];

/** "2013-2014" → "13-14": con trece cursos, el año entero no cabe en el eje. */
const shortYear = academicYear =>
    academicYear
        .split("-")
        .map(part => part.slice(-2))
        .join("-");

const trend = computed(() => ({
    labels: passTrend.map(point => shortYear(point.year)),
    series: [
        {
            label: "Tasa de rendimiento",
            values: passTrend.map(point => point.value)
        }
    ]
}));

/**
 * La frase de la gráfica. Se construye con los datos en vez de escribirse,
 * porque una nota de corte que baja este año puede subir el siguiente y la
 * frase quedaría al revés.
 *
 * "La más baja desde 2016" tampoco se escribe: se busca el último curso
 * anterior que estuviera igual o más abajo. Si no hay ninguno, es la más baja
 * de toda la serie.
 */
const admissionNote = computed(() => {
    if (!cutoff.value || cutoff.value.delta === null) return null;

    const dropped = cutoff.value.delta < 0;

    const earlier = [...admission]
        .slice(0, -1)
        .reverse()
        .find(row => row.nota_corte <= cutoff.value.value);

    return {
        direction: dropped ? "bajó" : "subió",
        amount: decimal(Math.abs(cutoff.value.delta)),
        value: decimal(cutoff.value.value, 3),
        year: cutoff.value.year,
        // El "más baja desde" solo tiene sentido si de verdad ha bajado: si ha
        // subido, el curso anterior ya era más bajo y la frase sobraría.
        lowestSince: dropped ? (earlier?.anyo ?? null) : undefined,
        gap: dropped ? "por debajo" : "por encima"
    };
});
</script>

<template>
    <div class="screen">
        <!-- Metadatos de la banda de título. `defer` porque el destino lo pinta
         la carcasa, que va antes en el árbol pero se inserta después. En el
         móvil la banda los esconde: allí el titular ocupa el ancho entero. -->
        <Teleport defer to="#pageActions">
            <p class="pageMeta num">
                {{ weightedAverages() }}<br />
                {{ coreCount }} troncales ·
                {{ thousands(totalEnrolment) }} matrículas
            </p>
        </Teleport>

        <div class="body">
            <!-- Las cifras ---------------------------------------------- -->
            <section class="kpis">
                <UiKpiCard
                    label="Nota de corte"
                    :value="decimal(cutoff?.value, 3)"
                    :delta="cutoff?.delta ?? null"
                    delta-unit=""
                    :delta-threshold="0.05"
                    :reference="
                        cutoff?.previousYear
                            ? `vs. ${cutoff.previousYear}`
                            : null
                    "
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

                <!-- La quinta cifra solo cabe en escritorio. -->
                <UiKpiCard
                    class="onlyWide"
                    :label="excellence.label"
                    :value="pct(excellence.value)"
                    :delta="excellence.delta"
                    :higher-is-better="excellence.higherIsBetter"
                    reference="sobresalientes y matrículas de honor"
                />

                <UiKpiCard
                    label="Convocatorias"
                    :value="decimal(sittings)"
                    :delta="null"
                    :reference="`media por troncal · ${sittingsYear ?? 'dato oficial'}`"
                />
            </section>

            <div class="band wide">
                <!-- Notas de acceso -------------------------------------- -->
                <section class="panel">
                    <div class="panelHead">
                        <h2>Notas de acceso</h2>
                        <span class="num range">
                            {{ admission[0].anyo }} –
                            {{ admission[admission.length - 1].anyo }}
                        </span>
                    </div>

                    <LineChart
                        :labels="chart.labels"
                        :series="chart.series"
                        :colors="CHART_COLORS"
                        :desktop-width="672"
                        :desktop-height="216"
                        :format-value="value => decimal(value, 1)"
                    />

                    <p v-if="admissionNote" class="takeaway">
                        La nota de corte {{ admissionNote.direction }} a
                        <strong>{{ admissionNote.value }}</strong>
                        en {{ admissionNote.year
                        }}<template v-if="admissionNote.lowestSince">
                            — la más baja desde
                            {{ admissionNote.lowestSince }}</template
                        ><template
                            v-else-if="admissionNote.lowestSince === null"
                        >
                            — la más baja de toda la serie</template
                        >, y {{ admissionNote.amount }} puntos
                        {{ admissionNote.gap }} del año anterior.
                    </p>
                </section>

                <div class="column">
                    <!-- La más dura ------------------------------------- -->
                    <RouterLink
                        v-if="hardest"
                        :to="`/asignatura/${hardest.code}`"
                        class="hardest"
                    >
                        <div class="hardestValue">
                            <span
                                class="num"
                                :style="{ color: difficultyInk(hardest.value) }"
                                >{{ pct(hardest.value) }}</span
                            >
                            <span class="hardestCaption">no superan</span>
                        </div>

                        <div class="hardestBody">
                            <span class="eyebrow hardestEyebrow"
                                >La más dura ahora mismo</span
                            >
                            <span class="hardestName">{{ hardest.name }}</span>
                            <span class="hardestMeta">
                                Troncal de {{ hardest.course }}º · media de
                                {{ recentYears }} cursos ·
                                {{ thousands(hardest.students) }} matrículas.
                                <span class="hardestGo">Ver ficha →</span>
                            </span>
                        </div>
                    </RouterLink>

                    <!-- Dificultad por curso ---------------------------- -->
                    <section class="panel">
                        <h2>¿Qué curso cuesta más?</h2>

                        <p class="lead">
                            % que no supera las troncales de cada curso, de
                            media.
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
                            {{ weightedAverages() }}.
                            <RouterLink :to="`/grado/${hardestYear}`">
                                Ver {{ hardestYear }}º →
                            </RouterLink>
                        </p>
                    </section>
                </div>
            </div>

            <div class="band trio">
                <!-- Tendencia --------------------------------------------- -->
                <section class="panel onlyWide">
                    <h2>¿Mejora con los años?</h2>

                    <p class="lead">
                        Tasa de rendimiento del grado, curso a curso.
                    </p>

                    <LineChart
                        :labels="trend.labels"
                        :series="trend.series"
                        :colors="TREND_COLORS"
                        :desktop-width="420"
                        :desktop-height="152"
                        :max-ticks="4"
                        :y-min="0"
                        :format-value="value => `${Math.round(value)}%`"
                    />
                </section>

                <!-- Reparto de calificaciones ----------------------------- -->
                <section class="panel onlyWide">
                    <h2>Reparto de calificaciones</h2>

                    <p class="lead">
                        Troncales, {{ recentYears }} últimos cursos ·
                        {{ thousands(totalEnrolment) }} matrículas.
                    </p>

                    <div class="stack">
                        <div
                            v-for="slice in gradeDistribution"
                            :key="slice.key"
                            class="slice"
                            :style="{
                                width: `${slice.pct}%`,
                                background: gradeColor(slice.key)
                            }"
                            :title="`${slice.label}: ${thousands(slice.count)}`"
                        ></div>
                    </div>

                    <div class="gradeLegend">
                        <span
                            v-for="slice in gradeDistribution"
                            :key="slice.key"
                            class="gradeItem"
                        >
                            <span
                                class="swatch"
                                :style="{ background: gradeColor(slice.key) }"
                            ></span>
                            <span class="gradeLabel">{{ slice.label }}</span>
                            <span class="num gradeValue">
                                {{ decimal(slice.pct, 1) }}%
                            </span>
                        </span>
                    </div>
                </section>

                <!-- Frescura ---------------------------------------------- -->
                <section class="freshness">
                    <p class="eyebrow">Actualización de los datos</p>

                    <ul class="sources">
                        <li v-for="source in DATA_SOURCES" :key="source.key">
                            <span class="sourceLabel">{{ source.short }}</span>
                            <span class="num sourceYear">{{
                                source.ultimo_curso
                            }}</span>
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
    </div>
</template>

<style scoped>
/* Cuerpo -------------------------------------------------------------- */

.body {
    padding: 16px var(--gutter) 8px;
}

.kpis {
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: var(--gap-card);
}

/* Las bandas del escritorio no existen en el móvil: ahí los paneles se apilan
   uno tras otro, que es lo que hace `display: contents`.
   Ojo con el nombre de la clase: el CSS de una vista alcanza también la raíz de
   los componentes que coloca, y llamar "row" a esto le cambiaba el display a
   todas las UiMeterRow de la pantalla. */
.band {
    display: contents;
}

.onlyWide {
    display: none;
}

.panel {
    margin-top: 16px;

    padding: 15px 15px 12px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: var(--radius-card-lg);

    box-shadow: var(--shadow-card);
}

.panelHead {
    display: flex;

    align-items: baseline;

    justify-content: space-between;

    gap: 10px;
}

h2 {
    margin: 0;

    font-family: var(--font-serif);

    font-size: 15px;

    font-weight: 600;
}

.range {
    font-size: var(--text-footnote);

    font-weight: 400;

    color: var(--ink-soft);
}

.lead {
    margin: 3px 0 13px;

    font-size: 10.5px;

    color: var(--ink-soft);
}

.takeaway {
    margin: 10px 0 0;

    padding-top: 10px;

    border-top: 1px solid var(--line-inner);

    font-size: 10.5px;

    line-height: 1.45;

    color: var(--ink-muted);
}

.takeaway strong {
    color: var(--ink);
}

/* Metadatos de la banda de título ------------------------------------- */

.pageMeta {
    margin: 0;

    font-size: var(--text-num-sm);

    font-weight: 400;

    line-height: 1.6;

    text-align: right;

    color: var(--ink-soft);
}

/* La más dura --------------------------------------------------------- */

.hardest {
    display: flex;

    gap: 12px;

    margin-top: 16px;

    padding: 14px 15px;

    background: var(--warn-bg);

    border: 1px solid var(--warn-line);

    border-radius: var(--radius-card-lg);

    color: var(--ink);
}

/* La cifra se centra contra el bloque de texto, que es más alto: alineada
   arriba se quedaba colgando junto al eyebrow. Se centra el CONTENIDO de la
   columna, no la columna, para que el filete que la separa siga recorriendo
   la tarjeta entera. */
.hardestValue {
    display: flex;

    flex-direction: column;

    justify-content: center;

    flex: none;

    width: 46px;

    text-align: center;
}

.hardestValue .num {
    font-size: 21px;

    line-height: 1;
}

.hardestCaption {
    display: block;

    margin-top: 3px;

    font-size: 8px;

    line-height: 1.2;

    color: var(--warn-caption);
}

.hardestBody {
    display: flex;

    flex-direction: column;

    padding-left: 12px;

    border-left: 1px solid var(--warn-line);
}

.hardestEyebrow {
    font-size: 8px;

    color: var(--delta-bad);
}

.hardestName {
    margin-top: 2px;

    font-family: var(--font-serif);

    font-size: 16px;

    font-weight: 600;

    line-height: 1.15;
}

.hardestMeta {
    margin-top: 3px;

    font-size: 10.5px;

    line-height: 1.4;

    color: var(--warn-body);
}

.hardestGo {
    color: var(--warn-title);

    font-weight: 600;

    /* Partido en dos líneas dejaba de leerse como un botón. */
    white-space: nowrap;
}

/* Dificultad por curso ------------------------------------------------- */

.yearBars {
    display: flex;

    flex-direction: column;

    gap: 8px;
}

.yearNote {
    margin: 10px 0 0;

    font-family: var(--font-mono);

    font-size: var(--text-num-sm);

    color: var(--ink-soft);
}

.yearNote a {
    color: var(--navy);

    font-weight: 600;
}

/* Reparto de calificaciones -------------------------------------------- */

.stack {
    display: flex;

    height: 24px;

    border-radius: 6px;

    overflow: hidden;
}

.slice {
    min-width: 2px;
}

.gradeLegend {
    display: flex;

    flex-direction: column;

    gap: 7px;

    margin-top: 14px;
}

.gradeItem {
    display: flex;

    align-items: center;

    gap: 8px;

    font-size: var(--text-body-sm);

    color: var(--ink-2);
}

.swatch {
    width: 9px;

    height: 9px;

    flex: none;

    border-radius: 2px;
}

.gradeLabel {
    flex: 1;

    min-width: 0;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;
}

.gradeValue {
    flex: none;

    font-size: var(--text-num);
}

/* Frescura ------------------------------------------------------------ */

.freshness {
    margin-top: 16px;
}

.freshness .eyebrow {
    margin: 0 0 8px;

    font-size: var(--text-footnote);
}

.sources {
    margin: 0;

    padding: 0;

    list-style: none;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: var(--radius-card);

    overflow: hidden;
}

.sources li {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 10px;

    padding: 9px 13px;
}

.sources li + li {
    border-top: 1px solid var(--line-inner);
}

.sourceLabel {
    font-size: var(--text-body-sm);

    color: var(--ink-2);
}

.sourceYear {
    font-size: var(--text-num-sm);

    color: var(--ink);
}

.methodology {
    margin: 11px 0 0;

    text-align: center;
}

.methodology a {
    display: inline-flex;

    align-items: center;

    min-height: var(--touch-target);

    font-size: 12px;

    font-weight: 600;
}

/* Escritorio ----------------------------------------------------------- *
 * Dos escalones. El diseño está dibujado a 1440px y sus columnas son fijas
 * (704, 452, 288); por debajo de 1200 no caben, así que hasta ahí la misma
 * pantalla se ordena en dos columnas iguales, con la gráfica y la frescura a
 * todo el ancho. Nada se oculta: solo cambia el reparto.
 */

@media (min-width: 900px) {
    .body {
        padding: 22px var(--gutter) 34px;
    }

    .kpis {
        grid-template-columns: repeat(3, 1fr);

        gap: 12px;

        --kpi-value-size: 26px;
    }

    .onlyWide {
        display: block;
    }

    .band {
        display: grid;

        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

        gap: 16px;

        margin-top: 16px;

        align-items: start;
    }

    /* La gráfica de acceso y la lista de frescura piden ancho antes que
       compañía: una serie de dieciséis años a media columna deja de leerse. */
    .band.wide > .panel:first-child,
    .band.trio > .freshness {
        grid-column: 1 / -1;
    }

    /* Sin la columna de la derecha, sus dos paneles son celdas hermanas. */
    .column {
        display: contents;
    }

    /* Dentro de la rejilla el hueco lo pone `gap`, no cada panel. */
    .band .panel,
    .band .hardest,
    .band .freshness {
        margin-top: 0;
    }

    .panel {
        padding: 16px 17px 14px;
    }

    h2 {
        font-size: 17px;
    }

    .lead {
        margin: 4px 0 12px;

        font-size: var(--text-body-sm);
    }

    .range {
        font-size: var(--text-num-sm);
    }

    .takeaway {
        font-size: 12px;

        line-height: 1.5;
    }

    /* La tarjeta de la más dura crece con la columna: es la advertencia de la
       pantalla y en el ancho del móvil se leía como una nota al pie. */
    .hardest {
        padding: 16px 17px;
    }

    .hardestValue {
        width: 62px;
    }

    .hardestValue .num {
        font-size: 27px;
    }

    .hardestCaption {
        margin-top: 4px;

        font-size: 9.5px;
    }

    .hardestBody {
        padding-left: 14px;
    }

    .hardestEyebrow {
        font-size: var(--text-eyebrow);
    }

    .hardestName {
        margin-top: 3px;

        font-size: 20px;
    }

    .hardestMeta {
        margin-top: 4px;

        font-size: var(--text-body-sm);

        line-height: 1.45;
    }

    .yearBars {
        gap: 10px;
    }

    .yearNote {
        margin-top: 14px;

        font-size: var(--text-num-sm);
    }

    .freshness .eyebrow {
        margin-bottom: 9px;

        font-size: 9.5px;
    }

    .sources li {
        font-size: var(--text-body-sm);
    }

    .sourceYear {
        font-size: 10.5px;
    }

    /* Sin el objetivo táctil de 44px: en escritorio el enlace se pulsa con un
       ratón y esa altura dejaba un hueco raro al final de la columna. */
    .methodology {
        margin-top: 12px;

        text-align: left;
    }

    .methodology a {
        min-height: 0;
    }
}

/* La rejilla del diseño, tal cual: cinco cifras arriba y las tres bandas. */
@media (min-width: 1200px) {
    .kpis {
        grid-template-columns: repeat(5, 1fr);

        /* La cifra manda más aquí que en ninguna otra pantalla. */
        --kpi-value-size: 30px;
    }

    /* 704px es lo que necesita la serie de dieciséis años para que dos puntos
       consecutivos no se toquen; lo que sobra se lo queda la columna de al
       lado, que es texto y aguanta cualquier ancho. */
    .band.wide {
        grid-template-columns: 704px minmax(0, 1fr);
    }

    .band.trio {
        grid-template-columns: 452px minmax(0, 1fr) 288px;
    }

    .band.wide > .panel:first-child,
    .band.trio > .freshness {
        grid-column: auto;
    }

    .column {
        display: flex;

        flex-direction: column;

        gap: 16px;

        min-width: 0;
    }
}
</style>
