<script setup>
/**
 * La lateral de escritorio: lo que en el móvil son la barra de pestañas y la
 * hoja "Más", aquí cabe entero y a la vista.
 *
 * Los destinos salen de content/navigation.js, los mismos que pinta el móvil.
 * Lo único que esta carcasa añade es la agrupación en tres bloques —el grado,
 * las herramientas y la letra pequeña—, el recuento a la derecha de algunas
 * entradas y el submenú de cursos.
 *
 * El pie dice de cuándo son los datos de la pantalla que se está mirando, no
 * de la web entera: cada fuente se actualiza por su cuenta y un solo "curso
 * 2025-2026" para todas sería mentira en tres de ellas.
 */

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { DESTINATIONS, GROUPS, isActive } from "@/content/navigation";
import { loadProfessorCount } from "@/utils/counts";
import { dataSource } from "@/utils/dataSources";
import { allSubjects, poolOptionalSubjects } from "@/utils/metrics";

import UiIcon from "@/components/ui/UiIcon.vue";

// Pasa por Vite para que el fichero se versione y se cachee como el resto.
import logoNegativo from "@/assets/logo-unizar-negativo.svg";

const props = defineProps({
    /** Clave de DATA_SOURCES cuya vigencia describe la pantalla activa. */
    source: {
        type: String,
        default: null
    },

    /** Pie a medida, para las pantallas que no describe ninguna fuente. */
    footer: {
        type: Object,
        default: null
    }
});

const route = useRoute();

const COURSES = ["1", "2", "3", "4"];

/**
 * Los recuentos no se escriben: son el catálogo contado. El de profesores se
 * pide al montar —y esta lateral solo se monta en escritorio— por lo que
 * explica utils/counts.js.
 */
const counts = ref({
    asignaturas: allSubjects.length,
    optativas: poolOptionalSubjects.length,
    profesorado: null
});

onMounted(async () => {
    counts.value.profesorado = await loadProfessorCount();
});

const groups = computed(() =>
    GROUPS.map(group => ({
        ...group,
        items: DESTINATIONS.filter(
            destination => destination.group === group.key
        )
    }))
);

/**
 * La letra pequeña va sin icono, como en el diseño: son dos destinos de
 * consulta, no dos secciones, y el icono de documento repetiría el de
 * Asignaturas justo encima.
 */
const hasIcon = item => item.group !== "letra-pequena";

/** El submenú de cursos solo aparece estando dentro de un curso. */
const showCourses = computed(() => route.name === "course");

const vigencia = computed(() => {
    if (props.footer) return props.footer;

    const source = dataSource(props.source);

    return source
        ? { label: source.short, detail: `curso ${source.ultimo_curso}` }
        : null;
});
</script>

<template>
    <nav class="sidebar" aria-label="Secciones">
        <div class="brand">
            <!-- El alt es información, no adorno: quien no ve el logotipo
             tiene que saber igualmente de qué universidad se trata. -->
            <img
                class="logo"
                :src="logoNegativo"
                alt="Universidad de Zaragoza"
            />

            <span class="brandName">Dashboard del<br />Grado en Física</span>
        </div>

        <div class="groups">
            <div v-for="group in groups" :key="group.key" class="group">
                <p class="eyebrow groupLabel">{{ group.label }}</p>

                <template v-for="item in group.items" :key="item.key">
                    <RouterLink
                        :to="item.to"
                        class="entry"
                        :class="{
                            active: isActive(item, route.path),
                            secondary: group.key === 'letra-pequena'
                        }"
                        :aria-current="
                            isActive(item, route.path) ? 'page' : undefined
                        "
                    >
                        <span
                            v-if="item.badge"
                            class="badge"
                            aria-hidden="true"
                        >
                            {{ item.badge }}
                        </span>
                        <UiIcon
                            v-else-if="hasIcon(item)"
                            :name="item.icon"
                            :size="17"
                        />

                        <span class="label">{{ item.label }}</span>

                        <span v-if="item.tag" class="tag">{{ item.tag }}</span>

                        <span
                            v-else-if="item.countKey && counts[item.countKey]"
                            class="num count"
                        >
                            {{ counts[item.countKey] }}
                        </span>
                    </RouterLink>

                    <!-- Los cuatro cursos cuelgan de "El Grado", que es de
                     donde cuelgan también en las rutas. -->
                    <div
                        v-if="item.key === 'grado' && showCourses"
                        class="submenu"
                    >
                        <RouterLink
                            v-for="course in COURSES"
                            :key="course"
                            :to="`/grado/${course}`"
                            class="course"
                            :class="{ active: route.params.curso === course }"
                        >
                            {{ course }}.º curso
                        </RouterLink>
                    </div>
                </template>
            </div>
        </div>

        <p v-if="vigencia" class="vigencia">
            {{ vigencia.label }}<br />{{ vigencia.detail }}
        </p>
    </nav>
</template>

<style scoped>
.sidebar {
    /* Pegada, no fija: el desplazamiento sigue siendo el del documento, y así
       la lateral acompaña sin robarle el scroll a nadie. */
    position: sticky;

    top: 0;

    z-index: 10;

    display: flex;

    flex-direction: column;

    flex: none;

    width: var(--sidebar-width);

    height: 100dvh;

    padding: 20px 0 16px;

    background: var(--navy-surface);

    /* El mismo filete de oro que cierra la cabecera del móvil: marca dónde
       acaba el cromo institucional y empieza el contenido. */
    border-right: 2px solid var(--gold-rule);
}

.brand {
    display: flex;

    align-items: center;

    gap: 12px;

    margin-bottom: 14px;

    padding: 0 20px 18px;

    border-bottom: 1px solid var(--on-navy-rule);
}

/* Alto fijo y ancho libre: el logotipo es vertical y lo que hay que fijar es
   la línea de la marca, no la caja. */
.logo {
    height: 38px;

    width: auto;

    flex: none;
}

.brandName {
    font-family: var(--font-serif);

    font-size: 15.5px;

    font-weight: 600;

    line-height: 1.2;

    color: var(--ink-on-navy);
}

.groups {
    display: flex;

    flex-direction: column;

    padding: 0 12px;
}

.group + .group {
    margin-top: 3px;
}

.groupLabel {
    margin: 0;

    padding: 6px 10px 7px;

    letter-spacing: 0.6px;

    color: var(--navy-faint);
}

.group + .group .groupLabel {
    padding-top: 16px;
}

.entry {
    display: flex;

    align-items: center;

    gap: 10px;

    /* 38px y no 44: esto es cromo de escritorio, se pulsa con un ratón y la
       fila ocupa los 220px de ancho de la lateral. Los 44px de la guía son
       para las filas de datos, donde el objetivo es pequeño de verdad. */
    min-height: 38px;

    padding: 0 11px;

    border-radius: var(--radius-control);

    color: var(--ink-on-navy-soft);

    font-size: 13.5px;

    text-decoration: none;
}

.entry + .entry,
.submenu + .entry {
    margin-top: 3px;
}

.entry:hover {
    background: var(--on-navy-hover);
}

.entry.active {
    background: var(--paper);

    color: var(--navy);

    font-weight: 700;
}

.entry.active:hover {
    background: var(--paper);
}

/* La letra pequeña se lee como lo que es: dos destinos de consulta, no dos
   secciones del grado. */
.entry.secondary {
    min-height: 34px;

    color: var(--navy-faint);

    font-size: 12.5px;
}

.entry.secondary.active {
    color: var(--navy);
}

/* El anillo navy de style.css no se ve contra la lateral. */
.entry:focus-visible,
.course:focus-visible {
    outline: 2px solid var(--focus-on-navy);

    outline-offset: -2px;
}

.label {
    flex: 1;

    min-width: 0;
}

/* Fight Mode no tiene icono: tiene un glifo, que es su marca. */
.badge {
    display: flex;

    align-items: center;

    justify-content: center;

    width: 17px;

    flex: none;

    font-family: var(--font-serif);

    font-size: 12px;

    font-weight: 700;
}

.count {
    flex: none;

    font-size: var(--text-num-sm);

    font-weight: 400;

    color: var(--navy-faint);
}

.entry.active .count {
    color: var(--navy);
}

/* El oro como decoración, no como dato: dice "esto es nuevo", no "esto vale
   más". */
.tag {
    flex: none;

    padding: 2px 6px;

    border-radius: var(--radius-pill);

    background: var(--gold);

    color: var(--navy-surface);

    font-family: var(--font-mono);

    font-size: var(--text-eyebrow-sm);

    font-weight: 600;

    letter-spacing: 0.4px;
}

.submenu {
    display: flex;

    flex-direction: column;

    gap: 1px;

    padding: 2px 0 2px 30px;
}

.course {
    display: flex;

    align-items: center;

    min-height: 30px;

    padding: 0 11px;

    border-radius: 7px;

    color: var(--navy-faint);

    font-size: 12.5px;

    text-decoration: none;
}

.course:hover {
    background: var(--on-navy-hover);
}

/* El curso abierto se marca con un lavado, no con el papel: dentro de un
   submenú, el bloque blanco de la entrada activa pesaría más que su padre. */
.course.active {
    background: var(--on-navy-rule);

    color: var(--ink-on-navy);

    font-weight: 700;
}

.vigencia {
    margin: 0;

    /* Al fondo del todo: es la letra pequeña de la pantalla, no una entrada
       más del menú. */
    margin-top: auto;

    padding: 14px 22px 0;

    border-top: 1px solid var(--on-navy-rule);

    font-family: var(--font-mono);

    font-size: 9.5px;

    line-height: 1.6;

    color: var(--navy-faint);
}
</style>
