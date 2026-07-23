/**
 * Deja que una pantalla afine su propia cabecera.
 *
 * Lo normal es que la cabecera salga del `meta` de la ruta, que es donde se
 * lee la jerarquía de un vistazo. Pero hay títulos que no se saben hasta
 * cargar los datos: la ficha de una asignatura de primero lleva el eyebrow
 * "EL GRADO · PRIMERO", y de qué curso es no está en la ruta, está en el
 * catálogo.
 *
 * Se guarda en un ref de módulo, no en un provide/inject, porque hay un solo
 * AppShell y una sola pantalla activa a la vez: montar una infraestructura de
 * inyección para un único consumidor sería más ceremonia que utilidad.
 *
 * Se limpia al desmontar. Si no, el título de la ficha se quedaría pegado a la
 * siguiente pantalla que no defina el suyo.
 */

import { onUnmounted, ref, watchEffect } from "vue";

const override = ref(null);

/** Lo lee AppShell. Vale null cuando manda el `meta` de la ruta. */
export const pageHeader = override;

/**
 * Llamar SIEMPRE desde el setup del componente: registra un onUnmounted y
 * fuera del setup no habría instancia a la que colgarlo.
 *
 * @param source objeto { title, eyebrow, back } o función que lo devuelva
 *               (si depende de datos que cambian, pasar la función).
 */
export const usePageHeader = source => {

    watchEffect(() => {
        override.value = typeof source === "function" ? source() : source;
    });

    onUnmounted(() => {
        override.value = null;
    });

};
