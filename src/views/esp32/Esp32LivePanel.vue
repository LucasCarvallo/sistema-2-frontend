<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-4">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-activity"></i>
                    ESP32 - Panel AP Activos
                </h1>
            </div>
            <div class="col-lg-5">
                <div class="row g-2">
                    <div class="col-sm-4">
                        <label class="form-label mb-1">Actualizar cada (s)</label>
                        <input
                            v-model.number="refreshIntervalSec"
                            type="number"
                            min="1"
                            class="form-control"
                            @change="normalizeRefreshInterval"
                        />
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label mb-1">Ultimos segundos</label>
                        <input
                            v-model.number="recentSeconds"
                            type="number"
                            min="0"
                            max="3600"
                            class="form-control"
                            @change="normalizeRecentSeconds"
                        />
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label mb-1">Registros</label>
                        <input
                            v-model.number="limit"
                            type="number"
                            min="1"
                            class="form-control"
                            @change="normalizeLimit"
                        />
                    </div>
                </div>
            </div>
            <div class="col-lg-3 d-flex gap-2 justify-content-lg-end">
                <button
                    class="btn btn-outline-secondary"
                    @click="toggleAutoRefresh"
                    :title="autoRefreshEnabled ? 'Pausar auto-actualización' : 'Activar auto-actualización'"
                >
                    <i :class="autoRefreshEnabled ? 'bi bi-pause-fill me-1' : 'bi bi-play-fill me-1'"></i>
                    {{ autoRefreshEnabled ? 'Pausar' : 'Reanudar' }}
                </button>
                <button class="btn btn-primary" :disabled="loading" @click="fetchPanel">
                    <i v-if="!loading" class="bi bi-arrow-clockwise me-1"></i>
                    <span v-else class="spinner-border spinner-border-sm me-1"></span>
                    {{ loading ? 'Cargando...' : 'Actualizar' }}
                </button>
                <RouterLink class="btn btn-outline-secondary" to="/tools/esp32">
                    <i class="bi bi-arrow-left me-1"></i>
                    Hub
                </RouterLink>
            </div>
        </div>

        <div v-if="apiError" class="alert alert-warning alert-dismissible fade show" role="alert">
            {{ apiError }}
            <button type="button" class="btn-close" @click="apiError = ''"></button>
        </div>

        <div class="card">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span><i class="bi bi-wifi me-2"></i>APs ordenados por mejor señal</span>
                <small class="opacity-75">{{ filteredItems.length }} resultados</small>
            </div>
            <div class="card-body border-bottom">
                <div class="row g-2 align-items-center">
                    <div class="col-md-8">
                        <input
                            v-model.trim="search"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Filtrar por SSID o BSSID"
                        />
                    </div>
                    <div class="col-md-4 text-md-end small text-muted">
                        Clientes vistos en la misma ventana temporal.
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                <div v-else-if="filteredItems.length === 0" class="p-4 text-center text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    Sin resultados
                </div>

                <div v-else class="table-responsive panel-table-wrapper">
                    <table class="table table-sm table-bordered align-middle mb-0 table-hover">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th>Estado</th>
                                <th>SSID</th>
                                <th>BSSID</th>
                                <th>Mejor RSSI</th>
                                <th>Promedio RSSI</th>
                                <th>Canal</th>
                                <th>Muestras</th>
                                <th>Clientes activos</th>
                                <th>Ultimo visto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredItems" :key="item.bssid">
                                <td class="text-center">
                                    <span class="led-dot" :class="signalLedClass(item.best_rssi)" :title="signalLabel(item.best_rssi)"></span>
                                </td>
                                <td class="fw-medium">{{ item.ssid || '(Red oculta)' }}</td>
                                <td class="font-monospace small">{{ item.bssid }}</td>
                                <td>
                                    <span class="badge" :class="signalBadgeClass(item.best_rssi)">
                                        {{ item.best_rssi }} dBm
                                    </span>
                                </td>
                                <td>{{ item.avg_rssi }} dBm</td>
                                <td class="text-center">{{ item.channel ?? '-' }}</td>
                                <td class="text-center">{{ item.samples }}</td>
                                <td class="text-center">
                                    <button
                                        class="btn btn-sm btn-outline-primary"
                                        :title="`Ver clientes asociados a ${item.bssid}`"
                                        @click="openClientsViewByBssid(item.bssid)"
                                    >
                                        {{ clientsCountForBssid(item.bssid) }}
                                    </button>
                                </td>
                                <td class="text-muted small">{{ formatDateTime(item.last_detected_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { apiGet } from '@/lib/http/token';

const router = useRouter();

const loading = ref(false);
const apiError = ref('');
const items = ref([]);
const clientCountsByBssid = ref({});

const refreshIntervalSec = ref(10);
const recentSeconds = ref(60);
const limit = ref(200);
const autoRefreshEnabled = ref(true);
let refreshTimer = null;

const search = ref('');

function normalizeRefreshInterval() {
    if (!Number.isFinite(refreshIntervalSec.value) || refreshIntervalSec.value < 1) {
        refreshIntervalSec.value = 1;
    }
    refreshIntervalSec.value = Math.floor(refreshIntervalSec.value);
}

function normalizeRecentSeconds() {
    if (!Number.isFinite(recentSeconds.value) || recentSeconds.value < 0) {
        recentSeconds.value = 0;
    }
    if (recentSeconds.value > 3600) {
        recentSeconds.value = 3600;
    }
    recentSeconds.value = Math.floor(recentSeconds.value);
}

function normalizeLimit() {
    if (!Number.isFinite(limit.value) || limit.value < 1) {
        limit.value = 1;
    }
    limit.value = Math.floor(limit.value);
}

function buildApPath() {
    normalizeLimit();
    normalizeRecentSeconds();

    const params = new URLSearchParams();
    params.set('limit', String(limit.value));
    if (recentSeconds.value > 0) {
        params.set('recent_seconds', String(recentSeconds.value));
    }

    return `/access-point-detections-grouped?${params.toString()}`;
}

function buildClientCountsPath() {
    normalizeRecentSeconds();

    const params = new URLSearchParams();
    if (recentSeconds.value > 0) {
        params.set('recent_seconds', String(recentSeconds.value));
    }

    return `/wifi-client-counts-by-bssid${params.toString() ? `?${params.toString()}` : ''}`;
}

async function fetchPanel() {
    loading.value = true;
    apiError.value = '';

    try {
        const [apData, clientsData] = await Promise.all([
            apiGet(buildApPath(), { loading: false }),
            apiGet(buildClientCountsPath(), { loading: false }),
        ]);

        items.value = Array.isArray(apData?.items) ? apData.items : [];

        const rows = Array.isArray(clientsData?.items) ? clientsData.items : [];
        const nextMap = {};
        rows.forEach((row) => {
            const key = String(row?.bssid ?? '').toLowerCase();
            if (!key) return;
            nextMap[key] = Number(row?.clients_count ?? 0);
        });
        clientCountsByBssid.value = nextMap;
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar el panel de AP activos.';
        items.value = [];
        clientCountsByBssid.value = {};
    } finally {
        loading.value = false;
    }
}

function clientsCountForBssid(bssid) {
    const key = String(bssid ?? '').toLowerCase();
    if (!key) return 0;
    return Number(clientCountsByBssid.value[key] ?? 0);
}

function openClientsViewByBssid(bssid) {
    const normalized = String(bssid ?? '').trim();
    if (!normalized) return;

    const resolved = router.resolve({
        // path: '/tools/esp32-clients-raw',
        path: '/tools/esp32-clients',
        query: {
            associated_bssid: normalized,
        },
    });

    window.open(resolved.href, '_blank', 'noopener');
}

const filteredItems = computed(() => {
    const q = search.value.toLowerCase();
    return items.value.filter((item) => {
        const ssid = String(item?.ssid ?? '').toLowerCase();
        const bssid = String(item?.bssid ?? '').toLowerCase();
        return !q || ssid.includes(q) || bssid.includes(q);
    });
});

function signalBadgeClass(rssi) {
    if (rssi >= -55) return 'bg-success';
    if (rssi >= -70) return 'bg-warning text-dark';
    return 'bg-danger';
}

function signalLedClass(rssi) {
    if (rssi >= -55) return 'led-green';
    if (rssi >= -70) return 'led-yellow';
    return 'led-red';
}

function signalLabel(rssi) {
    if (rssi >= -55) return 'Señal fuerte (cerca)';
    if (rssi >= -70) return 'Señal media';
    return 'Señal débil (lejos)';
}

function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function startAutoRefresh() {
    stopAutoRefresh();
    if (!autoRefreshEnabled.value) return;

    refreshTimer = setInterval(() => {
        fetchPanel();
    }, refreshIntervalSec.value * 1000);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

function toggleAutoRefresh() {
    autoRefreshEnabled.value = !autoRefreshEnabled.value;
}

watch(refreshIntervalSec, () => {
    normalizeRefreshInterval();
    startAutoRefresh();
});

watch(autoRefreshEnabled, () => {
    startAutoRefresh();
});

onMounted(async () => {
    normalizeRefreshInterval();
    normalizeRecentSeconds();
    normalizeLimit();
    await fetchPanel();
    startAutoRefresh();
});

onUnmounted(() => {
    stopAutoRefresh();
});
</script>

<style scoped>
.panel-table-wrapper {
    max-height: 680px;
    overflow-y: auto;
}

.font-monospace {
    font-family: 'Courier New', monospace;
}

.led-dot {
    width: 0.9rem;
    height: 0.9rem;
    display: inline-block;
    border-radius: 50%;
    box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.35);
}

.led-green {
    background: #1cc05b;
}

.led-yellow {
    background: #f6c942;
}

.led-red {
    background: #e34d4d;
}
</style>
