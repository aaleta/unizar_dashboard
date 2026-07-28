/**
 * La rampa de dificultad. UNA sola definición para toda la web.
 *
 * Traduce la tasa de no superación (% de matriculados que no aprueban, ya sea
 * por suspender o por no presentarse) a color: más rojo = más dura.
 *
 * Es el ÚNICO color que codifica una magnitud. Ni el carbón, ni el rojo, ni el
 * gris de los recuentos suben por esta escala. Y a la inversa: esta escala no
 * se usa para nada que no sea dificultad. Pintar de rojo una asignatura muy
 * matriculada, por ejemplo, sería mentir con el color.
 *
 * Mismo principio que metrics.js: si cada componente eligiera su umbral, la
 * misma asignatura saldría naranja en una pantalla y roja en la siguiente, y
 * el lector no tendría forma de saber cuál creerse.
 *
 * Los cortes salen del handoff de diseño (§5); los tonos, de la dirección
 * "Ficha técnica" (ver theme/tokens.css). La web no tenía hasta ahora
 * ninguna escala equivalente con la que alinearlos: solo un umbral suelto en
 * Subjects.vue que marcaba en rojo a partir del 30 %, que esta rampa sustituye.
 */

/**
 * Tramos de mayor a menor dureza.
 *
 * La rampa es CANTIDAD DE TINTA, no una escala de colores del arcoíris: el
 * tramo tranquilo no lleva tinta directa —es el gris del propio papel— y a
 * partir de ahí entra primero el amarillo de seguridad, luego el naranja y
 * al final el rojo de aviación a plena carga. Por eso el extremo bueno NO es
 * verde: en esta dirección el verde no existe, y "asequible" no es una buena
 * noticia que celebrar, es la ausencia de aviso.
 *
 * Tres tonos por tramo, y no es redundancia:
 *
 *   fill      superficie: el cuadro, la barra. El tono pleno del tramo.
 *   ink       la cifra GRANDE (la KPI de 23px). Basta 3:1 para texto grande,
 *             pero estos ya pasan de 4:1 sobre papel.
 *   inkSmall  la cifra pequeña (11-13px, las filas de las listas). El mismo
 *             tono oscurecido hasta 4,5:1 sobre papel, sobre tarjeta Y sobre
 *             el panel hundido.
 *
 * El motivo de `inkSmall`: el 61 % de una fila de lista va a 11px, y ahí un
 * naranja bonito a 3,5:1 no lo lee cualquiera. Como la web va de datos
 * públicos de una universidad, no leerse no es una opción.
 */
const RAMP = [
    { from: 45, fill: "#b0140a", ink: "#a8140a", inkSmall: "#a8140a", label: "muy dura" },
    { from: 33, fill: "#ce3d12", ink: "#b8360c", inkSmall: "#a83208", label: "dura" },
    { from: 22, fill: "#c06a0c", ink: "#a25708", inkSmall: "#8a4e05", label: "exigente" },
    { from: 15, fill: "#a07b10", ink: "#8a6b08", inkSmall: "#6e5806", label: "moderada" },
    { from: 0, fill: "#6e6a5c", ink: "#4f4c42", inkSmall: "#4f4c42", label: "asequible" }
];

/**
 * Sin datos no es lo mismo que "fácil": un gris neutro lo dice, y como la
 * rampa empieza en gris hay que distinguirlos — este es más claro que el
 * tramo "asequible" y siempre va acompañado de su etiqueta.
 */
const UNKNOWN = {
    fill: "#7d7869",
    ink: "#5f5c52",
    inkSmall: "#5b584e",
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
