<template>
	<div>
		<div class="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
			<div>
				<h4 class="mb-1"><i class="bi bi-braces-asterisk me-2 text-primary"></i>JSON Beauty</h4>
				<p class="text-muted mb-0">Valida, formatea, minifica y copia estructuras JSON.</p>
			</div>

			<div class="d-flex align-items-center gap-2 flex-wrap">
				<label class="small text-muted" for="indent-size">Indentación</label>
				<select id="indent-size" v-model.number="indentSize" class="form-select form-select-sm jsonbeauty-select">
					<option :value="2">2 espacios</option>
					<option :value="4">4 espacios</option>
				</select>
			</div>
		</div>

		<div class="row g-4">
			<div class="col-12 col-xl-6">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header fw-semibold d-flex align-items-center justify-content-between gap-2 flex-wrap">
						<span><i class="bi bi-input-cursor-text me-2"></i>Entrada</span>
						<div class="d-flex gap-2 flex-wrap">
							<button class="btn btn-outline-secondary btn-sm" type="button" @click="fillExample">
								<i class="bi bi-stars me-1"></i>Cargar ejemplo
							</button>
							<button class="btn btn-outline-danger btn-sm" type="button" @click="clearAll">
								<i class="bi bi-eraser me-1"></i>Limpiar
							</button>
						</div>
					</div>
					<div class="card-body d-flex flex-column gap-3">
						<textarea
							v-model="inputJson"
							class="form-control jsonbeauty-textarea"
							spellcheck="false"
							placeholder='Pega aquí tu JSON. Ejemplo: { "name": "Lucas", "roles": ["admin"] }'
						></textarea>

						<div class="d-flex gap-2 flex-wrap">
							<button class="btn btn-primary btn-sm" type="button" @click="formatJson">
								<i class="bi bi-magic me-1"></i>Embellecer
							</button>
							<button class="btn btn-outline-primary btn-sm" type="button" @click="minifyJson">
								<i class="bi bi-arrows-collapse me-1"></i>Minificar
							</button>
							<button class="btn btn-outline-success btn-sm" type="button" @click="validateJson">
								<i class="bi bi-patch-check me-1"></i>Validar
							</button>
						</div>

						<div v-if="statusMessage" :class="['alert', statusClass, 'mb-0 py-2']" role="alert">
							<i :class="['bi', statusIcon, 'me-2']"></i>{{ statusMessage }}
						</div>
					</div>
				</div>
			</div>

			<div class="col-12 col-xl-6">
				<div class="card border-0 shadow-sm h-100">
					<div class="card-header fw-semibold d-flex align-items-center justify-content-between gap-2 flex-wrap">
						<span><i class="bi bi-code-square me-2"></i>Salida</span>
						<div class="d-flex gap-2 flex-wrap">
							<button class="btn btn-outline-secondary btn-sm" type="button" :disabled="!outputJson" @click="copyOutput">
								<i class="bi bi-clipboard me-1"></i>{{ copied ? 'Copiado' : 'Copiar' }}
							</button>
							<button class="btn btn-outline-secondary btn-sm" type="button" :disabled="!outputJson" @click="downloadOutput">
								<i class="bi bi-download me-1"></i>Descargar
							</button>
						</div>
					</div>
					<div class="card-body d-flex flex-column gap-3">
						<textarea
							:value="outputJson"
							class="form-control jsonbeauty-textarea"
							spellcheck="false"
							readonly
							placeholder="Aquí verás el resultado formateado o minificado."
						></textarea>

						<div class="small text-muted d-flex align-items-center justify-content-between gap-3 flex-wrap">
							<span>Caracteres: {{ outputJson.length }}</span>
							<span v-if="statsText">{{ statsText }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';

const inputJson = ref('');
const outputJson = ref('');
const indentSize = ref(2);
const copied = ref(false);
const status = ref({ type: '', message: '' });

const exampleJson = {
	user: {
		id: 7,
		name: 'Lucas Perez',
		email: 'lucas@example.com',
		roles: ['admin', 'editor'],
		active: true,
	},
	lastLogin: '2026-05-02T14:32:00Z',
	preferences: {
		theme: 'dark',
		sidebarCollapsed: false,
	},
};

const statusMessage = computed(() => status.value.message);
const statusClass = computed(() => status.value.type === 'error' ? 'alert-danger' : 'alert-success');
const statusIcon = computed(() => status.value.type === 'error' ? 'bi-exclamation-octagon' : 'bi-check-circle');
const statsText = computed(() => {
	if (!inputJson.value || !outputJson.value) {
		return '';
	}

	const delta = outputJson.value.length - inputJson.value.length;
	if (delta === 0) {
		return 'Sin cambios en el tamaño';
	}

	return delta > 0 ? `+${delta} caracteres` : `${delta} caracteres`;
});

function setSuccess(message) {
	status.value = { type: 'success', message };
}

function setError(message) {
	status.value = { type: 'error', message };
}

function parseInput() {
	try {
		return JSON.parse(inputJson.value);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'JSON inválido.';
		throw new Error(`JSON inválido: ${message}`);
	}
}

function formatJson() {
	if (!inputJson.value.trim()) {
		outputJson.value = '';
		setError('Pegá un JSON antes de embellecerlo.');
		return;
	}

	try {
		const parsed = parseInput();
		outputJson.value = JSON.stringify(parsed, null, indentSize.value);
		setSuccess('JSON válido y formateado correctamente.');
		copied.value = false;
	} catch (error) {
		outputJson.value = '';
		setError(error.message);
	}
}

function minifyJson() {
	if (!inputJson.value.trim()) {
		outputJson.value = '';
		setError('Pegá un JSON antes de minificarlo.');
		return;
	}

	try {
		const parsed = parseInput();
		outputJson.value = JSON.stringify(parsed);
		setSuccess('JSON válido y minificado correctamente.');
		copied.value = false;
	} catch (error) {
		outputJson.value = '';
		setError(error.message);
	}
}

function validateJson() {
	if (!inputJson.value.trim()) {
		setError('Pegá un JSON antes de validarlo.');
		return;
	}

	try {
		parseInput();
		setSuccess('El JSON es válido.');
	} catch (error) {
		setError(error.message);
	}
}

async function copyOutput() {
	if (!outputJson.value) {
		return;
	}

	try {
		await navigator.clipboard.writeText(outputJson.value);
		copied.value = true;
		setSuccess('Resultado copiado al portapapeles.');
	} catch {
		setError('No se pudo copiar el resultado.');
	}
}

function downloadOutput() {
	if (!outputJson.value) {
		return;
	}

	const blob = new Blob([outputJson.value], { type: 'application/json;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'formatted.json';
	link.click();
	URL.revokeObjectURL(url);
	setSuccess('Archivo JSON descargado.');
}

function clearAll() {
	inputJson.value = '';
	outputJson.value = '';
	copied.value = false;
	status.value = { type: '', message: '' };
}

function fillExample() {
	inputJson.value = JSON.stringify(exampleJson);
	outputJson.value = '';
	copied.value = false;
	status.value = { type: '', message: '' };
}
</script>

<style scoped>
.jsonbeauty-textarea {
	min-height: 420px;
	resize: vertical;
	font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
	font-size: 0.95rem;
	line-height: 1.5;
}

.jsonbeauty-select {
	min-width: 132px;
}
</style>
