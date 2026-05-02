<template>
    <div class="card border-0 shadow-sm data-table-card">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="app-table-head">
                    <tr>
                        <th
                            v-for="col in columns"
                            :key="col.key"
                            :class="[col.headerClass, { 'th-sortable': col.sortable }]"
                            @click="col.sortable && $emit('sort', col.key)"
                        >
                            {{ col.label }}
                            <i
                                v-if="col.sortable && sortIcon"
                                :class="[
                                    'bi',
                                    sortIcon(col.key),
                                    'sort-icon ms-1',
                                    { 'is-active': sortKey === col.key },
                                ]"
                            ></i>
                        </th>
                        <th v-if="$slots.actions" class="text-end">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="rows.length === 0">
                        <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center text-muted py-4">
                            {{ emptyText }}
                        </td>
                    </tr>

                    <tr v-for="row in rows" :key="row[rowKey]">
                        <td v-for="col in columns" :key="`${row[rowKey]}-${col.key}`" :class="col.cellClass">
                            <slot :name="`cell-${col.key}`" :row="row">
                                {{ row[col.key] ?? '—' }}
                            </slot>
                        </td>

                        <td v-if="$slots.actions" class="text-end">
                            <slot name="actions" :row="row" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
defineProps({
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' },
    sortKey: { type: String, default: '' },
    sortIcon: { type: Function, default: null },
    emptyText: { type: String, default: 'Sin resultados.' },
});

defineEmits(['sort']);
</script>

<style scoped>
.data-table-card {
    overflow: hidden;
}

.app-table-head th {
    background: var(--app-table-head-bg, rgba(0, 0, 0, 0.03));
    color: var(--app-table-head-color, var(--bs-secondary-color));
    border-bottom-color: var(--app-surface-border, var(--bs-border-color-translucent));
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

tbody tr {
    transition: background-color 0.18s ease;
}
</style>
