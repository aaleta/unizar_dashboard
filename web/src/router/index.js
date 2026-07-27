import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/Home.vue";

/**
 * Rutas en español y en minúsculas. Las antiguas (/firstYear, /Optional,
 * /dashboard/:code…) se mantienen como redirecciones para no romper enlaces
 * ni marcadores ya compartidos.
 *
 * `meta` describe la cabecera de cada pantalla, y con ella el mapa de
 * navegación entero:
 *
 *   header  "identity" (marca) en las pantallas raíz, a las que se llega por
 *           pestaña; "inner" (chevron + eyebrow + título) en las demás.
 *   eyebrow de qué rama cuelga la pantalla, en mayúsculas.
 *   back    a dónde volver si no hay historial: quien abre un enlace
 *           compartido entra directo y su botón "atrás" no tiene a dónde ir.
 *
 * Está aquí y no en cada vista para poder leer la jerarquía de un vistazo.
 */
const router = createRouter({

    history: createWebHashHistory(import.meta.env.BASE_URL),

    routes: [

        {
            path: "/",
            name: "home",
            component: HomeView,
            meta: {
                header: "identity",
                title: "Física · Unizar"
            }
        },

        {
            path: "/grado",
            name: "degree",
            component: () => import("@/views/DegreeMap.vue"),
            meta: {
                header: "identity",
                title: "El Grado en Física"
            }
        },

        {
            path: "/grado/:curso",
            name: "course",
            component: () => import("@/views/Course.vue"),
            meta: {
                header: "inner",
                eyebrow: "El Grado",
                title: "Vista de curso",
                back: "/grado"
            }
        },

        {
            path: "/asignaturas",
            name: "subjects",
            component: () => import("@/views/Subjects.vue"),
            meta: {
                header: "inner",
                eyebrow: "El Grado",
                title: "Todas las asignaturas",
                back: "/grado"
            }
        },

        {
            path: "/asignatura/:code",
            name: "subject",
            component: () => import("@/views/Subject.vue"),
            meta: {
                header: "inner",
                eyebrow: "El Grado",
                title: "Ficha de asignatura",
                back: "/grado"
            }
        },

        {
            path: "/optativas",
            name: "optatives",
            component: () => import("@/views/Optatives.vue"),
            meta: {
                header: "identity",
                title: "Optativas"
            }
        },

        {
            path: "/profesorado",
            name: "faculty",
            component: () => import("@/views/Faculty.vue"),
            meta: {
                header: "inner",
                eyebrow: "Más",
                title: "Profesorado"
            }
        },

        {
            path: "/TimeTable",
            name: "timetable",
            component: () => import("@/views/MountYourCourse.vue")
        },

        {
            path: "/Exams",
            name: "exams",
            component: () => import("@/views/MountYourExams.vue")
        },

        {
            path: "/metodologia",
            name: "methodology",
            component: () => import("@/views/Methodology.vue"),
            meta: {
                header: "inner",
                eyebrow: "Más",
                title: "Metodología"
            }
        },

        {
            path: "/fight",
            name: "fight",
            component: () => import("@/views/FightMode.vue"),
            meta: {
                header: "inner",
                eyebrow: "Más",
                title: "Fight Mode"
            }
        },

        {
            path: "/acerca",
            name: "about",
            component: () => import("@/views/About.vue"),
            meta: {
                header: "inner",
                eyebrow: "Más",
                title: "Acerca de"
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
            ? [{
                path: "/dev/ui",
                name: "dev-ui",
                component: () => import("@/views/dev/UiGallery.vue"),
                meta: {
                    header: "inner",
                    eyebrow: "Desarrollo",
                    title: "Primitivas"
                }
            }]
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
