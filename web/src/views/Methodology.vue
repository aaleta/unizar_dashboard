<script setup>

/**
 * Metodología y fuentes: la página que hace verificable al resto.
 *
 * Sin esto los porcentajes son cifras sin contrato — nadie puede saber qué se
 * divide entre qué, ni con qué datos, ni desde cuándo.
 *
 * En el móvil la tabla ancha del escritorio se rompe en tarjetas apiladas. La
 * píldora del denominador va en navy porque es metadato estructural: dice
 * SOBRE QUÉ se calcula el indicador, no lo dura que es una asignatura.
 *
 * El texto es el mismo que tenía la web: es la parte que menos se debe tocar
 * al cambiar el diseño.
 */

import {
    METRICS,
    BASES,
    RECENT_YEARS,
    MIN_COHORT,
    academicYears,
    officialYears,
    officialAgreement,
    latestOfficialYear
} from "@/utils/metrics";

import { DATA_SOURCES } from "@/utils/dataSources";

import UiPill from "@/components/ui/UiPill.vue";

const metrics = Object.values(METRICS);

/**
 * El desacuerdo entre nuestras tasas y las oficiales, calculado y no escrito a
 * mano: la Universidad republica los datos y las cifras de esta advertencia
 * cambian con ellos.
 */
const agreement = officialAgreement(latestOfficialYear);

const firstYear = academicYears[0];

const lastYear = academicYears[academicYears.length - 1];

/** Los tres recuentos de los que sale todo lo demás. */
const COUNTS = [
    {
        label: "Matriculados",
        text: "Todos los alumnos con matrícula en la asignatura, se presenten o no."
    },
    {
        label: "Presentados",
        text: "Los que se presentan al menos a una convocatoria, es decir, "
            + "matriculados menos no presentados."
    },
    {
        label: "Superados",
        text: "Los que aprueban, sumando aprobados, notables, sobresalientes y "
            + "matrículas de honor."
    }
];

const LIMITS = [
    { glyph: "⚠", key: "cohortes" },
    { glyph: "≠", key: "noPre" },
    { glyph: "◷", key: "covid" },
    { glyph: "⇄", key: "planes" },
    { glyph: "◑", key: "oficiales" },
    { glyph: "≈", key: "fuentes" },
    { glyph: "◎", key: "nadie" }
];

</script>

<template>

<div class="screen">

    <header class="intro">

        <h1>Fuentes y metodología</h1>

        <p class="lead">
            Qué significa cada indicador, de dónde salen los datos y qué
            limitaciones tienen. Si una cifra de esta web no cuadra con otra que
            hayas visto, la explicación suele estar aquí.
        </p>

    </header>

    <!-- Cómo se calcula ------------------------------------------------ -->
    <section class="section">

        <h2>Cómo se calcula</h2>

        <p class="note">
            Todos los indicadores parten de tres recuentos por asignatura y
            curso académico:
        </p>

        <ol class="counts">
            <li
                v-for="(count, index) in COUNTS"
                :key="count.label"
            >
                <span
                    class="countNumber num"
                    aria-hidden="true"
                >{{ index + 1 }}</span>
                <span class="countBody">
                    <strong>{{ count.label }}</strong>
                    {{ count.text }}
                </span>
            </li>
        </ol>

        <p class="note">
            A partir de ahí, cada tasa usa un denominador distinto. Es el punto
            donde más fácil resulta comparar peras con manzanas, así que en toda
            la web se indica siempre cuál se está usando:
        </p>

        <ul class="indicators">
            <li
                v-for="metric in metrics"
                :key="metric.key"
            >
                <div class="indicatorHead">
                    <h3>{{ metric.label }}</h3>
                    <UiPill>÷ {{ BASES[metric.base].label.toLowerCase() }}</UiPill>
                </div>
                <p>{{ metric.definition }}</p>
            </li>
        </ul>

        <p class="note">
            Las tres primeras son la nomenclatura oficial de la Universidad de
            Zaragoza, de modo que los valores de esta web se pueden contrastar
            directamente con los informes de calidad del grado.
            La <strong>tasa de no superación</strong> es simplemente
            100 − tasa de rendimiento.
        </p>

        <p class="note">
            Cuando se agregan varias asignaturas o varios cursos, la media
            siempre está <strong>ponderada por número de matriculados</strong>:
            una asignatura de 120 alumnos pesa más que una de 6. Salvo que se
            indique otra cosa, el periodo agregado son los últimos
            {{ RECENT_YEARS }} cursos académicos con datos.
        </p>

    </section>

    <!-- Fuentes -------------------------------------------------------- -->
    <section class="section">

        <h2>Fuentes</h2>

        <ul class="sources">
            <li
                v-for="source in DATA_SOURCES"
                :key="source.key"
            >
                <h3>{{ source.label }}</h3>
                <p>{{ source.description }}</p>
                <div class="sourceMeta">
                    <span class="num">Último: {{ source.ultimo_curso }}</span>
                    <span
                        v-if="source.actualizado"
                        class="num"
                    >Publicado: {{ source.actualizado }}</span>
                </div>
                <a
                    :href="source.fuente"
                    target="_blank"
                    rel="noopener noreferrer"
                >Fuente →</a>
            </li>
        </ul>

    </section>

    <!-- Limitaciones --------------------------------------------------- -->
    <section class="section">

        <h2>Limitaciones</h2>

        <ul class="caveats">

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[0].glyph }}</span>
                <div>
                    <strong>Cohortes pequeñas.</strong>
                    Algunas optativas tienen menos de {{ MIN_COHORT }}
                    matriculados. Ahí un solo alumno mueve el porcentaje más de
                    diez puntos, así que esas asignaturas se marcan con ⚠ y
                    conviene mirar los recuentos absolutos en lugar de las tasas.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[1].glyph }}</span>
                <div>
                    <strong>No presentarse no es suspender.</strong>
                    La tasa de no superación mete en el mismo saco a quien
                    suspende y a quien ni se presenta. Son situaciones distintas:
                    en los últimos cursos del grado es habitual matricularse y
                    dejar la asignatura para más adelante. Por eso cada
                    asignatura muestra también el porcentaje de no presentados
                    por separado.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[2].glyph }}</span>
                <div>
                    <strong>Los cursos de la pandemia.</strong>
                    Los datos abarcan de {{ firstYear }} a {{ lastYear }}, e
                    incluyen los cursos afectados por la COVID-19, con evaluación
                    excepcional. Las series temporales presentan ahí anomalías
                    que no responden a cambios reales de dificultad.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[3].glyph }}</span>
                <div>
                    <strong>Cambios de plan y de nombre.</strong>
                    Las asignaturas se identifican por su código. Si una cambia
                    de nombre o de plan, su serie histórica puede partirse o
                    mezclarse con la de la asignatura que la sustituye.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[4].glyph }}</span>
                <div>
                    <strong>Las tasas oficiales no cubren todas las asignaturas
                    todos los años.</strong>
                    Los datos abiertos de rendimiento van de
                    {{ officialYears[0] }} a {{ latestOfficialYear }}, pero una
                    optativa que no se oferta un curso no aparece ese año. La
                    media de convocatorias consumidas procede de ahí: cuando
                    falta, se indica el curso del que sí hay dato.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[5].glyph }}</span>
                <div>
                    <strong>Las dos fuentes no siempre cuadran.</strong>
                    Todos los porcentajes de esta web se calculan a partir del
                    reparto de calificaciones, nunca mezclando fuentes. Al
                    contrastarlos con los datos abiertos del curso
                    {{ agreement.curso }}, {{ agreement.coinciden }} de
                    {{ agreement.comparables }} asignaturas coinciden hasta el
                    último decimal, pero en {{ agreement.difieren }} el número de
                    alumnos difiere en uno o dos, con diferencias de hasta
                    {{ Math.round(agreement.diferenciaMaxima) }} puntos en
                    asignaturas pequeñas. No es cosa de un curso suelto: el
                    desacuerdo aparece en los doce. Alguna fila oficial es
                    incluso incoherente consigo misma (declara un 100 % de
                    rendimiento con 16 alumnos superados de 17). Se ha optado por
                    una sola fuente para las tasas —el reparto de calificaciones,
                    que sí es internamente consistente— y usar los datos
                    oficiales únicamente para la media de convocatorias, que no
                    puede deducirse de las notas.
                </div>
            </li>

            <li>
                <span
                    class="glyph"
                    aria-hidden="true"
                >{{ LIMITS[6].glyph }}</span>
                <div>
                    <strong>Esto no evalúa a nadie.</strong>
                    Los indicadores describen resultados académicos agregados. No
                    miden la calidad de la docencia ni el desempeño del
                    profesorado: una asignatura difícil puede estar
                    excelentemente impartida. Tampoco miden la valía del
                    alumnado: una asignatura fácil también puede suspenderse.
                </div>
            </li>

        </ul>

    </section>

</div>

</template>

<style scoped>

.screen{

    padding:15px var(--gutter) 8px;

}

h1{

    margin:0 0 6px;

    font-family:var(--font-serif);

    font-size:var(--text-h1);

    font-weight:700;

    line-height:var(--leading-tight);

}

.lead{

    margin:0;

    font-size:var(--text-body);

    line-height:var(--leading-body);

    color:var(--ink-2);

}

.section{

    margin-top:var(--gap-section);

}

h2{

    margin:0 0 10px;

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

}

.note{

    margin:12px 0 0;

    font-size:var(--text-body-sm);

    line-height:var(--leading-body);

    color:var(--ink-2);

}

.note + .counts,
.note + .indicators{

    margin-top:10px;

}

/* Los tres recuentos --------------------------------------------------- */

.counts{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.counts li{

    display:flex;

    gap:10px;

    padding:11px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

}

.countNumber{

    flex:none;

    /* Azul y no verdín: numerar los tres recuentos es estructura del texto,
       y el verdín en esta web quiere decir "esto se elige". */
    color:var(--navy);

    font-size:var(--text-body);

}

.countBody{

    font-size:var(--text-body-sm);

    line-height:var(--leading-body);

    color:var(--ink-2);

}

.countBody strong{

    display:block;

    color:var(--ink);

}

/* Los siete indicadores ------------------------------------------------ */

.indicators{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.indicators li{

    padding:12px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

}

.indicatorHead{

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:9px;

}

h3{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-card-title);

    font-weight:600;

}

.indicators p{

    margin:5px 0 0;

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

/* Fuentes -------------------------------------------------------------- */

.sources{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.sources li{

    padding:13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

}

.sources p{

    margin:5px 0 0;

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

.sourceMeta{

    display:flex;

    flex-wrap:wrap;

    gap:12px;

    margin-top:8px;

    font-size:var(--text-eyebrow);

    color:var(--ink-soft);

}

.sources a{

    display:inline-flex;

    align-items:center;

    min-height:var(--touch-target);

    font-size:var(--text-body-xs);

    font-weight:600;

}

/* Limitaciones --------------------------------------------------------- */

.caveats{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.caveats li{

    display:flex;

    gap:11px;

    padding:12px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

.caveats strong{

    color:var(--ink);

}

.glyph{

    display:flex;

    align-items:center;

    justify-content:center;

    width:26px;

    height:26px;

    flex:none;

    border-radius:var(--radius-card);

    background:var(--navy-wash);

    color:var(--navy);

    font-size:var(--text-body);

}

</style>
