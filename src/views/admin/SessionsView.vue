<template>
    <div>
        <CrudTableLayout
            title="Sesiones activas"
            icon="bi-shield-lock"
            :show-create="false"
            :search="search"
            search-placeholder="Buscar por usuario, IP o dispositivo..."
            search-max-width="380px"
            :columns="columns"
            :rows="displayRows"
            :sort-key="sortKey"
            :sort-icon="sortIcon"
            empty-text="No hay sesiones activas."
            @update:search="search = $event"
            @sort="sort"
        >
            <template #cell-usuario="{ row }">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-muted"></i>
                    <div>
                        <div class="fw-medium">{{ row.usuario }}</div>
                        <div class="text-muted small">{{ row.email }}</div>
                    </div>
                </div>
            </template>

            <template #cell-dispositivo="{ row }">
                <span class="badge bg-secondary-subtle text-secondary-emphasis fw-normal">
                    <i :class="['bi', row.dispositivo === 'Móvil' ? 'bi-phone' : 'bi-laptop', 'me-1']"></i>
                    {{ row.dispositivo }}
                </span>
            </template>

            <template #cell-estado="{ row }">
                <span :class="['badge', row.estado === 'Activa' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis']">
                    {{ row.estado }}
                </span>
            </template>

            <template #cell-ultimaActividad="{ row }">
                <span class="text-muted small">{{ row.ultimaActividad }}</span>
            </template>

            <template #actions="{ row }">
                <button
                    class="btn btn-sm btn-danger"
                    title="Cerrar sesión"
                    @click="askDelete(row)"
                >
                    <i class="bi bi-x-circle"></i>
                </button>
            </template>
        </CrudTableLayout>

        <ConfirmModal
            ref="confirmModal"
            :loading="isDeleting"
            :message="`¿Cerrar la sesión de ${deletingItem?.usuario}? El usuario deberá iniciar sesión nuevamente.`"
            confirm-label="Cerrar sesión"
            confirm-variant="btn-danger"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue';
import { useTableSort } from '@/composables/useTableSort';

const columns = [
    { key: 'id',               label: 'ID',               sortable: true,  cellClass: 'text-muted small' },
    { key: 'usuario',          label: 'Usuario',          sortable: true  },
    { key: 'ip',               label: 'IP',               sortable: true,  cellClass: 'font-monospace small' },
    { key: 'dispositivo',      label: 'Dispositivo',      sortable: true  },
    { key: 'estado',           label: 'Estado',           sortable: true  },
    { key: 'creada',           label: 'Creada',           sortable: true,  cellClass: 'text-muted small' },
    { key: 'ultimaActividad',  label: 'Última actividad', sortable: true  },
];

const items = ref([
    {
        id: 1,
        usuario: 'Lucas Administrador',
        email: 'lucas@sistema.test',
        ip: '192.168.1.10',
        dispositivo: 'Escritorio',
        estado: 'Activa',
        creada: '02/05/2026 08:14',
        ultimaActividad: 'hace 2 min',
    },
    {
        id: 2,
        usuario: 'María García',
        email: 'maria@sistema.test',
        ip: '190.45.112.83',
        dispositivo: 'Móvil',
        estado: 'Activa',
        creada: '02/05/2026 09:02',
        ultimaActividad: 'hace 18 min',
    },
    {
        id: 3,
        usuario: 'Carlos Méndez',
        email: 'carlos@sistema.test',
        ip: '172.16.0.55',
        dispositivo: 'Escritorio',
        estado: 'Inactiva',
        creada: '01/05/2026 21:30',
        ultimaActividad: 'hace 6 h',
    },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (s) =>
                  s.usuario.toLowerCase().includes(q) ||
                  s.email.toLowerCase().includes(q) ||
                  s.ip.includes(q) ||
                  s.dispositivo.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const isDeleting = ref(false);
const confirmModal = ref(null);
const deletingItem = ref(null);

function askDelete(item) {
    deletingItem.value = item;
    confirmModal.value.show();
}

async function confirmDelete() {
    if (isDeleting.value || !deletingItem.value) return;
    isDeleting.value = true;
    try {
        items.value = items.value.filter((i) => i.id !== deletingItem.value.id);
        deletingItem.value = null;
    } finally {
        isDeleting.value = false;
    }
}
</script>
