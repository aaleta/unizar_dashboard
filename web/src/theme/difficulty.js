/**
 * La rampa de dificultad. UNA sola definición para toda la web.
 *
 * Traduce la tasa de no superación (% de matriculados que no aprueban, ya sea
 * por suspender o por no presentarse) a color: más rojo = más dura.
 *
 * Es el ÚNICO color que codifica una magnitud. Ni el navy, ni el oro, ni el
 * gris de los recuentos suben por esta escala. Y a la inversa: esta escala no
 * se usa para nada que no sea dificultad. Pintar de rojo una asignatura muy
 * matriculada, por ejemplo, sería mentir con el color.
 *
 * Mismo principio que metrics.js: si cada componente eligiera su umbral, la
 * misma asignatura saldría naranja en una pantalla y roja en la siguiente, y
 * el lector no tendría forma de saber cuál creerse.
 *
 * Los tramos salen del handoff de diseño (§5). La web no tenía hasta ahora
 * ninguna escala equivalente con la que alinearlos: solo un umbral suelto en
 * Subjects.vue que marcaba en rojo a partir del 30 %, que esta rampa sustituye.
 */

/**
 * Tramos de mayor a menor dureza.
 *
 * Tres tonos por tramo, y no es redundancia:
 *
 *   fill      superficie: el punto, la barra. El color del handoff.
 *   ink       la cifra GRANDE (la KPI de 23px). El tono del handoff, que a ese
 *             tamaño cumple AA (basta 3:1 para texto grande).
 *   inkSmall  la cifra pequeña (11-13px, las filas de las listas). El mismo
 *             tono oscurecido hasta 4.5:1 sobre papel Y sobre blanco.
 *
 * El motivo de `inkSmall`: los tonos del handoff se quedan entre 3,1 y 3,7 de
 * contraste. Vale para un numeral de 23px, pero el 61% de una fila de lista va
 * a 11px, y ahí 3,5:1 no lo lee cualquiera. Como la web va de datos públicos
 * de una universidad, no leerse no es una opción.
 *
 * El tramo más duro no necesita ajuste: ya iba a 6:1.
 */
const RAMP = [
    { from: 45, fill: "#a03018", ink: "#a03018", inkSmall: "#a03018", label: "muy dura" },
    { from: 33, fill: "#c25a24", ink: "#b5501e", inkSmall: "#9c451d", label: "dura" },
    { from: 22, fill: "#d19335", ink: "#906c22", inkSmall: "#7c5c1e", label: "exigente" },
    { from: 15, fill: "#ccb84f", ink: "#7c7030", inkSmall: "#6c622a", label: "moderada" },
    { from: 0, fill: "#7d9a6d", ink: "#587c4a", inkSmall: "#47643c", label: "asequible" }
];

/**
 * Sin datos no es lo mismo que "fácil": un gris neutro lo dice, un verde
 * mentiría.
 */
const UNKNOWN = {
    fill: "#c4c5bf",
    ink: "#767981",
    inkSmall: "#5d6066",
    label: "sin datos"
};

/** Tramo completo que corresponde a una tasa de no superación. */
export const difficultyBand = value => {

    if (value === null || value === undefined || Number.isNaN(value)) {
        return UNKNOWN;
    }

    return RAMP.find(band => value >= band.from) ?? UNKNOWN;

};

/** Color de relleno: puntos, barras, superficies. */
export const difficultyFill = value => difficultyBand(value).fill;

/**
 * Color de la cifra que acompaña al relleno.
 * @param {boolean} small `true` para texto de 11-13px, que necesita más
 *                        contraste que el numeral grande.
 */
export const difficultyInk = (value, small = false) => {

    const band = difficultyBand(value);

    return small ? band.inkSmall : band.ink;

};

/** Nombre del tramo, para lectores de pantalla y textos de apoyo. */
export const difficultyLabel = value => difficultyBand(value).label;

/** Los tramos, de más dura a más asequible. Para leyendas y la galería. */
export const difficultyRamp = RAMP;
