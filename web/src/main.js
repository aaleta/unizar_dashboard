import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { useNavigationProgress } from "./composables/useNavigationProgress";
import "./style.css";

const app = createApp(App);

app.use(router);

// Barra de carga entre pantallas. Se engancha aquí y no dentro de un
// componente porque son ganchos del router, no del ciclo de vida de una vista.
useNavigationProgress(router);

app.mount("#app");
