<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
      <h4 class="mb-0"><i class="bi bi-box-seam me-2 text-primary"></i>Productos</h4>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i>Nuevo producto
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
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Sin resultados.</td>
            </tr>
            <tr v-for="(p, i) in filtered" :key="p.id">
              <td class="text-muted small">{{ i + 1 }}</td>
              <td class="fw-medium">{{ p.nombre }}</td>
              <td>
                <span class="badge bg-secondary-subtle text-secondary-emphasis">{{ p.categoria }}</span>
              </td>
              <td>${{ p.precio.toLocaleString('es-AR') }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    p.stock > 0
                      ? 'bg-success-subtle text-success-emphasis'
                      : 'bg-danger-subtle text-danger-emphasis',
                  ]"
                >
                  {{ p.stock }}
                </span>
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
      :title="editingId ? 'Editar producto' : 'Nuevo producto'"
      :icon="editingId ? 'bi-pencil' : 'bi-box-seam'"
      size="lg"
      static-backdrop
      @hidden="resetForm"
    >
      <form ref="formEl" @submit.prevent="save" :class="{ 'was-validated': validated }" novalidate>
        <div class="row g-3">
          <div class="col-sm-8">
            <label class="form-label">Nombre <span class="text-danger">*</span></label>
            <input v-model.trim="form.nombre" type="text" class="form-control" required />
            <div class="invalid-feedback">Campo requerido.</div>
          </div>
          <div class="col-sm-4">
            <label class="form-label">Categoría <span class="text-danger">*</span></label>
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
            <textarea v-model.trim="form.descripcion" class="form-control" rows="2"></textarea>
          </div>
          <!-- Permite enviar con Enter; los textarea quedan excluidos por comportamiento nativo -->
          <button type="submit" class="d-none" aria-hidden="true"></button>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" type="button" @click="crudModal.hide()">Cancelar</button>
        <button class="btn btn-primary" type="button" @click="save">
          <i class="bi bi-check-lg me-1"></i>{{ editingId ? 'Guardar cambios' : 'Crear producto' }}
        </button>
      </template>
    </AppModal>

    <ConfirmModal
      ref="confirmModal"
      :message="`¿Eliminar el producto '${deletingItem?.nombre}'?`"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const items = ref([
  { id: 1, nombre: 'Laptop Pro', categoria: 'Electrónica', precio: 1200, stock: 15, descripcion: 'Laptop de alto rendimiento' },
  { id: 2, nombre: 'Mouse Inalámbrico', categoria: 'Electrónica', precio: 35, stock: 50, descripcion: 'Mouse ergonómico' },
  { id: 3, nombre: 'Escritorio', categoria: 'Hogar', precio: 280, stock: 8, descripcion: 'Escritorio de madera' },
])

const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return q
    ? items.value.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q),
      )
    : items.value
})

const EMPTY = { nombre: '', categoria: '', precio: 0, stock: 0, descripcion: '' }
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
