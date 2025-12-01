<script setup lang="ts">
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Divider from 'primevue/divider'
import type { Review } from '@/types/api'

interface Props {
    reviews: Review[]
}

defineProps<Props>()

const emit = defineEmits<{
    likeReview: [reviewId: number]
}>()
</script>

<template>
    <!-- Empty State -->
    <div v-if="reviews.length === 0" class="text-center py-12">
        <i class="pi pi-comments text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Reviews Yet</h3>
        <p class="text-gray-500 dark:text-gray-500">Be the first to share your thoughts about this show!</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
        <div v-for="(review, index) in reviews" :key="review.id">
            <div class="flex gap-4">
                <Avatar :label="review.username?.[0]?.toUpperCase() || 'U'" shape="circle"
                    class="bg-indigo-600 text-white" />

                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-white">{{ review.username }}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <Rating :modelValue="review.rating" readonly :cancel="false" class="text-sm" />
                                <span class="text-xs text-gray-600">{{ review.date }}</span>
                            </div>
                        </div>
                    </div>

                    <p class="text-gray-700 dark:text-gray-300 mb-3">{{ review.reviewText }}</p>

                    <div class="flex items-center gap-4">
                        <Button :label="`Helpful (${review.likes})`" icon="pi pi-thumbs-up" text size="small"
                            @click="emit('likeReview', review.id)" />
                        <Button label="Report" icon="pi pi-flag" text severity="secondary" size="small" />
                    </div>
                </div>
            </div>

            <Divider v-if="index < reviews.length - 1" />
        </div>
    </div>
</template>
