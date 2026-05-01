<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
      <h4 class="mb-0"><i class="bi bi-key me-2 text-primary"></i>Permisos</h4>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i>Nuevo permiso
      </button>
    </div>

    <div class="mb-3">
      <div class="input-group input-group-sm" style="max-width: 320px">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input v-model="search" type="text" class="form-control" placeholder="Buscar..." />
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Nombre (clave)</th>
              <th>Módulo</th>
              <th>Acción</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Sin resultados.</td>
            </tr>
            <tr v-for="(p, i) in filtered" :key="p.id">
              <td class="text-muted small">{{ i + 1 }}</td>
              <td><code class="text-body">{{ p.nombre }}</code></td>
              <td>{{ p.modulo }}</td>
              <td>
                <span :class="['badge', actionBadge(p.accion)]">{{ p.accion }}</span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openEdit(p)" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="askDelete(p)" title="Eliminar">
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
      :title="editingId ? 'Editar permiso' : 'Nuevo permiso'"
      :icon="editingId ? 'bi-pencil' : 'bi-key'"
      static-backdrop
      @hidden="resetForm"
    >
      <form ref="formEl" @submit.prevent="save" :class="{ 'was-validated': validated }" novalidate>
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
            <label class="form-label">Nombre (clave) <span class="text-danger">*</span></label>
            <input
              v-model.trim="form.nombre"
              type="text"
              class="form-control"
              required
              placeholder="Ej: users.view"
              pattern="^[a-z0-9_.]+$"
            />
            <div class="form-text">Solo letras minúsculas, números, puntos y guiones bajos.</div>
            <div class="invalid-feedback">Formato inválido (Ej: users.view).</div>
          </div>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" type="button" @click="crudModal.hide()">Cancelar</button>
        <button class="btn btn-primary" type="button" @click="save">
          <i class="bi bi-check-lg me-1"></i>{{ editingId ? 'Guardar cambios' : 'Crear permiso' }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      ref="confirmModal"
      :message="`¿Eliminar el permiso '${deletingItem?.nombre}'?`"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const ACTION_BADGES = {
  Ver: 'bg-info-subtle text-info-emphasis',
  Crear: 'bg-success-subtle text-success-emphasis',
  Editar: 'bg-warning-subtle text-warning-emphasis',
  Eliminar: 'bg-danger-subtle text-danger-emphasis',
}
const actionBadge = (a) => ACTION_BADGES[a] ?? 'bg-secondary-subtle text-secondary-emphasis'

const items = ref([
  { id: 1, nombre: 'users.view', modulo: 'Usuarios', accion: 'Ver' },
  { id: 2, nombre: 'users.create', modulo: 'Usuarios', accion: 'Crear' },
  { id: 3, nombre: 'users.edit', modulo: 'Usuarios', accion: 'Editar' },
  { id: 4, nombre: 'users.delete', modulo: 'Usuarios', accion: 'Eliminar' },
  { id: 5, nombre: 'products.view', modulo: 'Productos', accion: 'Ver' },
  { id: 6, nombre: 'products.create', modulo: 'Productos', accion: 'Crear' },
])

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q
    ? items.value.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.modulo.toLowerCase().includes(q) ||
          p.accion.toLowerCase().includes(q),
      )
    : items.value
})

const EMPTY = { nombre: '', modulo: '', accion: '' }
const form = reactive({ ...EMPTY })
const formEl = ref(null)
const validated = ref(false)
const editingId = ref(null)
const crudModal = ref(null)
const confirmModal = ref(null)
const deletingItem = ref(null)

function resetForm() {
  Object.assign(form, EMPTY)
  validated.value = false
  editingId.value = null
}

function openCreate() {
  resetForm()
  crudModal.value.show()
}

function openEdit(item) {
  resetForm()
  Object.assign(form, item)
  editingId.value = item.id
  crudModal.value.show()
}

function save() {
  validated.value = true
  if (!formEl.value.checkValidity()) return
  if (editingId.value) {
    const idx = items.value.findIndex((i) => i.id === editingId.value)
    items.value[idx] = { ...items.value[idx], ...form }
  } else {
    items.value.push({ ...form, id: Date.now() })
  }
  crudModal.value.hide()
}

function askDelete(item) {
  deletingItem.value = item
  confirmModal.value.show()
}

function confirmDelete() {
  items.value = items.value.filter((i) => i.id !== deletingItem.value.id)
  deletingItem.value = null
}
</script>
