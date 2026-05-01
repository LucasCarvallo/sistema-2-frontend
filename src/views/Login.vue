<template>
  <div class="auth-page">
    <div class="card border-0 shadow-sm auth-card">
      <div class="card-body p-4 p-md-5">
        <h4 class="mb-2">Iniciar sesión</h4>
        <p class="text-muted mb-4">Accede al dashboard con tu cuenta.</p>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input v-model.trim="name" type="text" class="form-control" required placeholder="Tu nombre" />
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <button class="btn btn-primary w-100" type="submit">
            <i class="bi bi-box-arrow-in-right me-2"></i>Entrar
          </button>
        </form>

        <p class="text-muted small mt-3 mb-0 text-center">
          ¿No tienes cuenta?
          <RouterLink to="/register" class="text-decoration-none">Regístrate</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const router = useRouter()

const name = ref('')
const email = ref('')

function handleLogin() {
  session.login({
    name: name.value,
    email: email.value,
  })
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 56px - 3rem);
  display: grid;
  place-items: center;
}

.auth-card {
  width: 100%;
  max-width: 460px;
}
</style>
