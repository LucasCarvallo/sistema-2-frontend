<template>
    <div class="container py-3 py-md-4">
        <div class="row g-3">
            <div class="col-12">
                <CrudTableLayout
                    title="Atributos"
                    icon="bi-tags"
                    create-label="Nuevo atributo"
                    :search="searchAttributes"
                    search-placeholder="Buscar por id o nombre"
                    :columns="attributeColumns"
                    :rows="attributeRows"
                    :sort-key="attributeSortKey"
                    :sort-icon="attributeSortIcon"
                    empty-text="Sin atributos."
                    @create="openAttributeCreate"
                    @update:search="searchAttributes = $event"
                    @sort="sortAttributes"
                >
                    <template #cell-id="{ row }">
                        <span class="badge rounded-pill text-bg-light border">#{{ row.id }}</span>
                    </template>
                    <template #cell-nombre="{ row }">
                        <span class="fw-medium">{{ row.nombre }}</span>
                    </template>
                    <template #actions="{ row }">
                        <button class="btn btn-sm btn-primary me-1" @click="openAttributeEdit(row)" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="askDelete('attribute', row)" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </template>
                </CrudTableLayout>
            </div>

            <div class="col-12">
                <div class="card border-0 shadow-sm mb-3 value-filter-card">
                    <div class="card-body py-2 px-3">
                        <div class="row g-2 align-items-end">
                            <div class="col-12 col-md-7">
                                <label class="form-label small text-muted mb-1">Buscar valor</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input
                                        v-model.trim="searchValues"
                                        type="text"
                                        class="form-control"
                                        placeholder="ID, atributo o valor"
                                    />
                                </div>
                            </div>
                            <div class="col-12 col-md-5">
                                <label class="form-label small text-muted mb-1">Filtrar por atributo</label>
                                <select v-model.number="valueFilterAttributeId" class="form-select form-select-sm">
                                    <option :value="0">Todos los atributos</option>
                                    <option v-for="item in attributes" :key="item.id" :value="item.id">
                                        {{ item.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <CrudTableLayout
                    title="Valores de atributos"
                    icon="bi-list-check"
                    create-label="Nuevo valor"
                    :show-search="false"
                    :columns="valueColumns"
                    :rows="valueRows"
                    :sort-key="valueSortKey"
                    :sort-icon="valueSortIcon"
                    empty-text="Sin valores para el filtro actual."
                    @create="openValueCreate"
                    @sort="sortValues"
                >
                    <template #cell-id="{ row }">
                        <span class="badge rounded-pill text-bg-light border">#{{ row.id }}</span>
                    </template>
                    <template #cell-id_atributo="{ row }">
                        <span class="badge text-bg-secondary-subtle text-secondary-emphasis">#{{ row.id_atributo }}</span>
                    </template>
                    <template #cell-atributo="{ row }">
                        <span class="fw-medium">{{ row.atributo }}</span>
                    </template>
                    <template #cell-valor="{ row }">
                        {{ row.valor }}
                    </template>
                    <template #actions="{ row }">
                        <button class="btn btn-sm btn-primary me-1" @click="openValueEdit(row)" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="askDelete('value', row)" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </template>
                </CrudTableLayout>
            </div>
        </div>

        <AppModal
            ref="attributeModal"
            :title="attributeEditingId === null ? 'Nuevo atributo' : 'Editar atributo'"
            icon="bi-tags"
            static-backdrop
            @hidden="resetAttributeForm"
        >
            <form
                id="attribute-form"
                ref="attributeFormEl"
                @submit.prevent="saveAttribute"
                :class="{ 'was-validated': attributeValidated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-4">
                        <label class="form-label">ID <span class="text-danger">*</span></label>
                        <input
                            v-model.number="attributeForm.id"
                            type="number"
                            class="form-control"
                            required
                            min="1"
                            step="1"
                        />
                        <div class="invalid-feedback">ID requerido.</div>
                    </div>
                    <div class="col-sm-8">
                        <label class="form-label">Nombre <span class="text-danger">*</span></label>
                        <input v-model.trim="attributeForm.nombre" type="text" class="form-control" required />
                        <div class="invalid-feedback">Nombre requerido.</div>
                    </div>
                    <div v-if="attributeError" class="col-12">
                        <div class="alert alert-danger py-2 px-3 mb-0">{{ attributeError }}</div>
                    </div>
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="attribute-form" :disabled="attributeSaving">
                    <span
                        v-if="attributeSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i>{{ attributeSaving ? 'Guardando…' : 'Guardar' }}
                </button>
                <button class="btn btn-danger" type="button" :disabled="attributeSaving" @click="attributeModal.hide()">
                    Cancelar
                </button>
            </template>
        </AppModal>

        <AppModal
            ref="valueModal"
            :title="valueEditingId === null ? 'Nuevo valor' : 'Editar valor'"
            icon="bi-list-check"
            static-backdrop
            @hidden="resetValueForm"
        >
            <form
                id="value-form"
                ref="valueFormEl"
                @submit.prevent="saveValue"
                :class="{ 'was-validated': valueValidated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-4">
                        <label class="form-label">ID <span class="text-danger">*</span></label>
                        <input
                            v-model.number="valueForm.id"
                            type="number"
                            class="form-control"
                            required
                            min="1"
                            step="1"
                        />
                        <div class="invalid-feedback">ID requerido.</div>
                    </div>
                    <div class="col-sm-8">
                        <label class="form-label">Atributo <span class="text-danger">*</span></label>
                        <select v-model.number="valueForm.id_atributo" class="form-select" required>
                            <option :value="0">Seleccionar…</option>
                            <option v-for="item in attributes" :key="item.id" :value="item.id">
                                {{ item.nombre }} ({{ item.id }})
                            </option>
                        </select>
                        <div class="invalid-feedback">Selecciona un atributo.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Valor <span class="text-danger">*</span></label>
                        <input v-model.trim="valueForm.valor" type="text" class="form-control" required />
                        <div class="invalid-feedback">Valor requerido.</div>
                    </div>
                    <div v-if="valueError" class="col-12">
                        <div class="alert alert-danger py-2 px-3 mb-0">{{ valueError }}</div>
                    </div>
                    <button type="submit" class="d-none" aria-hidden="true"></button>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="value-form" :disabled="valueSaving">
                    <span
                        v-if="valueSaving"
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    <i v-else class="bi bi-check-lg me-1"></i>{{ valueSaving ? 'Guardando…' : 'Guardar' }}
                </button>
                <button class="btn btn-danger" type="button" :disabled="valueSaving" @click="valueModal.hide()">
                    Cancelar
                </button>
            </template>
        </AppModal>

        <ConfirmModal
            ref="confirmModal"
            :loading="deleteLoading"
            :message="confirmMessage"
            @confirm="confirmDelete"
        />
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useTableSort } from '@/composables/useTableSort';
import source from '../../../json/ejemplo relacion atributo-producto.json';

const attributeColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
];

const valueColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'id_atributo', label: 'ID atributo', sortable: true },
    { key: 'atributo', label: 'Atributo', sortable: true },
    { key: 'valor', label: 'Valor', sortable: true },
];

const attributes = ref(source.atributos.map((item) => ({ ...item })));
const values = ref(source.valores_atributos.map((item) => ({ ...item })));

const searchAttributes = ref('');
const searchValues = ref('');
const valueFilterAttributeId = ref(0);

const attributeFiltered = computed(() => {
    const q = searchAttributes.value.trim().toLowerCase();
    if (!q) return attributes.value;
    return attributes.value.filter(
        (item) => String(item.id).includes(q) || item.nombre.toLowerCase().includes(q),
    );
});

const valueFiltered = computed(() => {
    const q = searchValues.value.trim().toLowerCase();

    return values.value
        .map((item) => ({
            ...item,
            atributo: getAttributeName(item.id_atributo),
        }))
        .filter((item) => {
            const matchesAttribute = !valueFilterAttributeId.value || item.id_atributo === valueFilterAttributeId.value;
            const matchesSearch =
                !q ||
                [String(item.id), String(item.id_atributo), item.atributo, item.valor]
                    .join(' ')
                    .toLowerCase()
                    .includes(q);
            return matchesAttribute && matchesSearch;
        });
});

const {
    sortKey: attributeSortKey,
    sort: sortAttributes,
    sortIcon: attributeSortIcon,
    sorted: attributeRows,
} = useTableSort(attributeFiltered);

const {
    sortKey: valueSortKey,
    sort: sortValues,
    sortIcon: valueSortIcon,
    sorted: valueRows,
} = useTableSort(valueFiltered);

const attributeModal = ref(null);
const valueModal = ref(null);
const confirmModal = ref(null);

const attributeFormEl = ref(null);
const valueFormEl = ref(null);

const attributeEditingId = ref(null);
const valueEditingId = ref(null);

const attributeSaving = ref(false);
const valueSaving = ref(false);
const deleteLoading = ref(false);

const attributeValidated = ref(false);
const valueValidated = ref(false);

const attributeError = ref('');
const valueError = ref('');

const deleteTargetType = ref('');
const deleteTarget = ref(null);

const attributeForm = reactive({ id: null, nombre: '' });
const valueForm = reactive({ id: null, id_atributo: 0, valor: '' });

const confirmMessage = computed(() => {
    if (deleteTargetType.value === 'attribute') {
        return `¿Eliminar el atributo '${deleteTarget.value?.nombre}' y sus valores asociados?`;
    }
    if (deleteTargetType.value === 'value') {
        return `¿Eliminar el valor '${deleteTarget.value?.valor}'?`;
    }
    return '¿Confirmar eliminación?';
});

function getAttributeName(id) {
    return attributes.value.find((item) => item.id === id)?.nombre || 'Sin atributo';
}

function nextAttributeId() {
    if (!attributes.value.length) return 1;
    return Math.max(...attributes.value.map((item) => Number(item.id) || 0)) + 1;
}

function nextValueId() {
    if (!values.value.length) return 1;
    return Math.max(...values.value.map((item) => Number(item.id) || 0)) + 1;
}

function resetAttributeForm() {
    attributeEditingId.value = null;
    attributeForm.id = nextAttributeId();
    attributeForm.nombre = '';
    attributeValidated.value = false;
    attributeError.value = '';
}

function resetValueForm() {
    valueEditingId.value = null;
    valueForm.id = nextValueId();
    valueForm.id_atributo = valueFilterAttributeId.value || attributes.value[0]?.id || 0;
    valueForm.valor = '';
    valueValidated.value = false;
    valueError.value = '';
}

function openAttributeCreate() {
    resetAttributeForm();
    attributeModal.value.show();
}

function openAttributeEdit(item) {
    attributeEditingId.value = item.id;
    attributeForm.id = item.id;
    attributeForm.nombre = item.nombre;
    attributeValidated.value = false;
    attributeError.value = '';
    attributeModal.value.show();
}

function openValueCreate() {
    resetValueForm();
    valueModal.value.show();
}

function openValueEdit(item) {
    valueEditingId.value = item.id;
    valueForm.id = item.id;
    valueForm.id_atributo = item.id_atributo;
    valueForm.valor = item.valor;
    valueValidated.value = false;
    valueError.value = '';
    valueModal.value.show();
}

function isDuplicateAttributeId(id, editingId = null) {
    return attributes.value.some((item) => item.id === id && item.id !== editingId);
}

function isDuplicateValueId(id, editingId = null) {
    return values.value.some((item) => item.id === id && item.id !== editingId);
}

async function saveAttribute() {
    if (attributeSaving.value) return;
    attributeValidated.value = true;
    attributeError.value = '';

    if (!attributeFormEl.value?.checkValidity()) return;

    const id = Number(attributeForm.id);
    const nombre = attributeForm.nombre.trim();

    if (!Number.isInteger(id) || id <= 0) {
        attributeError.value = 'El ID debe ser un numero entero mayor a cero.';
        return;
    }

    if (isDuplicateAttributeId(id, attributeEditingId.value)) {
        attributeError.value = 'Ya existe un atributo con ese ID.';
        return;
    }

    attributeSaving.value = true;
    try {
        if (attributeEditingId.value === null) {
            attributes.value.push({ id, nombre });
        } else {
            const idx = attributes.value.findIndex((item) => item.id === attributeEditingId.value);
            if (idx !== -1) {
                const oldId = attributes.value[idx].id;
                attributes.value[idx] = { id, nombre };

                if (oldId !== id) {
                    values.value = values.value.map((item) =>
                        item.id_atributo === oldId ? { ...item, id_atributo: id } : item,
                    );

                    if (valueFilterAttributeId.value === oldId) {
                        valueFilterAttributeId.value = id;
                    }
                }
            }
        }

        attributes.value = [...attributes.value].sort((a, b) => a.id - b.id);
        attributeModal.value.hide();
    } finally {
        attributeSaving.value = false;
    }
}

async function saveValue() {
    if (valueSaving.value) return;
    valueValidated.value = true;
    valueError.value = '';

    if (!valueFormEl.value?.checkValidity()) return;

    const id = Number(valueForm.id);
    const idAtributo = Number(valueForm.id_atributo);
    const valor = valueForm.valor.trim();

    if (!Number.isInteger(id) || id <= 0) {
        valueError.value = 'El ID debe ser un numero entero mayor a cero.';
        return;
    }

    if (!Number.isInteger(idAtributo) || idAtributo <= 0) {
        valueError.value = 'Selecciona un atributo valido.';
        return;
    }

    if (!attributes.value.some((item) => item.id === idAtributo)) {
        valueError.value = 'El atributo seleccionado no existe.';
        return;
    }

    if (isDuplicateValueId(id, valueEditingId.value)) {
        valueError.value = 'Ya existe un valor con ese ID.';
        return;
    }

    valueSaving.value = true;
    try {
        if (valueEditingId.value === null) {
            values.value.push({ id, id_atributo: idAtributo, valor });
        } else {
            const idx = values.value.findIndex((item) => item.id === valueEditingId.value);
            if (idx !== -1) {
                values.value[idx] = { id, id_atributo: idAtributo, valor };
            }
        }

        values.value = [...values.value].sort((a, b) => a.id - b.id);
        valueModal.value.hide();
    } finally {
        valueSaving.value = false;
    }
}

function askDelete(type, row) {
    deleteTargetType.value = type;
    deleteTarget.value = row;
    confirmModal.value.show();
}

async function confirmDelete() {
    if (deleteLoading.value || !deleteTargetType.value || !deleteTarget.value) return;

    deleteLoading.value = true;
    try {
        if (deleteTargetType.value === 'attribute') {
            const attributeId = deleteTarget.value.id;
            attributes.value = attributes.value.filter((item) => item.id !== attributeId);
            values.value = values.value.filter((item) => item.id_atributo !== attributeId);
            if (valueFilterAttributeId.value === attributeId) {
                valueFilterAttributeId.value = 0;
            }
        } else if (deleteTargetType.value === 'value') {
            values.value = values.value.filter((item) => item.id !== deleteTarget.value.id);
        }
    } finally {
        deleteLoading.value = false;
        deleteTargetType.value = '';
        deleteTarget.value = null;
    }
}
</script>

<style scoped>
.value-filter-card {
    background: linear-gradient(130deg, rgba(13, 110, 253, 0.04), rgba(25, 135, 84, 0.04));
    border: 1px solid rgba(13, 110, 253, 0.08);
}
</style>
