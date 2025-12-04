<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Divider from 'primevue/divider'
import type { Review, PaginationInfo } from '@/types/api'

interface Props {
    reviews: Review[]
    currentUserId?: number | null
    pagination?: PaginationInfo | null
    loadingMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    currentUserId: null,
    pagination: null,
    loadingMore: false,
})

const emit = defineEmits<{
    likeReview: [reviewId: number]
    loadMore: []
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const canLoadMore = computed(() => props.pagination?.hasMore ?? false)

const navigateToUserProfile = (username: string | undefined) => {
    if (username) {
        router.push({ name: 'user-profile', params: { username } })
    }
}
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
                    class="bg-indigo-600 text-white cursor-pointer hover:opacity-80 transition-opacity"
                    @click="navigateToUserProfile(review.username)" />

                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    @click="navigateToUserProfile(review.username)">
                                    {{ review.username }}
                                </h4>
                                <span v-if="review.userId === currentUserId"
                                    class="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded">
                                    You
                                </span>
                            </div>
                            <div class="flex items-center gap-2 mt-1">
                                <Rating :modelValue="review.rating" readonly :cancel="false" class="text-sm" />
                                <span class="text-xs text-gray-600">{{ formatDate(review.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <p class="text-gray-700 dark:text-gray-300 mb-3">{{ review.reviewText || review.comment }}</p>

                    <div class="flex items-center gap-4">
                        <Button :label="`Helpful (${review.likes || 0})`" icon="pi pi-thumbs-up" text size="small"
                            @click="emit('likeReview', review.id)" />
                        <Button v-if="review.userId !== currentUserId" label="Report" icon="pi pi-flag" text
                            severity="secondary" size="small" />
                    </div>
                </div>
            </div>

            <Divider v-if="index < reviews.length - 1" />
        </div>

        <!-- Load More Button -->
        <div v-if="canLoadMore" class="text-center pt-4">
            <Button label="Load More Reviews" icon="pi pi-chevron-down" severity="secondary" outlined
                :loading="loadingMore" @click="emit('loadMore')" />
        </div>
    </div>
</template>
