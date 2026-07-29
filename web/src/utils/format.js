/**
 * Formato de cifra.
 *
 * Son tres funciones de una línea, pero estaban copiadas en ocho ficheros y ya
 * habían empezado a divergir: `pct` tenía dos firmas distintas según la vista
 * y `decimal` dos comportamientos ante un hueco. Aquí se decide una vez cómo se
 * escribe un número en esta web, que es una decisión de idioma, no de pantalla.
 *
 * El guion largo, y no un 0, cuando no hay dato: "sin datos" no es "cero".
 */

/** 10.375 → "10,375". Coma decimal: esta web está en español. */
export const decimal = (value, digits = 2) =>
    value === null || value === undefined
        ? "—"
        : value.toFixed(digits).replace(".", ",");

/** 50.6 → "51%". Con decimales, la coma la pone `decimal`. */
export const pct = (value, digits = 0) =>
    value === null || value === undefined ? "—" : `${decimal(value, digits)}%`;

/**
 * 2003 → "2.003".
 *
 * A mano y no con toLocaleString("es-ES"): hay navegadores compilados con ICU
 * reducido que reconocen el locale pero no aplican el separador, y devuelven
 * "2003" tan tranquilos. Para meter un punto cada tres dígitos en una web que
 * solo está en español, la dependencia no compensa el riesgo.
 */
export const thousands = value =>
    String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
