/**
 * Fight Mode: dos asignaturas cara a cara.
 *
 * Es la parte divertida de la web, pero los datos no se relajan por eso: cada
 * duelo usa las mismas tasas que el resto de la aplicación y el ganador sale
 * de `higherIsBetter`, no de qué número es mayor. En "no presentados" gana
 * quien tiene MENOS.
 *
 * Las reglas son las que ya tenía el Fight Mode de escritorio, incluida la
 * quinta: **los matriculados solo se comparan entre optativas**. Medir la
 * popularidad de una troncal —que cursa todo el mundo por obligación— contra
 * la de una optativa no dice nada de ninguna de las dos.
 */

import { computed, unref } from "vue";

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

const pct = value => (value === null ? "—" : `${Math.round(value)}%`);

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

        if (bothOptional.value) {
            list.push({
                key: "matriculados",
                label: "Matriculados",
                first: averageEnrolment(first.value.code),
                second: averageEnrolment(second.value.code),
                higherIsBetter: true,
                format: value =>
                    value === null ? "—" : String(Math.round(value))
            });
        }

        return list.map(duel => ({
            ...duel,
            // 0 = empate o sin datos. No se inventa un ganador cuando falta
            // una de las dos cifras.
            winner:
                duel.first === null ||
                duel.second === null ||
                duel.first === duel.second
                    ? 0
                    : duel.higherIsBetter
                      ? duel.first > duel.second
                          ? 1
                          : 2
                      : duel.first < duel.second
                        ? 1
                        : 2
        }));
    });

    const score = computed(() => {
        const wins = [0, 0, 0];

        duels.value.forEach(duel => {
            wins[duel.winner] += 1;
        });

        return { first: wins[1], second: wins[2], ties: wins[0] };
    });

    const verdict = computed(() => {
        const { first: a, second: b } = score.value;

        if (first.value.code === second.value.code) return null;

        if (a === b) {
            return {
                tie: true,
                text: `Empate a ${a}`,
                detail: "Se parecen más de lo que parecía."
            };
        }

        const champion = a > b ? first.value : second.value;

        return {
            tie: false,
            winner: a > b ? 1 : 2,
            text: `Gana ${champion.name}`,
            score: `${Math.max(a, b)}–${Math.min(a, b)}`,
            detail:
                Math.min(a, b) === 0
                    ? "Gana en todas las categorías."
                    : "Gana en la mayoría de las categorías."
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
