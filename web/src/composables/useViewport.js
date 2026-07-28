/**
 * ¿Estamos en una pantalla grande?
 *
 * Solo una pantalla diverge de verdad entre móvil y escritorio: la red de
 * profesores, que en móvil va persona a persona y en escritorio es un grafo de
 * 267 nodos. Lo demás es la misma pantalla a otro ancho, y de eso se encarga
 * el CSS. Antes de añadir un consumidor nuevo, comprobar que el caso no se
 * resuelve con una media query.
 *
 * Un único matchMedia compartido: cada llamada devuelve el mismo ref, no crea
 * un listener nuevo.
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
