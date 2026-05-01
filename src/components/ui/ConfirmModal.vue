<template>
  <AppModal
    ref="modal"
    :title="title"
    icon="bi-exclamation-triangle"
    static-backdrop
    @hidden="$emit('hidden')"
  >
    <p class="mb-0">{{ message }}</p>

    <template #footer>
      <button class="btn btn-secondary" type="button" :disabled="props.loading" @click="modal.hide()">Cancelar</button>
      <button class="btn btn-danger" type="button" :disabled="props.loading" @click="handleConfirm">
        <span
          v-if="props.loading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
          aria-hidden="true"
        ></span>
        <i v-else class="bi bi-trash me-1"></i>{{ props.loading ? 'Eliminando…' : 'Eliminar' }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref } from 'vue'
import AppModal from './AppModal.vue'

const props = defineProps({
  title: { type: String, default: 'Confirmar eliminación' },
  message: { type: String, default: '¿Estás seguro de que querés eliminar este elemento?' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'hidden'])
const modal = ref(null)

function handleConfirm() {
  if (props.loading) return
  emit('confirm')
  modal.value.hide()
}

const show = () => modal.value?.show()
const hide = () => modal.value?.hide()

defineExpose({ show, hide })
</script>
