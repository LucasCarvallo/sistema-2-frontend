<template>
    <div>
        <h4 class="mb-4"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</h4>

        <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3" v-for="card in cards" :key="card.label">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div :class="['rounded-3 p-3 bg-opacity-10', card.bg]">
                            <i :class="['bi', card.icon, 'fs-4', card.text]"></i>
                        </div>
                        <div>
                            <div class="text-muted small">{{ card.label }}</div>
                            <div class="fw-bold fs-5">{{ card.value }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header bg-white fw-semibold">Actividad reciente</div>
            <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                    <li
                        v-for="item in activity"
                        :key="item.id"
                        class="list-group-item d-flex align-items-center gap-3 py-3"
                    >
                        <i :class="['bi', item.icon, 'text-secondary fs-5']"></i>
                        <div>
                            <div class="small fw-medium">{{ item.title }}</div>
                            <div class="text-muted" style="font-size: 0.78rem">{{ item.time }}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
const cards = [
    {
        label: 'Usuarios',
        value: '1,248',
        icon: 'bi-people',
        bg: 'bg-primary',
        text: 'text-primary',
    },
    {
        label: 'Reportes',
        value: '34',
        icon: 'bi-bar-chart-line',
        bg: 'bg-success',
        text: 'text-success',
    },
    { label: 'Pendientes', value: '12', icon: 'bi-clock', bg: 'bg-warning', text: 'text-warning' },
    {
        label: 'Errores',
        value: '3',
        icon: 'bi-exclamation-triangle',
        bg: 'bg-danger',
        text: 'text-danger',
    },
];

const activity = [
    {
        id: 1,
        icon: 'bi-person-plus',
        title: 'Nuevo usuario registrado: Juan García',
        time: 'Hace 5 minutos',
    },
    { id: 2, icon: 'bi-file-earmark-text', title: 'Reporte mensual generado', time: 'Hace 1 hora' },
    {
        id: 3,
        icon: 'bi-gear',
        title: 'Configuración del sistema actualizada',
        time: 'Hace 3 horas',
    },
    { id: 4, icon: 'bi-shield-check', title: 'Auditoría de seguridad completada', time: 'Ayer' },
];
</script>
