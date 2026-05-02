<template>
    <div>
        <CrudTableLayout
            title="Empleados"
            icon="bi-person-badge"
            create-label="Nuevo empleado"
            :search="search"
            search-placeholder="Buscar por nombre, DNI o cargo..."
            search-max-width="360px"
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
                <div class="d-flex align-items-center gap-2">
                    <span class="avatar-initials bg-primary-subtle text-primary-emphasis rounded-circle d-flex align-items-center justify-content-center fw-semibold" style="width:32px;height:32px;font-size:.8rem;flex-shrink:0">
                        {{ initials(row) }}
                    </span>
                    <div>
                        <div class="fw-medium">{{ row.nombre }} {{ row.apellido }}</div>
                        <div class="text-muted small">{{ row.email }}</div>
                    </div>
                </div>
            </template>

            <template #cell-cargo="{ row }">
                <span class="badge bg-secondary-subtle text-secondary-emphasis fw-normal">{{ row.cargo }}</span>
            </template>

            <template #cell-activo="{ row }">
                <span :class="['badge', row.activo ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis']">
                    {{ row.activo ? 'Activo' : 'Inactivo' }}
                </span>
            </template>

            <template #actions="{ row }">
                <button class="btn btn-sm btn-primary me-1" title="Editar" @click="openEdit(row)">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" title="Eliminar" @click="askDelete(row)">
                    <i class="bi bi-trash"></i>
                </button>
            </template>
        </CrudTableLayout>

        <!-- Modal CRUD -->
        <AppModal
            ref="crudModal"
            :title="editingId ? 'Editar empleado' : 'Nuevo empleado'"
            :icon="editingId ? 'bi-pencil' : 'bi-person-badge'"
            size="lg"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                id="employees-form"
                ref="formEl"
                :class="{ 'was-validated': validated }"
                novalidate
                @submit.prevent="save"
            >
                <div class="row g-3">
                    <div class="col-sm-6">
                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                        <input v-model.trim="form.nombre" type="text" class="form-control" maxlength="80" required />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Apellido <span class="text-danger">*</span></label>
                        <input v-model.trim="form.apellido" type="text" class="form-control" maxlength="80" required />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">DNI <span class="text-danger">*</span></label>
                        <input v-model.trim="form.dni" type="text" class="form-control" maxlength="15" required pattern="^\d{7,10}$" />
                        <div class="invalid-feedback">DNI inválido (7–10 dígitos).</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Teléfono</label>
                        <input v-model.trim="form.telefono" type="tel" class="form-control" maxlength="30" />
                    </div>
                    <div class="col-sm-8">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input v-model.trim="form.email" type="email" class="form-control" required />
                        <div class="invalid-feedback">Email inválido.</div>
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label">Cargo <span class="text-danger">*</span></label>
                        <select v-model="form.cargo" class="form-select" required>
                            <option value="">Seleccionar…</option>
                            <option>Vendedor</option>
                            <option>Repositor</option>
                            <option>Administrativo</option>
                            <option>Supervisor</option>
                            <option>Gerente</option>
                            <option>Otro</option>
                        </select>
                        <div class="invalid-feedback">Seleccioná un cargo.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Fecha de ingreso</label>
                        <input v-model="form.fechaIngreso" type="date" class="form-control" />
                    </div>
                    <div class="col-sm-6 d-flex align-items-end pb-1">
                        <div class="form-check form-switch ms-1">
                            <input id="emp-activo" v-model="form.activo" class="form-check-input" type="checkbox" role="switch" />
                            <label class="form-check-label" for="emp-activo">Empleado activo</label>
                        </div>
                    </div>
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>

            <template #footer>
                <button class="btn btn-success" type="submit" form="employees-form" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-check-lg me-1"></i>
                    {{ isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear empleado' }}
                </button>
                <button class="btn btn-secondary" type="button" :disabled="isSaving" @click="crudModal.hide()">
                    Cancelar
                </button>
            </template>
        </AppModal>

        <ConfirmModal
            ref="confirmModal"
            :loading="isDeleting"
            :message="`¿Eliminar a ${deletingItem?.nombre} ${deletingItem?.apellido}?`"
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
    { key: 'id',           label: 'ID',           sortable: true, cellClass: 'text-muted small' },
    { key: 'nombre',       label: 'Nombre',        sortable: true },
    { key: 'dni',          label: 'DNI',           sortable: true, cellClass: 'font-monospace small' },
    { key: 'telefono',     label: 'Teléfono',      sortable: true },
    { key: 'cargo',        label: 'Cargo',         sortable: true },
    { key: 'fechaIngreso', label: 'Ingreso',       sortable: true, cellClass: 'text-muted small' },
    { key: 'activo',       label: 'Estado',        sortable: true },
];

const items = ref([
    { id: 1, nombre: 'Martín',  apellido: 'López',    dni: '28341200', email: 'martin@empresa.test',  telefono: '11 4432 8821', cargo: 'Supervisor',     fechaIngreso: '2021-03-15', activo: true  },
    { id: 2, nombre: 'Valeria', apellido: 'Torres',   dni: '32110445', email: 'valeria@empresa.test', telefono: '341 551 7700', cargo: 'Administrativo', fechaIngreso: '2022-07-01', activo: true  },
    { id: 3, nombre: 'Diego',   apellido: 'Romero',   dni: '35678901', email: 'diego@empresa.test',   telefono: '11 3300 4411', cargo: 'Vendedor',       fechaIngreso: '2023-01-10', activo: false },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (e) =>
                  `${e.nombre} ${e.apellido}`.toLowerCase().includes(q) ||
                  e.dni.includes(q) ||
                  e.cargo.toLowerCase().includes(q) ||
                  e.email.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', apellido: '', dni: '', telefono: '', email: '', cargo: '', fechaIngreso: '', activo: true };
const form = reactive({ ...EMPTY });
const formEl = ref(null);
const validated = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editingId = ref(null);
const crudModal = ref(null);
const confirmModal = ref(null);
const deletingItem = ref(null);

function initials(row) {
    return `${row.nombre?.[0] ?? ''}${row.apellido?.[0] ?? ''}`.toUpperCase();
}

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
