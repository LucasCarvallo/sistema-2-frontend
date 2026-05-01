<template>
  <div class="modal fade" ref="modalEl" tabindex="-1" aria-hidden="true">
    <div :class="['modal-dialog', sizeClass, { 'modal-dialog-scrollable': scrollable }]">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i v-if="icon" :class="['bi', icon, 'me-2 text-primary']"></i>{{ title }}
          </h5>
          <button type="button" class="btn-close" @click="hide" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'

const props = defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  /** 'sm' | 'lg' | 'xl' */
  size: { type: String, default: '' },
  scrollable: { type: Boolean, default: false },
  /** Impide cerrar al hacer clic fuera */
  staticBackdrop: { type: Boolean, default: false },
})

const emit = defineEmits(['shown', 'hidden'])

const modalEl = ref(null)
let bsModal = null

const sizeClass = computed(() => (props.size ? `modal-${props.size}` : ''))

onMounted(() => {
  bsModal = new Modal(modalEl.value, {
    backdrop: props.staticBackdrop ? 'static' : true,
  })
  modalEl.value.addEventListener('shown.bs.modal', () => emit('shown'))
  modalEl.value.addEventListener('hidden.bs.modal', () => emit('hidden'))
})

onUnmounted(() => bsModal?.dispose())

const show = () => bsModal?.show()
const hide = () => bsModal?.hide()

defineExpose({ show, hide })
</script>
