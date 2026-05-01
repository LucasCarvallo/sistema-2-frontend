import { ref, computed } from 'vue';

/**
 * Composable de ordenamiento para tablas.
 *
 * @param {import('vue').ComputedRef<Array>} source - Lista reactiva a ordenar.
 *   Normalmente el computed de búsqueda/filtrado de la vista.
 *
 * @example
 *   const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered)
 */
export function useTableSort(source) {
    const sortKey = ref('');
    const sortDir = ref('asc'); // 'asc' | 'desc'

    /** Cambia la columna activa o invierte la dirección si ya está activa */
    function sort(key) {
        if (sortKey.value === key) {
            sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey.value = key;
            sortDir.value = 'asc';
        }
    }

    /** Clase Bootstrap Icons según el estado de ordenamiento de la columna `key` */
    function sortIcon(key) {
        if (sortKey.value !== key) return 'bi-arrow-down-up';
        return sortDir.value === 'asc' ? 'bi-sort-down' : 'bi-sort-up';
    }

    /** Lista final, ordenada según la columna activa */
    const sorted = computed(() => {
        if (!sortKey.value) return source.value;

        return [...source.value].sort((a, b) => {
            const valA = a[sortKey.value] ?? '';
            const valB = b[sortKey.value] ?? '';

            const cmp =
                typeof valA === 'number' && typeof valB === 'number'
                    ? valA - valB
                    : String(valA).localeCompare(String(valB), 'es', { sensitivity: 'base' });

            return sortDir.value === 'asc' ? cmp : -cmp;
        });
    });

    return { sortKey, sortDir, sort, sortIcon, sorted };
}
