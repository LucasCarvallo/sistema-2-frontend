<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-5">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-list-check"></i>
                    ESP32 - Sesiones de Escaneo
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
            </div>
            <div class="col-lg-3 d-flex gap-2 justify-content-lg-end">
                <RouterLink class="btn btn-outline-secondary" to="/tools/esp32">
                    <i class="bi bi-grid-1x2 me-1"></i>
                    Hub
                </RouterLink>
                <button
                    class="btn btn-outline-secondary"
                    @click="toggleAutoRefresh"
                    :title="autoRefreshEnabled ? 'Pausar auto-actualización' : 'Activar auto-actualización'"
                >
                    <i :class="autoRefreshEnabled ? 'bi bi-pause-fill me-1' : 'bi bi-play-fill me-1'"></i>
                    {{ autoRefreshEnabled ? 'Pausar' : 'Reanudar' }}
                </button>
                <button class="btn btn-primary" @click="refreshSessions" :disabled="loadingSessions">
                    <i v-if="!loadingSessions" class="bi bi-arrow-clockwise me-2"></i>
                    <span v-else class="spinner-border spinner-border-sm me-2"></span>
                    {{ loadingSessions ? 'Cargando...' : 'Actualizar' }}
                </button>
            </div>
        </div>

        <div v-if="apiError" class="alert alert-warning alert-dismissible fade show" role="alert">
            {{ apiError }}
            <button type="button" class="btn-close" @click="apiError = ''"></button>
        </div>

        <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span><i class="bi bi-clock-history me-2"></i>Sesiones</span>
                <small class="opacity-75">{{ filteredSessions.length }} resultados</small>
            </div>

            <div class="card-body border-bottom">
                <div class="row g-2">
                    <div class="col-md-6">
                        <input
                            v-model.trim="sessionFilter"
                            class="form-control form-control-sm"
                            type="text"
                            placeholder="Filtrar por ID, dispositivo o modo"
                        />
                    </div>
                    <div class="col-md-3">
                        <select v-model="modeFilter" class="form-select form-select-sm">
                            <option value="all">Todos los modos</option>
                            <option value="managed">Managed</option>
                            <option value="monitor">Monitor</option>
                        </select>
                    </div>
                    <div class="col-md-3">
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
                <div v-if="loadingSessions" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                <div v-else-if="filteredSessions.length === 0" class="p-4 text-center text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    Sin sesiones registradas
                </div>

                <div v-else class="table-responsive sessions-table-wrapper">
                    <table class="table table-hover mb-0 table-hover">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th>ID</th>
                                <th>Dispositivo</th>
                                <th>Modo</th>
                                <th>Total</th>
                                <th>Visibles</th>
                                <th>Fecha</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="session in filteredSessions" :key="session.id">
                                <td class="fw-bold">{{ session.id }}</td>
                                <td class="text-muted small">{{ session.device_id }}</td>
                                <td>
                                    <span class="badge text-bg-secondary text-uppercase small">{{ session.scan_mode }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-info-subtle text-info-emphasis">{{ session.total_found }}</span>
                                </td>
                                <td>{{ session.visible }}</td>
                                <td class="text-muted small">{{ formatDate(session.created_at) }}</td>
                                <td class="text-center">
                                    <RouterLink
                                        class="btn btn-sm btn-outline-primary"
                                        :to="{ path: '/tools/esp32-access-points', query: { session_id: session.id } }"
                                    >
                                        Ver APs
                                    </RouterLink>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { apiGet } from '@/lib/http/token';

const sessions = ref([]);
const loadingSessions = ref(false);
const apiError = ref('');

const refreshIntervalSec = ref(10);
const autoRefreshEnabled = ref(true);
let refreshTimer = null;

const sessionFilter = ref('');
const sessionSort = ref('latest');
const modeFilter = ref('all');

const filteredSessions = computed(() => {
    const q = sessionFilter.value.toLowerCase();

    let rows = sessions.value.filter((s) => {
        const byText =
            !q ||
            String(s.id).includes(q) ||
            String(s.device_id ?? '').toLowerCase().includes(q) ||
            String(s.scan_mode ?? '').toLowerCase().includes(q);

        const byMode = modeFilter.value === 'all' || String(s.scan_mode ?? '').toLowerCase() === modeFilter.value;

        return byText && byMode;
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

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-AR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function normalizeRefreshInterval() {
    if (!Number.isFinite(refreshIntervalSec.value) || refreshIntervalSec.value < 1) {
        refreshIntervalSec.value = 1;
    }
    refreshIntervalSec.value = Math.floor(refreshIntervalSec.value);
}

function startAutoRefresh() {
    stopAutoRefresh();
    if (!autoRefreshEnabled.value) return;

    refreshTimer = setInterval(() => {
        refreshSessions();
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

async function refreshSessions() {
    if (loadingSessions.value) return;

    loadingSessions.value = true;
    apiError.value = '';

    try {
        const data = await apiGet('/scan-sessions', {
            loading: false,
        });
        sessions.value = Array.isArray(data) ? data : data?.data ?? [];
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar las sesiones.';
    } finally {
        loadingSessions.value = false;
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
    await refreshSessions();
    startAutoRefresh();
});

onUnmounted(() => {
    stopAutoRefresh();
});
</script>

<style scoped>
.sessions-table-wrapper {
    max-height: 620px;
    overflow-y: auto;
}
</style>
