// Función global para filtrar items por término de búsqueda
export default function filterItems(items, term) {
    return items.filter((item) =>
        Object.keys(item).some((key) =>
            item[key]?.toString().toLowerCase().includes(term.toLowerCase())
        )
    );
}

