<script setup>

/**
 * La navegación se agrupa en secciones: antes Fight Mode y la red de
 * profesores solo se alcanzaban desde tarjetas de la portada y no había
 * forma de volver a ellas.
 */
const SECTIONS = [
    {
        title: null,
        links: [
            { to: "/", label: "Inicio", exact: true },
            { to: "/asignaturas", label: "Asignaturas" }
        ]
    },
    {
        title: "Cursos",
        links: [
            { to: "/curso/1", label: "1º" },
            { to: "/curso/2", label: "2º" },
            { to: "/curso/3", label: "3º" },
            { to: "/curso/4", label: "4º" },
            { to: "/optativas", label: "Optativas" }
        ]
    },
    {
        title: "Más",
        links: [
            { to: "/profesorado", label: "Profesorado" },
            { to: "/fight-mode", label: "Fight Mode" },
            { to: "/metodologia", label: "Metodología" }
        ]
    }
];

</script>

<template>

<aside class="sidebar">

    <div class="logo">
        Física Unizar
    </div>

    <nav>

        <div
            v-for="(section, index) in SECTIONS"
            :key="index"
            class="section"
        >

            <span
                v-if="section.title"
                class="sectionTitle"
            >
                {{ section.title }}
            </span>

            <RouterLink
                v-for="link in section.links"
                :key="link.to"
                :to="link.to"
                :class="{ exact: link.exact }"
            >
                {{ link.label }}
            </RouterLink>

        </div>

    </nav>

</aside>

</template>

<style scoped>

.sidebar{

    position:fixed;

    top:0;
    left:0;

    width:220px;
    height:100vh;

    display:flex;
    flex-direction:column;

    background:#111827;

    border-right:1px solid rgba(255,255,255,.08);

    box-shadow:8px 0 25px rgba(0,0,0,.35);

    overflow-y:auto;

    z-index:1000;

}

.logo{

    height:80px;

    flex-shrink:0;

    display:flex;
    justify-content:center;
    align-items:center;

    color:white;

    font-size:1.1rem;
    font-weight:700;

    letter-spacing:1.5px;

    border-bottom:1px solid rgba(255,255,255,.08);

}

nav{

    display:flex;

    flex-direction:column;

    gap:18px;

    padding:20px 12px;

}

.section{

    display:flex;

    flex-direction:column;

    gap:4px;

}

.sectionTitle{

    padding:0 18px 6px;

    color:#64748b;

    font-size:.68rem;

    font-weight:700;

    text-transform:uppercase;

    letter-spacing:1px;

}

nav a{

    display:flex;

    align-items:center;

    padding:11px 18px;

    border-radius:10px;

    text-decoration:none;

    color:#d1d5db;

    font-size:.95rem;

    font-weight:500;

    transition:.2s;

}

nav a:hover{

    background:rgba(255,255,255,.08);

    color:white;

}

/* "Inicio" solo se marca en la raíz; el resto, también en sus subrutas. */
nav a.router-link-active:not(.exact),
nav a.exact.router-link-exact-active{

    background:rgba(56,189,248,.18);

    color:white;

    box-shadow:inset 3px 0 0 #38bdf8;

}

/* ========================= */
/*          MÓVIL            */
/* ========================= */

@media (max-width:768px){

    .sidebar{

        top:auto;
        bottom:0;
        left:0;

        width:100%;
        height:64px;

        flex-direction:row;

        border-right:none;
        border-top:1px solid rgba(255,255,255,.08);

        box-shadow:0 -8px 20px rgba(0,0,0,.35);

        overflow-x:auto;
        overflow-y:hidden;

    }

    .logo,
    .sectionTitle{

        display:none;

    }

    nav{

        width:100%;

        padding:0 4px;

        flex-direction:row;

        align-items:center;

        gap:0;

    }

    .section{

        flex-direction:row;

        align-items:center;

        gap:0;

    }

    nav a{

        height:64px;

        padding:0 14px;

        border-radius:0;

        white-space:nowrap;

        font-size:.85rem;

    }

    nav a.router-link-active:not(.exact),
    nav a.exact.router-link-exact-active{

        box-shadow:inset 0 3px 0 #38bdf8;

    }

}

</style>
