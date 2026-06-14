<template>
    <div class="container-fluid py-4">
        <div class="row mb-4">
            <div class="col-md-8">
                <h1 class="d-flex align-items-center gap-2">
                    <i class="bi bi-cpu"></i>
                    ESP32 - Escaneos WiFi
                </h1>
            </div>
            <div class="col-md-4 d-flex justify-content-end align-items-center">
                <button
                    class="btn btn-primary"
                    @click="refreshSessions"
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

        <!-- Tablas en dos columnas en pantallas grandes -->
        <div class="row g-4">
            <!-- Tabla de sesiones -->
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <i class="bi bi-list-check me-2"></i>Sesiones de Escaneo
                    </div>
                    <div class="card-body p-0">
                        <div v-if="sessions.length === 0" class="p-4 text-center text-muted">
                            <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                            Sin sesiones registradas
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Dispositivo</th>
                                        <th>Totales</th>
                                        <th>Fecha</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="session in sessions"
                                        :key="session.id"
                                        :class="{ 'table-active': selectedSession?.id === session.id }"
                                        class="cursor-pointer"
                                        @click="selectSession(session)"
                                    >
                                        <td class="fw-bold">{{ session.id }}</td>
                                        <td class="text-muted small">
                                            {{ session.device_id }}
                                        </td>
                                        <td>
                                            <span class="badge bg-info">{{ session.total_found }}</span>
                                        </td>
                                        <td class="text-muted small">
                                            {{ formatDate(session.created_at) }}
                                        </td>
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

            <!-- Detalles de sesión seleccionada -->
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <i class="bi bi-wifi me-2"></i>Access Points Detectados
                    </div>
                    <div class="card-body">
                        <div v-if="!selectedSession" class="text-center text-muted py-5">
                            <i class="bi bi-hand-index fs-3 d-block mb-2"></i>
                            Selecciona una sesión para ver los detalles
                        </div>

                        <div v-else>
                            <!-- Información de la sesión -->
                            <div class="mb-4 p-3 bg-light rounded">
                                <div class="row g-2 small">
                                    <div class="col-6">
                                        <strong>ID Sesión:</strong><br />{{ selectedSession.id }}
                                    </div>
                                    <div class="col-6">
                                        <strong>Dispositivo:</strong><br />{{ selectedSession.device_id }}
                                    </div>
                                    <div class="col-6">
                                        <strong>Totales Encontrados:</strong><br />{{
                                            selectedSession.total_found
                                        }}
                                    </div>
                                    <div class="col-6">
                                        <strong>Visibles:</strong><br />{{ selectedSession.visible }}
                                    </div>
                                    <div class="col-12">
                                        <strong>Fecha:</strong><br />{{ formatDateTime(selectedSession.created_at) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Tabla de access points -->
                            <div v-if="loadingDetails" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>

                            <div
                                v-else-if="sessionDetails.detections.length === 0"
                                class="text-center text-muted py-4"
                            >
                                <i class="bi bi-wifi-off fs-5 d-block mb-2"></i>
                                Sin dispositivos detectados
                            </div>

                            <div v-else class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>SSID</th>
                                            <th>BSSID</th>
                                            <th>RSSI (dBm)</th>
                                            <th>Canal</th>
                                            <th>Oculta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="detection in sessionDetails.detections"
                                            :key="detection.id"
                                        >
                                            <td class="fw-medium">
                                                {{
                                                    detection.access_point.ssid ||
                                                    '(Red oculta)'
                                                }}
                                            </td>
                                            <td class="font-monospace small">
                                                {{ detection.access_point.bssid }}
                                            </td>
                                            <td>
                                                <span
                                                    :class="[
                                                        'badge',
                                                        detection.rssi > -50
                                                            ? 'bg-success'
                                                            : detection.rssi > -70
                                                              ? 'bg-warning'
                                                              : 'bg-danger',
                                                    ]"
                                                >
                                                    {{ detection.rssi }}
                                                </span>
                                            </td>
                                            <td class="text-center">{{ detection.channel }}</td>
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
import { ref, onMounted } from 'vue';
import { apiGet } from '@/lib/http/token';

const sessions = ref([]);
const selectedSession = ref(null);
const sessionDetails = ref({ detections: [] });
const loadingSessions = ref(false);
const loadingDetails = ref(false);
const apiError = ref('');

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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

async function refreshSessions() {
    if (loadingSessions.value) return;
    loadingSessions.value = true;
    apiError.value = '';
    try {
        const data = await apiGet('/scan-sessions', {
            loadingMessage: 'Cargando sesiones...',
        });
        sessions.value = Array.isArray(data) ? data : data?.data ?? [];
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar las sesiones.';
    } finally {
        loadingSessions.value = false;
    }
}

async function selectSession(session) {
    selectedSession.value = session;
    loadingDetails.value = true;
    apiError.value = '';
    try {
        const data = await apiGet(`/scan-sessions/${session.id}`, {
            loading: false,
        });
        sessionDetails.value = data;
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar los detalles.';
        sessionDetails.value = { detections: [] };
    } finally {
        loadingDetails.value = false;
    }
}

onMounted(refreshSessions);
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.table-responsive {
    max-height: 500px;
    overflow-y: auto;
}

.bg-light {
    background-color: #f8f9fa;
}

.fw-medium {
    font-weight: 500;
}

.font-monospace {
    font-family: 'Courier New', monospace;
}
</style>
