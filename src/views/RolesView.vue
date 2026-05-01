<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
      <h4 class="mb-0"><i class="bi bi-shield me-2 text-primary"></i>Roles</h4>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i>Nuevo rol
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
              <th>Nombre</th>
              <th>Descripción</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="4" class="text-center text-muted py-4">Sin resultados.</td>
            </tr>
            <tr v-for="(r, i) in filtered" :key="r.id">
              <td class="text-muted small">{{ i + 1 }}</td>
              <td>
                <span class="badge bg-primary-subtle text-primary-emphasis">{{ r.nombre }}</span>
              </td>
              <td class="text-muted">{{ r.descripcion || '—' }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openEdit(r)" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="askDelete(r)" title="Eliminar">
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
      :title="editingId ? 'Editar rol' : 'Nuevo rol'"
      :icon="editingId ? 'bi-pencil' : 'bi-shield-plus'"
      static-backdrop
      @hidden="resetForm"
    >
      <form ref="formEl" @submit.prevent="save" :class="{ 'was-validated': validated }" novalidate>
        <div class="mb-3">
          <label class="form-label">Nombre <span class="text-danger">*</span></label>
          <input v-model.trim="form.nombre" type="text" class="form-control" required />
          <div class="invalid-feedback">Campo requerido.</div>
        </div>
        <div class="mb-1">
          <label class="form-label">Descripción</label>
          <textarea v-model.trim="form.descripcion" class="form-control" rows="3"></textarea>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" type="button" @click="crudModal.hide()">Cancelar</button>
        <button class="btn btn-primary" type="button" @click="save">
          <i class="bi bi-check-lg me-1"></i>{{ editingId ? 'Guardar cambios' : 'Crear rol' }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      ref="confirmModal"
      :message="`¿Eliminar el rol '${deletingItem?.nombre}'?`"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const items = ref([
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
  { id: 2, nombre: 'Editor', descripcion: 'Puede crear y editar contenido' },
  { id: 3, nombre: 'Viewer', descripcion: 'Solo lectura' },
])

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q ? items.value.filter((r) => r.nombre.toLowerCase().includes(q)) : items.value
})

const EMPTY = { nombre: '', descripcion: '' }
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
