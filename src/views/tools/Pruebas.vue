<template>
    <div>
        <div class="d-flex align-items-center justify-content-between mb-4 gap-2 flex-wrap">
            <h4 class="mb-0"><i class="bi bi-collection-play me-2 text-primary"></i>Pruebas de Videos</h4>

            <button class="btn btn-outline-primary btn-sm" type="button" @click="syncVideos">
                <i class="bi bi-arrow-clockwise me-1"></i>Recargar
            </button>
        </div>

        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-12 col-lg-6">
                        <label class="form-label small text-muted mb-1">Buscar por nombre o ruta</label>
                        <input
                            v-model.trim="search"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Ej: creampie, revisar, orgasm..."
                        />
                    </div>
                    <div class="col-12 col-lg-3">
                        <label class="form-label small text-muted mb-1">Categoría</label>
                        <select v-model="selectedCategory" class="form-select form-select-sm">
                            <option value="all">Todas</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <div class="col-12 col-lg-3">
                        <label class="form-label small text-muted mb-1">Resumen</label>
                        <div class="small py-2 px-3 rounded summary-chip">
                            {{ totalCategories }} categorías / {{ totalVisibleVideos }} videos
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="apiError" class="alert alert-warning py-2" role="alert">
            {{ apiError }}
        </div>

        <div v-if="!apiError && !groupedVideos.length" class="card border-0 shadow-sm">
            <div class="card-body text-muted">No hay categorías disponibles.</div>
        </div>

        <div v-for="group in filteredGroups" :key="group.category" class="card border-0 shadow-sm mb-3">
            <div class="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <div class="fw-semibold">
                    <i class="bi bi-folder2-open me-2"></i>{{ group.category }}
                </div>
                <span class="badge text-bg-secondary">{{ group.videos.length }} videos</span>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="app-table-head">
                            <tr>
                                <th>Nombre</th>
                                <th>Ruta</th>
                                <th class="text-end">Tamaño</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="video in group.videos" :key="video.path">
                                <td class="text-truncate" style="max-width: 320px">{{ video.name }}</td>
                                <td class="text-muted small text-truncate" style="max-width: 420px">{{ video.path }}</td>
                                <td class="text-end small">{{ formatBytes(video.size) }}</td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" type="button" @click="setPreview(video)">
                                            <i class="bi bi-play-circle me-1"></i>Ver
                                        </button>
                                        <a
                                            class="btn btn-outline-secondary"
                                            :href="video.url"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i class="bi bi-box-arrow-up-right me-1"></i>Abrir
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="currentVideo" class="card border-0 shadow-sm mt-4">
            <div class="card-header fw-semibold">
                <i class="bi bi-camera-reels me-2"></i>Vista previa
            </div>
            <div class="card-body">
                <div class="small text-muted mb-2 text-truncate">{{ currentVideo.name }}</div>
                <video class="w-100 rounded" controls preload="metadata" :src="currentVideo.url"></video>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { apiGet } from '@/lib/http/token';

const apiError = ref('');
const groupedVideos = ref([]);
const currentVideo = ref(null);
const search = ref('');
const selectedCategory = ref('all');

const categories = computed(() => groupedVideos.value.map((group) => group.category));
const totalCategories = computed(() => groupedVideos.value.length);

const filteredGroups = computed(() => {
    const query = search.value.toLowerCase();

    return groupedVideos.value
        .filter((group) => selectedCategory.value === 'all' || group.category === selectedCategory.value)
        .map((group) => {
            if (!query) {
                return group;
            }

            const videos = group.videos.filter((video) => {
                const name = String(video.name ?? '').toLowerCase();
                const path = String(video.path ?? '').toLowerCase();
                return name.includes(query) || path.includes(query);
            });

            return {
                ...group,
                videos,
            };
        })
        .filter((group) => group.videos.length > 0);
});

const totalVisibleVideos = computed(() =>
    filteredGroups.value.reduce((total, group) => total + group.videos.length, 0),
);

function normalizeGroups(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((group) => ({
            category: String(group?.category ?? 'sin-categoria'),
            videos: Array.isArray(group?.videos)
                ? group.videos.map((video) => ({
                    name: String(video?.name ?? 'Sin nombre'),
                    path: String(video?.path ?? ''),
                    size: Number(video?.size ?? 0),
                    url: String(video?.url ?? ''),
                }))
                : [],
        }))
        .filter((group) => group.category && group.videos.length > 0);
}

function setPreview(video) {
    currentVideo.value = video;
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

async function syncVideos() {
    apiError.value = '';

    try {
        const data = await apiGet('/videos', { loadingMessage: 'Cargando videos...' });
        const normalized = normalizeGroups(data);
        groupedVideos.value = normalized;

        if (!normalized.length) {
            currentVideo.value = null;
            return;
        }

        if (!currentVideo.value) {
            const firstVideo = normalized[0]?.videos?.[0] ?? null;
            currentVideo.value = firstVideo;
        }
    } catch (error) {
        groupedVideos.value = [];
        currentVideo.value = null;
        apiError.value = error?.message ?? 'No se pudo sincronizar con API.';
    }
}

onMounted(() => {
    syncVideos();
});
</script>

<style scoped>
.summary-chip {
    background: var(--app-table-row-hover, rgba(120, 130, 150, 0.12));
    border: 1px solid var(--app-surface-border, rgba(120, 130, 150, 0.2));
}
</style>
