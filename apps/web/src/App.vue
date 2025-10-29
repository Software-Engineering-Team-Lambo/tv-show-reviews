<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()

// Don't show header on login page
const showHeader = computed(() => route.name !== 'login')
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
