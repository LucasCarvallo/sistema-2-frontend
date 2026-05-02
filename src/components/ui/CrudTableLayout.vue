<template>
    <div>
        <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
            <h4 class="mb-0"><i :class="['bi', icon, 'me-2', 'text-primary']"></i>{{ title }}</h4>
            <button class="btn btn-success btn-sm" type="button" @click="$emit('create')">
                <i class="bi bi-plus-lg me-1"></i>{{ createLabel }}
            </button>
        </div>

        <div class="mb-3">
            <div class="input-group input-group-sm" :style="{ maxWidth: searchMaxWidth }">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                    :value="search"
                    type="text"
                    class="form-control"
                    :placeholder="searchPlaceholder"
                    @input="$emit('update:search', $event.target.value)"
                    @keydown.esc.stop="$emit('update:search', '')"
                />
            </div>
        </div>

        <DataTable
            :columns="columns"
            :rows="rows"
            :sort-key="sortKey"
            :sort-icon="sortIcon"
            :empty-text="emptyText"
            @sort="$emit('sort', $event)"
        >
            <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps" />
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import DataTable from '@/components/ui/DataTable.vue';

defineProps({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    createLabel: { type: String, default: 'Nuevo' },
    search: { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Buscar...' },
    searchMaxWidth: { type: String, default: '320px' },
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    sortKey: { type: String, default: '' },
    sortIcon: { type: Function, default: null },
    emptyText: { type: String, default: 'Sin resultados.' },
});

defineEmits(['create', 'sort', 'update:search']);
</script>