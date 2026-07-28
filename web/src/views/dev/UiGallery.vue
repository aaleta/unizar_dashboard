<script setup>

/**
 * Galería de primitivas. Solo existe en desarrollo (ver router/index.js).
 *
 * Sirve para dos cosas que salen caras si se dejan para el final:
 *
 *   1. Comparar contra el prototipo sin tener que navegar por media web ni
 *      esperar a que la pantalla que usa un componente esté terminada.
 *   2. Ver los seis tramos de la rampa JUNTOS. Por separado todos parecen
 *      correctos; en fila se nota si dos son casi el mismo color o si el salto
 *      entre dos tramos es más brusco que el resto.
 *
 * No se traduce a producción ni se enlaza desde ninguna parte.
 */

import { ref } from "vue";

import UiCard from "@/components/ui/UiCard.vue";
import UiCallout from "@/components/ui/UiCallout.vue";
import UiChip from "@/components/ui/UiChip.vue";
import UiCountBar from "@/components/ui/UiCountBar.vue";
import UiDifficultyDot from "@/components/ui/UiDifficultyDot.vue";
import UiKpiCard from "@/components/ui/UiKpiCard.vue";
import UiLinkRow from "@/components/ui/UiLinkRow.vue";
import UiPill from "@/components/ui/UiPill.vue";
import UiSearchField from "@/components/ui/UiSearchField.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader.vue";
import UiSortHeader from "@/components/ui/UiSortHeader.vue";
import UiStat from "@/components/ui/UiStat.vue";

import { difficultyRamp, difficultyInk } from "@/theme/difficulty";
import { GRADE_COLORS } from "@/theme/gradePalette";

/** Un valor dentro de cada tramo, para verlos todos a la vez. */
const RAMP_SAMPLES = [61, 38, 27, 18, 11, null];

const SORT_METRICS = [
    { key: "noSuperacion", label: "No superan" },
    { key: "enrolment", label: "Matr." }
];

const search = ref("");
const filter = ref("todas");
const sortKey = ref("noSuperacion");

</script>

<template>

<main class="gallery">

    <header class="intro">
        <h1>Primitivas</h1>
        <p>
            Solo en desarrollo. Comparar con
            <code>design_handoff_physics_mobile/prototype/</code>.
        </p>
    </header>

    <section>

        <h2>Rampa de dificultad</h2>

        <p class="note">
            El único color que codifica una magnitud. De más dura a más
            asequible, más el caso «sin datos». Las dos columnas de la derecha
            son el mismo dato con el tono grande (handoff) y el pequeño
            (oscurecido hasta AA) — comprobar que el pequeño se lee.
        </p>

        <UiCard>
            <div
                v-for="(band, index) in difficultyRamp"
                :key="band.label"
                class="rampRow"
            >
                <UiDifficultyDot :value="RAMP_SAMPLES[index]" />
                <span class="rampLabel">{{ band.label }}</span>
                <span class="rampFrom num">≥ {{ band.from }}%</span>
                <span
                    class="rampBig num"
                    :style="{ color: difficultyInk(RAMP_SAMPLES[index]) }"
                >
                    {{ RAMP_SAMPLES[index] }}%
                </span>
                <span
                    class="rampValue num"
                    :style="{ color: difficultyInk(RAMP_SAMPLES[index], true) }"
                >
                    {{ RAMP_SAMPLES[index] }}%
                </span>
            </div>
            <div class="rampRow">
                <UiDifficultyDot :value="null" />
                <span class="rampLabel">sin datos</span>
                <span class="rampFrom num">—</span>
                <span class="rampBig num">—</span>
                <span class="rampValue num">—</span>
            </div>
        </UiCard>

    </section>

    <section>

        <h2>Punto: troncal vs. optativa</h2>

        <p class="note">
            El color dice cuánto cuesta; la forma, si es obligatoria. Relleno =
            troncal, anillo = optativa.
        </p>

        <UiCard>
            <div class="dotRow">
                <UiDifficultyDot
                    v-for="value in RAMP_SAMPLES"
                    :key="`solid-${value}`"
                    :value="value"
                />
            </div>
            <div class="dotRow">
                <UiDifficultyDot
                    v-for="value in RAMP_SAMPLES"
                    :key="`hollow-${value}`"
                    :value="value"
                    hollow
                />
            </div>
        </UiCard>

    </section>

    <section>

        <h2>Paleta de calificaciones</h2>

        <p class="note">
            Categórica, no una escala: «no presentado» no es menos que
            «suspenso». Solo se usa en la barra apilada de la ficha.
        </p>

        <UiCard>
            <div class="stack">
                <div
                    v-for="(color, key) in GRADE_COLORS"
                    :key="key"
                    class="stackSlice"
                    :style="{ background: color }"
                ></div>
            </div>
            <div class="legend">
                <span
                    v-for="(color, key) in GRADE_COLORS"
                    :key="key"
                    class="legendItem"
                >
                    <span
                        class="legendDot"
                        :style="{ background: color }"
                    ></span>
                    {{ key }}
                </span>
            </div>
        </UiCard>

    </section>

    <section>

        <h2>Recuentos</h2>

        <p class="note">
            Siempre gris. Una cantidad no es una dificultad.
        </p>

        <UiCard>
            <UiCountBar
                label="Gravitación y cosmología"
                :value="58"
                :max="58"
                display="58"
            />
            <UiCountBar
                label="Caos y sist. dinámicos"
                :value="56"
                :max="58"
                display="56"
            />
            <UiCountBar
                label="Astronomía y astrofísica"
                :value="47"
                :max="58"
                display="47"
            />
        </UiCard>

    </section>

    <section>

        <h2>Tarjetas</h2>

        <div class="cards">
            <UiCard>Troncal · sólida</UiCard>
            <UiCard variant="dashed">Optativa · discontinua</UiCard>
            <UiCard variant="structural">Estructural · contexto</UiCard>
        </div>

    </section>

    <section>

        <h2>Avisos</h2>

        <div class="cards">

            <UiCallout
                tone="hard"
                title="La troncal más dura del grado ahora mismo"
            >
                1ª de 12 troncales de 1º por no superación — y la tendencia
                empeora.
            </UiCallout>

            <UiCallout tone="structural">
                6 troncales · aprueban <strong>94%</strong> de media · el curso
                más amable.
            </UiCallout>

            <UiCallout tone="attention">
                Menos de 10 alumnos: los porcentajes bailan mucho.
            </UiCallout>

        </div>

    </section>

    <section>

        <h2>Indicadores</h2>

        <div class="kpis">
            <UiKpiCard
                label="No superan"
                value="61%"
                :delta="19"
                :higher-is-better="false"
                tone="difficulty"
                :difficulty-value="61"
                reference="vs. media de 3 cursos"
            />
            <UiKpiCard
                label="Aprueban"
                value="39%"
                :delta="-18"
                reference="vs. media de 3 cursos"
            />
            <UiKpiCard
                label="Convocatorias"
                value="1,57"
                :delta="null"
                reference="dato oficial"
            />
            <UiKpiCard
                label="Matriculados"
                value="139"
                :delta="0.2"
                delta-unit="pp"
                reference="media 3 cursos: 127"
            />
        </div>

    </section>

    <section>

        <h2>Etiquetas y cabeceras</h2>

        <UiCard>

            <div class="inline">
                <UiPill>TRONCAL</UiPill>
                <UiPill>1º CURSO</UiPill>
                <UiPill tone="neutral">CÓD. 26907</UiPill>
                <UiPill tone="verd">OPTATIVA</UiPill>
            </div>

            <div class="spacer"></div>

            <UiSectionHeader
                label="Troncales"
                :count="12"
                hint="% que no aprueba"
            />

            <div class="spacer"></div>

            <UiSectionHeader
                label="Optativas"
                :count="21"
                tone="verd"
            />

            <div class="spacer"></div>

            <div class="inline">
                <UiStat
                    value="21"
                    label="optativas"
                    tone="verd"
                />
                <UiStat
                    value="528"
                    label="matrículas al año"
                />
                <UiStat
                    value="96%"
                    label="aprueban de media"
                />
            </div>

        </UiCard>

    </section>

    <section>

        <h2>Controles</h2>

        <UiSearchField
            v-model="search"
            placeholder="Buscar entre 54 asignaturas…"
        />

        <div class="inline chips">
            <UiChip
                v-for="option in ['todas', 'troncales', 'optativas']"
                :key="option"
                :active="filter === option"
                @click="filter = option"
            >
                {{ option }}
            </UiChip>
        </div>

        <p class="note">
            Filtro activo: <strong>{{ filter }}</strong> · búsqueda:
            <strong>{{ search || "—" }}</strong>
        </p>

        <UiSortHeader
            :metrics="SORT_METRICS"
            :active-key="sortKey"
            @sort="sortKey = $event"
        />

    </section>

    <section>

        <h2>Filas</h2>

        <div class="rows">

            <UiLinkRow to="/">
                <template #lead>
                    <UiDifficultyDot :value="53" />
                </template>
                Álgebra II
                <template #trail>
                    <span
                        class="num"
                        :style="{ color: difficultyInk(53, true) }"
                    >53%</span>
                </template>
            </UiLinkRow>

            <UiLinkRow
                to="/"
                variant="dashed"
            >
                <template #lead>
                    <UiDifficultyDot
                        :value="9"
                        hollow
                    />
                </template>
                Astronomía y astrofísica
                <template #trail>
                    <span
                        class="num"
                        :style="{ color: difficultyInk(9, true) }"
                    >9%</span>
                </template>
            </UiLinkRow>

            <UiLinkRow
                to="/"
                variant="plain"
                selected
                chevron
            >
                Jesús Gómez Gardeñes
            </UiLinkRow>

            <UiLinkRow
                to="/"
                variant="plain"
                chevron
            >
                Luis Miguel García Vinuesa
            </UiLinkRow>

        </div>

    </section>

</main>

</template>

<style scoped>

.gallery{

    max-width:var(--content-max);

    margin:0 auto;

    padding:24px var(--gutter) 64px;

    display:flex;

    flex-direction:column;

    gap:26px;

}

.intro h1{

    margin:0 0 4px;

    font-family:var(--font-serif);

    font-size:var(--text-h1);

    font-weight:700;

}

.intro p{

    margin:0;

    font-size:var(--text-body-sm);

    color:var(--ink-muted);

}

code{

    font-family:var(--font-sans);

    font-size:var(--text-num-sm);

}

h2{

    margin:0 0 6px;

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

}

.note{

    margin:0 0 10px;

    font-size:var(--text-body-xs);

    color:var(--ink-soft);

    line-height:var(--leading-snug);

}

.rampRow{

    display:flex;

    align-items:center;

    gap:9px;

    padding:5px 0;

}

.rampRow + .rampRow{

    border-top:1px solid var(--line-inner);

}

.rampLabel{

    flex:1;

    font-size:var(--text-body-sm);

}

.rampFrom{

    font-size:var(--text-num-sm);

    font-weight:400;

    color:var(--ink-faint);

    width:52px;

    text-align:right;

}

.rampBig{

    font-size:var(--text-kpi);

    width:64px;

    text-align:right;

    line-height:var(--leading-none);

    color:var(--ink-faint);

}

.rampValue{

    font-size:var(--text-num);

    width:42px;

    text-align:right;

    color:var(--ink-faint);

}

.dotRow{

    display:flex;

    align-items:center;

    gap:14px;

    padding:6px 0;

}

.stack{

    display:flex;

    height:18px;

    border-radius:var(--radius-sm);

    overflow:hidden;

}

.stackSlice{

    flex:1;

}

.legend{

    display:flex;

    flex-wrap:wrap;

    gap:10px;

    margin-top:9px;

}

.legendItem{

    display:inline-flex;

    align-items:center;

    gap:5px;

    font-family:var(--font-sans);

    font-size:var(--text-eyebrow);

    color:var(--ink-muted);

}

.legendDot{

    width:8px;

    height:8px;

    border-radius:var(--radius-xs);

}

.cards,
.rows{

    display:flex;

    flex-direction:column;

    gap:9px;

}

.kpis{

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:var(--gap-card);

}

.inline{

    display:flex;

    flex-wrap:wrap;

    align-items:center;

    gap:22px;

}

.inline.chips{

    gap:6px;

    margin:10px 0;

}

.spacer{

    height:14px;

}

</style>
