<script setup>

/**
 * Acerca de: la página humana.
 */

import UiCallout from "@/components/ui/UiCallout.vue";

const REPO = "https://github.com/aaleta/unizar_dashboard";

const BIFI = "https://bifi.es/";

/**
 * El avatar sale de la foto pública de GitHub (github.com/<usuario>.png):
 * una imagen menos que mantener y siempre al día con el perfil. Claude no es
 * un usuario sino una app de GitHub, así que trae su avatar y su enlace
 * explícitos.
 */
const PEOPLE = [
    {
        name: "Alberto Aleta",
        handle: "aaleta",
        role: "Idea · Mantenimiento",
        url: "https://github.com/aaleta"
    },
    {
        name: "Marcos Lizano",
        handle: "Marcos9001",
        role: "Primera versión de la web",
        url: "https://github.com/Marcos9001"
    },
    {
        name: "Claude",
        handle: "claude",
        role: "Diseño · Implementación",
        url: "https://github.com/apps/claude",
        avatarUrl: "https://avatars.githubusercontent.com/in/1236702?s=96&v=4"
    }
];

const avatar = person =>
    person.avatarUrl ?? `https://github.com/${person.handle}.png?size=96`;

const HOW = [
    {
        title: "Datos abiertos.",
        text: "Partimos de las calificaciones y las tasas oficiales que publica "
            + "la Universidad de Zaragoza, más las notas de corte."
    },
    {
        title: "Código abierto.",
        text: "El código y los datos procesados son públicos: cualquiera puede "
            + "revisar, corregir o reutilizar."
    }
];

</script>

<template>

<div class="screen">

    <header class="intro">

        <h1>Una herramienta hecha por estudiantes, para estudiantes.</h1>

        <p>
            Elegir asignaturas se hacía a base de rumores de pasillo. Quisimos
            cambiar los rumores por datos: los mismos números que publica la
            Universidad, ordenados para que decidir el curso que viene sea un
            poco más fácil.
        </p>

    </header>

    <!-- Quién lo hace --------------------------------------------------- -->
    <section class="section">

        <div class="sectionHead">
            <h2>Quién lo hace</h2>
            <div class="rule"></div>
        </div>

        <div class="people">
            <a
                v-for="person in PEOPLE"
                :key="person.handle"
                class="person"
                :href="person.url"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    class="avatar"
                    :src="avatar(person)"
                    alt=""
                    loading="lazy"
                >
                <span class="personBody">
                    <span class="personName">
                        {{ person.name }}
                        <span class="personHandle num">@{{ person.handle }}</span>
                    </span>
                    <span class="personRole">{{ person.role }}</span>
                </span>
                <span class="personGo">GitHub →</span>
            </a>
        </div>

        <p class="context">
            Desarrollado como Prácticas Externas en el
            <a
                :href="BIFI"
                target="_blank"
                rel="noopener noreferrer"
            >Instituto de Biocomputación y Física de Sistemas Complejos
            (BIFI)</a>.
        </p>

    </section>

    <!-- Cómo se hizo ---------------------------------------------------- -->
    <section class="section">

        <div class="sectionHead">
            <h2>Cómo se hizo</h2>
            <div class="rule"></div>
        </div>

        <ul class="how">
            <li
                v-for="item in HOW"
                :key="item.title"
            >
                <strong>{{ item.title }}</strong>
                {{ item.text }}
            </li>
        </ul>

        <p class="more">
            <RouterLink to="/metodologia">
                Los detalles, en Metodología →
            </RouterLink>
        </p>

    </section>

    <!-- Repositorio ----------------------------------------------------- -->
    <a
        class="repo"
        :href="REPO"
        target="_blank"
        rel="noopener noreferrer"
    >
        <span class="repoTitle">Ver el proyecto en GitHub</span>
        <span class="repoUrl num">github.com/aaleta/unizar_dashboard</span>
    </a>

    <!-- Descargo -------------------------------------------------------- -->
    <UiCallout
        tone="structural"
        title="Esto no juzga a nadie"
        class="disclaimer"
    >
        Los números describen resultados agregados de cursos pasados; no miden
        la calidad de la docencia ni la valía de quien la imparte o la cursa.
        Una asignatura difícil puede estar magníficamente dada, y una
        asignatura fácil se puede suspender. Úsalo para organizarte, no para
        etiquetar.
    </UiCallout>

    <p class="footnote">
        Proyecto independiente · no es una web oficial de la Universidad de
        Zaragoza.
    </p>

</div>

</template>

<style scoped>

.screen{

    padding:18px var(--gutter) 8px;

}

h1{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-h1);

    font-weight:700;

    line-height:var(--leading-tight);

    text-wrap:pretty;

}

.intro p{

    margin:11px 0 0;

    font-size:var(--text-body);

    line-height:var(--leading-relaxed);

    color:var(--ink-2);

}

.section{

    margin-top:var(--gap-section);

}

.sectionHead{

    display:flex;

    align-items:center;

    gap:8px;

    margin-bottom:12px;

}

h2{

    margin:0;

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

    color:var(--navy);

}

.rule{

    flex:1;

    height:1px;

    background:var(--line-tab);

}

/* Personas -------------------------------------------------------------- */

.people{

    display:flex;

    flex-direction:column;

    gap:8px;

}

.person{

    display:flex;

    align-items:center;

    gap:12px;

    min-height:var(--touch-target);

    padding:13px 14px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card-lg);

    color:var(--ink);

}

.avatar{

    width:42px;

    height:42px;

    flex:none;

    border-radius:var(--radius-dot);

    /* Se ve mientras carga la foto y si el perfil no tiene ninguna. */
    background:var(--navy-wash);

    object-fit:cover;

}

.personBody{

    flex:1;

    min-width:0;

}

.personName{

    display:block;

    font-size:var(--text-body);

    font-weight:700;

}

.personHandle{

    margin-left:4px;

    font-size:var(--text-num-sm);

    font-weight:400;

    color:var(--ink-soft);

}

.personRole{

    display:block;

    margin-top:1px;

    font-size:var(--text-body-xs);

    color:var(--ink-muted);

}

.personGo{

    flex:none;

    font-size:var(--text-body-xs);

    font-weight:600;

    color:var(--navy);

}

.context{

    margin:12px 0 0;

    font-size:var(--text-body-xs);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

.context a{

    color:var(--navy);

    font-weight:600;

}

/* Cómo se hizo ---------------------------------------------------------- */

.how{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.how li{

    padding:12px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:var(--radius-card);

    font-size:var(--text-body-sm);

    line-height:var(--leading-body);

    color:var(--ink-muted);

}

.how strong{

    display:block;

    font-family:var(--font-serif);

    font-size:var(--text-card-title);

    color:var(--ink);

}

.more{

    margin:11px 0 0;

}

.more a{

    display:inline-flex;

    align-items:center;

    min-height:var(--touch-target);

    font-size:var(--text-body-sm);

    font-weight:600;

}

/* Repositorio ----------------------------------------------------------- */

.repo{

    display:flex;

    flex-direction:column;

    gap:3px;

    margin-top:20px;

    padding:14px 15px;

    background:var(--navy);

    border-radius:var(--radius-card-lg);

    color:var(--ink-on-navy);

}

.repoTitle{

    font-family:var(--font-serif);

    font-size:var(--text-section);

    font-weight:600;

}

.repoUrl{

    font-size:var(--text-num-sm);

    font-weight:400;

    color:var(--navy-faint);

}

.disclaimer{

    margin-top:16px;

}

.footnote{

    margin:16px 0 0;

    padding-top:12px;

    border-top:1px solid var(--line-rule);

    font-family:var(--font-sans);

    font-size:var(--text-footnote);

    line-height:var(--leading-relaxed);

    color:var(--ink-faint);

}

</style>
