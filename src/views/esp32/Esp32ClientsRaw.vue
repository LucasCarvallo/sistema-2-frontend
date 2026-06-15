<template>
    <div class="container-fluid py-4">
        <div class="row mb-4 g-3 align-items-end">
            <div class="col-lg-5">
                <h1 class="d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-people"></i>
                    ESP32 - Clientes Monitor (Crudo)
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
                            max="2000"
                            class="form-control"
                            @change="normalizeLimit"
                        />
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label mb-1">BSSID asociada (opcional)</label>
                        <input
                            v-model.trim="associatedBssid"
                            type="text"
                            class="form-control"
                            placeholder="AA:BB:CC:DD:EE:FF"
                        />
                    </div>
                    <div class="col-sm-3">
                        <label class="form-label mb-1">Ventana (s)</label>
                        <input
                            v-model.number="recentSeconds"
                            type="number"
                            min="0"
                            max="86400"
                            class="form-control"
                            @change="normalizeRecentSeconds"
                        />
                    </div>
                    <div class="col-sm-2 d-flex align-items-end gap-2">
                        <button class="btn btn-primary w-100" :disabled="loading" @click="fetchClientsRaw">
                            {{ loading ? 'Cargando...' : 'Aplicar' }}
                        </button>
                    </div>
                    <div class="col-sm-12 d-flex justify-content-end gap-2">
                        <RouterLink
                            class="btn btn-outline-dark btn-sm"
                            :to="{ path: '/tools/esp32-clients', query: { associated_bssid: associatedBssid || undefined } }"
                        >
                            <i class="bi bi-diagram-3 me-1"></i>
                            Ver agrupado
                        </RouterLink>
                        <RouterLink class="btn btn-outline-secondary btn-sm" to="/tools/esp32">
                            <i class="bi bi-arrow-left me-1"></i>
                            Volver a AP crudo
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
                <span><i class="bi bi-broadcast-pin me-2"></i>Detecciones de Clientes (Crudo)</span>
                <small class="opacity-75">{{ filteredItems.length }} detecciones</small>
            </div>
            <div class="card-body border-bottom">
                <div class="row g-2">
                    <div class="col-md-7">
                        <input
                            v-model.trim="search"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Filtrar por alias, MAC cliente, BSSID o sesión"
                        />
                    </div>
                    <div class="col-md-5">
                        <select v-model="sortMode" class="form-select form-select-sm">
                            <option value="recent_desc">Mas reciente</option>
                            <option value="rssi_desc">Mejor senal</option>
                            <option value="rssi_asc">Peor senal</option>
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

                <div v-else class="table-responsive clients-table-wrapper">
                    <table class="table table-sm table-bordered align-middle mb-0">
                        <thead class="table-light sticky-top">
                            <tr>
                                <th>Alias</th>
                                <th>Cliente MAC</th>
                                <th>BSSID asociada</th>
                                <th>RSSI</th>
                                <th>Canal</th>
                                <th>Sesion</th>
                                <th>Detectado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredItems" :key="item.id">
                                <td>
                                    <div class="input-group input-group-sm">
                                        <input
                                            type="text"
                                            class="form-control"
                                            :placeholder="item.client_alias ? '' : 'Sin alias'"
                                            v-model.trim="aliasDraftByMac[item.client_mac]"
                                        />
                                        <button
                                            class="btn btn-outline-primary"
                                            type="button"
                                            :disabled="savingAliasByMac[item.client_mac]"
                                            @click="saveAlias(item.client_mac)"
                                            title="Guardar alias"
                                        >
                                            <span v-if="!savingAliasByMac[item.client_mac]">Guardar</span>
                                            <span v-else class="spinner-border spinner-border-sm"></span>
                                        </button>
                                    </div>
                                </td>
                                <td class="font-monospace small">{{ item.client_mac }}</td>
                                <td class="font-monospace small">{{ item.associated_bssid || '-' }}</td>
                                <td>
                                    <span class="badge" :class="signalBadgeClass(item.rssi)">
                                        {{ item.rssi }} dBm
                                    </span>
                                </td>
                                <td class="text-center">{{ item.channel }}</td>
                                <td class="text-center">{{ item.scan_session_id }}</td>
                                <td class="text-muted small">{{ formatDateTime(item.detected_at) }}</td>
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
import { RouterLink, useRoute } from 'vue-router';
import { apiGet, apiPatch } from '@/lib/http/token';

const route = useRoute();

const loading = ref(false);
const apiError = ref('');
const items = ref([]);
const aliasDraftByMac = ref({});
const savingAliasByMac = ref({});

const limit = ref(500);
const associatedBssid = ref('');
const recentSeconds = ref(0);

const search = ref('');
const sortMode = ref('recent_desc');

function normalizeLimit() {
    if (!Number.isFinite(limit.value) || limit.value < 1) {
        limit.value = 1;
    }
    if (limit.value > 2000) {
        limit.value = 2000;
    }
    limit.value = Math.floor(limit.value);
}

function normalizeRecentSeconds() {
    if (!Number.isFinite(recentSeconds.value) || recentSeconds.value < 0) {
        recentSeconds.value = 0;
    }
    if (recentSeconds.value > 86400) {
        recentSeconds.value = 86400;
    }
    recentSeconds.value = Math.floor(recentSeconds.value);
}

function buildPath() {
    normalizeLimit();
    normalizeRecentSeconds();

    const params = new URLSearchParams();
    params.set('limit', String(limit.value));

    if (associatedBssid.value.trim()) {
        params.set('associated_bssid', associatedBssid.value.trim());
    }
    if (recentSeconds.value > 0) {
        params.set('recent_seconds', String(recentSeconds.value));
    }

    return `/wifi-client-detections?${params.toString()}`;
}

async function fetchClientsRaw() {
    loading.value = true;
    apiError.value = '';

    try {
        const data = await apiGet(buildPath(), { loading: false });
        items.value = Array.isArray(data?.items) ? data.items : [];

        const nextDraft = { ...aliasDraftByMac.value };
        items.value.forEach((item) => {
            const mac = String(item?.client_mac ?? '').trim();
            if (!mac || Object.prototype.hasOwnProperty.call(nextDraft, mac)) return;
            nextDraft[mac] = String(item?.client_alias ?? '').trim();
        });
        aliasDraftByMac.value = nextDraft;
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo cargar el detalle crudo de clientes monitor.';
        items.value = [];
    } finally {
        loading.value = false;
    }
}

async function saveAlias(mac) {
    const normalizedMac = String(mac ?? '').trim();
    if (!normalizedMac) return;

    savingAliasByMac.value = {
        ...savingAliasByMac.value,
        [normalizedMac]: true,
    };
    apiError.value = '';

    try {
        const alias = String(aliasDraftByMac.value?.[normalizedMac] ?? '').trim();
        await apiPatch(
            `/wifi-clients/${encodeURIComponent(normalizedMac)}/alias`,
            { alias },
            { loading: false },
        );

        items.value = items.value.map((item) =>
            item.client_mac === normalizedMac
                ? {
                      ...item,
                      client_alias: alias || null,
                  }
                : item,
        );
    } catch (error) {
        apiError.value = error?.message ?? 'No se pudo guardar el alias del cliente.';
    } finally {
        savingAliasByMac.value = {
            ...savingAliasByMac.value,
            [normalizedMac]: false,
        };
    }
}

const filteredItems = computed(() => {
    const q = search.value.toLowerCase();
    let list = items.value.filter((item) => {
        const alias = String(item?.client_alias ?? '').toLowerCase();
        const client = String(item?.client_mac ?? '').toLowerCase();
        const bssid = String(item?.associated_bssid ?? '').toLowerCase();
        const sessionId = String(item?.scan_session_id ?? '').toLowerCase();
        return !q || alias.includes(q) || client.includes(q) || bssid.includes(q) || sessionId.includes(q);
    });

    list = [...list].sort((a, b) => {
        if (sortMode.value === 'rssi_desc') return Number(b.rssi ?? -999) - Number(a.rssi ?? -999);
        if (sortMode.value === 'rssi_asc') return Number(a.rssi ?? -999) - Number(b.rssi ?? -999);
        return new Date(b.detected_at ?? 0).getTime() - new Date(a.detected_at ?? 0).getTime();
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

onMounted(() => {
    const queryBssid = String(route.query.associated_bssid ?? '').trim();
    if (queryBssid) {
        associatedBssid.value = queryBssid;
    }

    fetchClientsRaw();
});
</script>

<style scoped>
.clients-table-wrapper {
    max-height: 640px;
    overflow-y: auto;
}

.font-monospace {
    font-family: 'Courier New', monospace;
}
</style>
