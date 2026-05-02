<template>
    <div>
        pruebas
    </div>
    <div v-if="apiError" class="alert alert-warning py-2" role="alert">
        {{ apiError }}
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { apiGet } from '@/lib/http/token';

const apiError = ref('');

async function syncVideos() {
    apiError.value = '';
    try {
        const data = await apiGet('/videos', { loadingMessage: 'Cargando videos...' });
        console.log(data);
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(() => {
    syncVideos();
});

</script>
<style scoped></style>
