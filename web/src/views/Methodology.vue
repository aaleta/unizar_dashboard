<script setup>

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

/**
 * Glosario, fuentes y advertencias. Sin esta página los porcentajes son cifras
 * sin contrato: nadie puede saber qué se divide entre qué, ni con qué datos.
 */

const metrics = Object.values(METRICS);

/**
 * El desacuerdo entre nuestras tasas y las oficiales, calculado y no escrito a
 * mano: la Universidad republica los datos y las cifras de esta advertencia
 * cambian con ellos.
 */
const agreement = officialAgreement(latestOfficialYear);

const firstYear = academicYears[0];

const lastYear = academicYears[academicYears.length - 1];

</script>

<template>

<main class="page">

    <header class="hero">

        <h1>Metodología y fuentes</h1>

        <p>
            Qué significa cada indicador, de dónde salen los datos y qué
            limitaciones tienen. Si una cifra de esta web no cuadra con otra
            que hayas visto, la explicación suele estar aquí.
        </p>

    </header>

    <section class="section">

        <h2>Cómo se calcula</h2>

        <p class="lead">
            Todos los indicadores parten de tres recuentos por asignatura y
            curso académico:
        </p>

        <ul class="definitions">

            <li>
                <strong>Matriculados</strong>: todos los alumnos con matrícula
                en la asignatura, se presenten o no.
            </li>

            <li>
                <strong>Presentados</strong>: los que se presentan al menos a
                una convocatoria, es decir, matriculados menos no presentados.
            </li>

            <li>
                <strong>Superados</strong>: los que aprueban, sumando aprobados,
                notables, sobresalientes y matrículas de honor.
            </li>

        </ul>

        <p class="lead">
            A partir de ahí, cada tasa usa un denominador distinto. Es el punto
            donde más fácil resulta comparar peras con manzanas, así que en toda
            la web se indica siempre cuál se está usando:
        </p>

        <div class="tableWrapper">

            <table>

                <thead>
                    <tr>
                        <th scope="col">Indicador</th>
                        <th scope="col">Definición</th>
                        <th scope="col">Se divide entre</th>
                    </tr>
                </thead>

                <tbody>

                    <tr
                        v-for="metric in metrics"
                        :key="metric.key"
                    >
                        <th scope="row">{{ metric.label }}</th>
                        <td>{{ metric.definition }}</td>
                        <td class="base">{{ BASES[metric.base].label }}</td>
                    </tr>

                </tbody>

            </table>

        </div>

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

    <section class="section">

        <h2>Fuentes</h2>

        <div class="sources">

            <article
                v-for="source in DATA_SOURCES"
                :key="source.key"
                class="source"
            >

                <h3>{{ source.label }}</h3>

                <p>{{ source.description }}</p>

                <dl>

                    <div>
                        <dt>Último curso disponible</dt>
                        <dd>{{ source.ultimo_curso }}</dd>
                    </div>

                    <div v-if="source.actualizado">
                        <dt>Fecha de publicación</dt>
                        <dd>{{ source.actualizado }}</dd>
                    </div>

                </dl>

                <a
                    :href="source.fuente"
                    target="_blank"
                    rel="noopener"
                >
                    Ir a la fuente original →
                </a>

            </article>

        </div>

    </section>

    <section class="section">

        <h2>Limitaciones</h2>

        <ul class="caveats">

            <li>
                <strong>Cohortes pequeñas.</strong>
                Algunas optativas tienen menos de {{ MIN_COHORT }} matriculados.
                Ahí un solo alumno mueve el porcentaje más de diez puntos, así
                que esas asignaturas se marcan con ⚠ y conviene mirar los
                recuentos absolutos en lugar de las tasas.
            </li>

            <li>
                <strong>No presentarse no es suspender.</strong>
                La tasa de no superación mete en el mismo saco a quien suspende
                y a quien ni se presenta. Son situaciones distintas: en los
                últimos cursos del grado es habitual matricularse y dejar la
                asignatura para más adelante. Por eso cada asignatura muestra
                también el porcentaje de no presentados por separado.
            </li>

            <li>
                <strong>Los cursos de la pandemia.</strong>
                Los datos abarcan de {{ firstYear }} a {{ lastYear }}, e incluyen
                los cursos afectados por la COVID-19, con evaluación
                excepcional. Las series temporales presentan ahí anomalías que
                no responden a cambios reales de dificultad.
            </li>

            <li>
                <strong>Cambios de plan y de nombre.</strong>
                Las asignaturas se identifican por su código. Si una cambia de
                nombre o de plan, su serie histórica puede partirse o mezclarse
                con la de la asignatura que la sustituye.
            </li>

            <li>
                <strong>Las tasas oficiales no cubren todas las asignaturas
                todos los años.</strong>
                Los datos abiertos de rendimiento van de
                {{ officialYears[0] }} a {{ latestOfficialYear }}, pero una
                optativa que no se oferta un curso no aparece ese año. La media
                de convocatorias consumidas procede de ahí: cuando falta, se
                indica el curso del que sí hay dato.
            </li>

            <li>
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
                desacuerdo aparece en los doce. Alguna fila oficial es incluso
                incoherente consigo misma (declara un 100 % de rendimiento con
                16 alumnos superados de 17). Se ha optado por una sola fuente
                para las tasas —el reparto de calificaciones, que sí es
                internamente consistente— y usar los datos oficiales únicamente
                para la media de convocatorias, que no puede deducirse de las
                notas.
            </li>

            <li>
                <strong>Esto no evalúa a nadie.</strong>
                Los indicadores describen resultados académicos agregados. No
                miden la calidad de la docencia ni el desempeño del profesorado:
                una asignatura difícil puede estar excelentemente impartida.
            </li>

        </ul>

    </section>

</main>

</template>

<style scoped>

.page{

    /* Sin barra lateral: el hueco de 220px ya no reserva nada. */
    margin-left:0;

    width:calc(100% - 220px);

    min-height:100vh;

    padding:50px;

    box-sizing:border-box;

    background:#0f172a;

    color:white;

}

.hero{

    max-width:820px;

    margin-bottom:44px;

}

.hero h1{

    margin:0 0 12px;

    font-size:2.6rem;

}

.hero p{

    margin:0;

    color:#94a3b8;

    font-size:1.05rem;

    line-height:1.7;

}

.section{

    max-width:960px;

    margin-bottom:52px;

}

.section h2{

    margin:0 0 18px;

    font-size:1.5rem;

    color:#38bdf8;

}

.lead{

    margin:0 0 16px;

    color:#cbd5e1;

    line-height:1.7;

}

.definitions{

    margin:0 0 22px;

    padding-left:22px;

    color:#cbd5e1;

    line-height:1.8;

}

.definitions strong,
.caveats strong,
.note strong{

    color:white;

}

.tableWrapper{

    overflow-x:auto;

    border:1px solid rgba(255,255,255,.08);

    border-radius:14px;

    background:#1e293b;

}

table{

    width:100%;

    border-collapse:collapse;

    font-size:.9rem;

}

thead th{

    padding:13px 14px;

    background:#172033;

    color:#94a3b8;

    font-size:.72rem;

    font-weight:700;

    text-transform:uppercase;

    letter-spacing:.5px;

    text-align:left;

    white-space:nowrap;

}

tbody th,
tbody td{

    padding:13px 14px;

    text-align:left;

    vertical-align:top;

    color:#cbd5e1;

    font-weight:500;

    line-height:1.6;

    border-top:1px solid rgba(255,255,255,.06);

}

tbody th{

    color:white;

    font-weight:600;

    white-space:nowrap;

}

.base{

    color:#7dd3fc;

    white-space:nowrap;

}

.note{

    margin:18px 0 0;

    color:#94a3b8;

    font-size:.9rem;

    line-height:1.7;

}

.sources{

    display:grid;

    grid-template-columns:repeat(auto-fit,minmax(300px,1fr));

    gap:20px;

}

.source{

    display:flex;

    flex-direction:column;

    gap:12px;

    padding:22px;

    border-radius:16px;

    background:#1e293b;

    border:1px solid rgba(255,255,255,.08);

}

.source h3{

    margin:0;

    font-size:1.05rem;

}

.source p{

    margin:0;

    color:#94a3b8;

    font-size:.88rem;

    line-height:1.6;

}

.source dl{

    display:flex;

    flex-wrap:wrap;

    gap:18px;

    margin:0;

}

.source dt{

    color:#64748b;

    font-size:.7rem;

    text-transform:uppercase;

    letter-spacing:.5px;

    font-weight:600;

}

.source dd{

    margin:3px 0 0;

    color:white;

    font-weight:600;

    font-variant-numeric:tabular-nums;

}

.source a{

    margin-top:auto;

    color:#38bdf8;

    text-decoration:none;

    font-size:.85rem;

    font-weight:600;

}

.source a:hover{

    text-decoration:underline;

}

.caveats{

    margin:0;

    padding-left:22px;

    color:#cbd5e1;

    line-height:1.8;

}

.caveats li{

    margin-bottom:16px;

}

@media(max-width:768px){

    .page{

        margin-left:0;

        width:100%;

        padding:24px 16px 90px;

    }

    .hero h1{

        font-size:1.9rem;

    }

}

</style>
