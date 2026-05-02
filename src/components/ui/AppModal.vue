<template>
    <Teleport to="body">
        <Transition name="app-modal-fade">
            <div
                v-if="isOpen"
                class="modal d-block"
                ref="modalRoot"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                @click="handleBackdropClick"
            >
                <div
                    :class="[
                        'modal-dialog',
                        'modal-dialog-centered',
                        sizeClass,
                        { 'modal-dialog-scrollable': scrollable },
                    ]"
                    @click.stop
                >
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i v-if="icon" :class="['bi', icon, 'me-2 text-primary']"></i>{{ title }}
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                @click="hide"
                                aria-label="Cerrar"
                            ></button>
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
        </Transition>

        <Transition name="app-modal-backdrop">
            <div v-if="isOpen" class="modal-backdrop show"></div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref } from 'vue';

const props = defineProps({
    title: { type: String, default: '' },
    icon: { type: String, default: '' },
    /** 'sm' | 'lg' | 'xl' */
    size: { type: String, default: '' },
    scrollable: { type: Boolean, default: false },
    /** Impide cerrar al hacer clic fuera */
    staticBackdrop: { type: Boolean, default: false },
});

const emit = defineEmits(['shown', 'hidden']);

const isOpen = ref(false);
const modalRoot = ref(null);
const sizeClass = computed(() => (props.size ? `modal-${props.size}` : ''));

function focusFirstField() {
    const container = modalRoot.value;
    if (!container) return;

    const fieldSelector =
        'input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly])';

    const formField = container.querySelector(`form ${fieldSelector}`);
    const fallbackField = container.querySelector(fieldSelector);
    const target = formField || fallbackField;

    target?.focus({ preventScroll: true });
}

function syncBodyLock(locked) {
    document.body.classList.toggle('modal-open', locked);
    // document.body.style.overflow = locked ? 'hidden' : '';
}

async function show() {
    if (isOpen.value) return;
    isOpen.value = true;
    syncBodyLock(true);
    await nextTick();
    focusFirstField();
    emit('shown');
}

function hide() {
    if (!isOpen.value) return;
    isOpen.value = false;
    syncBodyLock(false);
    emit('hidden');
}

function handleBackdropClick() {
    if (props.staticBackdrop) return;
    hide();
}

function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen.value && !props.staticBackdrop) {
        hide();
    }
}

window.addEventListener('keydown', handleKeydown);

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    syncBodyLock(false);
});

defineExpose({ show, hide });
</script>

<style scoped>
.app-modal-fade-enter-active,
.app-modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.app-modal-fade-enter-from,
.app-modal-fade-leave-to {
    opacity: 0;
}

.app-modal-fade-enter-active .modal-dialog,
.app-modal-fade-leave-active .modal-dialog {
    transition:
        transform 0.25s ease,
        opacity 0.25s ease;
}

.app-modal-fade-enter-from .modal-dialog,
.app-modal-fade-leave-to .modal-dialog {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
}

.app-modal-backdrop-enter-active,
.app-modal-backdrop-leave-active {
    transition: opacity 0.2s ease;
}

.app-modal-backdrop-enter-from,
.app-modal-backdrop-leave-to {
    opacity: 0;
}

.modal-content {
    border: 0;
    border-radius: 0.75rem;
    box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.2);
}
</style>
