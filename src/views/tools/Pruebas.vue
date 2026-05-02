<template>
    <div>
        <p>Pruebas</p>
    </div> 
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { apiGet } from '@/lib/http/token';

const apiError = ref('');
const videos = ref([]);

async function getVideos() {
    apiError.value = '';
    try {
        const data = await apiGet('/videos', { loadingMessage: 'Cargando videos...' });
        console.log('payload API:', data);

        // El backend devuelve un arreglo de categorías [{ category, videos: [...] }, ...]
        videos.value = Array.isArray(data)
            ? data.flatMap((group) => Array.isArray(group?.videos) ? group.videos : [])
            : [];

        console.log('videos normalizados:', videos.value);
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(async () => {
    await getVideos();
    console.log('onMounted luego de await:', videos.value);
});

</script>
<style scoped></style>
