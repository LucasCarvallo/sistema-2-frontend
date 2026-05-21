<template>
    <div class="container py-3 py-md-4">
        <h1 class="mb-4">Requerimientos y tareas</h1>

        <div class="row g-4">
            <div class="col-12">
                <CrudTableLayout
                    title="Requerimientos"
                    icon="bi-clipboard-check"
                    create-label="Nuevo requerimiento"
                    :columns="requerimientoColumns"
                    :rows="requerimientoRows"
                    :sort-key="reqSortKey"
                    :sort-icon="reqSortIcon"
                    :search="reqSearch"
                    search-placeholder="Buscar por id, titulo, rama o estado"
                    @create="openRequerimientoModal()"
                    @update:search="reqSearch = $event"
                    @sort="reqSort"
                >
                    <template #cell-id="{ row }">
                        <span class="badge rounded-pill text-bg-light border">#{{ row.id }}</span>
                    </template>
                    <template #cell-titulo="{ row }">
                        <span class="fw-medium">{{ row.titulo }}</span>
                    </template>
                    <template #cell-rama="{ row }">
                        <span class="text-muted small">{{ row.rama }}</span>
                    </template>
                    <template #cell-estado="{ row }">
                        <span :class="estadoClass(row.estado)">{{ row.estado || '—' }}</span>
                    </template>
                    <template #cell-total_tareas="{ row }">
                        <span class="badge text-bg-secondary-subtle text-secondary-emphasis">{{ totalTareasByReq(row.id) }}</span>
                    </template>
                    <template #actions="{ row }">
                        <button class="btn btn-sm btn-primary me-1" type="button" @click="openRequerimientoModal(row)">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" type="button" @click="askDeleteRequerimiento(row)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </template>
                </CrudTableLayout>
            </div>

            <div class="col-12">
                <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body py-2 px-3">
                        <div class="row g-2 align-items-end">
                            <div class="col-12 col-md-6">
                                <label class="form-label small text-muted mb-1">Filtrar tareas por requerimiento</label>
                                <select v-model.number="taskFilterRequerimientoId" class="form-select form-select-sm">
                                    <option :value="0">Todos los requerimientos</option>
                                    <option v-for="req in requerimientos" :key="req.id" :value="req.id">
                                        #{{ req.id }} - {{ req.titulo }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small text-muted mb-1">Buscar tarea</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input
                                        v-model.trim="taskSearch"
                                        type="text"
                                        class="form-control"
                                        placeholder="ID, titulo, estado o requerimiento"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <CrudTableLayout
                    title="Tareas"
                    icon="bi-list-task"
                    create-label="Nueva tarea"
                    :show-search="false"
                    :columns="taskColumns"
                    :rows="taskRows"
                    :sort-key="taskSortKey"
                    :sort-icon="taskSortIcon"
                    empty-text="Sin tareas para el filtro actual"
                    @create="openTaskModal()"
                    @sort="taskSort"
                >
                    <template #cell-id="{ row }">
                        <span class="badge rounded-pill text-bg-light border">#{{ row.id }}</span>
                    </template>
                    <template #cell-requerimientoId="{ row }">
                        <span class="badge text-bg-secondary-subtle text-secondary-emphasis">#{{ row.requerimientoId }}</span>
                    </template>
                    <template #cell-requerimiento_titulo="{ row }">
                        <span class="small text-muted">{{ row.requerimiento_titulo }}</span>
                    </template>
                    <template #cell-titulo="{ row }">
                        <span class="fw-medium">{{ row.titulo }}</span>
                    </template>
                    <template #cell-estado="{ row }">
                        <span :class="estadoClass(row.estado)">{{ row.estado || '—' }}</span>
                    </template>
                    <template #cell-subtotal="{ row }">
                        <span class="badge text-bg-light border">{{ row.subtareas?.length || 0 }}</span>
                    </template>
                    <template #actions="{ row }">
                        <button class="btn btn-sm btn-primary me-1" type="button" @click="openTaskModal(row)">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" type="button" @click="askDeleteTask(row)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </template>
                </CrudTableLayout>
            </div>
        </div>

        <AppModal
            ref="requerimientoModal"
            :title="requerimientoEditingId === null ? 'Nuevo requerimiento' : 'Editar requerimiento'"
            icon="bi-clipboard-check"
            static-backdrop
            @hidden="resetRequerimientoForm"
        >
            <form
                id="requerimiento-form"
                @submit.prevent="saveRequerimiento"
                :class="{ 'was-validated': reqValidated }"
                novalidate
            >
                <div class="row g-3">
                    <div class="col-sm-3">
                        <label class="form-label">ID <span class="text-danger">*</span></label>
                        <input v-model.number="requerimientoForm.id" type="number" class="form-control" min="1" required />
                        <div class="invalid-feedback">ID requerido.</div>
                    </div>
                    <div class="col-sm-9">
                        <label class="form-label">Titulo <span class="text-danger">*</span></label>
                        <input v-model.trim="requerimientoForm.titulo" type="text" class="form-control" required />
                        <div class="invalid-feedback">Titulo requerido.</div>
                    </div>
                    <div class="col-sm-8">
                        <label class="form-label">Rama <span class="text-danger">*</span></label>
                        <input v-model.trim="requerimientoForm.rama" type="text" class="form-control" required />
                        <div class="invalid-feedback">Rama requerida.</div>
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label">Estado</label>
                        <input v-model.trim="requerimientoForm.estado" type="text" class="form-control" />
                    </div>
                </div>
            </form>
            <template #footer>
                <button class="btn btn-success" type="submit" form="requerimiento-form">
                    <i class="bi bi-check-lg me-1"></i>{{ requerimientoEditingId === null ? 'Agregar' : 'Guardar' }}
                </button>
                <button class="btn btn-secondary" type="button" @click="requerimientoModal.hide()">Cancelar</button>
            </template>
        </AppModal>

        <AppModal
            ref="taskModal"
            :title="taskEditingId === null ? 'Nueva tarea' : 'Editar tarea'"
            icon="bi-list-task"
            size="xl"
            static-backdrop
            @hidden="resetTaskForm"
        >
            <form id="task-form" @submit.prevent="saveTask" :class="{ 'was-validated': taskValidated }" novalidate>
                <div class="row g-3">
                    <div class="col-sm-3">
                        <label class="form-label">ID <span class="text-danger">*</span></label>
                        <input v-model.number="taskForm.id" type="number" class="form-control" min="1" required />
                        <div class="invalid-feedback">ID requerido.</div>
                    </div>
                    <div class="col-sm-5">
                        <label class="form-label">Requerimiento <span class="text-danger">*</span></label>
                        <select v-model.number="taskForm.requerimientoId" class="form-select" required>
                            <option :value="0">Seleccionar...</option>
                            <option v-for="req in requerimientos" :key="req.id" :value="req.id">
                                #{{ req.id }} - {{ req.titulo }}
                            </option>
                        </select>
                        <div class="invalid-feedback">Selecciona un requerimiento.</div>
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label">Estado</label>
                        <input v-model.trim="taskForm.estado" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Titulo <span class="text-danger">*</span></label>
                        <input v-model.trim="taskForm.titulo" type="text" class="form-control" required />
                        <div class="invalid-feedback">Titulo requerido.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Comentarios</label>
                        <textarea v-model="taskForm.comentariosStr" class="form-control" rows="2" placeholder="Un comentario por linea"></textarea>
                    </div>
                    <div class="col-sm-2">
                        <label class="form-label">Minutos <span class="text-danger">*</span></label>
                        <input v-model.number="taskForm.minutos" type="number" class="form-control" min="0" required />
                        <div class="invalid-feedback">Minutos requeridos.</div>
                    </div>
                    <div class="col-sm-5">
                        <label class="form-label">Inicio <span class="text-danger">*</span></label>
                        <input v-model.trim="taskForm.inicio" type="text" class="form-control" required />
                        <div class="invalid-feedback">Inicio requerido.</div>
                    </div>
                    <div class="col-sm-5">
                        <label class="form-label">Fin <span class="text-danger">*</span></label>
                        <input v-model.trim="taskForm.fin" type="text" class="form-control" required />
                        <div class="invalid-feedback">Fin requerido.</div>
                    </div>
                </div>

                <hr class="my-4" />

                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="mb-0">Subtareas</h6>
                    <button class="btn btn-success btn-sm" type="button" @click="addSubtareaToTask">
                        <i class="bi bi-plus"></i> Agregar subtarea
                    </button>
                </div>

                <div v-if="taskForm.subtareas.length === 0" class="alert alert-light border mb-0">
                    Esta tarea no tiene subtareas.
                </div>

                <div v-for="(subtarea, index) in taskForm.subtareas" :key="`sub-${index}`" class="card border mb-2">
                    <div class="card-body py-3">
                        <div class="row g-2">
                            <div class="col-sm-2">
                                <label class="form-label">ID <span class="text-danger">*</span></label>
                                <input v-model.number="subtarea.id" type="number" class="form-control form-control-sm" min="1" required />
                            </div>
                            <div class="col-sm-7">
                                <label class="form-label">Titulo <span class="text-danger">*</span></label>
                                <input v-model.trim="subtarea.titulo" type="text" class="form-control form-control-sm" required />
                            </div>
                            <div class="col-sm-3 d-flex justify-content-end align-items-end">
                                <button class="btn btn-danger btn-sm" type="button" @click="removeSubtareaFromTask(index)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Comentarios</label>
                                <textarea v-model="subtarea.comentariosStr" class="form-control form-control-sm" rows="2"></textarea>
                            </div>
                            <div class="col-sm-2">
                                <label class="form-label">Minutos <span class="text-danger">*</span></label>
                                <input v-model.number="subtarea.minutos" type="number" class="form-control form-control-sm" min="0" required />
                            </div>
                            <div class="col-sm-5">
                                <label class="form-label">Inicio <span class="text-danger">*</span></label>
                                <input v-model.trim="subtarea.inicio" type="text" class="form-control form-control-sm" required />
                            </div>
                            <div class="col-sm-5">
                                <label class="form-label">Fin <span class="text-danger">*</span></label>
                                <input v-model.trim="subtarea.fin" type="text" class="form-control form-control-sm" required />
                            </div>
                            <div class="col-sm-4">
                                <label class="form-label">Estado</label>
                                <input v-model.trim="subtarea.estado" type="text" class="form-control form-control-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <template #footer>
                <button class="btn btn-success" type="submit" form="task-form">
                    <i class="bi bi-check-lg me-1"></i>{{ taskEditingId === null ? 'Agregar' : 'Guardar' }}
                </button>
                <button class="btn btn-secondary" type="button" @click="taskModal.hide()">Cancelar</button>
            </template>
        </AppModal>

        <ConfirmModal ref="confirmReqModal" :message="confirmReqMessage" @confirm="confirmDeleteRequerimiento" />
        <ConfirmModal ref="confirmTaskModal" :message="confirmTaskMessage" @confirm="confirmDeleteTask" />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue';
import AppModal from '@/components/ui/AppModal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useTableSort } from '@/composables/useTableSort';

const requerimientos = ref([]);
const tareas = ref([]);

const reqSearch = ref('');
const taskSearch = ref('');
const taskFilterRequerimientoId = ref(0);

const requerimientoColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'titulo', label: 'Titulo', sortable: true },
    { key: 'rama', label: 'Rama', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'total_tareas', label: 'Tareas', sortable: false },
];

const taskColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'requerimientoId', label: 'Req', sortable: true },
    { key: 'requerimiento_titulo', label: 'Requerimiento', sortable: true },
    { key: 'titulo', label: 'Titulo', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'minutos', label: 'Minutos', sortable: true },
    { key: 'subtotal', label: 'Subtareas', sortable: false },
];

const filteredRequerimientos = computed(() => {
    const q = reqSearch.value.trim().toLowerCase();
    if (!q) return requerimientos.value;

    return requerimientos.value.filter((item) => {
        return [String(item.id), item.titulo || '', item.rama || '', item.estado || '']
            .join(' ')
            .toLowerCase()
            .includes(q);
    });
});

const filteredTasks = computed(() => {
    const q = taskSearch.value.trim().toLowerCase();

    return tareas.value
        .map((item) => ({
            ...item,
            requerimiento_titulo: getRequerimientoTitulo(item.requerimientoId),
            subtotal: item.subtareas?.length || 0,
        }))
        .filter((item) => {
            const filterByReq = !taskFilterRequerimientoId.value || item.requerimientoId === taskFilterRequerimientoId.value;
            if (!filterByReq) return false;

            if (!q) return true;

            return [
                String(item.id),
                String(item.requerimientoId),
                item.titulo || '',
                item.estado || '',
                item.requerimiento_titulo || '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(q);
        });
});

const { sortKey: reqSortKey, sort: reqSort, sortIcon: reqSortIcon, sorted: requerimientoRows } = useTableSort(filteredRequerimientos);
const { sortKey: taskSortKey, sort: taskSort, sortIcon: taskSortIcon, sorted: taskRows } = useTableSort(filteredTasks);

const requerimientoModal = ref(null);
const taskModal = ref(null);
const confirmReqModal = ref(null);
const confirmTaskModal = ref(null);

const reqValidated = ref(false);
const taskValidated = ref(false);

const requerimientoEditingId = ref(null);
const taskEditingId = ref(null);

const deleteReqTarget = ref(null);
const deleteTaskTarget = ref(null);

const confirmReqMessage = ref('¿Eliminar requerimiento?');
const confirmTaskMessage = ref('¿Eliminar tarea?');

const requerimientoForm = reactive({
    id: null,
    titulo: '',
    rama: '',
    estado: '',
});

const taskForm = reactive({
    id: null,
    requerimientoId: 0,
    titulo: '',
    comentariosStr: '',
    minutos: 0,
    inicio: '',
    fin: '',
    estado: '',
    subtareas: [],
});

function estadoClass(estado) {
    if (!estado) return 'badge bg-secondary-subtle text-secondary-emphasis';
    if (String(estado).toUpperCase().includes('LISTO')) return 'badge bg-success-subtle text-success-emphasis';
    if (String(estado).toUpperCase().includes('HACER')) return 'badge bg-warning-subtle text-warning-emphasis';
    return 'badge bg-info-subtle text-info-emphasis';
}

function totalTareasByReq(requerimientoId) {
    return tareas.value.filter((item) => item.requerimientoId === requerimientoId).length;
}

function getRequerimientoTitulo(requerimientoId) {
    return requerimientos.value.find((item) => item.id === requerimientoId)?.titulo || 'Requerimiento no encontrado';
}

function nextRequerimientoId() {
    if (!requerimientos.value.length) return 1;
    return Math.max(...requerimientos.value.map((item) => Number(item.id) || 0)) + 1;
}

function nextTaskId() {
    if (!tareas.value.length) return 1;
    return Math.max(...tareas.value.map((item) => Number(item.id) || 0)) + 1;
}

function nextSubtaskId(list) {
    if (!list.length) return 1;
    return Math.max(...list.map((item) => Number(item.id) || 0)) + 1;
}

function resetRequerimientoForm() {
    reqValidated.value = false;
    requerimientoEditingId.value = null;
    requerimientoForm.id = nextRequerimientoId();
    requerimientoForm.titulo = '';
    requerimientoForm.rama = '';
    requerimientoForm.estado = '';
}

function openRequerimientoModal(row = null) {
    reqValidated.value = false;

    if (row) {
        requerimientoEditingId.value = row.id;
        requerimientoForm.id = row.id;
        requerimientoForm.titulo = row.titulo || '';
        requerimientoForm.rama = row.rama || '';
        requerimientoForm.estado = row.estado || '';
    } else {
        resetRequerimientoForm();
    }

    requerimientoModal.value.show();
}

function saveRequerimiento() {
    reqValidated.value = true;

    if (!requerimientoForm.id || !requerimientoForm.titulo.trim() || !requerimientoForm.rama.trim()) {
        return;
    }

    const payload = {
        id: Number(requerimientoForm.id),
        titulo: requerimientoForm.titulo.trim(),
        rama: requerimientoForm.rama.trim(),
        estado: requerimientoForm.estado.trim(),
    };

    if (requerimientoEditingId.value === null) {
        if (requerimientos.value.some((item) => item.id === payload.id)) {
            return;
        }
        requerimientos.value.push(payload);
    } else {
        const index = requerimientos.value.findIndex((item) => item.id === requerimientoEditingId.value);
        if (index !== -1) {
            requerimientos.value[index] = payload;
        }
    }

    requerimientoModal.value.hide();
}

function askDeleteRequerimiento(row) {
    deleteReqTarget.value = row;
    confirmReqMessage.value = `¿Eliminar requerimiento #${row.id} y sus tareas asociadas?`;
    confirmReqModal.value.show();
}

function confirmDeleteRequerimiento() {
    if (!deleteReqTarget.value) return;

    const reqId = deleteReqTarget.value.id;
    requerimientos.value = requerimientos.value.filter((item) => item.id !== reqId);
    tareas.value = tareas.value.filter((item) => item.requerimientoId !== reqId);

    if (taskFilterRequerimientoId.value === reqId) {
        taskFilterRequerimientoId.value = 0;
    }

    deleteReqTarget.value = null;
}

function resetTaskForm() {
    taskValidated.value = false;
    taskEditingId.value = null;
    taskForm.id = nextTaskId();
    taskForm.requerimientoId = taskFilterRequerimientoId.value || requerimientos.value[0]?.id || 0;
    taskForm.titulo = '';
    taskForm.comentariosStr = '';
    taskForm.minutos = 0;
    taskForm.inicio = '';
    taskForm.fin = '';
    taskForm.estado = '';
    taskForm.subtareas = [];
}

function normalizeSubtareaForForm(item) {
    return {
        id: item.id,
        titulo: item.titulo || '',
        comentariosStr: (item.comentarios || []).join('\n'),
        minutos: Number(item.minutos) || 0,
        inicio: item.inicio || '',
        fin: item.fin || '',
        estado: item.estado || '',
        subtareas: [],
    };
}

function openTaskModal(row = null) {
    taskValidated.value = false;

    if (row) {
        taskEditingId.value = row.id;
        taskForm.id = row.id;
        taskForm.requerimientoId = row.requerimientoId || 0;
        taskForm.titulo = row.titulo || '';
        taskForm.comentariosStr = (row.comentarios || []).join('\n');
        taskForm.minutos = Number(row.minutos) || 0;
        taskForm.inicio = row.inicio || '';
        taskForm.fin = row.fin || '';
        taskForm.estado = row.estado || '';
        taskForm.subtareas = (row.subtareas || []).map((item) => normalizeSubtareaForForm(item));
    } else {
        resetTaskForm();
    }

    taskModal.value.show();
}

function addSubtareaToTask() {
    taskForm.subtareas.push({
        id: nextSubtaskId(taskForm.subtareas),
        titulo: '',
        comentariosStr: '',
        minutos: 0,
        inicio: '',
        fin: '',
        estado: '',
        subtareas: [],
    });
}

function removeSubtareaFromTask(index) {
    taskForm.subtareas.splice(index, 1);
}

function buildSubtaskPayload(item) {
    return {
        id: Number(item.id),
        titulo: (item.titulo || '').trim(),
        comentarios: (item.comentariosStr || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        minutos: Number(item.minutos) || 0,
        inicio: (item.inicio || '').trim(),
        fin: (item.fin || '').trim(),
        estado: (item.estado || '').trim(),
        subtareas: [],
    };
}

function saveTask() {
    taskValidated.value = true;

    if (
        !taskForm.id ||
        !taskForm.requerimientoId ||
        !taskForm.titulo.trim() ||
        !taskForm.inicio.trim() ||
        !taskForm.fin.trim()
    ) {
        return;
    }

    const hasInvalidSubtarea = taskForm.subtareas.some((item) => {
        return !item.id || !item.titulo.trim() || !item.inicio.trim() || !item.fin.trim();
    });

    if (hasInvalidSubtarea) {
        return;
    }

    const payload = {
        id: Number(taskForm.id),
        requerimientoId: Number(taskForm.requerimientoId),
        titulo: taskForm.titulo.trim(),
        comentarios: taskForm.comentariosStr
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        minutos: Number(taskForm.minutos) || 0,
        inicio: taskForm.inicio.trim(),
        fin: taskForm.fin.trim(),
        estado: taskForm.estado.trim(),
        subtareas: taskForm.subtareas.map((item) => buildSubtaskPayload(item)),
    };

    if (taskEditingId.value === null) {
        if (tareas.value.some((item) => item.id === payload.id)) {
            return;
        }
        tareas.value.push(payload);
    } else {
        const index = tareas.value.findIndex((item) => item.id === taskEditingId.value);
        if (index !== -1) {
            tareas.value[index] = payload;
        }
    }

    taskModal.value.hide();
}

function askDeleteTask(row) {
    deleteTaskTarget.value = row;
    confirmTaskMessage.value = `¿Eliminar tarea #${row.id}?`;
    confirmTaskModal.value.show();
}

function confirmDeleteTask() {
    if (!deleteTaskTarget.value) return;
    tareas.value = tareas.value.filter((item) => item.id !== deleteTaskTarget.value.id);
    deleteTaskTarget.value = null;
}

function normalizeRequerimiento(source) {
    return {
        id: Number(source.id),
        titulo: source.titulo || '',
        rama: source.rama || '',
        estado: source.estado || '',
    };
}

function normalizeTask(source, requerimientoId) {
    return {
        id: Number(source.id),
        requerimientoId,
        titulo: source.titulo || '',
        comentarios: Array.isArray(source.comentarios) ? source.comentarios : [],
        minutos: Number(source.minutos) || 0,
        inicio: source.inicio || '',
        fin: source.fin || '',
        estado: source.estado || '',
        subtareas: Array.isArray(source.subtareas)
            ? source.subtareas.map((sub) => ({
                id: Number(sub.id),
                titulo: sub.titulo || '',
                comentarios: Array.isArray(sub.comentarios) ? sub.comentarios : [],
                minutos: Number(sub.minutos) || 0,
                inicio: sub.inicio || '',
                fin: sub.fin || '',
                estado: sub.estado || '',
                subtareas: [],
            }))
            : [],
    };
}

async function loadData() {
    try {
        const response = await fetch('/requerimientos/requerimientos-sotic.json');
        const data = await response.json();
        const reqList = [];
        const taskList = [];

        (Array.isArray(data) ? data : []).forEach((item) => {
            const normalizedReq = normalizeRequerimiento(item);
            reqList.push(normalizedReq);

            (Array.isArray(item.tareas) ? item.tareas : []).forEach((task) => {
                taskList.push(normalizeTask(task, normalizedReq.id));
            });
        });

        requerimientos.value = reqList;
        tareas.value = taskList;
        resetRequerimientoForm();
        resetTaskForm();
    } catch {
        requerimientos.value = [];
        tareas.value = [];
    }
}

onMounted(loadData);
</script>

<style scoped>
.badge {
    font-size: 0.95em;
}
</style>
