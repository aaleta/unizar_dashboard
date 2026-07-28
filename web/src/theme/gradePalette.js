/**
 * Paleta de calificaciones: el desglose No presentado → Matrícula de honor.
 *
 * Es CATEGÓRICA, no una escala. No presentado no es "menos" que suspenso ni
 * más que aprobado: son categorías distintas. Por eso son seis tonos que se
 * distinguen entre sí, y no un degradado.
 *
 * Se usa exclusivamente en la barra apilada de la ficha y en su leyenda. Fuera
 * de ahí, un aprobado no tiene color.
 *
 * Vive aquí y no en metrics.js porque un color no es una métrica: metrics.js
 * define qué se cuenta y con qué denominador, y eso no cambia porque el diseño
 * cambie. Se indexa por la `key` de GRADE_CATEGORIES.
 *
 * Los seis son pigmentos apagados, del mismo mundo que el resto de la paleta,
 * pero además están escalonados en CLARIDAD: cada categoría contrasta al menos
 * 1,5:1 con la que le toca al lado en la barra apilada. Sin eso, dos segmentos
 * contiguos con la misma luminancia se fundirían en uno solo aunque tuvieran
 * tonos distintos, que es lo que pasaba con Notable y Sobresaliente.
 */

export const GRADE_COLORS = {
    "No pre": "#b5b0a6",
    "Sus": "#8e3626",
    "Apr": "#5e8467",
    "Not": "#31627c",
    "Sob": "#8877a0",
    "MH": "#c09a3a"
};

/** Color de una categoría; gris neutro si apareciera una desconocida. */
export const gradeColor = key => GRADE_COLORS[key] ?? "#bebab3";
