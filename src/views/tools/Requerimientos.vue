<template>
    <div class="container py-3 py-md-4">
        <h1 class="mb-4">Requerimientos</h1>

        <CrudTableLayout
            title="Lista de requerimientos"
            icon="bi-list-task"
            create-label="Nuevo requerimiento"
            :columns="columns"
            :rows="sortedRequerimientos"
            :sort-key="sortKey"
            :sort-icon="sortIcon"
            :search="search"
            search-placeholder="Buscar por título, rama o estado"
            @create="openModal()"
            @update:search="search = $event"
            @sort="sort"
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
            <template #actions="{ row }">
                <button class="btn btn-sm btn-primary me-1" @click="openModal(row)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger" @click="askDelete(row)"><i class="bi bi-trash"></i></button>
            </template>
        </CrudTableLayout>

        <AppModal ref="modal" :title="modalTitle" icon="bi-list-task" size="xl" static-backdrop @hidden="resetForm">
            <form @submit.prevent="saveRequerimiento" :class="{ 'was-validated': validated }" novalidate>
                <div class="row g-3">
                    <div class="col-md-2">
                        <label class="form-label">ID <span class="text-danger">*</span></label>
                        <input v-model.number="form.id" type="number" class="form-control" required min="1" step="1" />
                        <div class="invalid-feedback">ID requerido.</div>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Título <span class="text-danger">*</span></label>
                        <input v-model.trim="form.titulo" type="text" class="form-control" required />
                        <div class="invalid-feedback">Título requerido.</div>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Rama <span class="text-danger">*</span></label>
                        <input v-model.trim="form.rama" type="text" class="form-control" required />
                        <div class="invalid-feedback">Rama requerida.</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Estado</label>
                        <input v-model.trim="form.estado" type="text" class="form-control" />
                    </div>
                </div>

                <div class="mt-4">
                    <h5 class="mb-2">Tareas</h5>
                    <div v-for="(tarea, tIdx) in form.tareas" :key="tarea.id" class="card mb-3 border-1">
                        <div class="card-body pb-2">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-1">
                                    <label class="form-label">ID</label>
                                    <input v-model.number="tarea.id" type="number" class="form-control form-control-sm" required min="1" />
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Título</label>
                                    <input v-model.trim="tarea.titulo" type="text" class="form-control form-control-sm" required />
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Minutos</label>
                                    <input v-model.number="tarea.minutos" type="number" class="form-control form-control-sm" min="0" />
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Estado</label>
                                    <input v-model.trim="tarea.estado" type="text" class="form-control form-control-sm" />
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Inicio</label>
                                    <input v-model="tarea.inicio" type="text" class="form-control form-control-sm" />
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Fin</label>
                                    <input v-model="tarea.fin" type="text" class="form-control form-control-sm" />
                                </div>
                                <div class="col-md-1 text-end">
                                    <button class="btn btn-outline-danger btn-sm" type="button" @click="removeTarea(tIdx)"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                            <div class="row g-2 mt-2">
                                <div class="col-12">
                                    <label class="form-label">Descripciones</label>
                                    <textarea v-model="tarea.descripcionesStr" class="form-control form-control-sm" rows="1" placeholder="Separar por salto de línea"></textarea>
                                </div>
                            </div>
                            <div class="mt-2">
                                <strong>Subtareas</strong>
                                <div v-for="(sub, sIdx) in tarea.subtareas" :key="sub.id" class="border rounded p-2 mb-2">
                                    <div class="row g-2 align-items-end">
                                        <div class="col-md-1">
                                            <input v-model.number="sub.id" type="number" class="form-control form-control-sm" required min="1" placeholder="ID" />
                                        </div>
                                        <div class="col-md-4">
                                            <input v-model.trim="sub.titulo" type="text" class="form-control form-control-sm" required placeholder="Título" />
                                        </div>
                                        <div class="col-md-2">
                                            <input v-model.number="sub.minutos" type="number" class="form-control form-control-sm" min="0" placeholder="Minutos" />
                                        </div>
                                        <div class="col-md-2">
                                            <input v-model.trim="sub.estado" type="text" class="form-control form-control-sm" placeholder="Estado" />
                                        </div>
                                        <div class="col-md-2">
                                            <input v-model="sub.inicio" type="text" class="form-control form-control-sm" placeholder="Inicio" />
                                        </div>
                                        <div class="col-md-2">
                                            <input v-model="sub.fin" type="text" class="form-control form-control-sm" placeholder="Fin" />
                                        </div>
                                        <div class="col-md-1 text-end">
                                            <button class="btn btn-outline-danger btn-sm" type="button" @click="removeSubtarea(tIdx, sIdx)"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </div>
                                    <div class="row g-2 mt-1">
                                        <div class="col-12">
                                            <textarea v-model="sub.descripcionesStr" class="form-control form-control-sm" rows="1" placeholder="Descripciones (una por línea)"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-outline-success btn-sm mt-1" type="button" @click="addSubtarea(tIdx)"><i class="bi bi-plus"></i> Agregar subtarea</button>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-outline-success btn-sm mt-2" type="button" @click="addTarea"><i class="bi bi-plus"></i> Agregar tarea</button>
                </div>

                <div class="mt-4 d-flex gap-2 justify-content-end">
                    <button class="btn btn-success" type="submit"><i class="bi bi-check-lg me-1"></i>{{ editingId === null ? 'Agregar' : 'Guardar' }}</button>
                    <button class="btn btn-secondary" type="button" @click="modal.hide()">Cancelar</button>
                </div>
            </form>
        </AppModal>

        <ConfirmModal ref="confirmModal" :message="confirmMessage" @confirm="confirmDelete" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import CrudTableLayout from '@/components/ui/CrudTableLayout.vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { useTableSort } from '@/composables/useTableSort'

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'titulo', label: 'Título', sortable: true },
    { key: 'rama', label: 'Rama', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
]

const requerimientos = ref([])
const search = ref('')
const { sortKey, sort, sortIcon, sorted: sortedRequerimientos } = useTableSort(computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return requerimientos.value
    return requerimientos.value.filter(r =>
        String(r.id).includes(q) ||
        (r.titulo ?? '').toLowerCase().includes(q) ||
        (r.rama ?? '').toLowerCase().includes(q) ||
        (r.estado ?? '').toLowerCase().includes(q)
    )
}))

const modal = ref(null)
const confirmModal = ref(null)
const validated = ref(false)
const editingId = ref(null)
const form = reactive({ id: null, titulo: '', rama: '', estado: '', tareas: [] })
const confirmMessage = ref('¿Eliminar requerimiento?')
const deleteTarget = ref(null)

const modalTitle = computed(() => editingId.value === null ? 'Nuevo requerimiento' : `Editar requerimiento #${form.id}`)

function estadoClass(estado) {
    if (!estado) return 'badge bg-secondary-subtle text-secondary-emphasis'
    if (String(estado).toUpperCase().includes('LISTO')) return 'badge bg-success-subtle text-success-emphasis'
    if (String(estado).toUpperCase().includes('HACER')) return 'badge bg-warning-subtle text-warning-emphasis'
    return 'badge bg-info-subtle text-info-emphasis'
}

function openModal(row = null) {
    validated.value = false
    if (row) {
        editingId.value = row.id
        Object.assign(form, JSON.parse(JSON.stringify(row)))
        // Normalizar descripcionesStr para edición
        form.tareas?.forEach(t => {
            t.descripcionesStr = (t.descripciones || []).join('\n')
            t.subtareas?.forEach(s => {
                s.descripcionesStr = (s.descripciones || []).join('\n')
            })
        })
    } else {
        editingId.value = null
        Object.assign(form, { id: nextId(), titulo: '', rama: '', estado: '', tareas: [] })
    }
    modal.value?.show()
}

function resetForm() {
    validated.value = false
    editingId.value = null
    Object.assign(form, { id: nextId(), titulo: '', rama: '', estado: '', tareas: [] })
}

function addTarea() {
    form.tareas.push({
        id: nextTareaId(form.tareas),
        titulo: '',
        descripcionesStr: '',
        minutos: 0,
        estado: '',
        inicio: '',
        fin: '',
        subtareas: []
    })
}
function removeTarea(idx) {
    form.tareas.splice(idx, 1)
}
function addSubtarea(tIdx) {
    form.tareas[tIdx].subtareas.push({
        id: nextTareaId(form.tareas[tIdx].subtareas),
        titulo: '',
        descripcionesStr: '',
        minutos: 0,
        estado: '',
        inicio: '',
        fin: '',
        subtareas: []
    })
}
function removeSubtarea(tIdx, sIdx) {
    form.tareas[tIdx].subtareas.splice(sIdx, 1)
}

function nextId() {
    if (!requerimientos.value.length) return 1
    return Math.max(...requerimientos.value.map(r => Number(r.id) || 0)) + 1
}
function nextTareaId(arr) {
    if (!arr.length) return 1
    return Math.max(...arr.map(t => Number(t.id) || 0)) + 1
}

function askDelete(row) {
    deleteTarget.value = row
    confirmMessage.value = `¿Eliminar requerimiento #${row.id}?`
    confirmModal.value?.show()
}

function confirmDelete() {
    if (!deleteTarget.value) return
    requerimientos.value = requerimientos.value.filter(r => r.id !== deleteTarget.value.id)
    saveAll()
    deleteTarget.value = null
}

function saveRequerimiento() {
    validated.value = true
    if (!form.id || !form.titulo.trim() || !form.rama.trim() || !form.tareas.length) return

    // Normalizar descripciones
    form.tareas.forEach(t => {
        t.descripciones = t.descripcionesStr?.split('\n').map(s => s.trim()).filter(Boolean) || []
        t.subtareas?.forEach(s => {
            s.descripciones = s.descripcionesStr?.split('\n').map(x => x.trim()).filter(Boolean) || []
        })
    })

    const nuevo = JSON.parse(JSON.stringify(form))
    // Eliminar helpers temporales
    nuevo.tareas.forEach(t => {
        delete t.descripcionesStr
        t.subtareas?.forEach(s => { delete s.descripcionesStr })
    })

    if (editingId.value === null) {
        requerimientos.value.push(nuevo)
    } else {
        const idx = requerimientos.value.findIndex(r => r.id === editingId.value)
        if (idx !== -1) requerimientos.value[idx] = nuevo
    }
    saveAll()
    modal.value?.hide()
}

function saveAll() {
    // Guardar en el archivo JSON local (solo agrega o edita, nunca borra lo que ya estaba)
    fetch('/requerimientos/requerimientos-sotic.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requerimientos.value, null, 2)
    })
}

async function cargarRequerimientos() {
    const res = await fetch('/requerimientos/requerimientos-sotic.json')
    if (res.ok) {
        requerimientos.value = await res.json()
    }
}

onMounted(cargarRequerimientos)
</script>

<style scoped>
.badge {
    font-size: 0.95em;
}
</style>
