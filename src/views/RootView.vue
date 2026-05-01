<template>
  <DashboardView v-if="session.user" />
  <LoginView v-else />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import DashboardView from './DashboardView.vue'
import { useSessionStore } from '@/stores/session'

const LoginView = defineAsyncComponent(() => import('./auth/Login.vue'))
const session = useSessionStore()
</script>
