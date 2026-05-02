<template>
    <div>
        <CrudTableLayout
            title="Productos"
            icon="bi-box-seam"
            create-label="Nuevo producto"
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
                <span class="fw-medium">{{ row.nombre }}</span>
            </template>
            <template #cell-categoria="{ row }">
                <span class="badge bg-secondary-subtle text-secondary-emphasis">{{ row.categoria }}</span>
            </template>
            <template #cell-precio="{ row }">
                ${{ row.precio.toLocaleString('es-AR') }}
            </template>
            <template #cell-stock="{ row }">
                <span
                    :class="[
                        'badge',
                        row.stock > 0
                            ? 'bg-success-subtle text-success-emphasis'
                            : 'bg-danger-subtle text-danger-emphasis',
                    ]"
                >{{ row.stock }}</span>
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
            :title="editingId ? 'Editar producto' : 'Nuevo producto'"
            :icon="editingId ? 'bi-pencil' : 'bi-box-seam'"
            size="lg"
            static-backdrop
            @hidden="resetForm"
        >
            <form
                id="products-form"
                ref="formEl"
                @submit.prevent="save"
                :class="{ 'was-validated': validated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-8">
                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                        <input
                            v-model.trim="form.nombre"
                            type="text"
                            class="form-control"
                            required
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label"
                            >Categoría <span class="text-danger">*</span></label
                        >
                        <select v-model="form.categoria" class="form-select" required>
                            <option value="">Seleccionar…</option>
                            <option>Electrónica</option>
                            <option>Ropa</option>
                            <option>Hogar</option>
                            <option>Alimentos</option>
                            <option>Otros</option>
                        </select>
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Precio <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input
                                v-model.number="form.precio"
                                type="number"
                                class="form-control"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-sm-6">
                        <label class="form-label">Stock <span class="text-danger">*</span></label>
                        <input
                            v-model.number="form.stock"
                            type="number"
                            class="form-control"
                            required
                            min="0"
                            step="1"
                        />
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Descripción</label>
                        <textarea
                            v-model.trim="form.descripcion"
                            class="form-control"
                            rows="2"
                        ></textarea>
                    </div>
                    <!-- Permite enviar con Enter; los textarea quedan excluidos por comportamiento nativo -->
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="products-form" :disabled="isSaving">
                    <span
                        v-if="isSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i
                    >{{
                        isSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'
                    }}
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
            :message="`¿Eliminar el producto '${deletingItem?.nombre}'?`"
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
    { key: 'categoria', label: 'Categoría', sortable: true },
    { key: 'precio', label: 'Precio', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
];

const items = ref([
    {
        id: 1,
        nombre: 'Laptop Pro',
        categoria: 'Electrónica',
        precio: 1200,
        stock: 15,
        descripcion: 'Laptop de alto rendimiento',
    },
    {
        id: 2,
        nombre: 'Mouse Inalámbrico',
        categoria: 'Electrónica',
        precio: 35,
        stock: 50,
        descripcion: 'Mouse ergonómico',
    },
    {
        id: 3,
        nombre: 'Escritorio',
        categoria: 'Hogar',
        precio: 280,
        stock: 8,
        descripcion: 'Escritorio de madera',
    },
]);

const search = ref('');
const filtered = computed(() => {
    const q = search.value.toLowerCase();
    return q
        ? items.value.filter(
              (p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q),
          )
        : items.value;
});

const { sortKey, sort, sortIcon, sorted: displayRows } = useTableSort(filtered);

const EMPTY = { nombre: '', categoria: '', precio: 0, stock: 0, descripcion: '' };
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
