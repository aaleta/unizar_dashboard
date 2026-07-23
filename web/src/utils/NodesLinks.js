import datos from "../../../data/json/processed/Profesores_GuiasDoc.json";

/**
 * Construye la red de colaboración docente.
 *
 * Nodos   = profesores. Su tamaño es el nº de asignaturas distintas que imparten.
 * Aristas = dos profesores que comparten asignatura. Su grosor es el PESO de la
 *           colaboración, no el número de veces que aparecen juntos.
 *
 * Peso: compartir una asignatura de 2 profesores es una colaboración estrecha;
 * compartir una de 8 apenas significa nada. Por eso cada pareja suma 1/n en cada
 * asignatura y curso académico, donde n es el nº de profesores de esa asignatura
 * ese año. Un mismo dúo que repite asignatura curso tras curso acumula peso.
 */

export const ALL_YEARS = "all";

const UNASSIGNED = "no asignados / no encontrados";

const normalize = name =>
    name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const shortName = name => {

    const parts = name.split(" ");

    if (parts.length === 1) return name;

    return parts
        .map((part, i) => (i === 0 ? part : `${part.charAt(0)}.`))
        .join(" ");

};

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** El TFG lo firma medio departamento y saturaría el grafo de aristas falsas. */
const usableRows = datos.filter(
    row => !row.asignatura.toLowerCase().includes("trabajo fin de grado")
);

const years = [...new Set(usableRows.map(row => row.anyo_academico))].sort();

/**
 * Acumula profesores y pesos de colaboración sobre un conjunto de filas.
 * @returns {{ nodes: Array, edges: Array }} formato de vis-network
 */
const buildGraph = rows => {

    const professors = new Map();
    const weights = new Map();

    rows.forEach(row => {

        const teachers = row.profesores
            .filter(name => normalize(name) !== UNASSIGNED)
            .map(name => {

                const id = normalize(name);

                if (!professors.has(id)) {

                    professors.set(id, {
                        id,
                        label: shortName(name),
                        fullName: name.trim(),
                        subjects: new Set(),
                        years: new Set()
                    });

                }

                const professor = professors.get(id);

                professor.subjects.add(row.id_asignatura);
                professor.years.add(row.anyo_academico);

                return id;

            });

        // Sin pareja no hay colaboración que pesar.
        if (teachers.length < 2) return;

        // Cada pareja de esta asignatura-año aporta 1/n.
        const share = 1 / teachers.length;

        for (let i = 0; i < teachers.length; i++) {

            for (let j = i + 1; j < teachers.length; j++) {

                const key = pairKey(teachers[i], teachers[j]);

                const current = weights.get(key) ?? { weight: 0, shared: 0 };

                current.weight += share;
                current.shared += 1;

                weights.set(key, current);

            }

        }

    });

    /**
     * Los campos estructurados (fullName, subjects, years, weight, shared) van
     * junto a los que espera vis-network (id, label, value, title).
     *
     * El dato ya se calculaba, pero solo sobrevivía dentro de la cadena
     * `title` del tooltip. La ficha de profesor del móvil lo necesita como
     * dato, y sacarlo de ahí a base de parsear texto sería absurdo: es el
     * mismo cálculo, expuesto en vez de escondido.
     */
    const nodes = [...professors.values()].map(professor => ({
        id: professor.id,
        label: professor.label,
        value: professor.subjects.size,
        fullName: professor.fullName,
        subjects: [...professor.subjects],
        years: [...professor.years].sort(),
        title:
            `${professor.fullName}\n` +
            `${professor.subjects.size} asignatura(s) distintas\n` +
            `${professor.years.size} curso(s) académico(s)`
    }));

    const edges = [...weights.entries()].map(([key, data]) => {

        const [from, to] = key.split("|");

        return {
            from,
            to,
            value: data.weight,
            weight: data.weight,
            shared: data.shared,
            title:
                `Peso de colaboración: ${data.weight.toFixed(2)}\n` +
                `${data.shared} asignatura(s)-curso compartidas`
        };

    });

    return { nodes, edges };

};

const cache = {};

years.forEach(year => {

    cache[year] = buildGraph(
        usableRows.filter(row => row.anyo_academico === year)
    );

});

// Vista agregada: todos los cursos académicos a la vez.
cache[ALL_YEARS] = buildGraph(usableRows);

export const availableYears = years;

export default cache;
