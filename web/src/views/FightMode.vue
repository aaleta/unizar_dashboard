<script setup>
/**
 * Fight Mode. La broma de la casa, con los datos en serio.
 *
 * El oro marca al ganador y es lo único que hace en toda la web: no codifica
 * ninguna magnitud, solo dice "esta gana". El navy sigue siendo estructura —el
 * medallón VS, los nombres de las columnas— y las cifras de dificultad siguen
 * subiendo por la rampa, igual que en cualquier otra pantalla.
 *
 * Que sea un juego no autoriza a mentir: si falta un dato el duelo queda en
 * empate en vez de inventarse un ganador.
 */

import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { useFight } from "@/composables/useFight";
import { weightedAverages } from "@/content/copy";
import { allSubjects, subjectName } from "@/utils/metrics";
import { difficultyInk } from "@/theme/difficulty";

/**
 * La balanza en equilibrio y la balanza vencida. Pasan por Vite para que se
 * versionen y se cacheen como el resto de los assets.
 */
import scalesBalanced from "@/assets/scales-balanced.svg";
import scalesTilted from "@/assets/scales-tilted.svg";

/** Física computacional contra el TFG: un duelo con algo que mirar. */
const DEFAULTS = [26918, 26931];

/**
 * La ficha de asignatura enlaza aquí con `?a=<código>`: "llevar a Fight Mode"
 * tiene que traerse la asignatura, o el atajo obliga a buscarla otra vez.
 */
const route = useRoute();

const requested = Number(route.query.a);

const valid = allSubjects.some(subject => subject.code === requested);

const firstCode = ref(valid ? requested : DEFAULTS[0]);

const secondCode = ref(
    valid && requested === DEFAULTS[1] ? DEFAULTS[0] : DEFAULTS[1]
);

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

/** La cifra de dificultad se pinta con la rampa; el resto, en tinta normal. */
const valueColor = (duel, side) => {
    // La fila que no compite se lee como lo que es: un dato de contexto.
    if (duel.competes === false) return "var(--ink-placeholder)";

    if (duel.key !== "noSuperacion") return "var(--ink)";

    // Celdas de 15,5px: por debajo de "texto grande", hace falta 4,5:1.
    return difficultyInk(side === 1 ? duel.first : duel.second, true);
};
</script>

<template>
    <div class="screen">
        <header class="intro">
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
                    >
                        {{ option.name }}
                    </option>
                </select>
            </label>

            <!-- La balanza cuenta el veredicto: en equilibrio si empatan o
             si es la misma asignatura, y vencida del lado que gana. El
             fichero está dibujado cayendo a la derecha; para el otro lado se
             refleja. Va como decoración —`alt` vacío— porque el resultado
             está escrito debajo, y el botón conserva su etiqueta: lo que hace
             al pulsarlo es intercambiar los dos lados. -->
            <button
                type="button"
                class="medallion"
                title="Intercambiar"
                aria-label="Intercambiar las dos asignaturas"
                @click="swap"
            >
                <img
                    class="scales"
                    :class="{ mirrored: verdict?.winner === 1 }"
                    :src="
                        verdict && !verdict.tie ? scalesTilted : scalesBalanced
                    "
                    alt=""
                />
            </button>

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
                    >
                        {{ option.name }}
                    </option>
                </select>
            </label>
        </div>

        <!-- Veredicto ----------------------------------------------------- -->
        <div v-if="verdict" class="verdict" :class="{ tie: verdict.tie }">
            <span class="trophy" aria-hidden="true">{{
                verdict.tie ? "=" : "★"
            }}</span>

            <div>
                <div class="verdictText">
                    {{ verdict.text }}
                    <span v-if="verdict.score" class="num verdictScore"
                        >· {{ verdict.score }}</span
                    >
                </div>
                <div class="verdictDetail">{{ verdict.detail }}</div>
            </div>
        </div>

        <p v-else class="sameSubject">
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
                :class="{ inert: duel.competes === false }"
            >
                <span class="cell" :class="{ won: duel.winner === 1 }">
                    <span
                        class="num cellValue"
                        :style="{ color: valueColor(duel, 1) }"
                        >{{ duel.format(duel.first) }}</span
                    >
                    <span v-if="duel.winner === 1" class="cellWin">gana</span>
                </span>

                <span class="duelLabel">
                    {{ duel.label }}
                    <span v-if="duel.note" class="num duelNote">{{
                        duel.note
                    }}</span>
                </span>

                <span class="cell" :class="{ won: duel.winner === 2 }">
                    <span
                        class="num cellValue"
                        :style="{ color: valueColor(duel, 2) }"
                        >{{ duel.format(duel.second) }}</span
                    >
                    <span v-if="duel.winner === 2" class="cellWin">gana</span>
                </span>
            </div>
        </div>

        <div class="foot">
            <p class="footnote">
                {{ weightedAverages() }}.
                <template v-if="bothOptional">
                    Los matriculados solo se comparan entre optativas.
                </template>
                <template v-else>
                    Los matriculados solo se comparan cuando las dos son
                    optativas: la popularidad de una troncal no dice nada, la
                    cursa todo el mundo.
                </template>
            </p>

            <div class="footLinks onlyWide">
                <RouterLink
                    :to="`/asignatura/${first.code}`"
                    class="button footButton"
                >
                    Ver {{ first.name }} →
                </RouterLink>

                <RouterLink
                    :to="`/asignatura/${second.code}`"
                    class="button footButton"
                >
                    Ver {{ second.name }} →
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.screen {
    padding: 16px var(--gutter) 8px;
}

.intro {
    text-align: center;
}

.intro p {
    margin: 5px 0 0;

    font-size: var(--text-body-sm);

    color: var(--ink-soft);
}

/* Contendientes -------------------------------------------------------- */

.fighters {
    display: flex;

    align-items: stretch;

    gap: 9px;

    margin-top: 14px;
}

.fighter {
    position: relative;

    flex: 1;

    min-width: 0;

    padding: 13px 12px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: 13px;

    text-align: center;
}

/* El <select> cubre toda la tarjeta y va invisible: el control es nativo
   —teclado, lector de pantalla y rueda del sistema gratis— pero lo que se ve
   es la tarjeta del diseño. */
.fighter select {
    position: absolute;

    inset: 0;

    width: 100%;

    height: 100%;

    opacity: 0;

    cursor: pointer;
}

.fighterName {
    display: block;

    font-family: var(--font-serif);

    font-size: 14.5px;

    font-weight: 600;

    line-height: 1.2;
}

.fighterMeta {
    display: block;

    margin-top: 4px;

    font-size: var(--text-eyebrow-sm);

    font-weight: 400;

    text-transform: uppercase;

    color: var(--ink-soft);
}

.fighterPick {
    display: block;

    margin-top: 9px;

    font-size: var(--text-num-sm);

    font-weight: 600;

    color: var(--navy);
}

/* El medallón VS: la única sombra fuerte de la web. Y sirve para algo —
   intercambia los lados— en vez de ser solo un adorno. */
/**
 * El medallón es lo único de esta pantalla que puede sonar a combate, así que
 * suena: una balanza acuñada en un disco navy, con canto de oro.
 */
.medallion {
    flex: none;

    align-self: center;

    display: flex;

    align-items: center;

    justify-content: center;

    width: 54px;

    height: 54px;

    padding: 0;

    border: 2px solid var(--gold);

    border-radius: 50%;

    background: var(--navy);

    overflow: hidden;

    box-shadow: var(--shadow-medallion);
}

.scales {
    display: block;

    width: 100%;

    height: 100%;
}

/* El dibujo cae a la derecha; si gana la izquierda, se refleja. */
.scales.mirrored {
    transform: scaleX(-1);
}

/* Veredicto ------------------------------------------------------------ */

.verdict {
    display: flex;

    align-items: center;

    gap: 11px;

    margin-top: 14px;

    padding: 12px 14px;

    background: var(--gold-wash);

    border: 1px solid var(--gold-line);

    border-radius: 12px;
}

.verdict.tie {
    background: var(--navy-wash);

    border-color: var(--navy-wash-line);
}

.trophy {
    display: flex;

    align-items: center;

    justify-content: center;

    width: 34px;

    height: 34px;

    flex: none;

    border-radius: 50%;

    background: var(--gold);

    /* Navy sobre oro, no blanco: el blanco sobre oro se queda en 2,4:1. */
    color: var(--navy);

    font-size: 16px;
}

.verdict.tie .trophy {
    background: var(--navy);
}

.verdictText {
    font-size: 13px;

    font-weight: 700;

    line-height: 1.25;

    color: var(--gold-strong);
}

.verdict.tie .verdictText {
    color: var(--navy);
}

.verdictScore {
    font-size: var(--text-num);
}

.verdictDetail {
    margin-top: 2px;

    font-size: 10.5px;

    line-height: 1.35;

    color: var(--gold-soft);
}

.verdict.tie .verdictDetail {
    color: var(--navy-soft);
}

.sameSubject {
    margin: 14px 0 0;

    padding: 12px 14px;

    background: var(--navy-wash);

    border: 1px solid var(--navy-wash-line);

    border-radius: 12px;

    font-size: var(--text-body-xs);

    line-height: 1.45;

    color: var(--navy-soft);
}

/* Duelos --------------------------------------------------------------- */

.duels {
    margin-top: 16px;
}

.duelRow {
    display: grid;

    grid-template-columns: 1fr 90px 1fr;

    gap: 8px;

    align-items: center;
}

.duelRow + .duelRow {
    margin-top: 9px;
}

.heads {
    margin-bottom: 10px;
}

.head {
    font-family: var(--font-mono);

    font-size: var(--text-eyebrow);

    font-weight: 600;

    color: var(--navy);

    text-align: center;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
}

.cell {
    display: block;

    padding: 10px 6px;

    background: var(--surface);

    border: 1px solid var(--line);

    border-radius: 10px;

    text-align: center;
}

.cell.won {
    background: var(--gold-wash);

    border: 1.5px solid var(--gold);
}

.cellValue {
    font-size: var(--text-metric);
}

.cellWin {
    display: block;

    margin-top: 1px;

    font-size: 8px;

    font-weight: 600;

    color: var(--gold-ink);
}

.duelLabel {
    font-size: 9.5px;

    line-height: 1.25;

    text-align: center;

    color: var(--ink-muted);
}

.footnote {
    margin: 16px 0 0;

    padding-top: 12px;

    border-top: 1px solid var(--line-rule);

    font-family: var(--font-mono);

    font-size: var(--text-footnote);

    line-height: 1.6;

    color: var(--ink-soft);
}

/* La fila que no compite solo aparece donde hay sitio para explicarla. */
.duelRow.inert {
    display: none;
}

.onlyWide {
    display: none;
}

/* Escritorio ------------------------------------------------------------ *
 * Centrado a 980px y no estirado a 1196: esto es un duelo cara a cara, y dos
 * contendientes a metro y medio dejan de compararse.
 */

@media (min-width: 900px) {
    .screen {
        max-width: 980px;

        margin: 0 auto;

        padding: 26px var(--gutter) 34px;
    }

    .onlyWide {
        display: block;
    }

    .intro {
        max-width: 560px;

        margin: 0 auto;

        text-align: center;
    }

    .intro p {
        font-size: var(--text-body);

        line-height: 1.5;
    }

    .fighters {
        gap: 16px;

        margin-top: 22px;
    }

    /* Las dos tarjetas se recogen un poco: lo que se compara son los nombres,
       y con menos aire alrededor la balanza queda más cerca de los dos. */
    .fighter {
        padding: 16px 16px 14px;
    }

    .fighterName {
        font-size: 21px;
    }

    .fighterMeta {
        margin-top: 7px;

        font-size: var(--text-num-sm);
    }

    .fighterPick {
        margin-top: 12px;

        font-size: var(--text-num);
    }

    .medallion {
        width: 84px;

        height: 84px;

        border-width: 3px;
    }

    .verdict {
        gap: 14px;

        margin-top: 18px;

        padding: 16px 18px;
    }

    .trophy {
        width: 42px;

        height: 42px;

        font-size: 20px;
    }

    .verdictText {
        font-size: 15px;
    }

    .verdictDetail {
        font-size: var(--text-body-sm);
    }

    .duels {
        margin-top: 24px;
    }

    .duelRow {
        grid-template-columns: 1fr 190px 1fr;

        gap: 12px;
    }

    .duelRow + .duelRow {
        margin-top: 12px;
    }

    .duelRow.inert {
        display: grid;
    }

    .head {
        font-size: var(--text-num-sm);
    }

    .cell {
        padding: 14px 8px;
    }

    .cellValue {
        font-size: 20px;
    }

    .cellWin {
        margin-top: 2px;

        font-size: 9.5px;
    }

    .duelLabel {
        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        gap: 3px;

        font-size: var(--text-body);
    }

    /* La fila de matriculados cuando las dos no son optativas: en gris y
       discontinua, con el porqué debajo del rótulo. */
    .inert .cell {
        background: var(--surface-muted);

        border: 1px dashed var(--line-strong);
    }

    .inert .duelLabel {
        color: var(--ink-placeholder);
    }

    .duelNote {
        font-size: var(--text-eyebrow);

        font-weight: 400;

        line-height: 1.3;

        color: var(--ink-placeholder);
    }

    /* El pie, con los dos atajos a las fichas. */
    .foot {
        display: flex;

        align-items: center;

        gap: 12px;

        margin-top: 24px;

        padding-top: 14px;

        border-top: 1px solid var(--line-rule);
    }

    .footnote {
        flex: 1;

        margin: 0;

        padding-top: 0;

        border-top: none;

        font-size: var(--text-num-sm);

        line-height: 1.7;
    }

    .footLinks {
        display: flex;

        flex: none;

        gap: 8px;
    }

    .footButton {
        display: inline-flex;

        align-items: center;

        max-width: 220px;

        min-height: 38px;

        padding: 0 14px;

        border: 1px solid var(--navy-line-soft);

        border-radius: var(--radius-control);

        background: var(--surface);

        font-size: var(--text-body);

        font-weight: 600;

        color: var(--navy);

        white-space: nowrap;

        overflow: hidden;

        text-overflow: ellipsis;
    }

    .footButton:hover {
        border-color: var(--navy);
    }
}
</style>
