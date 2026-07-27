<script setup>

/**
 * El calendario de exámenes: una cuadrícula mensual por convocatoria.
 *
 * La pregunta de quien mira esta vista no es "¿qué día cae cada examen?"
 * sino "¿me queda aire entre uno y otro?", y eso lo responde la geometría
 * del mes: dos celdas marcadas pared con pared se ven antes que dos fechas
 * en una lista. Cada convocatoria tiene su propio calendario porque los
 * huecos solo significan algo dentro del mismo periodo de exámenes.
 *
 * Debajo de cada mes va la leyenda día → asignatura: una celda marcada dice
 * CUÁNDO, pero no QUÉ, y en una celda de 40px no cabe un nombre.
 *
 * El día con un examen se marca en navy (estructura); el día con dos
 * asignaturas es un choque y pasa al tono de aviso, como en el resto de la
 * pantalla.
 */

defineProps({

    // De useSchedule.examPeriods: { tab, label ("E1"), span ("dic 2026 –
    // ene 2027"), months: [{ key, label, weeks, days }] }
    periods: {
        type: Array,
        required: true
    }

});

const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

</script>

<template>

<div class="calendars">

    <section
        v-for="period in periods"
        :key="period.tab"
        class="period"
    >

        <div class="periodHead">
            <span class="periodName eyebrow">Convocatoria {{ period.label }}</span>
            <span class="rule"></span>
            <span class="periodSpan">{{ period.span }}</span>
        </div>

        <div
            v-for="month in period.months"
            :key="month.key"
            class="month"
        >

            <p class="monthName">{{ month.label }}</p>

            <div
                class="grid"
                role="img"
                :aria-label="`${month.label}: ${month.days.length} días con examen`"
            >

                <span
                    v-for="(letter, index) in WEEKDAY_LETTERS"
                    :key="'h' + index"
                    class="weekday"
                    :class="{ sunday: index === 6 }"
                >
                    {{ letter }}
                </span>

                <template
                    v-for="(week, weekIndex) in month.weeks"
                    :key="weekIndex"
                >
                    <span
                        v-for="(cell, cellIndex) in week"
                        :key="weekIndex + '-' + cellIndex"
                        class="cell"
                        :class="{
                            blank: cell === null,
                            sunday: cellIndex === 6,
                            exam: cell?.exams.length,
                            clash: cell?.clash
                        }"
                    >
                        <template v-if="cell !== null">
                            <span class="cellNum num">{{ cell.day }}</span>
                        </template>
                    </span>
                </template>

            </div>

            <!-- Leyenda: qué examen es cada día marcado -->
            <ul class="legend">
                <li
                    v-for="date in month.days"
                    :key="date.day"
                    class="legendRow"
                    :class="{ clash: date.clash }"
                >
                    <span class="legendDay num">{{ date.day }} {{ date.weekday }}</span>
                    <span class="legendNames">
                        {{ date.exams.map(exam => exam.name).join(" y ") }}<template
                            v-if="date.clash"
                        > ⚠</template>
                    </span>
                </li>
            </ul>

        </div>

    </section>

</div>

</template>

<style scoped>

.calendars{

    display:flex;

    flex-direction:column;

    gap:18px;

}

.periodHead{

    display:flex;

    align-items:center;

    gap:7px;

}

/* Más grande que un eyebrow normal: es el título de todo un bloque de
   calendarios, no el rótulo de una tarjeta. */
.periodName{

    font-size:var(--text-num);

    color:var(--navy);

}

.rule{

    flex:1;

    height:1px;

    background:var(--line-rule);

}

.periodSpan{

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    color:var(--ink-faint);

}

.month{

    margin-top:9px;

    padding:11px 12px 8px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    box-shadow:var(--shadow-card);

}

.month + .month{

    margin-top:var(--gap-card);

}

.monthName{

    margin:0 0 8px;

    font-family:var(--font-serif);

    font-size:var(--text-card-title);

    font-weight:600;

    color:var(--ink);

    text-transform:capitalize;

}

.grid{

    display:grid;

    grid-template-columns:repeat(7,1fr);

    gap:2px;

    /* Las casillas son cuadradas (aspect-ratio + max-height) y no llegan a
       llenar su columna: sin esto se pegan al borde izquierdo del carril y
       quedan descentradas respecto a su letra de cabecera. */
    justify-items:center;

}

.weekday{

    padding-bottom:3px;

    text-align:center;

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    font-weight:600;

    letter-spacing:.4px;

    color:var(--ink-soft);

}

.weekday.sunday{

    color:var(--ink-icon);

}

.cell{

    display:flex;

    align-items:center;

    justify-content:center;

    width:100%;

    max-width:40px;

    aspect-ratio:1;

    border-radius:7px;

    background:var(--paper);

}

.cell.blank{

    background:none;

}

/* Solo el domingo se apaga: es el único día en que nunca hay examen. El
   sábado es lectivo para exámenes y se pinta como cualquier otro día. Sin
   fondo, como los huecos fuera del mes, y con la cifra desvaída: una casilla
   que no puede recibir nada no debe parecer disponible. */
.cell.sunday:not(.blank){

    background:none;

}

.cell.sunday:not(.blank) .cellNum{

    color:var(--ink-icon);

    font-weight:400;

}

.cellNum{

    font-size:var(--text-num);

    font-weight:500;

    color:var(--ink-muted);

}

/* Día con examen: navy, estructura. */
.cell.exam{

    background:var(--navy);

}

.cell.exam .cellNum{

    font-weight:600;

    color:var(--ink-on-navy);

}

/* Día con dos asignaturas: el aviso de verdad. */
.cell.clash{

    background:var(--warn-title);

}

.legend{

    margin:8px 0 0;

    padding:6px 1px 0;

    border-top:1px solid var(--line-inner);

    list-style:none;

    display:flex;

    flex-direction:column;

    gap:3px;

}

.legendRow{

    display:flex;

    align-items:baseline;

    gap:8px;

}

.legendDay{

    flex:none;

    width:44px;

    font-size:var(--text-num-sm);

    color:var(--ink-soft);

}

.legendNames{

    min-width:0;

    font-size:var(--text-body-sm);

    font-weight:600;

    line-height:1.3;

    color:var(--ink-2);

}

.legendRow.clash .legendDay,
.legendRow.clash .legendNames{

    color:var(--warn-title);

}

</style>
