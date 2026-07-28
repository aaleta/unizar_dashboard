<script setup>

/**
 * Toda la navegación vive en AppShell: cabecera navy, pestañas abajo y hoja
 * "Más". El mapa completo de rutas está en router/index.js.
 */

import AppShell from "./components/layout/AppShell.vue";

</script>

<template>

<AppShell>
    <RouterView />
</AppShell>

</template>
