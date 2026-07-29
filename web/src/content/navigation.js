/**
 * A dónde se puede ir en esta web, escrito una sola vez.
 *
 * Los mismos destinos los pintan tres sitios: la barra de pestañas y la hoja
 * "Más" en móvil, y la lateral en escritorio. Con la lista escrita en cada uno,
 * corregir "Monta tu horario" obliga a acordarse de los tres, y el que se
 * olvida no falla hasta que alguien lo ve.
 *
 * Aquí solo vive el destino: cómo se llama, a dónde lleva, con qué icono y en
 * qué grupo cae. El aspecto lo pone cada carcasa, que para eso son distintas.
 */

export const GROUPS = [
    { key: "grado", label: "El grado" },
    { key: "herramientas", label: "Herramientas" },
    { key: "letra-pequena", label: "La letra pequeña" }
];

/**
 * Campos de un destino:
 *
 *   label      cómo se lee en un menú (NO es el título de la pantalla: ese
 *              sale de `meta.title` en el router y se escribe como titular)
 *   subtitle   solo la hoja "Más", que tiene sitio para explicarse
 *   icon       nombre en UiIcon; `badge` lo sustituye por un glifo
 *   group      en qué grupo de la lateral cae
 *   tab        una de las tres pestañas fijas del móvil
 *   sheet      aparece en la hoja "Más" del móvil
 *   countKey   recuento que la lateral cuelga a la derecha; lo resuelve ella,
 *              que es quien tiene los datos delante
 *   tag        insignia de oro a la derecha, en la lateral
 *   matches    con qué rutas se considera activo
 *   tabMatches lo mismo, pero para la pestaña del móvil, que abarca más
 */
export const DESTINATIONS = [
    {
        key: "inicio",
        to: "/",
        label: "Inicio",
        icon: "home",
        group: "grado",
        tab: true,
        matches: path => path === "/"
    },

    {
        key: "grado",
        to: "/grado",
        label: "El Grado",
        icon: "layers",
        group: "grado",
        tab: true,
        matches: path => path.startsWith("/grado"),
        /**
         * En el móvil la pestaña "El Grado" se queda encendida también en la
         * lista de asignaturas y en la ficha: son la misma rama del árbol vista
         * con más o menos zoom, y verla apagarse al abrir una asignatura da la
         * sensación de haberte salido de la sección. En la lateral no hace
         * falta, porque "Asignaturas" tiene entrada propia.
         */
        tabMatches: path =>
            path.startsWith("/grado") ||
            path.startsWith("/asignatura") ||
            path.startsWith("/curso")
    },

    {
        key: "asignaturas",
        to: "/asignaturas",
        label: "Asignaturas",
        icon: "document",
        group: "grado",
        countKey: "asignaturas",
        matches: path => path.startsWith("/asignaturas")
    },

    {
        key: "optativas",
        to: "/optativas",
        label: "Optativas",
        icon: "bookmark",
        group: "grado",
        tab: true,
        countKey: "optativas",
        matches: path => path.startsWith("/optativas")
    },

    {
        key: "horario",
        to: "/horario",
        label: "Monta tu horario",
        subtitle: "Tus clases y exámenes, sin solapamientos.",
        icon: "calendar",
        group: "herramientas",
        sheet: true,
        matches: path => path.startsWith("/horario")
    },

    {
        key: "profesorado",
        to: "/profesorado",
        label: "Profesorado",
        subtitle: "Quién imparte qué y con quién.",
        icon: "teachers",
        group: "herramientas",
        sheet: true,
        countKey: "profesorado",
        matches: path => path.startsWith("/profesorado")
    },

    {
        key: "fight",
        to: "/fight",
        label: "Fight Mode",
        subtitle: "Enfrenta dos asignaturas.",
        badge: "VS",
        group: "herramientas",
        sheet: true,
        matches: path => path.startsWith("/fight")
    },

    {
        key: "metodologia",
        to: "/metodologia",
        label: "Fuentes y metodología",
        subtitle: "Qué mide cada tasa y sus fuentes.",
        icon: "document",
        group: "letra-pequena",
        sheet: true,
        matches: path => path.startsWith("/metodologia")
    },

    {
        key: "acerca",
        to: "/acerca",
        label: "Acerca de",
        subtitle: "Quién lo hace, cómo y por qué.",
        icon: "info",
        group: "letra-pequena",
        sheet: true,
        matches: path => path.startsWith("/acerca")
    }
];

/** Las tres pestañas fijas de la barra inferior, en orden. */
export const TABS = DESTINATIONS.filter(destination => destination.tab);

/** Los destinos secundarios, los que viven en la hoja "Más". */
export const SHEET_DESTINATIONS = DESTINATIONS.filter(
    destination => destination.sheet
);

/**
 * ¿Está activo este destino en esta ruta?
 *
 * `broad` es el criterio de la barra de pestañas, que absorbe las rutas hijas;
 * sin él manda `matches`, que es el estricto.
 */
export const isActive = (destination, path, broad = false) =>
    (broad && destination.tabMatches
        ? destination.tabMatches
        : destination.matches)(path);
