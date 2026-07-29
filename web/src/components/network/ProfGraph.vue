<script setup>
/**
 * La madeja: cada nodo un profesor, cada arista una asignatura compartida.
 *
 * Se carga en diferido porque `vis-network` pesa medio mega; un teléfono, que
 * no la enseña, no debería descargarla.
 *
 * Sobre el color: aquí no hay ninguna magnitud codificada en el tono. El
 * tamaño del nodo dice cuántas asignaturas distintas imparte y el grosor de la
 * arista, cuánto pesa la colaboración; el navy es estructura, como en el resto
 * de la web. Esta pantalla venía del diseño anterior con fondo oscuro y azules
 * de otra paleta, y era lo único del árbol que no hablaba el idioma de la casa.
 *
 * La composición del lienzo no es la que sale de la física: el grafo tiene un
 * grupo principal y una veintena de parejas y tríos sueltos, y el layout por
 * defecto los reparte alrededor dejando el centro medio vacío. Aquí el grupo
 * principal se queda arriba, a todo el ancho, y los sueltos se ordenan en una
 * banda debajo, de mayor a menor.
 */

import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.css";

const props = defineProps({
    graph: {
        type: Object,
        required: true
    },

    /** Quién está seleccionado en la lista de al lado. */
    selectedId: {
        type: String,
        default: ""
    }
});

const emit = defineEmits(["select"]);

const container = ref(null);

let network = null;

/** Ni el navy ni el gris se escriben aquí: se leen del tema. */
const themeColor = name =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const options = () => {
    const navy = themeColor("--navy");
    const edge = themeColor("--navy-meta");
    const paper = themeColor("--surface");

    return {
        autoResize: true,

        nodes: {
            shape: "dot",

            scaling: { min: 6, max: 26 },

            font: {
                color: themeColor("--ink-2"),
                size: 12,
                face: "Public Sans"
            },

            color: {
                background: navy,
                border: navy,
                highlight: { background: navy, border: navy },
                hover: { background: navy, border: navy }
            },

            borderWidth: 0,

            // El nodo elegido se marca con un anillo, no con otro color: el
            // color ya dice otra cosa.
            chosen: {
                node: (values, id, selected) => {
                    values.borderWidth = selected ? 2 : 0;
                    values.borderColor = paper;
                }
            },

            opacity: 0.88
        },

        edges: {
            scaling: { min: 1, max: 7 },

            color: {
                // Un gris azulado con cuerpo: el `--navy-line` de las píldoras
                // es un borde de 1px sobre blanco y aquí, en diagonal y a 235
                // trazos, no se veía.
                color: edge,
                highlight: navy,
                hover: navy,
                opacity: 0.5
            },

            // Las curvas cuestan muy caro con miles de aristas.
            smooth: false
        },

        interaction: {
            hover: true,
            zoomView: true,
            dragView: true,
            navigationButtons: false,
            tooltipDelay: 150
        },

        physics: {
            stabilization: { enabled: true, iterations: 260 },

            barnesHut: {
                gravitationalConstant: -6200,
                springLength: 150,
                springConstant: 0.035
            }
        }
    };
};

/**
 * Los grupos conexos del grafo, de mayor a menor. Es lo que permite tratar al
 * principal distinto de los sueltos.
 */
const components = edges => {
    const parent = new Map();

    const find = id => {
        if (!parent.has(id)) parent.set(id, id);

        while (parent.get(id) !== id) {
            parent.set(id, parent.get(parent.get(id)));
            id = parent.get(id);
        }

        return id;
    };

    edges.forEach(edge => {
        const a = find(edge.from);
        const b = find(edge.to);

        if (a !== b) parent.set(a, b);
    });

    const groups = new Map();

    props.graph.nodes.forEach(node => {
        const root = find(node.id);

        if (!groups.has(root)) groups.set(root, []);

        groups.get(root).push(node.id);
    });

    return [...groups.values()].sort((a, b) => b.length - a.length);
};

const box = (positions, ids) => {
    const xs = ids.map(id => positions[id].x);
    const ys = ids.map(id => positions[id].y);

    return {
        left: Math.min(...xs),
        right: Math.max(...xs),
        top: Math.min(...ys),
        bottom: Math.max(...ys),
        width: Math.max(...xs) - Math.min(...xs) || 1,
        height: Math.max(...ys) - Math.min(...ys) || 1
    };
};

/**
 * Recoloca los grupos sueltos en una banda bajo el principal. Solo se mueven
 * posiciones: los radios son el dato y no se tocan.
 */
/** Cuántos grupos sueltos caben en una fila de la banda. */
const PER_ROW = 10;

/** Dónde van los dos rótulos del lienzo, en coordenadas del grafo. */
const captions = ref(null);

/**
 * Recoloca los grupos sueltos en una banda bajo el principal, en filas de diez
 * para que cada uno tenga sitio de verse. Solo se mueven posiciones: los radios
 * son el dato y no se tocan.
 */
const compose = () => {
    const groups = components(props.graph.edges);

    captions.value = null;

    if (groups.length < 2) {
        network.fit({ animation: false });

        network.redraw();

        return;
    }

    const positions = network.getPositions();

    const main = box(positions, groups[0]);

    const rest = groups.slice(1);

    const columns = Math.min(PER_ROW, rest.length);

    const slot = main.width / columns;

    const gap = Math.max(main.height * 0.14, 70);

    const top = main.bottom + gap;

    rest.forEach((group, index) => {
        const current = box(positions, group);

        const column = index % columns;
        const row = Math.floor(index / columns);

        const centerX = main.left + slot * (column + 0.5);

        // Se encoge lo justo para caber en su hueco, nunca se estira.
        const scale = Math.min(1, (slot * 0.72) / current.width);

        group.forEach(id => {
            network.moveNode(
                id,
                centerX +
                    (positions[id].x - (current.left + current.width / 2)) *
                        scale,
                top +
                    row * (gap * 0.8) +
                    (positions[id].y - current.top) * scale
            );
        });
    });

    captions.value = {
        main: {
            x: main.left,
            y: main.bottom + gap * 0.42,
            text: `grupo principal · ${groups[0].length} profesores`
        },
        rest: {
            x: main.left,
            // Por encima de la banda, no encima de sus nodos.
            y: top - gap * 0.42,
            text: `${rest.length} grupos sueltos, sin conexión con el principal`
        }
    };

    network.fit({ animation: false });

    // `fit` solo apunta la vista nueva; el repintado va aparte y explícito,
    // que si no queda al albur del siguiente fotograma.
    network.redraw();

    place();
};

/**
 * Los rótulos son HTML sobre el lienzo, no nodos falsos: un texto dentro del
 * grafo tendría que ser un nodo, y un nodo que no es un profesor mentiría en
 * todos los recuentos. Se recolocan en cada repintado para que acompañen al
 * zoom y al arrastre.
 */
const mainCaption = ref(null);

const restCaption = ref(null);

const place = () => {
    if (!network || !captions.value) return;

    [
        [mainCaption.value, captions.value.main],
        [restCaption.value, captions.value.rest]
    ].forEach(([element, caption]) => {
        if (!element) return;

        const point = network.canvasToDOM(caption);

        element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    });
};

const draw = () => {
    if (!container.value) return;

    if (!network) {
        network = new Network(container.value, props.graph, options());

        network.on("click", params => {
            emit("select", params.nodes[0] ?? "");
        });

        network.on("afterDrawing", place);

        network.once("stabilizationIterationsDone", () => {
            network.setOptions({ physics: false });
            compose();
        });

        return;
    }

    network.setOptions({ physics: true });
    network.setData(props.graph);

    network.once("stabilizationIterationsDone", () => {
        network.setOptions({ physics: false });
        compose();
    });
};

onMounted(draw);

/**
 * El grafo llega como computed y se recalcula por su cuenta; si se redibujara
 * con cada objeto nuevo, la física volvería a empezar sin que haya cambiado
 * nada. Se compara por contenido, que es lo que de verdad importa.
 */
const signature = graph =>
    `${graph.nodes.length}:${graph.edges.length}:${graph.nodes[0]?.id ?? ""}`;

watch(
    () => signature(props.graph),
    () => draw()
);

watch(
    () => props.selectedId,
    id => {
        if (!network) return;

        if (id && props.graph.nodes.some(node => node.id === id)) {
            network.selectNodes([id]);
        } else {
            network.unselectAll();
        }
    }
);

onBeforeUnmount(() => {
    network?.destroy();
    network = null;
});

const empty = computed(() => props.graph.nodes.length === 0);
</script>

<template>
    <div class="graph">
        <p v-if="empty" class="empty">
            Ninguna colaboración supera el peso mínimo seleccionado. Baja el
            filtro para ver más.
        </p>

        <div v-show="!empty" class="canvasWrap">
            <div ref="container" class="canvas"></div>

            <span
                v-show="captions"
                ref="mainCaption"
                class="num caption"
                aria-hidden="true"
                >{{ captions?.main.text }}</span
            >

            <span
                v-show="captions"
                ref="restCaption"
                class="num caption"
                aria-hidden="true"
                >{{ captions?.rest.text }}</span
            >
        </div>
    </div>
</template>

<style scoped>
.graph {
    display: flex;

    flex-direction: column;

    width: 100%;

    /* Crece con la columna de al lado: el panel tiene que acabar donde acaba
       el histograma, no antes. `min-height: 0` es lo que deja que encoja: sin
       él, un hijo de flex no baja de su contenido. */
    flex: 1;

    min-height: 0;
}

/**
 * El lienzo va ABSOLUTO dentro de esta caja, y no al 100 % de alto.
 *
 * vis-network mide el contenedor y ajusta el canvas a lo que mide; si el
 * contenedor mide, a su vez, lo que ocupa el canvas, cada medición lo hace un
 * poco más alto y la página crece sin parar. En absoluto, el lienzo toma su
 * tamaño de la caja y no puede devolvérselo.
 */
.canvasWrap {
    position: relative;

    flex: 1;

    min-height: 440px;

    max-height: 900px;
}

.canvas {
    position: absolute;

    inset: 0;

    background: var(--surface);

    border-radius: var(--radius-card);
}

/* Rótulos de los dos bloques del lienzo. */
.caption {
    position: absolute;

    top: 0;

    left: 0;

    font-size: var(--text-num-sm);

    font-weight: 400;

    color: var(--ink-soft);

    white-space: nowrap;

    pointer-events: none;
}

.empty {
    display: flex;

    align-items: center;

    justify-content: center;

    min-height: 300px;

    margin: 0;

    padding: 0 24px;

    border: 1px dashed var(--line-strong);

    border-radius: var(--radius-card);

    text-align: center;

    font-size: var(--text-body);

    color: var(--ink-soft);
}
</style>
