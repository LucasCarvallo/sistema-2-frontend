<template>
    <div class="card border-0 shadow-sm">
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <h5 class="mb-0">Panel diario de tareas</h5>
                <span class="small text-muted">Resumen por fecha</span>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-12 col-md-4">
                    <label class="form-label small text-muted mb-1">Desde</label>
                    <input v-model="filtroDesde" type="date" class="form-control form-control-sm" />
                </div>
                <div class="col-12 col-md-4">
                    <label class="form-label small text-muted mb-1">Hasta</label>
                    <input v-model="filtroHasta" type="date" class="form-control form-control-sm" />
                </div>
                <div class="col-12 col-md-4">
                    <label class="form-label small text-muted mb-1">Requerimiento</label>
                    <select v-model.number="filtroReqId" class="form-select form-select-sm">
                        <option :value="0">Todos</option>
                        <option v-for="req in requerimientos" :key="req.id" :value="req.id">#{{ req.id }} - {{ req.titulo }}</option>
                    </select>
                </div>
            </div>

            <div v-if="resumenDiario.length === 0" class="alert alert-light border mb-0">
                No hay datos con fecha para mostrar.
            </div>

            <div v-else class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th class="text-end">Minutos</th>
                            <th class="text-end">Horas</th>
                            <th class="text-end">Registros</th>
                            <th class="text-end">Tareas</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in resumenDiario" :key="`dia-${row.fecha}`">
                            <td>{{ row.fecha }}</td>
                            <td class="text-end">{{ row.minutos }}</td>
                            <td class="text-end">{{ calcularHoras(row.minutos) }}</td>
                            <td class="text-end">{{ row.registros }}</td>
                            <td class="text-end">{{ row.tareas }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    tareas: {
        type: Array,
        default: () => [],
    },
    requerimientos: {
        type: Array,
        default: () => [],
    },
});

const filtroDesde = ref('');
const filtroHasta = ref('');
const filtroReqId = ref(0);

function extraerFecha(value) {
    const text = String(value || '').trim();
    if (!text) return '';

    const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    const legacyMatch = text.match(/^(\d{2}-\d{2}-\d{4})/);
    return legacyMatch ? toIsoDate(legacyMatch[1]) : '';
}

function toIsoDate(fecha) {
    const value = String(fecha || '').trim();
    if (!value) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const legacyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!legacyMatch) return '';

    const [, dd, mm, yyyy] = legacyMatch;
    return `${yyyy}-${mm}-${dd}`;
}

function sortKeyFecha(fecha) {
    const iso = toIsoDate(fecha);
    return Number(iso.replaceAll('-', '')) || 0;
}

function calcularHoras(minutos) {
    const horas = minutos / 60;
    const minutosRestantes = minutos % 60;
    return `${Math.floor(horas)}h ${Math.round(minutosRestantes)}m`;
}

const resumenDiario = computed(() => {
    const grouped = new Map();

    function ensureRow(fecha) {
        if (!grouped.has(fecha)) {
            grouped.set(fecha, {
                fecha,
                minutos: 0,
                registros: 0,
                taskIds: new Set(),
            });
        }
        return grouped.get(fecha);
    }

    function pasaFiltros(fecha, reqId) {
        if (filtroReqId.value && Number(reqId) !== Number(filtroReqId.value)) {
            return false;
        }

        const iso = toIsoDate(fecha);
        if (!iso) return false;

        if (filtroDesde.value && iso < filtroDesde.value) return false;
        if (filtroHasta.value && iso > filtroHasta.value) return false;

        return true;
    }

    for (const task of props.tareas) {
        const subtareas = Array.isArray(task.subtareas) ? task.subtareas : [];

        if (subtareas.length > 0) {
            for (const sub of subtareas) {
                const fecha = extraerFecha(sub.inicio) || extraerFecha(sub.fin) || 'Sin fecha';
                if (!pasaFiltros(fecha, task.requerimiento_id)) continue;

                const row = ensureRow(fecha);
                row.minutos += Number(sub.minutos) || 0;
                row.registros += 1;
                row.taskIds.add(task.id);
            }
            continue;
        }

        const fecha = extraerFecha(task.inicio) || extraerFecha(task.fin) || 'Sin fecha';
        if (!pasaFiltros(fecha, task.requerimiento_id)) continue;

        const row = ensureRow(fecha);
        row.minutos += Number(task.minutos) || 0;
        row.registros += 1;
        row.taskIds.add(task.id);
    }

    return Array.from(grouped.values())
        .map((row) => ({
            fecha: row.fecha,
            minutos: row.minutos,
            registros: row.registros,
            tareas: row.taskIds.size,
        }))
        .sort((a, b) => sortKeyFecha(b.fecha) - sortKeyFecha(a.fecha));
});
</script>
