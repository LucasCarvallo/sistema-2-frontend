<template>
    <div>
        <CrudTableLayout
            title="Usuarios"
            icon="bi-people"
            create-label="Nuevo usuario"
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
            <template #cell-nombre="{ row }">{{ row.nombre }} {{ row.apellido }}</template>

            <template #cell-telefono="{ row }">{{ row.telefono || '—' }}</template>

            <template #actions="{ row }">
                <button class="btn btn-sm btn-primary me-1" @click="openEdit(row)" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="askDelete(row)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </template>
        </CrudTableLayout>

        <div v-if="apiError" class="alert alert-warning py-2" role="alert">
            {{ apiError }}
        </div>

        <!-- Modal CRUD -->
        <AppModal
            ref="crudModal"
            :title="editingId ? 'Editar usuario' : 'Nuevo usuario'"
            :icon="editingId ? 'bi-pencil' : 'bi-person-plus'"
            size="lg"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                id="users-form"
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
                            required
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label"
                            >Apellido <span class="text-danger">*</span></label
                        >
                        <input
                            v-model.trim="form.apellido"
                            type="text"
                            class="form-control"
                            required
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input
                            v-model.trim="form.email"
                            type="email"
                            class="form-control"
                            required
                        />
                        <div class="invalid-feedback">Email inválido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Teléfono</label>
                        <input v-model.trim="form.telefono" type="tel" class="form-control" />
                    </div>
                    <!-- Permite enviar con Enter; los textarea quedan excluidos por comportamiento nativo -->
                    <button type="submit" class="d-none" aria-hidden="true"></button>

                    <div class="col-12">
                        <label class="form-label">
                            Contraseña
                            <span v-if="!editingId" class="text-danger">*</span>
                            <span v-else class="text-muted small ms-1"
                                >(dejar vacío para no cambiar)</span
                            >
                        </label>
                        <input
                            v-model="form.password"
                            type="password"
                            class="form-control"
                            :required="!editingId"
                            minlength="6"
                        />
                        <div class="invalid-feedback">Mínimo 6 caracteres.</div>
                    </div>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="users-form" :disabled="isSaving">
                    <span
                        v-if="isSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i
                    >{{ isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear usuario' }}
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
            :message="`¿Eliminar a ${deletingItem?.nombre} ${deletingItem?.apellido}?`"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue';
import { apiGet, apiPost } from '@/lib/http/token';
import { useSessionStore } from '@/stores/session';
import { useTableSort } from '@/composables/useTableSort';

const columns = [
    { key: 'id', label: 'ID', sortable: true, cellClass: 'text-muted small' },
    { key: 'nombre', label: 'Nombre', sortable: true, cellClass: 'fw-medium' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
];

const items = ref([
    {
        id: 1,
        nombre: 'Juan',
        apellido: 'García',
        email: 'juan@ejemplo.com',
        telefono: '011-1234-5678',
    },
    {
        id: 2,
        nombre: 'María',
        apellido: 'López',
        email: 'maria@ejemplo.com',
        telefono: '011-9876-5432',
    },
    { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@ejemplo.com', telefono: '' },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (u) =>
                  `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', apellido: '', email: '', telefono: '', password: '' };
const form = reactive({ ...EMPTY });
const formEl = ref(null);
const validated = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editingId = ref(null);
const crudModal = ref(null);
const confirmModal = ref(null);
const deletingItem = ref(null);
const apiError = ref('');

const session = useSessionStore();

function mapApiUserToRow(user) {
    const fullName = String(user?.name ?? '').trim();
    const [nombre = 'Mock', ...apellidoParts] = fullName.split(' ');
    return {
        id: user?.id ?? Date.now(),
        nombre,
        apellido: apellidoParts.join(' ') || 'User',
        email: user?.email ?? 'mock@example.com',
        telefono: user?.telefono ?? '',
    };
}

async function syncWithApi() {
    apiError.value = '';
    try {
        await apiGet('/health');

        // Backend mock: devuelve token + user sin base de datos.
        const data = await apiPost('/login', {
            email: 'frontend.demo@sistema.lucas.test',
            password: '123456',
        });

        session.setSession({ token: data.token, user: data.user });

        const apiUserRow = mapApiUserToRow(data.user);
        items.value = [
            apiUserRow,
            ...items.value.filter((u) => u.email.toLowerCase() !== apiUserRow.email.toLowerCase()),
        ];
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(syncWithApi);

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
    Object.assign(form, { ...item, password: '' });
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
            const updated = { ...items.value[idx], ...form };
            if (!form.password) delete updated.password;
            items.value[idx] = updated;
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
