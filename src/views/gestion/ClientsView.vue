<template>
    <div>
        <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
            <h4 class="mb-0"><i class="bi bi-person-vcard me-2 text-primary"></i>Clientes</h4>
            <button class="btn btn-success btn-sm" @click="openCreate">
                <i class="bi bi-plus-lg me-1"></i>Nuevo cliente
            </button>
        </div>

        <div class="mb-3">
            <div class="input-group input-group-sm" style="max-width: 360px">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input
                    v-model="search"
                    type="text"
                    class="form-control"
                    placeholder="Buscar por nombre, teléfono o dirección..."
                    @keydown.esc.stop="search = ''"
                />
            </div>
        </div>

        <DataTable
            :columns="columns"
            :rows="displayRows"
            :sort-key="sortKey"
            @sort="sort"
        >
            <template #cell-nombre="{ row }">
                <span class="fw-medium">{{ row.nombre }}</span>
            </template>
            <template #cell-direccionEntrega="{ row }">
                <span class="text-wrap" style="max-width: 360px; display: inline-block">{{ row.direccionEntrega }}</span>
            </template>
            <template #actions="{ row }">
                <button class="btn btn-sm btn-primary me-1" @click="openEdit(row)" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="askDelete(row)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </template>
        </DataTable>

        <AppModal
            ref="crudModal"
            :title="editingId ? 'Editar cliente' : 'Nuevo cliente'"
            :icon="editingId ? 'bi-pencil' : 'bi-person-plus'"
            size="lg"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                ref="formEl"
                @submit.prevent="save"
                :class="{ 'was-validated': validated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-6">
                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                        <input
                            v-model.trim="form.nombre"
                            type="text"
                            class="form-control"
                            maxlength="120"
                            required
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label"
                            >Teléfono <span class="text-danger">*</span></label
                        >
                        <input
                            v-model.trim="form.telefono"
                            type="tel"
                            class="form-control"
                            required
                            maxlength="30"
                            pattern="^[0-9+()\-\s]{6,30}$"
                        />
                        <div class="invalid-feedback">Formato inválido. Ej: 11 5555 5555</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label"
                            >Dirección de entrega <span class="text-danger">*</span></label
                        >
                        <textarea
                            v-model.trim="form.direccionEntrega"
                            class="form-control"
                            rows="3"
                            required
                            maxlength="280"
                            placeholder="Calle, número, piso/depto, localidad"
                        ></textarea>
                        <div class="invalid-feedback">Campo requerido.</div>
                        <div class="form-text">
                            Por ahora se guarda una sola dirección por cliente.
                        </div>
                    </div>
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>

            <template #footer>
                <button class="btn btn-success" type="button" :disabled="isSaving" @click="save">
                    <span
                        v-if="isSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i
                    >{{ isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear cliente' }}
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
            :message="`¿Eliminar el cliente '${deletingItem?.nombre}'?`"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { useTableSort } from '@/composables/useTableSort';

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
    { key: 'direccionEntrega', label: 'Dirección de entrega', sortable: true },
];

const items = ref([
    {
        id: 1,
        nombre: 'Lucía Fernández',
        telefono: '11 4555 9821',
        direccionEntrega: 'Av. Corrientes 1234, Piso 4, Depto B, CABA',
    },
    {
        id: 2,
        nombre: 'Carlos Méndez',
        telefono: '11 3201 7770',
        direccionEntrega: 'Calle 14 N° 552, La Plata, Buenos Aires',
    },
    {
        id: 3,
        nombre: 'Sofía Ruiz',
        telefono: '341 555 1001',
        direccionEntrega: 'San Martín 980, Rosario, Santa Fe',
    },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (c) =>
                  c.nombre.toLowerCase().includes(q) ||
                  c.telefono.toLowerCase().includes(q) ||
                  c.direccionEntrega.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', telefono: '', direccionEntrega: '' };
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
