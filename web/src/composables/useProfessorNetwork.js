/**
 * La red de colaboración docente, vista persona a persona.
 *
 * En escritorio la red es un grafo de 267 nodos y 2.003 aristas. En un móvil
 * esa madeja no se lee: los nodos se solapan, no se puede hacer zoom con
 * precisión y no responde a ninguna pregunta. Así que el móvil da la vuelta al
 * problema y pregunta por una persona: con quién comparte asignatura y cuánto.
 *
 * Mismo modelo de datos que el grafo —los mismos pesos 1/n, el TFG excluido—
 * y los mismos números totales. Solo cambia por dónde se entra.
 */

import { computed, unref } from "vue";

import cache, { ALL_YEARS, availableYears } from "@/utils/NodesLinks";

import { subjectName } from "@/utils/metrics";

const graph = cache[ALL_YEARS];

const normalize = text =>
    String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Índice de colaboradores por persona. Se construye una vez al cargar el
 * módulo: recorrer 2.003 aristas por cada pulsación de tecla del buscador
 * sería un derroche, y son datos que no cambian.
 */
const collaborators = new Map();

graph.edges.forEach(edge => {
    [
        [edge.from, edge.to],
        [edge.to, edge.from]
    ].forEach(([self, other]) => {
        if (!collaborators.has(self)) collaborators.set(self, []);

        collaborators.get(self).push({
            id: other,
            weight: edge.weight,
            shared: edge.shared
        });
    });
});

collaborators.forEach(list => list.sort((a, b) => b.weight - a.weight));

const byId = new Map(graph.nodes.map(node => [node.id, node]));

/** El curso de la última guía docente publicada: quien aparece ahí, está activo. */
const latestYear = availableYears[availableYears.length - 1];

/**
 * Qué asignaturas imparte cada profesor ESTE curso. El grafo agregado mezcla
 * toda la historia; la ficha separa "imparte ahora" de "ha impartido", y esa
 * distinción solo está en el grafo del último curso.
 */
const currentSubjects = new Map(
    cache[latestYear].nodes.map(node => [node.id, new Set(node.subjects)])
);

const people = graph.nodes
    .map(node => {
        const edges = collaborators.get(node.id) ?? [];

        return {
            id: node.id,
            name: node.fullName,
            subjects: node.subjects,
            years: node.years,
            nSubjects: node.subjects.length,
            nCollaborators: edges.length,
            // Cuántas asignaturas-curso ha compartido en total.
            nCollaborations: edges.reduce((sum, edge) => sum + edge.shared, 0),
            // La suma de sus pesos 1/n: cuánta docencia compartida acumula.
            totalWeight: edges.reduce((sum, edge) => sum + edge.weight, 0),
            active: node.years.includes(latestYear),
            search: normalize(node.fullName)
        };
    })
    // Ordenados por peso acumulado: la misma magnitud que dimensiona las
    // barras de la ficha, para que la lista y la ficha cuenten lo mismo.
    .sort((a, b) => b.totalWeight - a.totalWeight || b.nSubjects - a.nSubjects);

const peopleById = new Map(people.map(person => [person.id, person]));

export const useProfessorNetwork = (
    querySource,
    selectedSource,
    activeOnlySource
) => {
    const read = source =>
        typeof source === "function" ? source() : unref(source);

    const results = computed(() => {
        const needle = normalize(String(read(querySource) ?? "").trim());

        const pool = read(activeOnlySource)
            ? people.filter(person => person.active)
            : people;

        return needle
            ? pool.filter(person => person.search.includes(needle))
            : pool;
    });

    /** La ficha abierta: por defecto, la persona de mayor alcance. */
    const selected = computed(() => {
        const id = read(selectedSource) || results.value[0]?.id;

        const person = peopleById.get(id);

        if (!person) return null;

        // Código y nombre juntos: la píldora de la ficha enlaza a la
        // asignatura, y para eso hace falta el código.
        const subjectItems = person.subjects
            .map(code => ({ code, name: subjectName(code) }))
            .sort((a, b) => a.name.localeCompare(b.name, "es"));

        const current = currentSubjects.get(person.id) ?? new Set();

        return {
            ...person,
            currentSubjectItems: subjectItems.filter(subject =>
                current.has(subject.code)
            ),
            pastSubjectItems: subjectItems.filter(
                subject => !current.has(subject.code)
            ),
            topCollaborators: (collaborators.get(person.id) ?? [])
                .slice(0, 5)
                .map(item => ({
                    id: item.id,
                    name: byId.get(item.id)?.fullName ?? item.id,
                    weight: item.weight,
                    shared: item.shared
                }))
        };
    });

    return {
        results,

        selected,

        totals: {
            professors: graph.nodes.length,
            active: people.filter(person => person.active).length,
            collaborations: graph.edges.length,
            years: availableYears.length
        }
    };
};
