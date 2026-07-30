/**
 * Deja que una pantalla afine su propia cabecera.
 *
 * Lo normal es que el título salga del `meta` de la ruta, que es donde se
 * leen todos juntos. Pero hay dos que no se saben hasta cargar los datos: la
 * ficha de asignatura se titula con el nombre de la asignatura, y ese nombre
 * no está en la ruta, está en el catálogo.
 *
 * Lo que puede traer el objeto:
 *
 *   title        el h1 de la pantalla
 *   eyebrow      el antetítulo de la banda (la sección a la que pertenece)
 *   breadcrumbs  [{ label, to }] — los antecesores, cuando la pantalla cuelga
 *                de otra (la ficha de asignatura, de su curso)
 *   source       clave de DATA_SOURCES cuya vigencia describe estos datos
 *
 * Los tres últimos solo se pintan en escritorio: en el móvil la banda de
 * título es una línea y no hay sitio. Ninguna vista está obligada a darlos.
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

/**
 * Quién escribió lo que hay ahora mismo en `override`.
 *
 * Hace falta porque Vue desmonta la pantalla vieja ANTES de montar la nueva,
 * pero ejecuta su `onUnmounted` DESPUÉS (va a la cola de efectos posteriores al
 * render). Sin esta comprobación, ir de una pantalla con cabecera propia a otra
 * también con cabecera propia —del curso a la ficha de asignatura— dejaba este
 * orden: la ficha escribe su título y acto seguido la limpieza del curso lo
 * borra. El resultado era una ficha sin titular, sin migas y sin la banda
 * entera, y con ella los destinos de los Teleport (#pageActions, #pageBadges).
 */
let owner = null;

/** Lo lee AppShell. Vale null cuando manda el `meta` de la ruta. */
export const pageHeader = override;

/**
 * Llamar SIEMPRE desde el setup del componente: registra un onUnmounted y
 * fuera del setup no habría instancia a la que colgarlo.
 *
 * @param source objeto con los campos de arriba, o función que lo devuelva
 *               (si depende de datos que cambian, pasar la función).
 */
export const usePageHeader = source => {
    /** Identidad de esta pantalla; basta con que sea única. */
    const token = {};

    watchEffect(() => {
        owner = token;
        override.value = typeof source === "function" ? source() : source;
    });

    onUnmounted(() => {
        // Solo borra quien sigue siendo el dueño: si otra pantalla ya escribió
        // la suya, esta limpieza llega tarde y no le toca nada.
        if (owner !== token) return;

        owner = null;
        override.value = null;
    });
};
