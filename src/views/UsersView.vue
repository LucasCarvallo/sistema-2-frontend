<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
      <h4 class="mb-0"><i class="bi bi-people me-2 text-primary"></i>Usuarios</h4>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i>Nuevo usuario
      </button>
    </div>

    <div class="mb-3">
      <div class="input-group input-group-sm" style="max-width: 320px">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input v-model="search" type="text" class="form-control" placeholder="Buscar..." @keydown.esc.stop="search = ''" />
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Sin resultados.</td>
            </tr>
            <tr v-for="(u, i) in filtered" :key="u.id">
              <td class="text-muted small">{{ i + 1 }}</td>
              <td class="fw-medium">{{ u.nombre }} {{ u.apellido }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.telefono || '—' }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openEdit(u)" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="askDelete(u)" title="Eliminar">
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
      :title="editingId ? 'Editar usuario' : 'Nuevo usuario'"
      :icon="editingId ? 'bi-pencil' : 'bi-person-plus'"
      size="lg"
      static-backdrop
      @hidden="resetForm"
    >
      <form ref="formEl" @submit.prevent="save" :class="{ 'was-validated': validated }" novalidate>
        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input v-model.trim="form.nombre" type="text" class="form-control" required />
            <div class="invalid-feedback">Campo requerido.</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label">Apellido <span class="text-danger">*</span></label>
            <input v-model.trim="form.apellido" type="text" class="form-control" required />
            <div class="invalid-feedback">Campo requerido.</div>
          </div>
          <div class="col-sm-6">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input v-model.trim="form.email" type="email" class="form-control" required />
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
              <span v-else class="text-muted small ms-1">(dejar vacío para no cambiar)</span>
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
        <button class="btn btn-secondary" type="button" @click="crudModal.hide()">Cancelar</button>
        <button class="btn btn-primary" type="button" @click="save">
          <i class="bi bi-check-lg me-1"></i>{{ editingId ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      ref="confirmModal"
      :message="`¿Eliminar a ${deletingItem?.nombre} ${deletingItem?.apellido}?`"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const items = ref([
  { id: 1, nombre: 'Juan', apellido: 'García', email: 'juan@ejemplo.com', telefono: '011-1234-5678' },
  { id: 2, nombre: 'María', apellido: 'López', email: 'maria@ejemplo.com', telefono: '011-9876-5432' },
  { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@ejemplo.com', telefono: '' },
])

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q
    ? items.value.filter(
        (u) =>
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    : items.value
})

const EMPTY = { nombre: '', apellido: '', email: '', telefono: '', password: '' }
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
  Object.assign(form, { ...item, password: '' })
  editingId.value = item.id
  crudModal.value.show()
}

function save() {
  validated.value = true
  if (!formEl.value.checkValidity()) return
  if (editingId.value) {
    const idx = items.value.findIndex((i) => i.id === editingId.value)
    const updated = { ...items.value[idx], ...form }
    if (!form.password) delete updated.password
    items.value[idx] = updated
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
