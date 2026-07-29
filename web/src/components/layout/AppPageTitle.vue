<script setup>
/**
 * La banda de título: dice en qué pantalla estás, justo debajo de la marca.
 *
 * Es el h1 del documento. Antes cada vista abría con su propio titular y no
 * había dos iguales —unas con antetítulo, otras con una tesela, otras con un
 * párrafo de entrada—, así que la parte de arriba de la aplicación cambiaba
 * de forma en cada pantalla. Ahora el titular sale de un solo sitio y todas
 * las pantallas empiezan igual.
 *
 * Va en tinta sobre el papel, no en una segunda banda navy: la banda de arriba
 * es la marca y se queda fija, y el título es de la página, así que pertenece
 * a la página y se va con ella al bajar.
 *
 * En escritorio la banda crece y se lleva tres cosas más, que en el móvil no
 * caben: el antetítulo (o las migas), un filete que la cierra, y los controles
 * de la pantalla —buscador, selector de año, botones de curso—, que cada vista
 * manda aquí con un <Teleport> en vez de escribirlos dos veces.
 */

defineProps({
    title: {
        type: String,
        default: null
    },

    /** La sección a la que pertenece la pantalla. Solo en escritorio. */
    eyebrow: {
        type: String,
        default: null
    },

    /**
     * [{ label, to }] de más lejano a más cercano, incluida la pantalla
     * actual, que va sin `to`. Sustituye al antetítulo cuando la pantalla
     * cuelga de otra.
     */
    breadcrumbs: {
        type: Array,
        default: null
    }
});
</script>

<template>
    <div v-if="title" class="band">
        <div class="inner">
            <div class="heading">
                <nav
                    v-if="breadcrumbs?.length"
                    class="crumbs"
                    aria-label="Ruta de la pantalla"
                >
                    <template
                        v-for="(crumb, index) in breadcrumbs"
                        :key="crumb.label"
                    >
                        <span v-if="index" class="separator" aria-hidden="true">
                            /
                        </span>

                        <RouterLink v-if="crumb.to" :to="crumb.to">
                            {{ crumb.label }}
                        </RouterLink>

                        <span v-else class="current">{{ crumb.label }}</span>
                    </template>
                </nav>

                <p v-else-if="eyebrow" class="eyebrow section">
                    {{ eyebrow }}
                </p>

                <h1 class="title">{{ title }}</h1>

                <!-- Lo que va pegado al titular: las etiquetas de la ficha de
                 asignatura. Como #pageActions, existe siempre para que el
                 destino esté en el DOM antes de que nadie apunte a él. -->
                <div id="pageBadges" class="badges"></div>
            </div>

            <!-- El destino de los <Teleport> de las vistas. Existe siempre para
             que el destino esté en el DOM antes de que nadie apunte a él; en
             el móvil los controles se quedan donde estaban y esto queda
             vacío. -->
            <div id="pageActions" class="actions"></div>
        </div>
    </div>
</template>

<style scoped>
/* Sin relleno inferior: el hueco hasta el contenido lo pone el `padding-top`
   que cada pantalla ya tenía. Poner otro aquí los sumaría a los dos. */
.band {
    padding: 18px 0 0;
}

/* El relleno va DENTRO de la caja de ancho máximo, como en el contenido: si va
   fuera, en un monitor ancho el titular arranca 32px antes que lo que tiene
   debajo y se ve descolgado. */
.inner {
    max-width: var(--content-max);

    margin: 0 auto;

    padding: 0 var(--gutter);
}

.title {
    margin: 0;

    font-family: var(--font-serif);

    font-size: var(--text-h1-lg);

    font-weight: 700;

    line-height: 1.15;

    color: var(--ink);

    /* Los títulos largos —el nombre de una asignatura— parten mejor por
       donde el sentido lo pide que por donde cae el ancho. */
    text-wrap: pretty;
}

/* El antetítulo, las migas y los controles son de escritorio: en una pantalla
   de 402px la banda es una línea y no hay sitio para nada más. */
.crumbs,
.section,
.actions,
.badges {
    display: none;
}

@media (min-width: 900px) {
    .band {
        padding: 26px 0 18px;

        border-bottom: 1px solid var(--line);
    }

    .inner {
        display: flex;

        /* Los controles se alinean con la base del titular, no con su caja:
           un buscador flotando a la altura del antetítulo se lee como parte
           de la cabecera y no de la pantalla. */
        align-items: flex-end;

        justify-content: space-between;

        gap: 24px;
    }

    .heading {
        min-width: 0;
    }

    .crumbs,
    .section {
        display: block;

        margin: 0;

        font-size: 9.5px;

        letter-spacing: 0.6px;
    }

    /* Las migas no llevan la clase .eyebrow porque no son una etiqueta sino
       una ruta, pero se leen igual: mono, mayúsculas y pequeñas. */
    .crumbs {
        font-family: var(--font-mono);

        font-weight: 600;

        text-transform: uppercase;

        color: var(--ink-soft);
    }

    .crumbs a {
        color: var(--navy);

        font-weight: 600;
    }

    .separator {
        margin: 0 4px;

        color: var(--ink-soft);
    }

    .current {
        color: var(--ink-soft);
    }

    .title {
        margin-top: 5px;

        font-size: 29px;
    }

    .actions {
        display: flex;

        align-items: flex-end;

        gap: 12px;

        flex: none;
    }

    .badges {
        display: flex;

        flex-wrap: wrap;

        gap: 7px;

        margin-top: 11px;
    }

    .badges:empty {
        display: none;
    }

    /* Una pantalla sin controles no deja un hueco a la derecha. */
    .actions:empty {
        display: none;
    }
}
</style>
