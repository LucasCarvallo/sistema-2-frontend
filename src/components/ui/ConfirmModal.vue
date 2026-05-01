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
      <button class="btn btn-secondary" type="button" @click="modal.hide()">Cancelar</button>
      <button class="btn btn-danger" type="button" @click="handleConfirm">
        <i class="bi bi-trash me-1"></i>Eliminar
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref } from 'vue'
import AppModal from './AppModal.vue'

defineProps({
  title: { type: String, default: 'Confirmar eliminación' },
  message: { type: String, default: '¿Estás seguro de que querés eliminar este elemento?' },
})

const emit = defineEmits(['confirm', 'hidden'])
const modal = ref(null)

function handleConfirm() {
  emit('confirm')
  modal.value.hide()
}

const show = () => modal.value?.show()
const hide = () => modal.value?.hide()

defineExpose({ show, hide })
</script>
