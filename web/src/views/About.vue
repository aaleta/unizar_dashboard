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

    font-family:var(--font-display);

    font-size:var(--text-h1);

    font-weight:900;

    letter-spacing:var(--track-display-tight);

    text-transform:uppercase;

    line-height:.92;

    text-wrap:pretty;

}

.intro p{

    margin:11px 0 0;

    font-size:var(--text-body);

    line-height:1.6;

    color:var(--ink-2);

}

.section{

    margin-top:20px;

}

.sectionHead{

    display:flex;

    align-items:center;

    gap:8px;

    margin-bottom:12px;

}

h2{

    margin:0;

    font-family:var(--font-display);

    font-size:var(--text-section);

    font-weight:900;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1;

    color:var(--ink);

}

.rule{

    flex:1;

    height:var(--rule-strong);

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

    padding:12px 13px;

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

    border-radius:0;

    color:var(--ink);

    text-decoration:none;

}

/* La foto va encerrada en tinta, como una fotografía pegada en una ficha:
   sin marco flota sobre el papel y se le ve el recorte. */
.avatar{

    width:44px;

    height:44px;

    flex:none;

    border:var(--rule) solid var(--ink);

    border-radius:0;

    /* Se ve mientras carga la foto y si el perfil no tiene ninguna. */
    background:var(--carbon-wash);

    object-fit:cover;

    /* En blanco y negro y con algo más de contraste: en una web impresa a dos
       tintas, un retrato a todo color es lo único que delataría la pantalla. */
    filter:grayscale(1) contrast(1.12);

}

.personBody{

    flex:1;

    min-width:0;

}

.personName{

    display:block;

    font-family:var(--font-display);

    font-size:13.5px;

    font-weight:800;

    letter-spacing:-.01em;

}

.personHandle{

    margin-left:5px;

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    font-weight:400;

    letter-spacing:.02em;

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

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

    color:var(--accent-ink);

}

.context{

    margin:12px 0 0;

    font-size:var(--text-body-xs);

    line-height:1.55;

    color:var(--ink-muted);

}

.context a{

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

    padding:11px 13px;

    background:var(--surface);

    border:var(--rule-strong) solid var(--line);

    border-radius:var(--radius-card);

    font-size:var(--text-body-sm);

    line-height:1.55;

    color:var(--ink-muted);

}

.how strong{

    display:block;

    font-family:var(--font-display);

    font-size:var(--text-card-title);

    font-weight:800;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    color:var(--ink);

}

.more{

    margin:11px 0 0;

}

.more a{

    display:inline-flex;

    align-items:center;

    min-height:var(--touch-target);

    font-family:var(--font-mono);

    font-size:var(--text-eyebrow);

    font-weight:600;

    letter-spacing:var(--track-label);

    text-transform:uppercase;

}

/* Repositorio ----------------------------------------------------------- */

.repo{

    display:flex;

    flex-direction:column;

    gap:3px;

    margin-top:20px;

    padding:14px 15px;

    background:var(--carbon);

    border-left:6px solid var(--accent);

    border-radius:var(--radius-card-lg);

    color:var(--on-carbon);

    text-decoration:none;

}

.repoTitle{

    font-family:var(--font-display);

    font-size:var(--text-section);

    font-weight:900;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1;

}

.repoUrl{

    font-family:var(--font-mono);

    font-size:var(--text-num-sm);

    font-weight:400;

    letter-spacing:.02em;

    color:var(--carbon-faint);

}

.disclaimer{

    margin-top:16px;

}

.footnote{

    margin:16px 0 0;

    padding-top:12px;

    border-top:var(--rule-strong) solid var(--line-rule);

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

</style>
