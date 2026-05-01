<template>
  <div>
    <h4 class="mb-4">
      <i class="bi bi-gear me-2 text-primary"></i>Configuración
    </h4>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header fw-semibold">
        <i class="bi bi-palette me-2"></i>Apariencia
      </div>
      <div class="card-body">
        <p class="text-muted small mb-3">Elige el tema visual de la aplicación.</p>
        <ThemeSelector />
      </div>
    </div>
  </div>
</template>

<script setup>
import ThemeSelector from '@/components/ui/ThemeSelector.vue'
</script>
