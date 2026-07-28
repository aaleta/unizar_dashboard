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
 */

/**
 * Tramos de mayor a menor dureza.
 *
 * Tres tonos por tramo, y no es redundancia:
 *
 *   fill      superficie: el punto, la barra.
 *   ink       la cifra GRANDE (la KPI de 23px), donde basta 3:1.
 *   inkSmall  la cifra pequeña (11-13px de las listas), oscurecida hasta
 *             4,5:1 sobre papel Y sobre blanco.
 *
 * Sin `inkSmall` el 61% de una fila se quedaría en 3,5:1 a 11px, y esto son
 * datos públicos de una universidad: no leerse no es una opción.
 */
const RAMP = [
    {
        from: 45,
        fill: "#9a3b23",
        ink: "#9a3b23",
        inkSmall: "#9a3b23",
        label: "muy dura"
    },
    {
        from: 33,
        fill: "#c4642f",
        ink: "#c4642f",
        inkSmall: "#a95628",
        label: "dura"
    },
    {
        from: 22,
        fill: "#d69a46",
        ink: "#a8813a",
        inkSmall: "#88682f",
        label: "exigente"
    },
    {
        from: 15,
        fill: "#d8c168",
        ink: "#8a7a3f",
        inkSmall: "#796b37",
        label: "moderada"
    },
    {
        from: 0,
        fill: "#8aa07a",
        ink: "#6f8a5f",
        inkSmall: "#5c734f",
        label: "asequible"
    }
];

/**
 * Sin datos no es lo mismo que "fácil": un gris neutro lo dice, un verde
 * mentiría.
 */
const UNKNOWN = {
    fill: "#c7bfb0",
    ink: "#8a8275",
    inkSmall: "#6e675c",
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
