import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/Home.vue";

/**
 * Rutas en español y en minúsculas. Las antiguas (/firstYear, /Optional,
 * /dashboard/:code…) se mantienen como redirecciones para no romper enlaces
 * ni marcadores ya compartidos.
 */
const router = createRouter({

    history: createWebHashHistory(import.meta.env.BASE_URL),

    routes: [

        {
            path: "/",
            name: "home",
            component: HomeView
        },

        {
            path: "/asignaturas",
            name: "subjects",
            component: () => import("@/views/Subjects.vue")
        },

        {
            path: "/asignatura/:code",
            name: "subject",
            component: () => import("@/views/Dashboard.vue")
        },

        {
            path: "/curso/:course",
            name: "course",
            component: () => import("@/views/Course.vue")
        },

        {
            path: "/optativas",
            name: "optatives",
            component: () => import("@/views/Optatives.vue")
        },

        {
            path: "/profesorado",
            name: "faculty",
            component: () => import("@/components/Dashboard/ProfWeb.vue")
        },

        {
            path: "/metodologia",
            name: "methodology",
            component: () => import("@/views/Methodology.vue")
        },

        {
            path: "/fight-mode",
            name: "fight",
            component: () => import("@/views/FightMode.vue")
        },

        /* ---------------- Redirecciones de rutas antiguas ---------------- */

        { path: "/firstYear", redirect: "/curso/1" },
        { path: "/secondYear", redirect: "/curso/2" },
        { path: "/thirdYear", redirect: "/curso/3" },
        { path: "/forthYear", redirect: "/curso/4" },
        {
            path: "/dashboardYear/:course",
            redirect: to => `/curso/${to.params.course}`
        },
        { path: "/Optional", redirect: "/optativas" },
        { path: "/dashboardGeneralOpts", redirect: "/optativas" },
        {
            path: "/dashboard/:code",
            redirect: to => `/asignatura/${to.params.code}`
        },
        { path: "/ProfWeb", redirect: "/profesorado" },

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
                component: () => import("@/views/dev/UiGallery.vue")
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
