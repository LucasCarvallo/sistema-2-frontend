<template>
    <div class="container-fluid py-4 esp32-hub">
        <div class="row mb-4">
            <div class="col-12">
                <h1 class="d-flex align-items-center gap-2 mb-1">
                    <i class="bi bi-cpu"></i>
                    ESP32 - Hub de Monitoreo
                </h1>
                <p class="text-muted mb-0">Accesos rápidos a paneles crudos, agrupados y herramientas de análisis.</p>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-6">
                <div class="card h-100 border-0 shadow-sm hub-card managed-card">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="h5 mb-0 d-flex align-items-center gap-2">
                                <i class="bi bi-router"></i>
                                Access Points
                            </h2>
                            <span class="badge text-bg-success">Managed / Monitor</span>
                        </div>
                        <p class="text-muted small mb-3">
                            Explorá detecciones de AP por sesión (crudo) o por resumen (agrupado).
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                            <RouterLink class="btn btn-primary" to="/tools/esp32-access-points" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-list-ul me-1"></i>
                                AP crudo
                            </RouterLink>
                            <RouterLink class="btn btn-outline-dark" to="/tools/esp32-grouped" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-diagram-3 me-1"></i>
                                AP agrupado
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card h-100 border-0 shadow-sm hub-card clients-card">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="h5 mb-0 d-flex align-items-center gap-2">
                                <i class="bi bi-people"></i>
                                Clientes Monitor
                            </h2>
                            <span class="badge text-bg-warning">Monitor</span>
                        </div>
                        <p class="text-muted small mb-3">
                            Vista de detecciones de clientes por evento (crudo) o consolidada por cliente/BSSID.
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                            <RouterLink class="btn btn-primary" to="/tools/esp32-clients-raw" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-list-ul me-1"></i>
                                Clientes crudo
                            </RouterLink>
                            <RouterLink class="btn btn-outline-dark" to="/tools/esp32-clients" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-diagram-3 me-1"></i>
                                Clientes agrupado
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card h-100 border-0 shadow-sm hub-card sessions-card">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="h5 mb-0 d-flex align-items-center gap-2">
                                <i class="bi bi-list-check"></i>
                                Sesiones
                            </h2>
                            <span class="badge text-bg-info">Historial</span>
                        </div>
                        <p class="text-muted small mb-3">
                            Consultá el historial de sesiones y abrí rápidamente los AP detectados por sesión.
                        </p>
                        <RouterLink class="btn btn-primary" to="/tools/esp32-sessions" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-clock-history me-1"></i>
                            Ver sesiones
                        </RouterLink>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card h-100 border-0 shadow-sm hub-card tools-card">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="h5 mb-0 d-flex align-items-center gap-2">
                                <i class="bi bi-tools"></i>
                                Herramientas
                            </h2>
                            <span class="badge text-bg-secondary">Próximamente</span>
                        </div>
                        <p class="text-muted small mb-3">
                            Espacio reservado para análisis de paquetes, fingerprinting y correlaciones avanzadas.
                        </p>
                        <button class="btn btn-outline-secondary" type="button" disabled>
                            <i class="bi bi-hourglass-split me-1"></i>
                            Pendiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.esp32-hub {
    background: radial-gradient(circle at 20% 0%, #f3f9ff 0%, #ffffff 45%, #f9fbf6 100%);
    min-height: calc(100vh - 2rem);
}

.hub-card {
    border-radius: 1rem;
    transition: transform 180ms ease, box-shadow 180ms ease;
}

.hub-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important;
}

.managed-card {
    border-left: 0.35rem solid #1b8f59;
}

.clients-card {
    border-left: 0.35rem solid #cc8a07;
}

.sessions-card {
    border-left: 0.35rem solid #0d6efd;
}

.tools-card {
    border-left: 0.35rem solid #6c757d;
}
</style>
