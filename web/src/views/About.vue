<script setup>

/**
 * Acerca de: la página humana.
 *
 * Los huecos de colaborador se dejan SIN RELLENAR a propósito. El handoff lo
 * pide explícitamente y es lo correcto: inventar nombres en la página que
 * dice quién responde de los datos sería la peor forma posible de estrenar
 * una web que va de no fiarse de los rumores.
 *
 * El único crédito real es @aaleta, que es quien mantiene el repositorio.
 */

import UiCallout from "@/components/ui/UiCallout.vue";

const REPO = "https://github.com/aaleta/unizar_dashboard";

/**
 * Plantillas a rellenar. Se ven en gris de marcador de posición para que
 * nadie las confunda con personas reales.
 */
const SLOTS = [
    { role: "Idea y contenidos" },
    { role: "Diseño y frontend" },
    { role: "Revisión y datos" }
];

const HOW = [
    {
        title: "Datos abiertos.",
        text: "Partimos de las calificaciones y las tasas oficiales que publica "
            + "la Universidad de Zaragoza, más las notas de corte."
    },
    {
        title: "Un cálculo, una vez.",
        text: "Cada tasa se define en un único sitio, con la nomenclatura "
            + "oficial, y nada se recalcula por su cuenta."
    },
    {
        title: "Todo a la vista.",
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

        <a
            class="person"
            :href="REPO"
            target="_blank"
            rel="noopener noreferrer"
        >
            <span
                class="avatar"
                aria-hidden="true"
            >AA</span>
            <span class="personBody">
                <span class="personName">@aaleta</span>
                <span class="personRole">Mantenimiento · datos · scraper</span>
            </span>
            <span class="personGo">GitHub →</span>
        </a>

        <p class="eyebrow slotsLabel">Colaboradores · por rellenar</p>

        <ul class="slots">
            <li
                v-for="slot in SLOTS"
                :key="slot.role"
            >
                <span
                    class="avatar small"
                    aria-hidden="true"
                >··</span>
                <span class="personBody">
                    <span class="slotName">Nombre Apellido</span>
                    <span class="personRole">{{ slot.role }}</span>
                </span>
            </li>
        </ul>

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
        Una asignatura difícil puede estar magníficamente dada. Úsalo para
        organizarte, no para etiquetar.
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

    font-size:22px;

    font-weight:700;

    line-height:1.22;

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

.person{

    display:flex;

    align-items:center;

    gap:12px;

    min-height:var(--touch-target);

    padding:13px 14px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:13px;

    color:var(--ink);

}

.avatar{

    display:flex;

    align-items:center;

    justify-content:center;

    width:42px;

    height:42px;

    flex:none;

    border-radius:50%;

    background:var(--navy);

    color:var(--gold);

    font-family:var(--font-serif);

    font-size:17px;

    font-weight:700;

}

.avatar.small{

    width:34px;

    height:34px;

    background:var(--navy-wash);

    color:#7185ab;

    font-size:13px;

}

.personBody{

    flex:1;

    min-width:0;

}

.personName{

    display:block;

    font-size:13.5px;

    font-weight:700;

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

.slotsLabel{

    margin:14px 0 8px;

    font-size:var(--text-footnote);

}

.slots{

    display:flex;

    flex-direction:column;

    gap:8px;

    margin:0;

    padding:0;

    list-style:none;

}

.slots li{

    display:flex;

    align-items:center;

    gap:12px;

    padding:11px 13px;

    background:var(--surface);

    border:1px solid var(--line);

    border-radius:12px;

}

/* Gris de marcador: estos huecos son plantillas, no personas. */
.slotName{

    display:block;

    font-size:var(--text-body);

    font-weight:600;

    color:var(--ink-placeholder);

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

    line-height:1.55;

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

    font-family:var(--font-mono);

    font-size:var(--text-footnote);

    line-height:1.6;

    color:var(--ink-faint);

}

</style>
