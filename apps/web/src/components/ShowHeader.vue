<script setup lang="ts">
import { computed } from 'vue'
import Rating from 'primevue/rating'
import Chip from 'primevue/chip'
import Button from 'primevue/button'

interface Props {
    title: string
    year: number | null
    seasons: number | null
    status: string | null
    averageRating: number
    reviewCount: number
    genres: string[]
    description: string | null
    creators: string[]
    cast: string[]
    posterPath: string | null
    isFavorite: boolean
    inWatchlist: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    toggleFavorite: []
    toggleWatchlist: []
    searchByName: [name: string]
}>()

const imageUrl = computed(() => `/show_images${props.posterPath ?? ''}`)
</script>

<template>
    <div class="flex flex-col md:flex-row gap-8">
        <!-- Show Poster -->
        <div class="flex-shrink-0">
            <img :src="imageUrl" :alt="title" class="w-full md:w-80 rounded-lg shadow-lg" />
        </div>

        <!-- Show Info -->
        <div class="flex-1">
            <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">{{ title }}</h1>

            <div class="flex flex-wrap gap-2 mb-4">
                <Chip :label="String(year ?? '')" />
                <Chip :label="`${seasons ?? 0} Seasons`" />
                <Chip :label="status ?? 'Unknown'" severity="success" />
            </div>

            <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2">
                    <Rating :modelValue="averageRating" readonly :cancel="false" />
                    <span class="text-2xl font-bold">{{ averageRating }}</span>
                </div>
                <span class="text-gray-600 dark:text-gray-400">{{ reviewCount }} reviews</span>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
                <Chip v-for="genre in genres" :key="genre" :label="genre" outlined />
            </div>

            <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{{ description }}</p>

            <div v-if="creators.length > 0" class="mb-4">
                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created by</h3>
                <p class="text-gray-800 dark:text-white">
                    <span v-for="(creator, index) in creators" :key="creator">
                        <button @click="emit('searchByName', creator)"
                            class="hover:text-indigo-600 hover:underline cursor-pointer transition-colors">
                            {{ creator }}
                        </button>
                        <span v-if="index < creators.length - 1">, </span>
                    </span>
                </p>
            </div>

            <div v-if="cast.length > 0" class="mb-6">
                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Starring</h3>
                <p class="text-gray-800 dark:text-white">
                    <span v-for="(actor, index) in cast" :key="actor">
                        <button @click="emit('searchByName', actor)"
                            class="hover:text-indigo-600 hover:underline cursor-pointer transition-colors">
                            {{ actor }}
                        </button>
                        <span v-if="index < cast.length - 1">, </span>
                    </span>
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <Button :label="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
                    :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
                    :severity="isFavorite ? 'danger' : 'secondary'" @click="emit('toggleFavorite')" />
                <Button :label="inWatchlist ? 'In Watchlist' : 'Add to Watchlist'"
                    :icon="inWatchlist ? 'pi pi-check' : 'pi pi-plus'" :outlined="!inWatchlist"
                    @click="emit('toggleWatchlist')" />
            </div>
        </div>
    </div>
</template>
