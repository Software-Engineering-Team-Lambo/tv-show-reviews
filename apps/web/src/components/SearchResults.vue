<script setup lang="ts">
import ShowCard from './ShowCard.vue'
import type { ShowCardData } from '@/types/api'

interface Props {
    shows: ShowCardData[]
    loading?: boolean
}

defineProps<Props>()
</script>

<template>
    <div>
        <!-- Loading Skeletons -->
        <Transition enter-active-class="transition-opacity duration-300 ease-in"
            leave-active-class="transition-opacity duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="n in 8" :key="n" class="animate-pulse">
                    <div class="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div class="h-72 bg-gray-300 dark:bg-gray-600"></div>
                        <div class="p-4 space-y-3">
                            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div v-else-if="shows.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <TransitionGroup enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-200 ease-in" enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100" leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95">
                    <ShowCard v-for="(show, index) in shows" :key="show.id" :show="show" :show-description="true"
                        :style="{ transitionDelay: `${index * 30}ms` }" />
                </TransitionGroup>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16">
                <i class="pi pi-search text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No shows found
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters
                </p>
            </div>
        </Transition>
    </div>
</template>
