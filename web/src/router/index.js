import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/Home.vue";

/**
 * Rutas en español y en minúsculas. Las antiguas (/firstYear, /Optional,
 * /dashboard/:code…) se mantienen como redirecciones para no romper enlaces
 * ni marcadores ya compartidos.
 *
 * `meta.title` es lo que se lee en la banda de título, debajo de la marca.
 * Es el h1 de la pantalla, así que se escribe como un titular y no como una
 * etiqueta de menú. Los dos que dependen de los datos —el curso y la ficha
 * de asignatura— los afina la propia vista con usePageHeader.
 *
 * Está aquí y no en cada vista para poder leer todos los títulos juntos.
 *
 * `meta.eyebrow` es el antetítulo de esa banda, y solo se ve en escritorio: la
 * sección de la que cuelga la pantalla. `meta.source` dice qué fuente de datos
 * la alimenta, y es lo que el pie de la lateral convierte en "de cuándo son
 * estos datos"; una pantalla que no describe ninguna fuente trae su `footer`
 * escrito.
 */
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),

    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
            meta: {
                title: "Estadísticas globales del grado",
                eyebrow: "Portada",
                source: "notas"
            }
        },

        {
            path: "/grado",
            name: "degree",
            component: () => import("@/views/DegreeMap.vue"),
            meta: {
                title: "Estructura del grado",
                eyebrow: "El grado",
                source: "notas"
            }
        },

        {
            path: "/grado/:curso",
            name: "course",
            component: () => import("@/views/Course.vue"),
            meta: {
                title: "Vista de curso",
                eyebrow: "El grado",
                source: "notas"
            }
        },

        {
            path: "/asignaturas",
            name: "subjects",
            component: () => import("@/views/Subjects.vue"),
            meta: {
                title: "Todas las asignaturas",
                eyebrow: "El grado",
                source: "notas"
            }
        },

        {
            path: "/asignatura/:code",
            name: "subject",
            component: () => import("@/views/Subject.vue"),
            meta: {
                title: "Ficha de asignatura",
                eyebrow: "El grado",
                source: "notas"
            }
        },

        {
            path: "/optativas",
            name: "optatives",
            component: () => import("@/views/Optatives.vue"),
            meta: {
                title: "Optativas del grado",
                eyebrow: "El grado",
                source: "notas"
            }
        },

        {
            path: "/profesorado",
            name: "faculty",
            component: () => import("@/views/Faculty.vue"),
            meta: {
                title: "Profesorado",
                eyebrow: "Herramientas",
                source: "guias"
            }
        },

        {
            path: "/horario",
            name: "schedule",
            component: () => import("@/views/Schedule.vue"),
            meta: {
                title: "Monta tu horario",
                eyebrow: "Herramientas",
                source: "horarios"
            }
        },

        {
            path: "/metodologia",
            name: "methodology",
            component: () => import("@/views/Methodology.vue"),
            meta: {
                title: "Fuentes y metodología",
                eyebrow: "La letra pequeña"
            }
        },

        {
            path: "/fight",
            name: "fight",
            component: () => import("@/views/FightMode.vue"),
            meta: {
                title: "Fight Mode",
                eyebrow: "Herramientas",
                source: "notas",
                // El duelo se centra a 980px; el titular, con él.
                align: "center"
            }
        },

        {
            path: "/acerca",
            name: "about",
            component: () => import("@/views/About.vue"),
            meta: {
                title: "Acerca de",
                eyebrow: "La letra pequeña",
                footer: { label: "Proyecto", detail: "independiente" }
            }
        },

        /* ---------------- Redirecciones de rutas antiguas ---------------- */

        { path: "/firstYear", redirect: "/grado/1" },
        { path: "/secondYear", redirect: "/grado/2" },
        { path: "/thirdYear", redirect: "/grado/3" },
        { path: "/forthYear", redirect: "/grado/4" },
        {
            path: "/dashboardYear/:course",
            redirect: to => `/grado/${to.params.course}`
        },
        // El rediseño mueve los cursos bajo /grado; la ruta anterior lleva año
        // y medio publicada y hay enlaces sueltos por ahí.
        {
            path: "/curso/:course",
            redirect: to => `/grado/${to.params.course}`
        },
        { path: "/Optional", redirect: "/optativas" },
        { path: "/dashboardGeneralOpts", redirect: "/optativas" },
        {
            path: "/dashboard/:code",
            redirect: to => `/asignatura/${to.params.code}`
        },
        { path: "/ProfWeb", redirect: "/profesorado" },
        { path: "/fight-mode", redirect: "/fight" },
        // El horario y los exámenes nacieron como dos páginas; ahora son dos
        // pestañas de la misma.
        { path: "/TimeTable", redirect: "/horario" },
        {
            path: "/Exams",
            redirect: { path: "/horario", query: { vista: "examenes" } }
        },

        /* ---------------- Solo en desarrollo ---------------- */

        /**
         * Galería de primitivas del sistema de diseño. `import.meta.env.DEV`
         * lo evalúa Vite en tiempo de compilación, así que en producción esta
         * rama desaparece y la vista ni siquiera entra en el bundle.
         *
         * Va antes del comodín: si no, /dev/ui acabaría redirigido a la
         * portada.
         */
        ...(import.meta.env.DEV
            ? [
                  {
                      path: "/dev/ui",
                      name: "dev-ui",
                      component: () => import("@/views/dev/UiGallery.vue"),
                      meta: {
                          title: "Primitivas"
                      }
                  }
              ]
            : []),

        {
            path: "/:pathMatch(.*)*",
            redirect: "/"
        }
    ],

    // Al cambiar de página se empieza arriba, no a media altura de la anterior.
    scrollBehavior: () => ({ top: 0 })
});

export default router;
