/**
 * ¿Estamos en una pantalla grande?
 *
 * Se crea AHORA y no antes porque hasta ahora no había nada que conmutar. De
 * las once pantallas del rediseño solo una diverge de verdad: la red de
 * profesores, que en el móvil va persona a persona y en escritorio es un grafo
 * de 267 nodos. Todo lo demás es la misma pantalla a otro ancho, y para eso
 * está el CSS.
 *
 * Un único matchMedia compartido por todos los consumidores: cada llamada a
 * useViewport() devuelve el mismo ref, no crea un listener nuevo.
 */

import { ref } from "vue";

/** Por debajo de esto, el grafo completo no se puede leer ni manejar. */
const DESKTOP = "(min-width: 900px)";

const isDesktop = ref(false);

if (typeof window !== "undefined" && window.matchMedia) {

    const query = window.matchMedia(DESKTOP);

    isDesktop.value = query.matches;

    query.addEventListener("change", event => {
        isDesktop.value = event.matches;
    });

}

export const useViewport = () => ({ isDesktop });
