<template>
    <div>
        <p class="m-0">Pruebas 2</p>
    </div>
    <div v-if="apiError" class="alert alert-warning py-2 mt-2" role="alert">
        {{ apiError }}
    </div>
    <div class="card border-0 shadow-sm mt-3">
        <div class="card-header fw-semibold">Filtros</div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-12 col-lg-4">
                    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div class="fw-semibold">Categorias</div>
                        <button
                            v-if="categoryOptions.length"
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            @click="toggleAllCategories"
                        >
                            {{ allCategoriesSelected ? 'Limpiar seleccion' : 'Seleccionar todas' }}
                        </button>
                    </div>
                    <div v-if="categoryOptions.length" class="d-grid gap-2">
                        <div
                            v-for="category in categoryOptions"
                            :key="category"
                            class="form-check"
                        >
                            <input
                                :id="`category-${category}`"
                                class="form-check-input"
                                type="checkbox"
                                :checked="selectedCategories.includes(category)"
                                @change="toggleCategory(category, $event.target.checked)"
                            >
                            <label class="form-check-label" :for="`category-${category}`">
                                {{ category }}
                            </label>
                        </div>
                    </div>
                    <div v-else class="small text-muted">No hay categorias disponibles.</div>
                </div>
                <div class="col-12 col-lg-8">
                    <div class="fw-semibold mb-2">V</div>
                    <div v-if="selectedCategories.length" class="d-grid gap-3">
                        <div v-for="category in selectedCategories" :key="`videos-${category}`" class="border rounded p-2">
                            <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <div class="small fw-semibold text-muted">{{ category }}</div>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-secondary"
                                    @click="toggleAllVideosByCategory(category)"
                                >
                                    {{ areAllVideosSelectedByCategory(category) ? 'Limpiar videos' : 'Seleccionar todos' }}
                                </button>
                            </div>
                            <div class="row g-2">
                                <div
                                    v-for="video in videoOptionsByCategory[category] ?? []"
                                    :key="video.key"
                                    class="col-12 col-md-6"
                                >
                                    <div class="form-check">
                                        <input
                                            :id="`video-${video.key}`"
                                            class="form-check-input"
                                            type="checkbox"
                                            :checked="isVideoSelected(category, video.key)"
                                            @change="toggleVideoSelection(category, video.key, $event.target.checked)"
                                        >
                                        <label class="form-check-label text-truncate d-block" :for="`video-${video.key}`" :title="video.label">
                                            {{ video.label }}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="small text-muted">
                        Selecciona una categoria para habilitar la seleccion.
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="mt-3">
        <div v-for="group in filteredGroups" :key="group.category" class="card border-0 shadow-sm mb-3">
            <div class="card-header fw-semibold">
                {{ group.category }}
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div
                        v-for="v in group.videos"
                        :key="v.key"
                        class="col-12 col-md-6 col-xl-4"
                    >
                        <div class="h-100 border rounded p-2">
                            <video
                                class="w-100 rounded bg-black"
                                :src="v.url"
                                controls
                                preload="metadata"
                                role="button"
                                tabindex="0"
                                @click="openInNewTab(v.url)"
                                @loadedmetadata="handleVideoMetadata"
                                @durationchange="handleVideoMetadata"
                                @timeupdate="handleVideoTimeUpdate"
                                @ended="handleVideoEnded"
                            ></video>
                            <div class="small text-muted mt-2 text-truncate" :title="v.name">{{ v.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!filteredGroups.length" class="small text-muted mt-2">
            No hay nada para mostrar con los filtros actuales.
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { apiGet } from '@/lib/http/token';

const SHORT_VIDEO_MAX_SECONDS = 5;
const DURATION_EPSILON_SECONDS = 0.15;

const apiError = ref('');
const videos = ref([]);
const selectedCategories = ref([]);
const selectedVideosByCategory = ref({});

const normalizedGroups = computed(() => {
    return videos.value
        .filter((group) => group && typeof group === 'object')
        .map((group, groupIndex) => {
            const category = group.category ?? `Categoria ${groupIndex + 1}`;
            const videoList = Array.isArray(group.videos) ? group.videos : [];

            return {
                category,
                videos: videoList.map((video, videoIndex) => {
                    const fallbackName = `Video ${videoIndex + 1}`;
                    const name = video?.name || fallbackName;
                    const baseKey = video?.path || video?.url || name;

                    return {
                        ...(video ?? {}),
                        name,
                        key: `${category}::${baseKey}::${videoIndex}`,
                    };
                }),
            };
        });
});

const categoryOptions = computed(() => normalizedGroups.value.map((group) => group.category));
const videoOptionsByCategory = computed(() => {
    return normalizedGroups.value.reduce((acc, group) => {
        acc[group.category] = group.videos.map((video) => ({
            key: video.key,
            label: video.name,
        }));
        return acc;
    }, {});
});

const allCategoriesSelected = computed(() => {
    return categoryOptions.value.length > 0
        && selectedCategories.value.length === categoryOptions.value.length;
});

const filteredGroups = computed(() => {
    return normalizedGroups.value
        .filter((group) => selectedCategories.value.includes(group.category))
        .map((group) => {
            const selectedVideoKeys = selectedVideosByCategory.value[group.category] ?? [];

            return {
                ...group,
                videos: group.videos.filter((video) => selectedVideoKeys.includes(video.key)),
            };
        })
        .filter((group) => group.videos.length > 0);
});

function toggleCategory(category, checked) {
    if (checked) {
        if (!selectedCategories.value.includes(category)) {
            selectedCategories.value = [...selectedCategories.value, category];
        }
        if (!Array.isArray(selectedVideosByCategory.value[category])) {
            selectedVideosByCategory.value = {
                ...selectedVideosByCategory.value,
                [category]: [],
            };
        }
        return;
    }

    selectedCategories.value = selectedCategories.value.filter((item) => item !== category);

    if (selectedVideosByCategory.value[category]) {
        const next = { ...selectedVideosByCategory.value };
        delete next[category];
        selectedVideosByCategory.value = next;
    }
}

function toggleAllCategories() {
    if (allCategoriesSelected.value) {
        selectedCategories.value = [];
        selectedVideosByCategory.value = {};
        return;
    }

    selectedCategories.value = [...categoryOptions.value];
    selectedVideosByCategory.value = categoryOptions.value.reduce((acc, category) => {
        acc[category] = selectedVideosByCategory.value[category] ?? [];
        return acc;
    }, {});
}

function isVideoSelected(category, videoKey) {
    const selected = selectedVideosByCategory.value[category] ?? [];
    return selected.includes(videoKey);
}

function toggleVideoSelection(category, videoKey, checked) {
    const selected = selectedVideosByCategory.value[category] ?? [];
    if (checked) {
        if (!selected.includes(videoKey)) {
            selectedVideosByCategory.value = {
                ...selectedVideosByCategory.value,
                [category]: [...selected, videoKey],
            };
        }
        return;
    }

    selectedVideosByCategory.value = {
        ...selectedVideosByCategory.value,
        [category]: selected.filter((key) => key !== videoKey),
    };
}

function areAllVideosSelectedByCategory(category) {
    const allKeys = (videoOptionsByCategory.value[category] ?? []).map((video) => video.key);
    if (!allKeys.length) {
        return false;
    }

    const selected = selectedVideosByCategory.value[category] ?? [];
    return allKeys.every((key) => selected.includes(key));
}

function toggleAllVideosByCategory(category) {
    const allKeys = (videoOptionsByCategory.value[category] ?? []).map((video) => video.key);
    if (!allKeys.length) {
        return;
    }

    if (areAllVideosSelectedByCategory(category)) {
        selectedVideosByCategory.value = {
            ...selectedVideosByCategory.value,
            [category]: [],
        };
        return;
    }

    selectedVideosByCategory.value = {
        ...selectedVideosByCategory.value,
        [category]: allKeys,
    };
}

function openInNewTab(url) {
    if (!url) {
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
}

function handleVideoEnded(event) {
    const videoElement = event?.target;

    if (!(videoElement instanceof HTMLVideoElement)) {
        return;
    }

    if (!isShortVideo(videoElement)) {
        return;
    }

    // Forzamos loop por si metadata llego tarde o con variacion.
    videoElement.loop = true;
    restartVideo(videoElement);
}

function handleVideoMetadata(event) {
    const videoElement = event?.target;

    if (!(videoElement instanceof HTMLVideoElement)) {
        return;
    }

    videoElement.loop = isShortVideo(videoElement);
}

function handleVideoTimeUpdate(event) {
    const videoElement = event?.target;

    if (!(videoElement instanceof HTMLVideoElement)) {
        return;
    }

    if (!isShortVideo(videoElement)) {
        return;
    }

    // Algunos navegadores no disparan ended de forma consistente en ciertos codecs.
    if (isNearVideoEnd(videoElement)) {
        restartVideo(videoElement);
    }
}

function getDuration(videoElement) {
    const duration = Number(videoElement.duration);
    return Number.isFinite(duration) && duration > 0 ? duration : NaN;
}

function isShortVideo(videoElement) {
    const duration = getDuration(videoElement);
    return Number.isFinite(duration)
        && duration <= SHORT_VIDEO_MAX_SECONDS + DURATION_EPSILON_SECONDS;
}

function isNearVideoEnd(videoElement) {
    const duration = getDuration(videoElement);
    const current = Number(videoElement.currentTime);
    if (!Number.isFinite(duration) || !Number.isFinite(current)) {
        return false;
    }

    return current >= duration - 0.12;
}

function restartVideo(videoElement) {
    if (videoElement.dataset.restarting === '1') {
        return;
    }

    videoElement.dataset.restarting = '1';
    videoElement.currentTime = 0;

    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.finally === 'function') {
        playPromise
            .catch(() => {})
            .finally(() => {
                videoElement.dataset.restarting = '0';
            });
        return;
    }

    videoElement.dataset.restarting = '0';
}

async function getVideos() {
    apiError.value = '';
    try {
        const data = await apiGet('/v', { loadingMessage: 'Cargando videos...' });
        videos.value = Array.isArray(data) ? data : [];
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(async () => {
    await getVideos();
});

</script>
<style scoped></style>
