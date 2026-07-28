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
 */

export const GRADE_COLORS = {
    "No pre": "#b3b8ae",
    "Sus": "#b5482f",
    "Apr": "#6e9a6a",
    "Not": "#4e86a0",
    "Sob": "#7e6ba6",
    "MH": "#d2a03f"
};

/** Color de una categoría; gris neutro si apareciera una desconocida. */
export const gradeColor = key => GRADE_COLORS[key] ?? "#c1c7bf";
