<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import type { ShowCardData } from '@/types/api'

interface Props {
    show: ShowCardData
    showDescription?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showDescription: false,
})

const router = useRouter()

const navigateToShow = () => {
    router.push({ name: 'show-details', params: { id: props.show.id } })
}

// Format genres for display
const genreDisplay = computed(() => {
    return props.show.genre.join(', ')
})

// Get placeholder image if none provided
const displayImage = computed(() => {
    return `show_images${props.show.image}`
})
</script>

<template>
    <Card class="hover:shadow-xl transition-shadow cursor-pointer">
        <template #header>
            <img :src="displayImage" :alt="show.title" class="w-full object-cover" @click="navigateToShow" />
        </template>
        <template #title>
            <div class="text-lg font-semibold hover:text-indigo-600 cursor-pointer" @click="navigateToShow">
                {{ show.title }}
            </div>
        </template>
        <template #subtitle>
            <div class="space-y-1">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                    <template v-if="show.year">{{ show.year }} • </template>{{ genreDisplay }}
                </div>
                <div class="flex items-center gap-2">
                    <Rating :modelValue="show.rating" readonly :cancel="false" class="text-sm" />
                    <span class="text-sm font-semibold">{{ show.rating.toFixed(1) }}</span>
                </div>
            </div>
        </template>
        <template #content>
            <p v-if="showDescription && show.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ show.description }}
            </p>
            <div class="text-xs text-gray-500" :class="{ 'mt-2': showDescription }">
                {{ show.reviews }} {{ show.reviews === 1 ? 'review' : 'reviews' }}
            </div>
        </template>
        <template #footer>
            <Button label="View Details" icon="pi pi-arrow-right" iconPos="right" text class="w-full"
                @click="navigateToShow" />
        </template>
    </Card>
</template>
