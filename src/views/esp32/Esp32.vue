<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-5">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-cpu"></i>
                    ESP32 - Escaneos WiFi
                </h1>
            </div>
            <div class="col-lg-4">
                <label class="form-label mb-1">Actualización automática (segundos)</label>
                <div class="input-group">
                    <input
                        v-model.number="refreshIntervalSec"
                        type="number"
                        min="1"
                        class="form-control"
                        @change="normalizeRefreshInterval"
                    />
                    <span class="input-group-text">s</span>
                </div>
                <small class="text-muted">Sugerido: intervalo ESP32 + 1s.</small>
            </div>
            <div class="col-lg-3 d-flex gap-2 justify-content-lg-end">
                <RouterLink
                    class="btn btn-outline-dark"
                    to="/tools/esp32-grouped"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver vista agrupada"
                >
                    <i class="bi bi-diagram-3 me-1"></i>
                    Agrupados
                </RouterLink>
                <button
                    class="btn btn-outline-secondary"
                    @click="toggleAutoRefresh"
                    :title="autoRefreshEnabled ? 'Pausar auto-actualización' : 'Activar auto-actualización'"
                >
                    <i :class="autoRefreshEnabled ? 'bi bi-pause-fill me-1' : 'bi bi-play-fill me-1'"></i>
                    {{ autoRefreshEnabled ? 'Pausar' : 'Reanudar' }}
                </button>
                <button
                    class="btn btn-primary"
                    @click="refreshSessions({ forceSelectLatest: false })"
                    :disabled="loadingSessions"
                    title="Recargar sesiones"
                >
                    <i v-if="!loadingSessions" class="bi bi-arrow-clockwise me-2"></i>
                    <span v-if="loadingSessions" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loadingSessions ? 'Cargando...' : 'Actualizar' }}
                </button>
            </div>
        </div>

        <div v-if="apiError" class="alert alert-warning alert-dismissible fade show" role="alert">
            {{ apiError }}
            <button type="button" class="btn-close" @click="apiError = ''"></button>
        </div>

        <div class="row g-4">
            <div class="col-xl-5 order-xl-1 order-2">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-list-check me-2"></i>Sesiones de Escaneo</span>
                        <small class="opacity-75">{{ filteredSessions.length }} resultados</small>
                    </div>

                    <div class="card-body border-bottom">
                        <div class="row g-2">
                            <div class="col-12">
                                <input
                                    v-model.trim="sessionFilter"
                                    class="form-control form-control-sm"
                                    type="text"
                                    placeholder="Filtrar por ID, dispositivo o modo"
                                />
                            </div>
                            <div class="col-12">
                                <select v-model="sessionSort" class="form-select form-select-sm">
                                    <option value="latest">Más recientes</option>
                                    <option value="oldest">Más antiguas</option>
                                    <option value="total_desc">Mayor total encontrado</option>
                                    <option value="total_asc">Menor total encontrado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="sessions.length === 0" class="p-4 text-center text-muted">
                            <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                            Sin sesiones registradas
                        </div>

                        <div v-else class="table-responsive sessions-table-wrapper">
                            <table class="table table-hover mb-0">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>ID</th>
                                        <th>Dispositivo</th>
                                        <th>Modo</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="session in filteredSessions"
                                        :key="session.id"
                                        :class="{ 'table-active': selectedSession?.id === session.id }"
                                        class="cursor-pointer"
                                        @click="selectSession(session)"
                                    >
                                        <td class="fw-bold">{{ session.id }}</td>
                                        <td class="text-muted small">{{ session.device_id }}</td>
                                        <td>
                                            <span class="badge text-bg-secondary text-uppercase small">{{ session.scan_mode }}</span>
                                        </td>
                                        <td>
                                            <span class="badge bg-info-subtle text-info-emphasis">{{ session.total_found }}</span>
                                        </td>
                                        <td class="text-muted small">{{ formatDate(session.created_at) }}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-primary"
                                                @click.stop="selectSession(session)"
                                                title="Ver detalles"
                                            >
                                                <i class="bi bi-arrow-right"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-7 order-xl-2 order-1">
                <div class="card h-100">
                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-wifi me-2"></i>Access Points Detectados</span>
                        <small v-if="selectedSession" class="opacity-75">Sesión #{{ selectedSession.id }}</small>
                    </div>
                    <div class="card-body">
                        <div v-if="!selectedSession" class="text-center text-muted py-5">
                            <i class="bi bi-hand-index fs-3 d-block mb-2"></i>
                            Selecciona una sesión para ver los detalles
                        </div>

                        <div v-else>
                            <div class="mb-3 p-3 bg-light rounded small">
                                <div class="row g-2">
                                    <div class="col-md-4"><strong>ID:</strong> {{ selectedSession.id }}</div>
                                    <div class="col-md-4"><strong>Modo:</strong> {{ selectedSession.scan_mode }}</div>
                                    <div class="col-md-4"><strong>Dispositivo:</strong> {{ selectedSession.device_id }}</div>
                                    <div class="col-md-4"><strong>Total:</strong> {{ selectedSession.total_found }}</div>
                                    <div class="col-md-4"><strong>Visibles:</strong> {{ selectedSession.visible }}</div>
                                    <div class="col-md-4"><strong>Fecha:</strong> {{ formatDateTime(selectedSession.created_at) }}</div>
                                </div>
                            </div>

                            <div class="row g-2 mb-3">
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

                            <div v-if="loadingDetails" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>

                            <div v-else-if="filteredDetections.length === 0" class="text-center text-muted py-4">
                                <i class="bi bi-wifi-off fs-5 d-block mb-2"></i>
                                Sin dispositivos detectados para el filtro aplicado
                            </div>

                            <div v-else class="table-responsive aps-table-wrapper">
                                <table class="table table-sm table-bordered align-middle mb-0">
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
                                                <span
                                                    class="led-dot"
                                                    :class="signalLedClass(detection.rssi)"
                                                    :title="signalLabel(detection.rssi)"
                                                ></span>
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
                                                <!-- <a
                                                    :href="`/clients?bssid=${detection.access_point.bssid}`"
                                                    target="_blank"
                                                    class="btn btn-sm btn-outline-primary"
                                                    :title="`Ver clientes asociados a ${detection.access_point.bssid}`"
                                                    @click="openClientsViewByBssid(detection.access_point.bssid)"
                                                >
                                                    {{ clientsCountForBssid(detection.access_point.bssid) }}
                                                </a> -->
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
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { apiGet } from '@/lib/http/token';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();

const sessions = ref([]);
const selectedSession = ref(null);
const sessionDetails = ref({ detections: [] });
const loadingSessions = ref(false);
const loadingDetails = ref(false);
const apiError = ref('');
const clientCountsByBssid = ref({});

const refreshIntervalSec = ref(10);
const autoRefreshEnabled = ref(true);
let refreshTimer = null;

const sessionFilter = ref('');
const sessionSort = ref('latest');

const apFilter = ref('');
const hiddenFilter = ref('all');
const apSort = ref('signal_desc');

const CLIENT_COUNTS_LOOKBACK_SECONDS = 3600;
const MONITOR_AP_LIMIT = 300;
const MONITOR_AP_RECENT_SECONDS = 0;

const filteredSessions = computed(() => {
    const q = sessionFilter.value.toLowerCase();

    let rows = sessions.value.filter((s) => {
        if (!q) return true;
        return (
            String(s.id).includes(q) ||
            String(s.device_id ?? '').toLowerCase().includes(q) ||
            String(s.scan_mode ?? '').toLowerCase().includes(q)
        );
    });

    rows = [...rows].sort((a, b) => {
        if (sessionSort.value === 'latest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sessionSort.value === 'oldest') {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sessionSort.value === 'total_desc') {
            return Number(b.total_found ?? 0) - Number(a.total_found ?? 0);
        }
        return Number(a.total_found ?? 0) - Number(b.total_found ?? 0);
    });

    return rows;
});

const filteredDetections = computed(() => {
    const rows = Array.isArray(sessionDetails.value?.detections) ? sessionDetails.value.detections : [];
    const q = apFilter.value.toLowerCase();

    let list = rows.filter((d) => {
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

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-AR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function normalizeRefreshInterval() {
    if (!Number.isFinite(refreshIntervalSec.value) || refreshIntervalSec.value < 1) {
        refreshIntervalSec.value = 1;
    }
    refreshIntervalSec.value = Math.floor(refreshIntervalSec.value);
}

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

async function loadDetectionsForMonitorView() {
    const params = new URLSearchParams();
    params.set('limit', String(MONITOR_AP_LIMIT));
    if (MONITOR_AP_RECENT_SECONDS > 0) {
        params.set('recent_seconds', String(MONITOR_AP_RECENT_SECONDS));
    }

    const data = await apiGet(`/access-point-detections-grouped?${params.toString()}`, {
        loading: false,
    });

    const rows = Array.isArray(data?.items) ? data.items : [];

    return rows.map((item) => ({
        id: `monitor-${item.bssid}-${item.last_scan_session_id ?? 'x'}`,
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

function startAutoRefresh() {
    stopAutoRefresh();
    if (!autoRefreshEnabled.value) return;

    refreshTimer = setInterval(() => {
        refreshSessions({ forceSelectLatest: false });
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

async function refreshSessions(options = { forceSelectLatest: false }) {
    if (loadingSessions.value) return;

    loadingSessions.value = true;
    apiError.value = '';

    try {
        const [data] = await Promise.all([
            apiGet('/scan-sessions', {
                loading: false,
            }),
            refreshClientCounts(),
        ]);

        const nextSessions = Array.isArray(data) ? data : data?.data ?? [];
        sessions.value = nextSessions;

        if (!sessions.value.length) {
            selectedSession.value = null;
            sessionDetails.value = { detections: [] };
            return;
        }

        const latestSession = sessions.value[0] ?? null;
        const selectedExists = sessions.value.some((s) => s.id === selectedSession.value?.id);
        const hasNewLatest = latestSession && latestSession.id !== selectedSession.value?.id;

        if (options.forceSelectLatest || !selectedExists || !selectedSession.value || hasNewLatest) {
            await selectSession(sessions.value[0]);
        }
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar las sesiones.';
    } finally {
        loadingSessions.value = false;
    }
}

async function selectSession(session) {
    if (!session) return;
    selectedSession.value = session;
    loadingDetails.value = true;
    apiError.value = '';

    try {
        const data = await apiGet(`/scan-sessions/${session.id}`, {
            loading: false,
        });

        const details = data ?? { detections: [] };
        const hasDetections = Array.isArray(details?.detections) && details.detections.length > 0;

        if (session.scan_mode === 'monitor' && !hasDetections) {
            const monitorDetections = await loadDetectionsForMonitorView();
            sessionDetails.value = {
                session,
                detections: monitorDetections,
            };
            return;
        }

        sessionDetails.value = details;
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar los detalles.';
        sessionDetails.value = { detections: [] };
    } finally {
        loadingDetails.value = false;
    }
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
    await refreshSessions({ forceSelectLatest: true });
    startAutoRefresh();
});

onUnmounted(() => {
    stopAutoRefresh();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.sessions-table-wrapper,
.aps-table-wrapper {
    max-height: 510px;
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
