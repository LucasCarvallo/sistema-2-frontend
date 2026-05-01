<template>
    <div class="d-flex flex-column align-items-center justify-content-center text-center py-5 px-3">
        <i class="bi bi-exclamation-circle text-secondary" style="font-size: 5rem"></i>
        <h1 class="display-6 fw-bold mt-4">{{ code }}</h1>
        <p class="text-muted mb-4">{{ resolvedMessage }}</p>
        <RouterLink to="/" class="btn btn-primary">
            <i class="bi bi-house me-2"></i>Volver al inicio
        </RouterLink>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    code: { type: [Number, String], required: true },
    message: { type: String, default: '' },
});

const defaultMessages = {
    400: 'La solicitud no pudo procesarse.',
    401: 'No tenés autorización para acceder.',
    403: 'No tenés permisos para ver esta página.',
    404: 'La página que buscás no existe o fue movida.',
    500: 'Ocurrió un error interno inesperado.',
};

const resolvedMessage = computed(() => {
    if (props.message) return props.message;
    return defaultMessages[Number(props.code)] || 'Ocurrió un error al cargar la página.';
});
</script>