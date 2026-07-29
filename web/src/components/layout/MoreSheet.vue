<script setup>
/**
 * La hoja que sube desde la pestaña "Más".
 *
 * NO es una pantalla: no cambia la ruta, no entra en el historial y al
 * cerrarla sigues donde estabas. Cuatro destinos secundarios no justifican una
 * página intermedia cuyo único contenido sea cuatro enlaces.
 *
 * Cuáles son y cómo se llaman está en content/navigation.js, junto al resto de
 * destinos de la web.
 *
 * Es un diálogo modal de verdad, con lo que eso obliga:
 *   - Escape cierra.
 *   - El foco entra en la hoja y no se escapa a lo que hay debajo mientras
 *     está abierta; al cerrar vuelve a la pestaña que la abrió.
 *   - El fondo no se desplaza al arrastrar sobre el velo.
 */

import { nextTick, ref, watch } from "vue";

import { SHEET_DESTINATIONS } from "@/content/navigation";

import UiIcon from "@/components/ui/UiIcon.vue";

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(["close"]);

const sheet = ref(null);

// Quién tenía el foco antes de abrir, para devolvérselo al cerrar.
let trigger = null;

// Se cierra porque hemos ido a otro sitio, no porque el usuario haya
// desistido. Distinguirlo importa para saber a dónde mandar el foco.
let navigating = false;

const follow = () => {
    navigating = true;
    emit("close");
};

/**
 * Atrapa el tabulador dentro de la hoja. Sin esto se puede tabular hasta los
 * enlaces de la pantalla de debajo, que está tapada por el velo: el foco
 * desaparece de la vista y no hay forma de saber dónde está.
 */
const onKeydown = event => {
    if (event.key === "Escape") {
        emit("close");
        return;
    }

    if (event.key !== "Tab" || !sheet.value) return;

    const focusables = sheet.value.querySelectorAll("a[href],button");

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
};

watch(
    () => props.open,
    async isOpen => {
        // Bloquear el scroll del documento evita el efecto de "dos capas que se
        // mueven" al arrastrar sobre el velo.
        document.body.style.overflow = isOpen ? "hidden" : "";

        if (!isOpen) {
            // Al cerrar sin ir a ningún sitio, el foco vuelve a la pestaña "Más".
            // Si no, se queda huérfano y el siguiente tabulador empieza desde el
            // principio de la página: quien navega con teclado pierde el sitio
            // cada vez que abre y cierra el menú.
            //
            // Si se ha cerrado por seguir un enlace no se toca: manda la pantalla
            // de destino, y robarle el foco para devolverlo a una pestaña sería
            // justo lo contrario de lo que se acaba de pedir.
            if (!navigating && trigger?.isConnected) {
                trigger.focus();
            }

            trigger = null;
            navigating = false;

            return;
        }

        trigger = document.activeElement;

        await nextTick();

        // El primer destino, no el aspa: quien abre el menú quiere ir a algún
        // sitio, no cerrarlo.
        sheet.value?.querySelector("a[href]")?.focus();
    }
);
</script>

<template>
    <Transition name="sheet">
        <div v-if="open" class="layer">
            <div class="scrim" @click="$emit('close')"></div>

            <div
                ref="sheet"
                class="sheet"
                role="dialog"
                aria-modal="true"
                aria-label="Más secciones"
                @keydown="onKeydown"
            >
                <div class="head">
                    <span class="eyebrow">Más</span>

                    <button
                        type="button"
                        class="close"
                        aria-label="Cerrar"
                        @click="$emit('close')"
                    >
                        <UiIcon name="close" :size="9" :width="2.2" />
                    </button>
                </div>

                <RouterLink
                    v-for="destination in SHEET_DESTINATIONS"
                    :key="destination.key"
                    :to="destination.to"
                    class="row"
                    @click="follow"
                >
                    <span class="tile" aria-hidden="true">
                        <span v-if="destination.badge" class="badge">{{
                            destination.badge
                        }}</span>
                        <UiIcon v-else :name="destination.icon" :size="18" />
                    </span>

                    <span class="text">
                        <span class="title">{{ destination.label }}</span>
                        <span class="subtitle">{{ destination.subtitle }}</span>
                    </span>

                    <UiIcon
                        name="chevronRight"
                        :size="13"
                        :width="2"
                        class="chevron"
                    />
                </RouterLink>

                <span class="caret" aria-hidden="true"></span>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.layer {
    position: fixed;

    inset: 0;

    z-index: 30;
}

.scrim {
    position: absolute;

    inset: 0;

    background: var(--scrim);
}

.sheet {
    position: absolute;

    left: 12px;

    right: 12px;

    /* Justo encima de la barra, no pegada: el pico tiene que caber. */
    bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + 8px);

    max-width: calc(var(--content-max) - 24px);

    margin: 0 auto;

    background: var(--surface);

    border: 1px solid var(--line-tab);

    border-radius: var(--radius-sheet);

    box-shadow: var(--shadow-sheet);
}

.head {
    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 11px 14px 9px;

    border-bottom: 1px solid var(--line-inner);
}

.head .eyebrow {
    font-size: var(--text-footnote);

    text-transform: uppercase;
}

.close {
    display: flex;

    align-items: center;

    justify-content: center;

    position: relative;

    width: 22px;

    height: 22px;

    padding: 0;

    border: none;

    border-radius: 50%;

    background: var(--surface-muted);

    color: var(--ink-soft);

    cursor: pointer;
}

.close::after {
    content: "";

    position: absolute;

    left: 50%;

    top: 50%;

    width: var(--touch-target);

    height: var(--touch-target);

    transform: translate(-50%, -50%);
}

.row {
    display: flex;

    align-items: center;

    gap: 12px;

    min-height: var(--touch-target);

    padding: 12px 13px;

    color: var(--ink);

    text-decoration: none;
}

.row + .row {
    /* Línea entre filas, pero sin llegar a los bordes: una regla de lado a
       lado corta la tarjeta en trozos y parece que son cuatro tarjetas. */
    background-image: linear-gradient(var(--line-inner), var(--line-inner));

    background-size: calc(100% - 26px) 1px;

    background-position: 13px 0;

    background-repeat: no-repeat;
}

.row:active {
    background-color: var(--navy-wash);
}

.tile {
    display: flex;

    align-items: center;

    justify-content: center;

    width: 34px;

    height: 34px;

    flex: none;

    border-radius: 9px;

    background: var(--navy-wash);

    color: var(--navy);
}

.badge {
    font-family: var(--font-serif);

    font-size: 12px;

    font-weight: 700;
}

.text {
    flex: 1;

    min-width: 0;

    display: flex;

    flex-direction: column;
}

.text .title {
    font-size: 13.5px;

    font-weight: 700;
}

.subtitle {
    margin-top: 1px;

    font-size: var(--text-num-sm);

    line-height: var(--leading-snug);

    color: var(--ink-soft);
}

.chevron {
    flex: none;

    color: var(--ink-chevron);
}

/* El pico que apunta a la pestaña "Más".
   La pestaña es la cuarta de cuatro, o sea el 87,5 % del ancho de la barra;
   pero la hoja va metida 12px por cada lado y la barra solo 6, así que el
   centro de la pestaña cae algo más a la derecha dentro de la hoja. Sale un
   88,5 %, y se mantiene dentro de ±2px entre 320px y el ancho máximo.
   En porcentaje y no en píxeles: así sigue apuntando al ensancharse. */
.caret {
    position: absolute;

    left: 88.5%;

    bottom: -8px;

    width: 16px;

    height: 16px;

    margin-left: -8px;

    background: var(--surface);

    border-right: 1px solid var(--line-tab);

    border-bottom: 1px solid var(--line-tab);

    transform: rotate(45deg);
}

.sheet-enter-active,
.sheet-leave-active {
    transition: opacity 0.18s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
    transition:
        transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1),
        opacity 0.18s ease;
}

.sheet-enter-from,
.sheet-leave-to {
    opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
    transform: translateY(10px);

    opacity: 0;
}
</style>
