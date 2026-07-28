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
 *
 * ------------------------------------------------------------------------
 * POR QUÉ ES DE UN SOLO PIGMENTO
 * ------------------------------------------------------------------------
 * La rampa era un semáforo: verde, amarillo, naranja, rojo. Ahora es una sola
 * familia —el óxido de hierro— que va de un barro claro a un almagre casi
 * negro. Dos motivos, y ninguno es estético:
 *
 *   1. Lo que mide es una MAGNITUD (qué porcentaje no aprueba), y una magnitud
 *      se codifica con una escala secuencial, no con categorías de colores. El
 *      verde del tramo bajo decía "bien"; lo que el dato dice es "poco".
 *   2. En una escala de un solo tono la ordenación sobrevive a la luminancia:
 *      quien no distinga rojos —o mire la pantalla al sol— sigue viendo cuál
 *      de dos puntos es el más oscuro. Un verde y un naranja de la misma
 *      claridad, no.
 *
 * El amarillo que la rampa ha dejado libre es ahora el ocre de la cautela
 * estadística, y solo eso.
 */

/**
 * Tramos de mayor a menor dureza.
 *
 * Tres tonos por tramo, y no es redundancia:
 *
 *   fill      superficie: el punto, la barra.
 *   ink       la cifra GRANDE (la KPI de 25px), oscurecida hasta 3:1, que es
 *             el mínimo del texto grande.
 *   inkSmall  la cifra pequeña (11-13px, las filas de las listas). El mismo
 *             tono oscurecido hasta 4.5:1 sobre papel Y sobre blanco.
 *
 * El motivo de `inkSmall`: el relleno de los tramos claros se queda en 2:1 de
 * contraste. Vale para pintar un punto, pero el 61% de una fila de lista va a
 * 11px, y ahí eso no lo lee nadie. Como la web va de datos públicos de una
 * universidad, no leerse no es una opción.
 *
 * El tramo más duro no necesita ajuste: ya va a 9:1.
 */
const RAMP = [
    { from: 45, fill: "#6f2a21", ink: "#6f2a21", inkSmall: "#6f2a21", label: "muy dura" },
    { from: 33, fill: "#93472f", ink: "#93472f", inkSmall: "#8e4429", label: "dura" },
    { from: 22, fill: "#aa6449", ink: "#9c5636", inkSmall: "#864b2f", label: "exigente" },
    { from: 15, fill: "#b8886c", ink: "#a06945", inkSmall: "#7e5136", label: "moderada" },
    { from: 0, fill: "#c0a088", ink: "#9c7454", inkSmall: "#7a5a43", label: "asequible" }
];

/**
 * Sin datos no es lo mismo que "poco": un gris neutro lo dice, un barro claro
 * mentiría. Es el único tono de la escala que no es óxido, y por eso se ve que
 * no pertenece a ella.
 */
const UNKNOWN = {
    fill: "#bebab3",
    ink: "#7c776f",
    inkSmall: "#67635c",
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
