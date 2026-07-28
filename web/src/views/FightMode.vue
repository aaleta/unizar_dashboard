<script setup>

/**
 * Fight Mode. La broma de la casa, con los datos en serio.
 *
 * El verdín marca al ganador, igual que marca lo elegible en el resto de la
 * web: no codifica ninguna magnitud, solo dice "esta gana". El azul sigue
 * siendo estructura —el medallón VS, los nombres de las columnas— y las cifras
 * de dificultad siguen subiendo por la rampa, igual que en cualquier otra
 * pantalla.
 *
 * Que sea un juego no autoriza a mentir: si falta un dato el duelo queda en
 * empate en vez de inventarse un ganador.
 */

import { computed, ref } from "vue";

import { useFight } from "@/composables/useFight";
import { allSubjects, subjectName } from "@/utils/metrics";
import { difficultyInk } from "@/theme/difficulty";

/** Física computacional contra el TFG: un duelo con algo que mirar. */
const DEFAULTS = [26918, 26931];

const firstCode = ref(DEFAULTS[0]);
const secondCode = ref(DEFAULTS[1]);

const { first, second, duels, verdict, bothOptional } = useFight(
    () => firstCode.value,
    () => secondCode.value
);

/** El catálogo ordenado, para los dos selectores. */
const options = computed(() =>
    [...allSubjects]
        .map(subject => ({
            code: subject.code,
            name: subjectName(subject.code)
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
);

const swap = () => {
    const previous = firstCode.value;
    firstCode.value = secondCode.value;
    secondCode.value = previous;
};

/** La cifra de dificultad se pinta con la rampa; el resto, en tinta normal. */
const valueColor = (duel, side) => {

    if (duel.key !== "noSuperacion") return "var(--ink)";

    // Celdas de 15,5px: por debajo de "texto grande", hace falta 4,5:1.
    return difficultyInk(side === 1 ? duel.first : duel.second, true);

};

</script>

<template>

<div class="screen">

    <header class="intro">
        <h1>Fight Mode</h1>
        <p>
            Mejor comparar asignaturas del mismo tipo: optativas con
            optativas, troncales con troncales.
        </p>
    </header>

    <!-- Contendientes ------------------------------------------------- -->
    <div class="fighters">

        <label class="fighter">
            <span class="fighterName">{{ first.name }}</span>
            <span class="fighterMeta num">{{ first.label }}</span>
            <span class="fighterPick">cambiar ▾</span>
            <select
                v-model.number="firstCode"
                aria-label="Primera asignatura"
            >
                <option
                    v-for="option in options"
                    :key="option.code"
                    :value="option.code"
                >{{ option.name }}</option>
            </select>
        </label>

        <button
            type="button"
            class="medallion"
            title="Intercambiar"
            aria-label="Intercambiar las dos asignaturas"
            @click="swap"
        >VS</button>

        <label class="fighter">
            <span class="fighterName">{{ second.name }}</span>
            <span class="fighterMeta num">{{ second.label }}</span>
            <span class="fighterPick">cambiar ▾</span>
            <select
                v-model.number="secondCode"
                aria-label="Segunda asignatura"
            >
                <option
                    v-for="option in options"
                    :key="option.code"
                    :value="option.code"
                >{{ option.name }}</option>
            </select>
        </label>

    </div>

    <!-- Veredicto ----------------------------------------------------- -->
    <div
        v-if="verdict"
        class="verdict"
        :class="{ tie: verdict.tie }"
    >

        <span
            class="trophy"
            aria-hidden="true"
        >{{ verdict.tie ? "=" : "★" }}</span>

        <div>
            <div class="verdictText">
                {{ verdict.text }}
                <span
                    v-if="verdict.score"
                    class="num verdictScore"
                >· {{ verdict.score }}</span>
            </div>
            <div class="verdictDetail">{{ verdict.detail }}</div>
        </div>

    </div>

    <p
        v-else
        class="sameSubject"
    >
        Es la misma asignatura en los dos lados. Elige otra para que haya
        combate.
    </p>

    <!-- Duelos -------------------------------------------------------- -->
    <div class="duels">

        <div class="duelRow heads">
            <span class="head">{{ first.name }}</span>
            <span></span>
            <span class="head">{{ second.name }}</span>
        </div>

        <div
            v-for="duel in duels"
            :key="duel.key"
            class="duelRow"
        >

            <span
                class="cell"
                :class="{ won: duel.winner === 1 }"
            >
                <span
                    class="num cellValue"
                    :style="{ color: valueColor(duel, 1) }"
                >{{ duel.format(duel.first) }}</span>
                <span
                    v-if="duel.winner === 1"
                    class="cellWin"
                >gana</span>
            </span>

            <span class="duelLabel">{{ duel.label }}</span>

            <span
                class="cell"
                :class="{ won: duel.winner === 2 }"
            >
                <span
                    class="num cellValue"
                    :style="{ color: valueColor(duel, 2) }"
                >{{ duel.format(duel.second) }}</span>
                <span
                    v-if="duel.winner === 2"
                    class="cellWin"
                >gana</span>
            </span>

        </div>

    </div>

    <p class="footnote">
        Medias ponderadas de los últimos 3 cursos.
        <template v-if="bothOptional">
            Los matriculados solo se comparan entre optativas.
        </template>
        <template v-else>
            Los matriculados solo se comparan cuando las dos son optativas: la
            popularidad de una troncal no dice nada, la cursa todo el mundo.
        </template>
    </p>

</div>

</template>

<style scoped>

.screen{

    padding:16px var(--gutter) 8px;

}

.intro{

    text-align:center;

}

h1{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-h1-lg);

    font-weight:700;

}

.intro p{

    margin:5px 0 0;

    font-size:var(--text-body-sm);

    color:var(--ink-soft);

}

/* Contendientes -------------------------------------------------------- */

.fighters{

    display:flex;

    align-items:stretch;

    gap:9px;

    margin-top:14px;

}

.fighter{

    position:relative;

    flex:1;

    min-width:0;

    padding:13px 12px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    text-align:center;

}

/* El <select> cubre toda la tarjeta y va invisible: el control es nativo
   —teclado, lector de pantalla y rueda del sistema gratis— pero lo que se ve
   es la tarjeta del diseño. */
.fighter select{

    position:absolute;

    inset:0;

    width:100%;

    height:100%;

    opacity:0;

    cursor:pointer;

}

.fighterName{

    display:block;

    font-family:var(--font-serif);

    font-size:var(--text-card-title);

    font-weight:600;

    line-height:var(--leading-tight);

}

.fighterMeta{

    display:block;

    margin-top:4px;

    font-size:var(--text-eyebrow-sm);

    font-weight:400;

    text-transform:uppercase;

    color:var(--ink-soft);

}

.fighterPick{

    display:block;

    margin-top:9px;

    font-size:var(--text-num-sm);

    font-weight:600;

    color:var(--navy);

}

/* El medallón VS: la única sombra fuerte de la web. Y sirve para algo —
   intercambia los lados— en vez de ser solo un adorno. */
.medallion{

    flex:none;

    align-self:center;

    width:44px;

    height:44px;

    border:none;

    border-radius:var(--radius-dot);

    background:var(--navy);

    /* El VS no es un ganador, así que no lleva verdín: es el rótulo de un
       medallón y va en el blanco de la banda. */
    color:var(--ink-on-navy);

    font-family:var(--font-serif);

    font-size:var(--text-lead);

    font-weight:700;

    box-shadow:var(--shadow-medallion);

    cursor:pointer;

}

.medallion:active{

    transform:scale(.94);

}

/* Veredicto ------------------------------------------------------------ */

.verdict{

    display:flex;

    align-items:center;

    gap:11px;

    margin-top:14px;

    padding:12px 14px;

    background:var(--verd-wash);

    border:1px solid var(--verd-line);

    border-radius:var(--radius-card-lg);

}

.verdict.tie{

    background:var(--navy-wash);

    border-color:var(--navy-wash-line);

}

.trophy{

    display:flex;

    align-items:center;

    justify-content:center;

    width:34px;

    height:34px;

    flex:none;

    border-radius:var(--radius-dot);

    background:var(--verd);

    /* Blanco sobre verdín, no tinta: el verdín es lo bastante oscuro para
       sostener texto claro (4,7:1) y la tinta encima se quedaría en 2,4:1. */
    color:var(--ink-on-navy);

    font-size:var(--text-metric);

}

.verdict.tie .trophy{

    background:var(--navy);

}

.verdictText{

    font-size:var(--text-body);

    font-weight:700;

    line-height:var(--leading-snug);

    color:var(--verd-strong);

}

.verdict.tie .verdictText{

    color:var(--navy);

}

.verdictScore{

    font-size:var(--text-num);

}

.verdictDetail{

    margin-top:2px;

    font-size:var(--text-caption);

    line-height:var(--leading-snug);

    color:var(--verd-soft);

}

.verdict.tie .verdictDetail{

    color:var(--navy-soft);

}

.sameSubject{

    margin:14px 0 0;

    padding:12px 14px;

    background:var(--navy-wash);

    border:1px solid var(--navy-wash-line);

    border-radius:var(--radius-card-lg);

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--navy-soft);

}

/* Duelos --------------------------------------------------------------- */

.duels{

    margin-top:16px;

}

.duelRow{

    display:grid;

    grid-template-columns:1fr 90px 1fr;

    gap:8px;

    align-items:center;

}

.duelRow + .duelRow{

    margin-top:9px;

}

.heads{

    margin-bottom:10px;

}

.head{

    font-family:var(--font-sans);

    font-size:var(--text-eyebrow);

    font-weight:600;

    color:var(--navy);

    text-align:center;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}

.cell{

    display:block;

    padding:10px 6px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    text-align:center;

}

.cell.won{

    background:var(--verd-wash);

    border:1px solid var(--verd);

}

.cellValue{

    font-size:var(--text-metric);

}

.cellWin{

    display:block;

    margin-top:1px;

    font-size:var(--text-micro);

    font-weight:600;

    color:var(--verd-ink);

}

.duelLabel{

    font-size:var(--text-nav);

    line-height:var(--leading-snug);

    text-align:center;

    color:var(--ink-muted);

}

.footnote{

    margin:16px 0 0;

    padding-top:12px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-sans);

    font-size:var(--text-footnote);

    line-height:var(--leading-relaxed);

    color:var(--ink-faint);

}

</style>
