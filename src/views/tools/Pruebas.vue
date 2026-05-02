<template>
    <div>
        <p class="m-0">Pruebas</p>
    </div>
    <div v-if="apiError" class="alert alert-warning py-2 mt-2" role="alert">
        {{ apiError }}
    </div>

    <!-- Sin preview de video (este sirve) -->
    <!-- <div class="mt-3">
        <div v-for="video in videos" :key="video.id">
            <div class="my-3 p-3 border rounded">
                <span>{{ video.category }}</span>
                <div v-for="v in video.videos" :key="v.id" class="ms-3 my-2">
                    <a :href="v.url" target="_blank" rel="noopener noreferrer">{{ v.name }}</a>
                </div>
            </div>
        </div>
    </div> -->

    <!-- Con preview de video (este esta mas piola) -->
    <!-- <div class="mt-3">
        <div v-for="group in videos" :key="group.category" class="card border-0 shadow-sm mb-3">
            <div class="card-header fw-semibold">
                {{ group.category }}
            </div>

            <div class="card-body">
                <div class="row g-3">
                    <div
                        v-for="v in group.videos"
                        :key="v.path"
                        class="col-12 col-md-6 col-xl-4"
                    >
                        <div class="h-100 border rounded p-2">
                            <video
                                class="w-100 rounded bg-black"
                                :src="v.url"
                                controls
                                preload="metadata"
                            ></video>
                            <div class="small text-muted mt-2 text-truncate" :title="v.name">{{ v.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> -->

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
