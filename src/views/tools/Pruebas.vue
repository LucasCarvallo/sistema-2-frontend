<template>
    <div>
        <p class="m-0">Pruebas</p>
    </div>
    <div>
        <div v-for="video in videos" :key="video.id">
            <div class="my-3 p-3 border rounded">
                <span>{{ video.category }}</span>
                <div v-for="v in video.videos" :key="v.id" class="ms-3 my-2">
                    <a :href="v.url" target="_blank" rel="noopener noreferrer">{{ v.name }}</a>
                </div>
            </div>
        </div>
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
        // console.log('payload API:', data);
        videos.value = Array.isArray(data) ? data : [];
        console.log('videos asignados:', videos.value);

        // // El backend devuelve un arreglo de categorías [{ category, videos: [...] }, ...]
        // videos.value = Array.isArray(data)
        //     ? data.flatMap((group) => Array.isArray(group?.videos) ? group.videos : [])
        //     : [];
        // console.log('videos normalizados:', videos.value);
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(async () => {
    await getVideos();
    // console.log('onMounted luego de await:', videos.value);
});

</script>
<style scoped></style>
