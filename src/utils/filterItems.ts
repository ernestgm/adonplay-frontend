// Función global para filtrar items por término de búsqueda
export default function filterItems(items: any, term: any) {
    return items.filter((item: any) =>
        Object.keys(item).some((key) =>
            item[key]?.toString().toLowerCase().includes(term.toLowerCase())
        )
    );
}

