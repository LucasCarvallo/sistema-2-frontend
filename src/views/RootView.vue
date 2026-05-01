<template>
  <HomeView v-if="session.user" />
  <LoginView v-else />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import HomeView from './HomeView.vue'
import { useSessionStore } from '@/stores/session'

const LoginView = defineAsyncComponent(() => import('./Login.vue'))
const session = useSessionStore()
</script>
