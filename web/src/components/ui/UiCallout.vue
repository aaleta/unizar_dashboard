<script setup>

/**
 * Aviso destacado. Tres tonos, tres significados distintos:
 *
 *   structural → contexto neutro ("6 troncales, aprueban el 94%"). Carbón,
 *                porque es estructura, no un dato malo.
 *   hard       → la advertencia con peso ("la troncal más dura del grado").
 *                Usa la paleta cálida de la rampa, que es lo que describe.
 *   caution    → cohorte pequeña, datos poco fiables. Amarillo: pide cautela,
 *                no alarma. Un suspenso alto con 6 alumnos no es una asignatura
 *                dura, es una muestra pequeña, y decirlo en rojo mentiría.
 */

defineProps({

    tone: {
        type: String,
        default: "structural",
        validator: value => ["structural", "hard", "caution"].includes(value)
    },

    title: {
        type: String,
        default: null
    }

});

</script>

<template>

<div
    class="callout"
    :class="tone"
>

    <span class="marker"></span>

    <div class="body">

        <div
            v-if="title"
            class="title"
        >
            {{ title }}
        </div>

        <div class="text">
            <slot />
        </div>

    </div>

</div>

</template>

<style scoped>

.callout{

    display:flex;

    align-items:flex-start;

    gap:10px;

    padding:11px 13px;

    border-radius:var(--radius-card);

    border:var(--rule-strong) solid;

}

/* Cuadro, no punto. Un círculo es una gota; un cuadrado es una marca hecha
   con el canto de un sello, que es lo que toda esta dirección imita. */
.marker{

    width:9px;

    height:9px;

    flex:none;

    /* Alineado con la primera línea de texto, no con el borde de la caja. */
    margin-top:3px;

}

.body{

    min-width:0;

}

.title{

    font-family:var(--font-display);

    font-size:var(--text-body);

    font-weight:800;

    letter-spacing:var(--track-display);

    text-transform:uppercase;

    line-height:1.2;

}

.text{

    font-size:var(--text-body-xs);

    line-height:var(--leading-snug);

}

/* Sin título, el texto es el mensaje y carga el peso. */
.body:not(:has(.title)) .text{

    font-weight:500;

}

.structural{

    background:var(--carbon-wash);

    border-color:var(--carbon-wash-line);

}

.structural .marker{

    background:var(--carbon);

}

.structural .title{

    color:var(--carbon);

}

.structural .text{

    color:var(--carbon-ink);

}

.hard{

    background:var(--warn-bg);

    border-color:var(--warn-line);

}

.hard .marker{

    background:var(--warn-title);

}

.hard .title{

    color:var(--warn-title);

}

.hard .text{

    color:var(--warn-body);

}

.caution{

    background:var(--caution-bg);

    border-color:var(--caution-line);

}

/* El amarillo de seguridad sobre papel claro tiene poquísimo contraste: solo
   se ve porque va encerrado en tinta. El borde no es adorno, es lo que hace
   visible el marcador. */
.caution .marker{

    background:var(--caution);

    border:var(--rule) solid var(--ink);

}

.caution .title,
.caution .text{

    color:var(--caution-ink);

}

</style>
