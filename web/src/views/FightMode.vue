<script setup>

/**
 * Fight Mode. La broma de la casa, con los datos en serio.
 *
 * El rojo marca al ganador, y aquí eso es todo lo que hace: no codifica
 * ninguna magnitud, solo dice "esta gana". El carbón sigue siendo estructura —el
 * * la tesela VS, los nombres de las columnas— y las cifras de dificultad siguen
 * subiendo por la rampa, igual que en cualquier otra pantalla.
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

    font-family:var(--font-display);

    font-size:var(--text-h1);

    font-weight:900;

    letter-spacing:var(--track-display-tight);

    text-transform:uppercase;

    line-height:.92;

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

    border:var(--rule-strong) solid var(--line);

    border-radius:0;

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

    font-family:var(--font-display);

    font-size:14.5px;

    font-weight:800;

    letter-spacing:-.015em;

    line-height:1.12;

}

.fighterMeta{

    display:block;

    margin-top:5px;

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow-sm);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--ink-soft);

}

.fighterPick{

    display:block;

    margin-top:10px;

    padding-top:8px;

    border-top:var(--rule) solid var(--line-inner);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--accent-ink);

}

/* La tesela VS: la única cosa de la pantalla con sombra, y es una sombra
   dura, de tinta desplazada. Y sirve para algo —intercambia los lados— en vez
   de ser solo un adorno. */
.medallion{

    flex:none;

    align-self:center;

    width:44px;

    height:44px;

    border:none;

    border-radius:0;

    background:var(--carbon);

    /* El rótulo va en papel y no en rojo: el rojo vivo sobre carbón se queda
       en 3,5:1 y esto es texto de 15px. El rojo entra por el canto inferior,
       que es donde no tiene que leerse nadie. */
    color:var(--on-carbon);

    border-bottom:3px solid var(--accent);

    font-family:var(--font-display);

    font-size:15px;

    font-weight:900;

    letter-spacing:-.03em;

    line-height:1;

    box-shadow:var(--shadow-medallion);

    cursor:pointer;

}

.medallion:active{

    transform:translate(3px,3px);

    box-shadow:none;

}

/* Veredicto ------------------------------------------------------------ */

.verdict{

    display:flex;

    align-items:center;

    gap:11px;

    margin-top:14px;

    padding:12px 14px;

    background:var(--accent-wash);

    border:var(--rule-strong) solid var(--accent-line);

    border-radius:0;

}

.verdict.tie{

    background:var(--carbon-wash);

    border-color:var(--carbon-wash-line);

}

.trophy{

    display:flex;

    align-items:center;

    justify-content:center;

    width:34px;

    height:34px;

    flex:none;

    border-radius:0;

    background:var(--accent);

    /* Papel sobre rojo, no carbón: el carbón sobre el rojo vivo se queda en
       3,5:1 y el papel llega a 4,8:1. */
    color:var(--on-carbon);

    font-size:16px;

}

.verdict.tie .trophy{

    background:var(--carbon);

    color:var(--on-carbon);

}

.verdictText{

    font-family:var(--font-display);

    font-size:13.5px;

    font-weight:800;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1.12;

    color:var(--accent-strong);

}

.verdict.tie .verdictText{

    color:var(--ink);

}

.verdictScore{

    font-size:var(--text-num);

}

.verdictDetail{

    margin-top:2px;

    font-size:10.5px;

    line-height:1.35;

    color:var(--accent-soft);

}

.verdict.tie .verdictDetail{

    color:var(--carbon-ink);

}

.sameSubject{

    margin:14px 0 0;

    padding:12px 14px;

    background:var(--carbon-wash);

    border:var(--rule-strong) solid var(--carbon-wash-line);

    border-radius:0;

    font-size:var(--text-body-xs);

    line-height:1.45;

    color:var(--carbon-ink);

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

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:.06em;

    text-transform:uppercase;

    color:var(--ink);

    text-align:center;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:ellipsis;

}

.cell{

    display:block;

    padding:10px 6px;

    background:var(--surface);

    border:var(--rule) solid var(--line);

    border-radius:0;

    text-align:center;

}

/* La ganadora no cambia de tamaño ni se ilumina: se entinta el marco. */
.cell.won{

    background:var(--accent-wash);

    border:var(--rule-strong) solid var(--accent);

}

.cellValue{

    font-size:var(--text-metric);

}

.cellWin{

    display:block;

    margin-top:2px;

    font-family:var(--font-mono);

    font-size:8px;

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--accent-ink);

}

.duelLabel{

    font-family:var(--font-mono);

    font-size:9px;

    letter-spacing:.04em;

    text-transform:uppercase;

    line-height:1.3;

    text-align:center;

    color:var(--ink-muted);

}

.footnote{

    margin:16px 0 0;

    padding-top:12px;

    border-top:var(--rule-strong) solid var(--line-rule);

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

</style>
