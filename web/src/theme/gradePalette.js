/**
 * Paleta de calificaciones: el desglose No presentado → Matrícula de honor.
 *
 * Es CATEGÓRICA, no una escala. No presentado no es "menos" que suspenso ni
 * más que aprobado: son categorías distintas. Por eso son seis tintas que se
 * distinguen entre sí, y no un degradado.
 *
 * Es el único sitio de la web donde hacen falta seis colores a la vez, y por
 * tanto el único que sale de las tres tintas de la dirección. Se resuelve como
 * lo haría una imprenta: seis tintas planas, todas apagadas, ninguna con el
 * brillo de una paleta de interfaz. Y alternando claro/oscuro por posición, no
 * solo por matiz — en una barra apilada lo que separa dos tramos contiguos es
 * el salto de luminosidad, que es lo único que también funciona sin ver el
 * color. Cada par contiguo va por encima de 2,5:1.
 *
 * Se usa exclusivamente en la barra apilada de la ficha y en su leyenda. Fuera
 * de ahí, un aprobado no tiene color.
 *
 * Vive aquí y no en metrics.js porque un color no es una métrica: metrics.js
 * define qué se cuenta y con qué denominador, y eso no cambia porque el diseño
 * cambie. Se indexa por la `key` de GRADE_CATEGORIES.
 */

export const GRADE_COLORS = {
    "No pre": "#bdb8a6",
    "Sus": "#b0170b",
    "Apr": "#d3a12e",
    "Not": "#2e5c74",
    "Sob": "#8fa07c",
    "MH": "#14140f"
};

/** Color de una categoría; gris neutro si apareciera una desconocida. */
export const gradeColor = key => GRADE_COLORS[key] ?? "#7d7869";
