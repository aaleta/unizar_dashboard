/**
 * Deja que una pantalla afine su propio título.
 *
 * Lo normal es que el título salga del `meta` de la ruta, que es donde se
 * leen todos juntos. Pero hay dos que no se saben hasta cargar los datos: la
 * ficha de asignatura se titula con el nombre de la asignatura, y ese nombre
 * no está en la ruta, está en el catálogo.
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
 * @param source objeto { title } o función que lo devuelva (si depende de
 *               datos que cambian, pasar la función).
 */
export const usePageHeader = source => {

    watchEffect(() => {
        override.value = typeof source === "function" ? source() : source;
    });

    onUnmounted(() => {
        override.value = null;
    });

};
