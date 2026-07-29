<script setup>
/**
 * Catálogo de optativas: la pantalla para ELEGIR, que es una tarea distinta de
 * consultar.
 *
 * Por eso no es una tabla ordenable como la lista maestra sino tarjetas con
 * cuatro órdenes con nombre propio. Quien elige optativas no piensa "ordéname
 * por tasa de excelencia descendente"; piensa "cuáles son las más fáciles" o
 * "en cuáles cae más matrícula de honor".
 *
 * Las barras de "las más elegidas" van en GRIS y no en la rampa. Cuánta gente
 * se matricula es un recuento, no una dificultad: pintar de rojo la más
 * elegida diría que es la más dura, que es justo lo contrario de lo que pasa.
 *
 * Antes esto eran dos páginas (/Optional y /dashboardGeneralOpts) contando lo
 * mismo por separado.
 */

import { computed, ref } from "vue";

import { useSubjectList } from "@/composables/useSubjectList";
import { useViewport } from "@/composables/useViewport";
import { COHORT, SEARCH } from "@/content/copy";
import { pct } from "@/utils/format";
import {
    RECENT_YEARS,
    poolOptionalSubjects,
    weightedRate,
    subjectRows,
    lastYears
} from "@/utils/metrics";

import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";
import UiCountBar from "@/components/ui/UiCountBar.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiStat from "@/components/ui/UiStat.vue";
import UiSubjectCard from "@/components/ui/UiSubjectCard.vue";

/** Cuántas tarjetas se ven antes de tener que pedir el resto. */
const PREVIEW = 4;

/** Cuántas barras tiene cada ranking. */
const TOP_ENROLLED = 5;

const { isDesktop } = useViewport();

const { query, applySort, isSort, results, rows, total, empty } =
    useSubjectList({
        // La bolsa de 3º y 4º: las optativas especiales de primero (Biología,
        // Geología, Grafos y combinatoria) no se eligen aquí y no se listan.
        source: poolOptionalSubjects,
        sort: "enrolment",
        descending: true
    });

/**
 * Los cuatro órdenes, con la dirección explícita. "Más fáciles" es no
 * superación ASCENDENTE: la que menos gente suspende, arriba.
 */
const ORDERS = [
    { label: "Populares", key: "enrolment", descending: true },
    { label: "Más fáciles", key: "noSuperacion", descending: false },
    { label: "＋ Sob·MH", key: "excelencia", descending: true },
    { label: "A–Z", key: "name", descending: false }
];

const expanded = ref(false);

/** Media ponderada de aprobados de las optativas de la bolsa. */
const averagePass = computed(() => {
    const allRows = poolOptionalSubjects.flatMap(subject =>
        lastYears(subjectRows(subject.code))
    );

    return weightedRate(allRows, "rendimiento");
});

/** Matrículas al año: la suma de las medias de matriculados de cada una. */
const enrolmentPerYear = computed(() =>
    Math.round(rows.value.reduce((sum, row) => sum + row.enrolment, 0))
);

const mostEnrolled = computed(() =>
    [...rows.value]
        .sort((a, b) => b.enrolment - a.enrolment)
        .slice(0, TOP_ENROLLED)
);

const topEnrolment = computed(() => mostEnrolled.value[0]?.enrolment ?? 1);

/** Media ponderada de sobresalientes y matrículas de honor de la bolsa. */
const averageExcellence = computed(() => {
    const allRows = poolOptionalSubjects.flatMap(subject =>
        lastYears(subjectRows(subject.code))
    );

    return weightedRate(allRows, "excelencia");
});

/**
 * Dónde caen las notas altas. En el móvil este dato solo vive dentro de cada
 * tarjeta y hay que recorrer las veintiuna; con sitio se puede rankear.
 */
const mostExcellent = computed(() =>
    [...rows.value]
        .filter(row => row.excelencia !== null)
        .sort((a, b) => b.excelencia - a.excelencia)
        .slice(0, TOP_ENROLLED)
);

/** Cuánta matrícula optativa se llevan las tres más elegidas. */
const topShare = computed(() => {
    const total = rows.value.reduce((sum, row) => sum + row.enrolment, 0);

    if (!total) return null;

    const top = mostEnrolled.value
        .slice(0, 3)
        .reduce((sum, row) => sum + row.enrolment, 0);

    return Math.round((top / total) * 100);
});

/** La más dura de la bolsa, hacia arriba: "ninguna pasa del N %". */
const hardest = computed(() =>
    Math.ceil(
        rows.value.reduce(
            (worst, row) => Math.max(worst, row.noSuperacion ?? 0),
            0
        )
    )
);

/** "OPTATIVA · 3º y 4º · 58 matr." */
const meta = row =>
    [
        "Optativa",
        row.courses.map(c => `${c}º`).join(" y "),
        `${Math.round(row.enrolment)} matr.`
    ].join(" · ");
</script>

<template>
    <div class="screen">
        <header class="intro">
            <p class="lead">
                La bolsa de 3º y 4º, con sus estadísticas y su ficha.<span
                    class="onlyWide"
                >
                    Esta pantalla es para <strong>elegir</strong>, no para
                    consultar: por eso son tarjetas y cuatro órdenes con nombre,
                    no una tabla.</span
                >
            </p>

            <div class="summary">
                <div class="stats">
                    <UiStat
                        :value="total"
                        label="optativas en la bolsa"
                        tone="gold"
                    />
                    <UiStat
                        :value="enrolmentPerYear"
                        label="matrículas al año"
                    />
                    <UiStat
                        :value="pct(averagePass)"
                        label="aprueban de media"
                    />
                    <UiStat
                        :value="pct(averageExcellence)"
                        label="sacan Sob. o MH"
                    />
                </div>

                <UiCallout tone="structural" title="Cuántas tienes que elegir">
                    En 3º deberías cursar 15 créditos optativos (3 asignaturas)
                    y en 4º, 20 créditos (4 asignaturas).
                </UiCallout>
            </div>
        </header>

        <div class="pair">
            <section class="section">
                <div class="panelHead">
                    <h2>Las más elegidas</h2>
                    <span class="num panelMeta onlyWide">
                        matriculados de media · gris = recuento
                    </span>
                </div>

                <div class="panel wideLabels">
                    <UiCountBar
                        v-for="row in mostEnrolled"
                        :key="row.code"
                        :label="row.name"
                        :value="row.enrolment"
                        :max="topEnrolment"
                        :display="String(Math.round(row.enrolment))"
                    />

                    <p v-if="topShare" class="takeaway onlyWide">
                        Las tres primeras se llevan
                        <strong>{{ topShare }}%</strong> de la matrícula
                        optativa del grado. Ninguna de las {{ total }} pasa del
                        {{ hardest }}% de no superación: elegir optativa no es
                        donde se decide si apruebas el curso.
                    </p>
                </div>
            </section>

            <section class="section onlyWide">
                <h2>Dónde cae más matrícula de honor</h2>

                <p class="lead">% de sobresalientes y MH sobre matriculados.</p>

                <div class="panel">
                    <UiCountBar
                        v-for="row in mostExcellent"
                        :key="row.code"
                        :label="row.name"
                        :value="row.excelencia"
                        :max="100"
                        :display="pct(row.excelencia)"
                    />

                    <p class="takeaway">
                        En gris, no en la rampa: una nota alta no es una
                        dificultad. Media de la bolsa:
                        <strong>{{ pct(averageExcellence) }}</strong
                        >.
                    </p>
                </div>
            </section>
        </div>

        <div class="controls">
            <Teleport defer to="#pageActions" :disabled="!isDesktop">
                <UiSearchField
                    v-model="query"
                    class="search"
                    :placeholder="SEARCH.optative"
                    :label="SEARCH.optativeLabel"
                />
            </Teleport>

            <h2 class="onlyWide gridTitle">Las {{ total }} optativas</h2>

            <p class="eyebrow orderLabel">Ordenar por</p>

            <div class="chips">
                <UiChip
                    v-for="order in ORDERS"
                    :key="order.label"
                    shape="rounded"
                    :active="isSort(order.key, order.descending)"
                    @click="applySort(order.key, order.descending)"
                >
                    {{ order.label }}
                </UiChip>
            </div>

            <span class="onlyWide num count">
                {{ results.length }} de {{ total }}
            </span>
        </div>

        <p v-if="empty" class="emptyState">
            Ninguna optativa coincide con la búsqueda.
        </p>

        <div v-else class="cards" :class="{ collapsed: !expanded }">
            <!-- Props explícitas, NUNCA v-bind="row".
             El resumen trae campos que la tarjeta no declara y que se cuelan
             como atributos en el <a>. Uno de ellos, `search`, es además una
             propiedad del DOM en los enlaces: asignarla REESCRIBE la query del
             href y deja URLs con "?gravitacion y cosmologia 26937" pegado. -->
            <UiSubjectCard
                v-for="row in results"
                :key="row.code"
                :code="row.code"
                :name="row.name"
                :no-superacion="row.noSuperacion"
                :rendimiento="row.rendimiento"
                :excelencia="row.excelencia"
                :small-cohort="row.smallCohort"
                :meta="meta(row)"
                :badge="row.alternatesWith ? 'BIENAL' : null"
                secondary="excelencia"
                density="compact"
                optative
            />

            <button
                v-if="results.length > PREVIEW"
                type="button"
                class="more moreCard"
                @click="expanded = !expanded"
            >
                {{
                    expanded
                        ? "− ver menos"
                        : `＋ ${results.length - PREVIEW} optativas más`
                }}
            </button>
        </div>

        <p class="footnote">
            Medias de {{ RECENT_YEARS }} cursos · {{ COHORT.legend }} ·
            <span class="num">BIENAL</span> = no se oferta todos los años.
        </p>
    </div>
</template>

<style scoped>
.screen {
    padding: 15px var(--gutter) 8px;
}

.lead {
    margin: 0 0 13px;

    font-size: var(--text-body-sm);

    color: var(--ink-soft);
}

.stats {
    display: flex;

    flex-wrap: wrap;

    gap: 22px;
}

.section {
    margin-top: 16px;
}

h2 {
    margin: 0 0 10px;

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

.controls {
    margin-top: 16px;
}

.orderLabel {
    margin: 11px 0 7px;

    font-size: var(--text-footnote);
}

.chips {
    display: flex;

    flex-wrap: wrap;

    gap: 6px;
}

.cards {
    display: flex;

    flex-direction: column;

    gap: 9px;

    margin-top: 12px;
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

.emptyState {
    margin: 0;

    padding: 26px 0;

    text-align: center;

    font-size: var(--text-body);

    color: var(--ink-soft);
}

.footnote {
    margin: 14px 0 0;

    padding-top: 12px;

    border-top: 1px solid var(--line-rule);

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.6;

    color: var(--ink-soft);
}

/* El recorte del móvil: PREVIEW + 1. Si allí cambia, aquí también. */
.cards.collapsed > *:nth-child(n + 5):not(.moreCard) {
    display: none;
}

/* Solo en escritorio ---------------------------------------------------- */

.onlyWide {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * Sigue siendo la pantalla de elegir: tarjetas y órdenes con nombre. Lo que
 * cambia es que las cuatro cifras, la regla de créditos y los dos rankings
 * caben arriba, y las veintiuna tarjetas se ven de un vistazo.
 */

@media (min-width: 900px) {
    .screen {
        padding: 22px var(--gutter) 34px;
    }

    .onlyWide {
        display: block;
    }

    .lead {
        max-width: 700px;

        margin-bottom: 18px;

        font-size: var(--text-body);

        line-height: 1.55;

        color: var(--ink-muted);
    }

    .lead .onlyWide {
        display: inline;
    }

    .lead strong {
        color: var(--ink);
    }

    .search {
        width: 300px;
    }

    .summary {
        display: grid;

        grid-template-columns: minmax(0, 1fr);

        gap: 16px;

        align-items: start;
    }

    /* Los dos rankings se leen como una pareja: a distinta altura parecen dos
       cosas distintas. */
    .pair {
        display: grid;

        grid-template-columns: minmax(0, 1fr);

        gap: 16px;

        align-items: stretch;
    }

    .pair .section {
        display: flex;

        flex-direction: column;
    }

    /* El pie de cada panel se queda abajo aunque uno tenga menos barras. */
    .pair .takeaway {
        margin-top: auto;
    }

    .pair {
        margin-top: 20px;
    }

    /* Las cifras dejan de ser una fila suelta: filete arriba y abajo, y un
       filete vertical entre cada dos. */
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

        padding: 0 26px;

        border-left: 1px solid var(--line-rule);
    }

    .stats > *:first-child {
        padding-left: 0;

        border-left: none;
    }

    .stats > *:last-child {
        padding-right: 0;
    }

    .section {
        margin-top: 0;

        padding: 17px 18px 15px;

        background: var(--surface);

        border: 1px solid var(--line);

        border-radius: var(--radius-card-lg);

        box-shadow: var(--shadow-card);
    }

    /* Dentro del panel, las barras ya no necesitan su propia caja. */
    .panel {
        gap: 10px;

        margin-top: 15px;

        padding: 0;

        background: none;

        border: none;

        border-radius: 0;

        box-shadow: none;
    }

    .panelHead {
        display: flex;

        align-items: baseline;

        justify-content: space-between;

        gap: 12px;
    }

    .panelMeta {
        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    h2 {
        margin: 0;

        font-size: 18px;
    }

    .section .lead {
        margin: 5px 0 0;

        font-size: var(--text-body);
    }

    /* Los nombres de las optativas son largos: con sitio, no se cortan. */
    .wideLabels {
        --count-label-width: 230px;
    }

    .takeaway {
        margin: 15px 0 0;

        padding-top: 12px;

        border-top: 1px solid var(--line-inner);

        font-size: var(--text-body);

        line-height: 1.5;

        color: var(--ink-muted);
    }

    .takeaway strong {
        color: var(--ink);
    }

    /* Los controles se convierten en la cabecera de la banda de tarjetas. */
    .controls {
        display: flex;

        align-items: center;

        gap: 16px;

        margin-top: 26px;

        padding-bottom: 12px;

        border-bottom: 1px solid var(--gold-line);
    }

    .gridTitle {
        font-size: 21px;

        font-weight: 600;
    }

    .orderLabel {
        margin: 0;

        font-size: var(--text-eyebrow);
    }

    .chips {
        margin-top: 0;

        gap: 7px;
    }

    .count {
        margin-left: auto;

        font-size: var(--text-num-sm);

        font-weight: 400;

        color: var(--ink-soft);
    }

    .cards {
        display: grid;

        grid-template-columns: repeat(3, minmax(0, 1fr));

        gap: 12px;

        margin-top: 14px;
    }

    /* Las veintiuna a la vez: el "＋ N más" es del móvil. */
    .cards.collapsed > *:nth-child(n + 5):not(.moreCard) {
        display: block;
    }

    .moreCard {
        display: none;
    }

    .footnote {
        margin-top: 20px;
    }
}

/* La rejilla del diseño: los dos rankings al lado de las cifras y cuatro
   tarjetas por fila. */
@media (min-width: 1200px) {
    .summary,
    .pair {
        grid-template-columns: minmax(0, 1fr) 420px;
    }

    .cards {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>
