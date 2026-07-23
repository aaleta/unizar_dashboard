<script setup>

/**
 * Buscador de las listas. Filtra en vivo mientras se escribe.
 *
 * `type="search"` y no `text`: en el móvil aparece la tecla "buscar" en vez de
 * "intro" y el navegador ofrece la ✕ para vaciar. `enterkeyhint="search"` lo
 * refuerza donde el tipo no basta.
 *
 * Sin autocorrección ni mayúscula automática: aquí se escriben nombres de
 * asignatura, y el corrector del teléfono los destroza.
 */

defineProps({

    placeholder: {
        type: String,
        default: "Buscar…"
    },

    label: {
        type: String,
        default: "Buscar"
    }

});

const model = defineModel({ type: String, default: "" });

</script>

<template>

<label class="field">

    <span class="visuallyHidden">{{ label }}</span>

    <svg
        class="icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            stroke-width="2"
        />
        <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
        />
    </svg>

    <input
        v-model="model"
        type="search"
        class="input"
        :placeholder="placeholder"
        enterkeyhint="search"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
    >

</label>

</template>

<style scoped>

.field{

    display:flex;

    align-items:center;

    gap:8px;

    /* Altura táctil completa: es el control que más se usa de la pantalla. */
    min-height:var(--touch-target);

    padding:9px 11px;

    background:var(--surface);

    border:1px solid var(--line-strong);

    border-radius:var(--radius-control);

}

.field:focus-within{

    border-color:var(--navy);

}

.icon{

    flex:none;

    color:var(--ink-icon);

}

.input{

    flex:1;

    min-width:0;

    border:none;

    outline:none;

    background:none;

    padding:0;

    font-family:var(--font-sans);

    font-size:13px;

    color:var(--ink);

}

/* Por debajo de 16px, iOS hace zoom al enfocar un campo y descoloca la
   pantalla entera. El texto se ve igual; lo que cambia es que no salta. */
@supports (-webkit-touch-callout:none){

    .input{

        font-size:16px;

    }

}

.input::placeholder{

    color:var(--ink-placeholder);

}

/* La ✕ nativa de WebKit no hereda el color y se ve como un pegote azul. */
.input::-webkit-search-cancel-button{

    filter:grayscale(1) opacity(.5);

}

.visuallyHidden{

    position:absolute;

    width:1px;

    height:1px;

    padding:0;

    margin:-1px;

    overflow:hidden;

    clip-path:inset(50%);

    white-space:nowrap;

}

</style>
