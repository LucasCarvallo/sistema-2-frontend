<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-5">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-diagram-3"></i>
                    ESP32 - Access Points Agrupados
                </h1>
            </div>
            <div class="col-lg-7">
                <div class="row g-2">
                    <div class="col-sm-3">
                        <label class="form-label mb-1">Registros</label>
                        <input
                            v-model.number="limit"
                            type="number"
                            min="1"
                            class="form-control"
                            @change="normalizeLimit"
                        />
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label mb-1">MAC (opcional)</label>
                        <input
                            v-model.trim="mac"
                            type="text"
                            class="form-control"
                            placeholder="AA:BB:CC:DD:EE:FF"
                        />
                    </div>
                    <div class="col-sm-3">
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
                    <div class="col-sm-2 d-flex align-items-end gap-2">
                        <button class="btn btn-primary w-100" :disabled="loading" @click="fetchGrouped">
                            {{ loading ? 'Cargando...' : 'Aplicar' }}
                        </button>
                    </div>
                    <div class="col-sm-12 d-flex justify-content-end">
                        <RouterLink class="btn btn-outline-secondary btn-sm" to="/tools/esp32">
                            <i class="bi bi-arrow-left me-1"></i>
                            Volver a crudo
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="apiError" class="alert alert-warning alert-dismissible fade show" role="alert">
            {{ apiError }}
            <button type="button" class="btn-close" @click="apiError = ''"></button>
        </div>

        <div class="card">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span><i class="bi bi-wifi me-2"></i>Resumen por BSSID</span>
                <small class="opacity-75">{{ filteredItems.length }} redes</small>
            </div>
            <div class="card-body border-bottom">
                <div class="row g-2">
                    <div class="col-md-8">
                        <input
                            v-model.trim="search"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Filtrar por SSID o BSSID"
                        />
                    </div>
                    <div class="col-md-4">
                        <select v-model="sortMode" class="form-select form-select-sm">
                            <option value="best_desc">Mejor senal</option>
                            <option value="best_asc">Peor senal</option>
                            <option value="samples_desc">Mas muestras</option>
                            <option value="last_desc">Mas reciente</option>
                        </select>
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

                <div v-else class="table-responsive grouped-table-wrapper">
                    <table class="table table-sm table-bordered align-middle mb-0 table-hover">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th>BSSID</th>
                                <th>SSID</th>
                                <th>Muestras</th>
                                <th>Mejor RSSI</th>
                                <th>Promedio RSSI</th>
                                <th>Canal</th>
                                <th>Ult. sesion</th>
                                <th>Ult. visto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredItems" :key="item.bssid">
                                <td class="font-monospace small">{{ item.bssid }}</td>
                                <td>{{ item.ssid || '(Red oculta)' }}</td>
                                <td class="text-center">{{ item.samples }}</td>
                                <td>
                                    <span class="badge" :class="signalBadgeClass(item.best_rssi)">
                                        {{ item.best_rssi }} dBm
                                    </span>
                                </td>
                                <td>{{ item.avg_rssi }} dBm</td>
                                <td class="text-center">{{ item.channel ?? '-' }}</td>
                                <td class="text-center">{{ item.last_scan_session_id ?? '-' }}</td>
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
import { computed, onMounted, ref } from 'vue';
import { apiGet } from '@/lib/http/token';
import { RouterLink } from 'vue-router';

const loading = ref(false);
const apiError = ref('');
const items = ref([]);

const limit = ref(200);
const mac = ref('');
const recentSeconds = ref(60);

const search = ref('');
const sortMode = ref('best_desc');

function normalizeLimit() {
    if (!Number.isFinite(limit.value) || limit.value < 1) {
        limit.value = 1;
    }
    limit.value = Math.floor(limit.value);
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

function buildPath() {
    normalizeLimit();
    normalizeRecentSeconds();

    const params = new URLSearchParams();
    params.set('limit', String(limit.value));

    if (mac.value.trim()) {
        params.set('mac', mac.value.trim());
    }
    if (recentSeconds.value > 0) {
        params.set('recent_seconds', String(recentSeconds.value));
    }

    return `/access-point-detections-grouped?${params.toString()}`;
}

async function fetchGrouped() {
    loading.value = true;
    apiError.value = '';
    try {
        const data = await apiGet(buildPath(), { loading: false });
        items.value = Array.isArray(data?.items) ? data.items : [];
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar el resumen agrupado.';
        items.value = [];
    } finally {
        loading.value = false;
    }
}

const filteredItems = computed(() => {
    const q = search.value.toLowerCase();
    let list = items.value.filter((item) => {
        const ssid = String(item?.ssid ?? '').toLowerCase();
        const bssid = String(item?.bssid ?? '').toLowerCase();
        return !q || ssid.includes(q) || bssid.includes(q);
    });

    list = [...list].sort((a, b) => {
        if (sortMode.value === 'best_desc') return Number(b.best_rssi ?? -999) - Number(a.best_rssi ?? -999);
        if (sortMode.value === 'best_asc') return Number(a.best_rssi ?? -999) - Number(b.best_rssi ?? -999);
        if (sortMode.value === 'samples_desc') return Number(b.samples ?? 0) - Number(a.samples ?? 0);
        return new Date(b.last_detected_at ?? 0).getTime() - new Date(a.last_detected_at ?? 0).getTime();
    });

    return list;
});

function signalBadgeClass(rssi) {
    if (rssi >= -55) return 'bg-success';
    if (rssi >= -70) return 'bg-warning text-dark';
    return 'bg-danger';
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

onMounted(fetchGrouped);
</script>

<style scoped>
.grouped-table-wrapper {
    max-height: 640px;
    overflow-y: auto;
}

.font-monospace {
    font-family: 'Courier New', monospace;
}
</style>
