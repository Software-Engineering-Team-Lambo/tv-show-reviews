<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ProfileReview } from '@/types/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'

defineProps<{
    reviews: ProfileReview[]
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getPosterUrl = (posterPath: string | null) => {
    return `/show_images${posterPath}`
}

const navigateToShow = (showId: number) => {
    router.push(`/show/${showId}`)
}
</script>

<template>
    <div class="space-y-4">
        <!-- Review Cards -->
        <Card v-for="review in reviews" :key="review.id" class="hover:shadow-lg transition-shadow">
            <template #content>
                <div class="flex gap-4">
                    <!-- Show Poster -->
                    <img :src="getPosterUrl(review.show.posterPath)" :alt="review.show.title"
                        class="w-24 h-36 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        @click="navigateToShow(review.show.id)" />

                    <!-- Review Content -->
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800 dark:text-white hover:text-indigo-600 cursor-pointer transition-colors"
                                    @click="navigateToShow(review.show.id)">
                                    {{ review.show.title }}
                                </h3>
                                <div class="flex items-center gap-3 mt-2">
                                    <Rating :modelValue="review.rating" readonly :cancel="false" />
                                    <span class="text-sm text-gray-500">
                                        {{ formatDate(review.createdAt) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p v-if="review.comment" class="text-gray-700 dark:text-gray-300 mt-3">
                            {{ review.comment }}
                        </p>
                        <p v-else class="text-gray-400 dark:text-gray-500 italic mt-3">
                            No comment provided
                        </p>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Empty State -->
        <div v-if="reviews.length === 0" class="text-center py-16">
            <i class="pi pi-star text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No reviews yet
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
                Start reviewing your favorite TV shows!
            </p>
            <Button label="Browse Shows" icon="pi pi-search" @click="router.push('/')" />
        </div>
    </div>
</template>
