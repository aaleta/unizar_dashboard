/**
 * Cuántos son, para las pantallas que lo cuentan.
 *
 * Los de asignaturas y cursos salen del catálogo, que ya está cargado. El de
 * profesores vive en el grafo, y el grafo arrastra 250 kB de guías docentes:
 * por eso se pide en diferido y solo desde donde de verdad se enseña. Un
 * teléfono no debería descargar un cuarto de mega para ver un número al lado
 * de la palabra "profesores".
 *
 * Está aquí, y no repetido en cada vista, para que el rodeo se explique una
 * sola vez.
 */

export const loadProfessorCount = async () => {
    const { default: cache, ALL_YEARS } = await import("@/utils/NodesLinks");

    return cache[ALL_YEARS].nodes.length;
};
