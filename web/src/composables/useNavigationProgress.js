/**
 * Indicador de carga entre pantallas.
 *
 * Los datos son JSON importado en compilación, así que no hay espera por
 * datos: lo único que tarda es descargar el trozo de código de la pantalla
 * (`() => import(...)`). En una conexión buena son milisegundos; en una mala,
 * lo bastante como para que parezca que el toque no ha hecho nada.
 *
 * Por eso NO se enseña nada durante los primeros 180 ms. Un indicador que
 * parpadea en cada navegación instantánea molesta más de lo que informa. Si
 * la pantalla llega antes de ese plazo, el usuario no ve absolutamente nada
 * — que es lo correcto.
 */

import { ref } from "vue";

const DELAY = 180;

const loading = ref(false);

let timer = null;

export const useNavigationProgress = router => {

    router.beforeEach((to, from, next) => {

        // La primera carga ya enseña el HTML de arranque: no hace falta barra.
        if (from.name !== undefined) {

            clearTimeout(timer);

            timer = setTimeout(() => {
                loading.value = true;
            }, DELAY);

        }

        next();

    });

    const stop = () => {
        clearTimeout(timer);
        loading.value = false;
    };

    router.afterEach(stop);

    // Si un trozo no se puede descargar (se cayó la red a mitad de camino) la
    // barra no puede quedarse girando para siempre.
    router.onError(stop);

};

export const navigationLoading = loading;
