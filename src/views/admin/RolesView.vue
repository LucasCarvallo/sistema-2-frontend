<template>
    <div>
        <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
            <h4 class="mb-0"><i class="bi bi-shield me-2 text-primary"></i>Roles</h4>
            <button class="btn btn-primary btn-sm" @click="openCreate">
                <i class="bi bi-plus-lg me-1"></i>Nuevo rol
            </button>
        </div>

        <div class="mb-3">
            <div class="input-group input-group-sm" style="max-width: 320px">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                    v-model="search"
                    type="text"
                    class="form-control"
                    placeholder="Buscar..."
                    @keydown.esc.stop="search = ''"
                />
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="th-sortable" @click="sort('id')">
                                ID
                                <i
                                    :class="[
                                        'bi',
                                        sortIcon('id'),
                                        'sort-icon ms-1',
                                        { 'is-active': sortKey === 'id' },
                                    ]"
                                ></i>
                            </th>
                            <th class="th-sortable" @click="sort('nombre')">
                                Nombre
                                <i
                                    :class="[
                                        'bi',
                                        sortIcon('nombre'),
                                        'sort-icon ms-1',
                                        { 'is-active': sortKey === 'nombre' },
                                    ]"
                                ></i>
                            </th>
                            <th class="th-sortable" @click="sort('descripcion')">
                                Descripción
                                <i
                                    :class="[
                                        'bi',
                                        sortIcon('descripcion'),
                                        'sort-icon ms-1',
                                        { 'is-active': sortKey === 'descripcion' },
                                    ]"
                                ></i>
                            </th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="displayRows.length === 0">
                            <td colspan="4" class="text-center text-muted py-4">Sin resultados.</td>
                        </tr>
                        <tr v-for="r in displayRows" :key="r.id">
                            <td class="text-muted small">{{ r.id }}</td>
                            <td>
                                <span class="badge bg-primary-subtle text-primary-emphasis">{{
                                    r.nombre
                                }}</span>
                            </td>
                            <td class="text-muted">{{ r.descripcion || '—' }}</td>
                            <td class="text-end">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    @click="openEdit(r)"
                                    title="Editar"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    @click="askDelete(r)"
                                    title="Eliminar"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal CRUD -->
        <AppModal
            ref="crudModal"
            :title="editingId ? 'Editar rol' : 'Nuevo rol'"
            :icon="editingId ? 'bi-pencil' : 'bi-shield-plus'"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                ref="formEl"
                @submit.prevent="save"
                :class="{ 'was-validated': validated }"
                novalidate
            >
                <div class="mb-3">
                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                    <input v-model.trim="form.nombre" type="text" class="form-control" required />
                    <div class="invalid-feedback">Campo requerido.</div>
                </div>
                <div class="mb-1">
                    <label class="form-label">Descripción</label>
                    <textarea
                        v-model.trim="form.descripcion"
                        class="form-control"
                        rows="3"
                    ></textarea>
                </div>
                <!-- Permite enviar con Enter; los textarea quedan excluidos por comportamiento nativo -->
                <button type="submit" class="d-none" aria-hidden="true"></button>
            </form>
            <template #footer>
                <button
                    class="btn btn-secondary"
                    type="button"
                    :disabled="isSaving"
                    @click="crudModal.hide()"
                >
                    Cancelar
                </button>
                <button class="btn btn-primary" type="button" :disabled="isSaving" @click="save">
                    <span
                        v-if="isSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i
                    >{{ isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear rol' }}
                </button>
            </template>
        </AppModal>

        <ConfirmModal
            ref="confirmModal"
            :loading="isDeleting"
            :message="`¿Eliminar el rol '${deletingItem?.nombre}'?`"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useTableSort } from '@/composables/useTableSort';

const items = ref([
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
    { id: 2, nombre: 'Editor', descripcion: 'Puede crear y editar contenido' },
    { id: 3, nombre: 'Viewer', descripcion: 'Solo lectura' },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q ? items.value.filter((r) => r.nombre.toLowerCase().includes(q)) : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', descripcion: '' };
const form = reactive({ ...EMPTY });
const formEl = ref(null);
const validated = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editingId = ref(null);
const crudModal = ref(null);
const confirmModal = ref(null);
const deletingItem = ref(null);

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
