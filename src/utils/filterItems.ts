// Función global para filtrar items por término de búsqueda
export default function filterItems<T extends Record<string, unknown>>(
    items: T[],
    term: string
): T[] {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) return items;

    return items.filter((item) =>
        Object.keys(item).some((key) => {
            const value = item[key];
            if (value === null || value === undefined) return false;
            if (typeof value === "object") {
                // Busca en sub-objetos (ej. owner.name, user.name)
                return Object.values(value as Record<string, unknown>).some(
                    (nested) =>
                        typeof nested === "string" &&
                        nested.toLowerCase().includes(normalizedTerm)
                );
            }
            return String(value).toLowerCase().includes(normalizedTerm);
        })
    );
}
