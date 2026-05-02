<template>
    <div>
        <CrudTableLayout
            title="Permisos"
            icon="bi-key"
            create-label="Nuevo permiso"
            :search="search"
            search-placeholder="Buscar..."
            :columns="columns"
            :rows="displayRows"
            :sort-key="sortKey"
            :sort-icon="sortIcon"
            empty-text="Sin resultados."
            @create="openCreate"
            @update:search="search = $event"
            @sort="sort"
        >
            <template #cell-nombre="{ row }">
                <code class="text-body">{{ row.nombre }}</code>
            </template>
            <template #cell-accion="{ row }">
                <span :class="['badge', actionBadge(row.accion)]">{{ row.accion }}</span>
            </template>
            <template #actions="{ row }">
                <button class="btn btn-sm btn-primary me-1" @click="openEdit(row)" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="askDelete(row)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </template>
        </CrudTableLayout>

        <!-- Modal CRUD -->
        <AppModal
            ref="crudModal"
            :title="editingId ? 'Editar permiso' : 'Nuevo permiso'"
            :icon="editingId ? 'bi-pencil' : 'bi-key'"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                id="permissions-form"
                ref="formEl"
                @submit.prevent="save"
                :class="{ 'was-validated': validated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-6">
                        <label class="form-label">Módulo <span class="text-danger">*</span></label>
                        <input
                            v-model.trim="form.modulo"
                            type="text"
                            class="form-control"
                            required
                            placeholder="Ej: Usuarios"
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Acción <span class="text-danger">*</span></label>
                        <select v-model="form.accion" class="form-select" required>
                            <option value="">Seleccionar…</option>
                            <option>Ver</option>
                            <option>Crear</option>
                            <option>Editar</option>
                            <option>Eliminar</option>
                        </select>
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label"
                            >Nombre (clave) <span class="text-danger">*</span></label
                        >
                        <input
                            v-model.trim="form.nombre"
                            type="text"
                            class="form-control"
                            required
                            placeholder="Ej: users.view"
                            pattern="^[a-z0-9_.]+$"
                        />
                        <div class="form-text">
                            Solo letras minúsculas, números, puntos y guiones bajos.
                        </div>
                        <div class="invalid-feedback">Formato inválido (Ej: users.view).</div>
                    </div>
                    <!-- Permite enviar con Enter -->
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="permissions-form" :disabled="isSaving">
                    <span
                        v-if="isSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i
                    >{{ isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear permiso' }}
                </button>
                <button
                    class="btn btn-danger"
                    type="button"
                    :disabled="isSaving"
                    @click="crudModal.hide()"
                >
                    Cancelar
                </button>
            </template>
        </AppModal>

        <ConfirmModal
            ref="confirmModal"
            :loading="isDeleting"
            :message="`¿Eliminar el permiso '${deletingItem?.nombre}'?`"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue';
import { useTableSort } from '@/composables/useTableSort';

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'modulo', label: 'Módulo', sortable: true },
    { key: 'accion', label: 'Acción', sortable: true },
];

const items = ref([
    { id: 1, nombre: 'users.view', modulo: 'Usuarios', accion: 'Ver' },
    { id: 2, nombre: 'users.create', modulo: 'Usuarios', accion: 'Crear' },
    { id: 3, nombre: 'users.edit', modulo: 'Usuarios', accion: 'Editar' },
    { id: 4, nombre: 'users.delete', modulo: 'Usuarios', accion: 'Eliminar' },
    { id: 5, nombre: 'products.view', modulo: 'Productos', accion: 'Ver' },
    { id: 6, nombre: 'products.create', modulo: 'Productos', accion: 'Crear' },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (p) =>
                  p.nombre.toLowerCase().includes(q) ||
                  p.modulo.toLowerCase().includes(q) ||
                  p.accion.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', modulo: '', accion: '' };
const form = reactive({ ...EMPTY });
const formEl = ref(null);
const validated = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editingId = ref(null);
const crudModal = ref(null);
const confirmModal = ref(null);
const deletingItem = ref(null);

const ACTION_BADGES = {
    Ver: 'bg-info-subtle text-info-emphasis',
    Crear: 'bg-success-subtle text-success-emphasis',
    Editar: 'bg-warning-subtle text-warning-emphasis',
    Eliminar: 'bg-danger-subtle text-danger-emphasis',
};
const actionBadge = (a) => ACTION_BADGES[a] ?? 'bg-secondary-subtle text-secondary-emphasis';


function resetForm() {
    Object.assign(form, EMPTY);
    validated.value = false;
    editingId.value = null;
}

function openCreate() {
    resetForm();
    crudModal.value.show();
}

function openEdit(item) {
    resetForm();
    Object.assign(form, item);
    editingId.value = item.id;
    crudModal.value.show();
}

async function save() {
    if (isSaving.value) return;
    validated.value = true;
    if (!formEl.value.checkValidity()) return;
    isSaving.value = true;
    try {
        if (editingId.value) {
            const idx = items.value.findIndex((i) => i.id === editingId.value);
            items.value[idx] = { ...items.value[idx], ...form };
        } else {
            items.value.push({ ...form, id: Date.now() });
        }
        crudModal.value.hide();
    } finally {
        isSaving.value = false;
    }
}

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
