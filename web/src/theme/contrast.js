/**
 * Elegir tinta legible sobre un fondo de color.
 *
 * Vive en theme/ y no en la vista que lo usa por la misma razón que el resto
 * de los colores: estas dos constantes son `--ink` y `--ink-on-navy`, y si se
 * escribieran sueltas en un componente serían dos colores fuera del único
 * sitio donde deben estar.
 *
 * Van como literales y no como `var(--ink)` porque aquí no se pintan: se
 * miden. Calcular la luminancia de una cadena "var(--ink)" no es posible sin
 * preguntarle al navegador por el valor computado, que es mucha maquinaria
 * para dos colores que no cambian.
 */

const INK = "#17181a";
const ON_DARK = "#ffffff";

const luminance = color => {

    const channels = [1, 3, 5]
        .map(i => parseInt(color.substr(i, 2), 16) / 255)
        .map(value =>
            value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        );

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

};

export const contrastRatio = (a, b) => {

    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);

    return (high + 0.05) / (low + 0.05);

};

/**
 * La tinta que MÁS contraste da sobre `background`, o null si ninguna de las
 * dos llega al mínimo legible.
 *
 * Devolver null es la parte importante: hay colores —el azul de los notables
 * en la paleta de calificaciones— sobre los que ni el negro ni el blanco
 * alcanzan 4,5:1. Ahí lo correcto es no escribir nada encima y dejar que el
 * dato lo dé la leyenda, no elegir "el menos malo" y publicar una cifra que
 * no se lee.
 */
export const readableInk = (background, minimum = 4.5) => {

    const dark = contrastRatio(INK, background);
    const light = contrastRatio(ON_DARK, background);

    if (Math.max(dark, light) < minimum) return null;

    return dark >= light ? "var(--ink)" : "var(--ink-on-navy)";

};
