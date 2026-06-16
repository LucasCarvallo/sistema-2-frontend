<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-5">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-wifi"></i>
                    ESP32 - Access Points Detectados
                </h1>
            </div>
            <div class="col-lg-7">
                <div class="row g-2">
                    <div class="col-sm-3">
                        <label class="form-label mb-1">Sesion (opcional)</label>
                        <input
                            v-model.number="sessionId"
                            type="number"
                            min="0"
                            class="form-control"
                            @change="normalizeSessionId"
                        />
                    </div>
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
                    <div class="col-sm-3 d-flex align-items-end gap-2">
                        <button class="btn btn-primary w-100" :disabled="loading" @click="fetchDetections">
                            {{ loading ? 'Cargando...' : 'Aplicar' }}
                        </button>
                    </div>
                    <div class="col-sm-12 d-flex justify-content-end gap-2">
                        <RouterLink class="btn btn-outline-dark btn-sm" to="/tools/esp32-grouped" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-diagram-3 me-1"></i>
                            Ver AP agrupado
                        </RouterLink>
                        <RouterLink class="btn btn-outline-secondary btn-sm" to="/tools/esp32">
                            <i class="bi bi-arrow-left me-1"></i>
                            Volver al hub
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
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <span><i class="bi bi-router me-2"></i>Detecciones AP</span>
                <small class="opacity-75">{{ filteredDetections.length }} resultados</small>
            </div>

            <div class="card-body border-bottom">
                <div class="row g-2">
                    <div class="col-md-6">
                        <input
                            v-model.trim="apFilter"
                            class="form-control form-control-sm"
                            type="text"
                            placeholder="Filtrar por SSID o BSSID"
                        />
                    </div>
                    <div class="col-md-3">
                        <select v-model="hiddenFilter" class="form-select form-select-sm">
                            <option value="all">Todas</option>
                            <option value="visible">Visibles</option>
                            <option value="hidden">Ocultas</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select v-model="apSort" class="form-select form-select-sm">
                            <option value="signal_desc">Mejor señal</option>
                            <option value="signal_asc">Peor señal</option>
                            <option value="ssid_asc">SSID A-Z</option>
                            <option value="ssid_desc">SSID Z-A</option>
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

                <div v-else-if="filteredDetections.length === 0" class="p-4 text-center text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    Sin resultados
                </div>

                <div v-else class="table-responsive aps-table-wrapper">
                    <table class="table table-sm table-bordered align-middle mb-0 table-hover">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th>Estado</th>
                                <th>SSID</th>
                                <th>BSSID</th>
                                <th>RSSI</th>
                                <th>Canal</th>
                                <th>Clientes</th>
                                <th>Oculta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="detection in filteredDetections" :key="detection.id">
                                <td class="text-center">
                                    <span class="led-dot" :class="signalLedClass(detection.rssi)" :title="signalLabel(detection.rssi)"></span>
                                </td>
                                <td class="fw-medium">{{ detection.access_point.ssid || '(Red oculta)' }}</td>
                                <td class="font-monospace small">{{ detection.access_point.bssid }}</td>
                                <td>
                                    <span class="badge" :class="signalBadgeClass(detection.rssi)">
                                        {{ detection.rssi }} dBm
                                    </span>
                                </td>
                                <td class="text-center">{{ detection.channel }}</td>
                                <td class="text-center">
                                    <button
                                        class="btn btn-sm btn-outline-primary"
                                        :title="`Ver clientes asociados a ${detection.access_point.bssid}`"
                                        @click="openClientsViewByBssid(detection.access_point.bssid)"
                                    >
                                        {{ clientsCountForBssid(detection.access_point.bssid) }}
                                    </button>
                                </td>
                                <td class="text-center">
                                    <i
                                        :class="[
                                            'bi',
                                            detection.access_point.hidden
                                                ? 'bi-eye-slash text-warning'
                                                : 'bi-eye text-success',
                                        ]"
                                    ></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { apiGet } from '@/lib/http/token';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const apiError = ref('');
const detections = ref([]);
const clientCountsByBssid = ref({});

const sessionId = ref(0);
const limit = ref(300);
const recentSeconds = ref(0);

const apFilter = ref('');
const hiddenFilter = ref('all');
const apSort = ref('signal_desc');

const CLIENT_COUNTS_LOOKBACK_SECONDS = 3600;

function normalizeSessionId() {
    if (!Number.isFinite(sessionId.value) || sessionId.value < 0) {
        sessionId.value = 0;
    }
    sessionId.value = Math.floor(sessionId.value);
}

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

async function refreshClientCounts() {
    try {
        const data = await apiGet(`/wifi-client-counts-by-bssid?recent_seconds=${CLIENT_COUNTS_LOOKBACK_SECONDS}`, {
            loading: false,
        });

        const rows = Array.isArray(data?.items) ? data.items : [];
        const nextMap = {};

        rows.forEach((row) => {
            const key = String(row?.bssid ?? '').toLowerCase();
            if (!key) return;
            nextMap[key] = Number(row?.clients_count ?? 0);
        });

        clientCountsByBssid.value = nextMap;
    } catch {
        clientCountsByBssid.value = {};
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
        path: '/tools/esp32-clients-raw',
        query: {
            associated_bssid: normalized,
        },
    });

    window.open(resolved.href, '_blank', 'noopener');
}

async function fetchDetections() {
    loading.value = true;
    apiError.value = '';

    try {
        const [data] = await Promise.all([
            sessionId.value > 0
                ? apiGet(`/scan-sessions/${sessionId.value}`, { loading: false })
                : apiGet(`/access-point-detections-grouped?limit=${limit.value}${recentSeconds.value > 0 ? `&recent_seconds=${recentSeconds.value}` : ''}`, {
                      loading: false,
                  }),
            refreshClientCounts(),
        ]);

        if (sessionId.value > 0) {
            const details = data ?? { detections: [] };
            detections.value = Array.isArray(details?.detections) ? details.detections : [];
        } else {
            const rows = Array.isArray(data?.items) ? data.items : [];
            detections.value = rows.map((item) => ({
                id: `grouped-${item.bssid}-${item.last_scan_session_id ?? 'x'}`,
                rssi: Number(item.best_rssi ?? item.avg_rssi ?? -100),
                channel: Number(item.channel ?? 0),
                detected_at: item.last_detected_at ?? null,
                access_point: {
                    bssid: item.bssid,
                    ssid: item.ssid,
                    hidden: Boolean(item.hidden),
                },
            }));
        }
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar detecciones de access points.';
        detections.value = [];
    } finally {
        loading.value = false;
    }
}

const filteredDetections = computed(() => {
    const q = apFilter.value.toLowerCase();

    let list = detections.value.filter((d) => {
        const ssid = String(d.access_point?.ssid ?? '').toLowerCase();
        const bssid = String(d.access_point?.bssid ?? '').toLowerCase();
        const hidden = Boolean(d.access_point?.hidden);

        const byText = !q || ssid.includes(q) || bssid.includes(q);
        const byHidden =
            hiddenFilter.value === 'all' ||
            (hiddenFilter.value === 'hidden' && hidden) ||
            (hiddenFilter.value === 'visible' && !hidden);

        return byText && byHidden;
    });

    list = [...list].sort((a, b) => {
        if (apSort.value === 'signal_desc') return Number(b.rssi ?? -999) - Number(a.rssi ?? -999);
        if (apSort.value === 'signal_asc') return Number(a.rssi ?? -999) - Number(b.rssi ?? -999);
        if (apSort.value === 'ssid_desc') {
            return String(b.access_point?.ssid ?? '').localeCompare(String(a.access_point?.ssid ?? ''), 'es');
        }
        return String(a.access_point?.ssid ?? '').localeCompare(String(b.access_point?.ssid ?? ''), 'es');
    });

    return list;
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

onMounted(async () => {
    const querySession = Number(route.query.session_id ?? 0);
    if (Number.isFinite(querySession) && querySession > 0) {
        sessionId.value = Math.floor(querySession);
    }

    normalizeSessionId();
    normalizeLimit();
    normalizeRecentSeconds();

    await fetchDetections();
});

watch(() => route.query.session_id, async (value) => {
    const parsed = Number(value ?? 0);
    if (Number.isFinite(parsed) && parsed > 0) {
        sessionId.value = Math.floor(parsed);
        await fetchDetections();
    }
});
</script>

<style scoped>
.aps-table-wrapper {
    max-height: 640px;
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
