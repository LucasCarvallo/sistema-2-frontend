<template>
    <div class="container py-3 py-md-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h1 class="mb-0">Detalle de requerimiento</h1>
            <button class="btn btn-outline-secondary" type="button" @click="volver">
                <i class="bi bi-arrow-left me-1"></i>Volver
            </button>
        </div>

        <div v-if="loading" class="alert alert-info mb-0">Cargando datos...</div>
        <div v-else-if="!requerimiento" class="alert alert-warning mb-0">No se encontro el requerimiento solicitado.</div>

        <template v-else>
            <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">
                    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
                        <div>
                            <div class="text-muted small">Requerimiento #{{ requerimiento.id }}</div>
                            <h4 class="mb-1">{{ requerimiento.titulo }}</h4>
                            <div class="text-muted">{{ requerimiento.rama }}</div>
                        </div>
                        <div class="text-end">
                            <span :class="estadoClass(requerimiento.estado)">{{ requerimiento.estado || '—' }}</span>
                            <div class="mt-2 small text-muted">
                                Tareas: {{ tareasDelReq.length }}
                                <br />
                                Minutos: {{ minutosTotalesReq }} ({{ calcularHoras(minutosTotalesReq) }})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-3">
                <div class="col-12 col-xl-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <h5 class="mb-0">Tarea</h5>
                                <button class="btn btn-sm btn-outline-secondary" type="button" @click="resetTaskForm">
                                    <i class="bi bi-plus-lg me-1"></i>Nueva
                                </button>
                            </div>

                            <form @submit.prevent="saveTaskForm" :class="{ 'was-validated': taskValidated }" novalidate>
                                <div class="row g-2">
                                    <div class="col-3">
                                        <label class="form-label">ID</label>
                                        <input v-model.number="taskForm.id" type="number" min="1" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-9">
                                        <label class="form-label">Titulo</label>
                                        <input v-model.trim="taskForm.titulo" type="text" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Estado</label>
                                        <input v-model.trim="taskForm.estado" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Minutos</label>
                                        <input v-model.number="taskForm.minutos" type="number" min="0" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Req</label>
                                        <input :value="reqId" type="number" class="form-control form-control-sm" disabled />
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Inicio</label>
                                        <input v-model.trim="taskForm.inicio" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Fin</label>
                                        <input v-model.trim="taskForm.fin" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Comentarios</label>
                                        <textarea v-model="taskForm.comentariosStr" rows="2" class="form-control form-control-sm" placeholder="Un comentario por linea"></textarea>
                                    </div>
                                    <div class="col-12 d-flex gap-2 justify-content-end">
                                        <button class="btn btn-sm btn-success" type="submit">Guardar tarea</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <h5 class="mb-0">Subtarea</h5>
                                <button class="btn btn-sm btn-outline-secondary" type="button" @click="resetSubtaskForm">
                                    <i class="bi bi-plus-lg me-1"></i>Nueva
                                </button>
                            </div>

                            <form @submit.prevent="saveSubtaskForm" :class="{ 'was-validated': subtaskValidated }" novalidate>
                                <div class="row g-2">
                                    <div class="col-4">
                                        <label class="form-label">Tarea</label>
                                        <select v-model.number="subtaskForm.parentTaskId" class="form-select form-select-sm" required>
                                            <option :value="0">Seleccionar...</option>
                                            <option v-for="t in tareasDelReq" :key="`st-task-${t.id}`" :value="t.id">#{{ t.id }} - {{ t.titulo }}</option>
                                        </select>
                                    </div>
                                    <div class="col-3">
                                        <label class="form-label">ID</label>
                                        <input v-model.number="subtaskForm.id" type="number" min="1" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-5">
                                        <label class="form-label">Estado</label>
                                        <input v-model.trim="subtaskForm.estado" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Titulo</label>
                                        <input v-model.trim="subtaskForm.titulo" type="text" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Minutos</label>
                                        <input v-model.number="subtaskForm.minutos" type="number" min="0" class="form-control form-control-sm" required />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Inicio</label>
                                        <input v-model.trim="subtaskForm.inicio" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label">Fin</label>
                                        <input v-model.trim="subtaskForm.fin" type="text" class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Comentarios</label>
                                        <textarea v-model="subtaskForm.comentariosStr" rows="2" class="form-control form-control-sm" placeholder="Un comentario por linea"></textarea>
                                    </div>
                                    <div class="col-12 d-flex gap-2 justify-content-end">
                                        <button class="btn btn-sm btn-success" type="submit">Guardar subtarea</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="tareasDelReq.length === 0" class="alert alert-light border mb-0">
                Este requerimiento aun no tiene tareas cargadas.
            </div>

            <div v-else class="vstack gap-3">
                <div v-for="tarea in tareasDelReq" :key="tarea.id" class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                            <div>
                                <div class="small text-muted">Tarea #{{ tarea.id }}</div>
                                <h5 class="mb-1">{{ tarea.titulo }}</h5>
                                <span :class="estadoClass(estadoTareaFinal(tarea))">{{ estadoTareaFinal(tarea) || '—' }}</span>
                            </div>
                            <div class="text-end small">
                                <div><strong>Minutos:</strong> {{ minutosTotalesByTask(tarea) }}</div>
                                <div><strong>Horas:</strong> {{ calcularHoras(minutosTotalesByTask(tarea)) }}</div>
                                <div v-if="tarea.inicio || tarea.fin" class="text-muted mt-1">
                                    {{ tarea.inicio || '—' }} a {{ tarea.fin || '—' }}
                                </div>
                            </div>
                        </div>

                        <div v-if="tarea.comentarios?.length" class="mb-3">
                            <div class="small text-muted mb-1">Comentarios</div>
                            <ul class="mb-0 ps-3">
                                <li v-for="(c, idx) in tarea.comentarios" :key="`tc-${tarea.id}-${idx}`">{{ c }}</li>
                            </ul>
                        </div>

                        <div class="border-top pt-3">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <h6 class="mb-0">Subtareas</h6>
                                <span class="badge text-bg-light border">{{ tarea.subtareas?.length || 0 }}</span>
                            </div>

                            <div class="d-flex gap-2 mb-2">
                                <button class="btn btn-sm btn-outline-primary" type="button" @click="openTaskForm(tarea)">
                                    <i class="bi bi-pencil me-1"></i>Editar tarea
                                </button>
                                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteTask(tarea.id)">
                                    <i class="bi bi-trash me-1"></i>Eliminar tarea
                                </button>
                                <button class="btn btn-sm btn-outline-success" type="button" @click="prepareSubtaskForTask(tarea.id)">
                                    <i class="bi bi-plus me-1"></i>Nueva subtarea
                                </button>
                            </div>

                            <div v-if="!tarea.subtareas?.length" class="alert alert-light border mb-0 py-2">
                                Sin subtareas.
                            </div>

                            <div v-else class="table-responsive">
                                <table class="table table-sm align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th style="width: 70px">ID</th>
                                            <th>Titulo</th>
                                            <th style="width: 130px">Estado</th>
                                            <th style="width: 110px">Minutos</th>
                                            <th style="width: 260px">Rango</th>
                                            <th style="width: 110px"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="sub in tarea.subtareas" :key="`sub-${tarea.id}-${sub.id}`">
                                            <td>#{{ sub.id }}</td>
                                            <td>
                                                <div>{{ sub.titulo }}</div>
                                                <ul v-if="sub.comentarios?.length" class="mb-0 mt-1 ps-3 small text-muted">
                                                    <li v-for="(c, idx) in sub.comentarios" :key="`sc-${sub.id}-${idx}`">{{ c }}</li>
                                                </ul>
                                            </td>
                                            <td>
                                                <span :class="estadoClass(sub.estado)">{{ sub.estado || '—' }}</span>
                                            </td>
                                            <td>{{ Number(sub.minutos) || 0 }}</td>
                                            <td class="small text-muted">{{ sub.inicio || '—' }} a {{ sub.fin || '—' }}</td>
                                            <td class="text-end">
                                                <button class="btn btn-sm btn-outline-primary me-1" type="button" @click="openSubtaskForm(tarea.id, sub)">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteSubtask(tarea.id, sub.id)">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const requerimientos = ref([]);
const tareas = ref([]);
const taskValidated = ref(false);
const subtaskValidated = ref(false);

const taskForm = reactive({
    id: null,
    titulo: '',
    comentariosStr: '',
    minutos: 0,
    inicio: '',
    fin: '',
    estado: '',
});

const subtaskForm = reactive({
    parentTaskId: 0,
    id: null,
    titulo: '',
    comentariosStr: '',
    minutos: 0,
    inicio: '',
    fin: '',
    estado: '',
});

const reqId = computed(() => Number(route.params.id));

const requerimiento = computed(() => {
    return requerimientos.value.find((r) => Number(r.id) === reqId.value) || null;
});

const tareasDelReq = computed(() => {
    return tareas.value.filter((t) => Number(t.requerimiento_id) === reqId.value);
});

const minutosTotalesByTask = (task) => {
    const subtareas = Array.isArray(task.subtareas) ? task.subtareas : [];
    if (subtareas.length > 0) {
        return subtareas.reduce((total, item) => total + (Number(item.minutos) || 0), 0);
    }
    return Number(task.minutos) || 0;
};

const minutosTotalesReq = computed(() => {
    return tareasDelReq.value.reduce((total, t) => total + minutosTotalesByTask(t), 0);
});

function estadoTareaFinal(task) {
    const estado = String(task?.estado || '').toUpperCase().trim();
    if (estado !== 'LISTO') return task?.estado || '';

    const subtareas = Array.isArray(task?.subtareas) ? task.subtareas : [];
    const tienePendiente = subtareas.some((sub) => String(sub?.estado || '').toUpperCase().trim() !== 'LISTO');

    return tienePendiente ? 'HACER' : 'LISTO';
}

function calcularHoras(minutos) {
    const horas = minutos / 60;
    const minutosRestantes = minutos % 60;
    return `${Math.floor(horas)}h ${Math.round(minutosRestantes)}m`;
}

function estadoClass(estado) {
    const value = String(estado || '').toUpperCase().trim();

    if (!value || value === '—') return 'badge bg-secondary-subtle text-secondary-emphasis';
    if (value === 'EN DEV') return 'badge bg-primary-subtle text-primary-emphasis';
    if (value === 'LISTO' || value === 'EN PROD') return 'badge bg-success-subtle text-success-emphasis';
    if (value.includes('HACER') || value.includes('REVISAR')) return 'badge bg-warning-subtle text-warning-emphasis';

    return 'badge bg-info-subtle text-info-emphasis';
}

function volver() {
    router.push({ name: 'requerimientos' });
}

function nextTaskId() {
    if (!tareas.value.length) return 1;
    return Math.max(...tareas.value.map((item) => Number(item.id) || 0)) + 1;
}

function nextSubtaskId(task) {
    const subs = Array.isArray(task?.subtareas) ? task.subtareas : [];
    if (!subs.length) return 1;
    return Math.max(...subs.map((item) => Number(item.id) || 0)) + 1;
}

function parseComentarios(text) {
    return (text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function findTask(taskId) {
    return tareas.value.find((t) => Number(t.id) === Number(taskId) && Number(t.requerimiento_id) === reqId.value);
}

function resetTaskForm() {
    taskValidated.value = false;
    taskForm.id = nextTaskId();
    taskForm.titulo = '';
    taskForm.comentariosStr = '';
    taskForm.minutos = 0;
    taskForm.inicio = '';
    taskForm.fin = '';
    taskForm.estado = '';
}

function openTaskForm(task) {
    taskValidated.value = false;
    taskForm.id = Number(task.id);
    taskForm.titulo = task.titulo || '';
    taskForm.comentariosStr = (task.comentarios || []).join('\n');
    taskForm.minutos = Number(task.minutos) || 0;
    taskForm.inicio = task.inicio || '';
    taskForm.fin = task.fin || '';
    taskForm.estado = task.estado || '';
}

function saveTaskForm() {
    taskValidated.value = true;
    if (!taskForm.id || !taskForm.titulo.trim()) return;

    const payload = {
        id: Number(taskForm.id),
        requerimiento_id: reqId.value,
        titulo: taskForm.titulo.trim(),
        comentarios: parseComentarios(taskForm.comentariosStr),
        minutos: Number(taskForm.minutos) || 0,
        inicio: (taskForm.inicio || '').trim(),
        fin: (taskForm.fin || '').trim(),
        estado: (taskForm.estado || '').trim(),
        subtareas: [],
    };

    const existing = findTask(payload.id);
    if (existing) {
        payload.subtareas = Array.isArray(existing.subtareas) ? existing.subtareas : [];
        const index = tareas.value.findIndex((t) => Number(t.id) === payload.id && Number(t.requerimiento_id) === reqId.value);
        if (index !== -1) tareas.value[index] = payload;
    } else {
        tareas.value.push(payload);
    }

    resetTaskForm();
}

function deleteTask(taskId) {
    tareas.value = tareas.value.filter((t) => !(Number(t.id) === Number(taskId) && Number(t.requerimiento_id) === reqId.value));
    if (Number(taskForm.id) === Number(taskId)) resetTaskForm();
    if (Number(subtaskForm.parentTaskId) === Number(taskId)) resetSubtaskForm();
}

function resetSubtaskForm() {
    subtaskValidated.value = false;
    subtaskForm.parentTaskId = 0;
    subtaskForm.id = null;
    subtaskForm.titulo = '';
    subtaskForm.comentariosStr = '';
    subtaskForm.minutos = 0;
    subtaskForm.inicio = '';
    subtaskForm.fin = '';
    subtaskForm.estado = '';
}

function prepareSubtaskForTask(taskId) {
    const task = findTask(taskId);
    if (!task) return;
    resetSubtaskForm();
    subtaskForm.parentTaskId = Number(taskId);
    subtaskForm.id = nextSubtaskId(task);
}

function openSubtaskForm(taskId, sub) {
    subtaskValidated.value = false;
    subtaskForm.parentTaskId = Number(taskId);
    subtaskForm.id = Number(sub.id);
    subtaskForm.titulo = sub.titulo || '';
    subtaskForm.comentariosStr = (sub.comentarios || []).join('\n');
    subtaskForm.minutos = Number(sub.minutos) || 0;
    subtaskForm.inicio = sub.inicio || '';
    subtaskForm.fin = sub.fin || '';
    subtaskForm.estado = sub.estado || '';
}

function saveSubtaskForm() {
    subtaskValidated.value = true;
    if (!subtaskForm.parentTaskId || !subtaskForm.id || !subtaskForm.titulo.trim()) return;

    const task = findTask(subtaskForm.parentTaskId);
    if (!task) return;

    if (!Array.isArray(task.subtareas)) {
        task.subtareas = [];
    }

    const payload = {
        id: Number(subtaskForm.id),
        titulo: subtaskForm.titulo.trim(),
        comentarios: parseComentarios(subtaskForm.comentariosStr),
        minutos: Number(subtaskForm.minutos) || 0,
        inicio: (subtaskForm.inicio || '').trim(),
        fin: (subtaskForm.fin || '').trim(),
        estado: (subtaskForm.estado || '').trim(),
        subtareas: [],
    };

    const subIndex = task.subtareas.findIndex((s) => Number(s.id) === payload.id);
    if (subIndex === -1) task.subtareas.push(payload);
    else task.subtareas[subIndex] = payload;

    prepareSubtaskForTask(task.id);
}

function deleteSubtask(taskId, subId) {
    const task = findTask(taskId);
    if (!task || !Array.isArray(task.subtareas)) return;
    task.subtareas = task.subtareas.filter((s) => Number(s.id) !== Number(subId));

    if (Number(subtaskForm.parentTaskId) === Number(taskId) && Number(subtaskForm.id) === Number(subId)) {
        prepareSubtaskForTask(taskId);
    }
}

async function loadData() {
    loading.value = true;

    try {
        const [reqRes, taskRes] = await Promise.all([
            fetch('/requerimientos/requerimientos.json'),
            fetch('/requerimientos/tareas.json'),
        ]);

        const reqList = await reqRes.json();
        const taskList = await taskRes.json();

        requerimientos.value = Array.isArray(reqList) ? reqList : [];
        tareas.value = Array.isArray(taskList)
            ? taskList.map((item) => ({
                ...item,
                subtareas: Array.isArray(item.subtareas) ? item.subtareas : [],
            }))
            : [];
    } catch {
        requerimientos.value = [];
        tareas.value = [];
    } finally {
        loading.value = false;
        resetTaskForm();
        resetSubtaskForm();
    }
}

onMounted(loadData);
</script>

<style scoped>
.badge {
    font-size: 0.9em;
}
</style>
