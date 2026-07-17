import datos from "../../../data/json/processed/Profesores_GuiasDoc.json";

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
        .map((part, i) =>
            i === 0
                ? part
                : part.charAt(0) + "."
        )
        .join(" ");

};

const cache = {};

const years = [...new Set(datos.map(r => r.anyo_academico))];

years.forEach(year => {

    const rows = datos.filter(
        r =>
            r.anyo_academico === year &&
            !r.asignatura.toLowerCase().includes("trabajo fin de grado")
    );

    const professors = new Map();
    const edges = new Set();

    rows.forEach(subject => {

        const profs = subject.profesores.map(name => {

            const id = normalize(name);

            if (!professors.has(id)) {

                professors.set(id, {
                    id,
                    label: shortName(name),
                    subjects: new Set()
                });

            }

            professors.get(id).subjects.add(subject.id_asignatura);

            return id;

        });

        for (let i = 0; i < profs.length; i++) {

            for (let j = i + 1; j < profs.length; j++) {

                const key =
                    profs[i] < profs[j]
                        ? `${profs[i]}|${profs[j]}`
                        : `${profs[j]}|${profs[i]}`;

                edges.add(key);

            }

        }

    });

    cache[year] = {

        nodes: [...professors.values()].map(p => ({
            id: p.id,
            label: p.label,
            value: p.subjects.size
        })),

        edges: [...edges].map(key => {

            const [from, to] = key.split("|");

            return {
                from,
                to
            };

        })

    };

});

export default cache;