/**
 * Fight Mode: dos asignaturas cara a cara.
 *
 * Es la parte divertida de la web, pero los datos no se relajan por eso: cada
 * duelo usa las mismas tasas que el resto de la aplicación y el ganador sale
 * de `higherIsBetter`, no de qué número es mayor. En "no presentados" gana
 * quien tiene MENOS.
 *
 * Un duelo se decide sobre la cifra QUE SE PINTA, no sobre el decimal que hay
 * detrás: 33,4 % y 33,0 % se escriben los dos "33 %", y coronar a una de las
 * dos con el mismo número en la mano le pide al lector que se crea algo que la
 * pantalla no enseña. Cuando las dos cifras se escriben igual, el duelo es
 * EMPATE.
 *
 * Las reglas son las que ya tenía el Fight Mode de escritorio, incluida la
 * quinta: **los matriculados solo se comparan entre optativas**. Medir la
 * popularidad de una troncal —que cursa todo el mundo por obligación— contra
 * la de una optativa no dice nada de ninguna de las dos.
 */

import { computed, unref } from "vue";

import { pct } from "@/utils/format";
import {
    METRICS,
    RECENT_YEARS,
    subjectInfo,
    subjectName,
    subjectRate,
    averageEnrolment
} from "@/utils/metrics";

const read = source =>
    typeof source === "function" ? source() : unref(source);

const describe = code => {
    const info = subjectInfo(code);

    return {
        code,
        name: subjectName(code),
        tipo: info?.tipo ?? null,
        courses: info?.courses ?? [],
        label: info
            ? `${info.tipo === "optativa" ? "Optativa" : "Troncal"} · ${info.courses.map(c => `${c}º`).join(" y ")}`
            : ""
    };
};

export const useFight = (firstSource, secondSource) => {
    const first = computed(() => describe(Number(read(firstSource))));
    const second = computed(() => describe(Number(read(secondSource))));

    const bothOptional = computed(
        () =>
            first.value.tipo === "optativa" && second.value.tipo === "optativa"
    );

    const duels = computed(() => {
        const rate = (key, label) => ({
            key,
            label: label ?? METRICS[key].label,
            first: subjectRate(first.value.code, key),
            second: subjectRate(second.value.code, key),
            higherIsBetter: METRICS[key].higherIsBetter,
            format: pct
        });

        const list = [
            rate("noSuperacion", "Más fácil de superar"),
            rate("exito", "Tasa de éxito"),
            rate("noPresentados", "No presentados"),
            rate("excelencia", "Excelencia (Sob+MH)")
        ];

        /**
         * Los matriculados solo compiten entre optativas: la popularidad de una
         * troncal no dice nada, la cursa todo el mundo. La fila se enseña
         * igualmente —en escritorio, donde hay sitio— para que se vea que el
         * dato existe y por qué no puntúa.
         */
        list.push({
            key: "matriculados",
            label: "Matriculados",
            first: averageEnrolment(first.value.code),
            second: averageEnrolment(second.value.code),
            higherIsBetter: true,
            competes: bothOptional.value,
            note: bothOptional.value ? null : "solo se compara entre optativas",
            format: value => (value === null ? "—" : String(Math.round(value)))
        });

        return list.map(duel => {
            const row = { competes: true, note: null, ...duel };

            /**
             * Se comparan las dos cifras ya formateadas, que son exactamente
             * las que se leen en pantalla. Así el resultado nunca contradice
             * lo escrito, y de paso el redondeo no puede colar un ganador por
             * una décima invisible.
             */
            const shown =
                row.first === null || row.second === null
                    ? null
                    : [row.format(row.first), row.format(row.second)];

            /** Empate de verdad: dos cifras que existen y se escriben igual. */
            const tie =
                row.competes !== false &&
                shown !== null &&
                shown[0] === shown[1];

            return {
                ...row,
                tie,
                // 0 = nadie gana: empate, falta de datos o fila que no compite.
                // No se inventa un ganador cuando falta una de las dos cifras.
                winner:
                    row.competes === false || shown === null || tie
                        ? 0
                        : row.higherIsBetter
                          ? row.first > row.second
                              ? 1
                              : 2
                          : row.first < row.second
                            ? 1
                            : 2
            };
        });
    });

    /**
     * El marcador solo cuenta las filas que puntúan: la de matriculados entre
     * una troncal y una optativa no compite y tampoco es un empate. `ties` son
     * empates de verdad, no huecos de datos.
     */
    const score = computed(() => {
        const tally = { first: 0, second: 0, ties: 0 };

        duels.value.forEach(duel => {
            if (duel.competes === false) return;

            if (duel.winner === 1) tally.first += 1;
            else if (duel.winner === 2) tally.second += 1;
            else if (duel.tie) tally.ties += 1;
        });

        return tally;
    });

    const verdict = computed(() => {
        const { first: a, second: b, ties } = score.value;

        if (first.value.code === second.value.code) return null;

        if (a === b) {
            return {
                tie: true,
                text: a === 0 ? "Empate" : `Empate a ${a}`,
                detail:
                    a === 0
                        ? "Ninguna se impone en ninguna categoría."
                        : "Se parecen más de lo que parecía."
            };
        }

        const champion = a > b ? first.value : second.value;

        const lost = Math.min(a, b);

        return {
            tie: false,
            winner: a > b ? 1 : 2,
            text: `Gana ${champion.name}`,
            score: `${Math.max(a, b)}–${lost}`,
            // "Todas" solo si de verdad son todas: un empate no es una victoria.
            detail:
                lost > 0
                    ? "Gana en la mayoría de las categorías."
                    : ties > 0
                      ? "Gana en todas las que se deciden; el resto, empate."
                      : "Gana en todas las categorías."
        };
    });

    return {
        first,
        second,
        duels,
        score,
        verdict,
        bothOptional,
        recentYears: RECENT_YEARS
    };
};
