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
    String(text)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();

/**
 * Índice de colaboradores por persona. Se construye una vez al cargar el
 * módulo: recorrer 2.003 aristas por cada pulsación de tecla del buscador
 * sería un derroche, y son datos que no cambian.
 */
const collaborators = new Map();

graph.edges.forEach(edge => {

    [[edge.from, edge.to], [edge.to, edge.from]].forEach(([self, other]) => {

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

const people = graph.nodes
    .map(node => ({
        id: node.id,
        name: node.fullName,
        subjects: node.subjects,
        years: node.years,
        nSubjects: node.subjects.length,
        nCollaborators: collaborators.get(node.id)?.length ?? 0,
        search: normalize(node.fullName)
    }))
    // Ordenados por alcance: con cuánta gente distinta ha coincidido. Es la
    // medida que mejor separa a quien lleva media carrera de quien dio una
    // asignatura un año.
    .sort((a, b) =>
        b.nCollaborators - a.nCollaborators || b.nSubjects - a.nSubjects
    );

const peopleById = new Map(people.map(person => [person.id, person]));

export const useProfessorNetwork = (querySource, selectedSource) => {

    const read = source =>
        typeof source === "function" ? source() : unref(source);

    const results = computed(() => {

        const needle = normalize(String(read(querySource) ?? "").trim());

        return needle
            ? people.filter(person => person.search.includes(needle))
            : people;

    });

    /** La ficha abierta: por defecto, la persona de mayor alcance. */
    const selected = computed(() => {

        const id = read(selectedSource) || results.value[0]?.id;

        const person = peopleById.get(id);

        if (!person) return null;

        return {
            ...person,
            subjectNames: person.subjects
                .map(code => subjectName(code))
                .sort((a, b) => a.localeCompare(b, "es")),
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
            collaborations: graph.edges.length,
            years: availableYears.length
        }

    };

};
