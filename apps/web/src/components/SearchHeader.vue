<script setup lang="ts">
interface Props {
    resultCount: number
    loading?: boolean
}

defineProps<Props>()
</script>

<template>
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Search TV Shows
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Find your next binge-worthy series
        </p>
        <div v-if="!loading" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ resultCount }} {{ resultCount === 1 ? 'result' : 'results' }} found
        </div>
    </div>
</template>
