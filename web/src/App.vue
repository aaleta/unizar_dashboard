<script setup>

/**
 * La barra lateral oscura se retira: la navegación pasa a la carcasa móvil
 * (cabecera navy + pestañas abajo + hoja "Más").
 *
 * Sidebar.vue se queda en el repositorio a propósito, aunque ya no se monte:
 * es el mapa de navegación de escritorio que hay que reencarnar cuando le
 * toque el rediseño, y se lee mejor del componente que del historial de git.
 */

import AppShell from "./components/layout/AppShell.vue";

</script>

<template>

<AppShell>
    <RouterView />
</AppShell>

</template>
