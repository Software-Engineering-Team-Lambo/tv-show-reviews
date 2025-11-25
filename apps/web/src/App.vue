<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Don't show header on login page
const showHeader = computed(() => route.name !== 'login')

// Check authentication status on app load
onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader v-if="showHeader" />
    <RouterView />
  </div>
</template>

<style scoped>
/* App-specific styles can go here if needed */
</style>
