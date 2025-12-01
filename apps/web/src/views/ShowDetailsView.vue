<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ShowDetailsSkeleton from '@/components/ShowDetailsSkeleton.vue'
import ShowHeader from '@/components/ShowHeader.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import ReviewsList from '@/components/ReviewsList.vue'
import ShowStats from '@/components/ShowStats.vue'
import type { ShowWithDetails, Review } from '@/types/api'

const route = useRoute()
const router = useRouter()

// Loading / error state
const isLoading = ref(true)
const error = ref<string | null>(null)

// Show and related state
const show = ref<ShowWithDetails | null>(null)
const isFavorite = ref(false)
const inWatchlist = ref(false)
const reviews = ref<Review[]>([])

const fetchShow = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
        const res = await fetch(`/api/show/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`)
        const data: ShowWithDetails = await res.json()
        show.value = data
        reviews.value = data.reviews
    } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : String(err)
        error.value = message
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    const idParam = route.params.id
    const id = Number(idParam)
    if (!id || Number.isNaN(id)) {
        error.value = 'Invalid show id'
        isLoading.value = false
        return
    }
    void fetchShow(id)
})

watch(
    () => route.params.id,
    (newId) => {
        const id = Number(newId)
        if (id && !Number.isNaN(id)) fetchShow(id)
    }
)

const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value
    // TODO: Call API to add/remove from favorites
}

const toggleWatchlist = () => {
    inWatchlist.value = !inWatchlist.value
    // TODO: Call API to add/remove from watchlist
}

const submitReview = (rating: number, review: string) => {
    // TODO: Call API to submit review
    console.log('Submit review:', { rating, review })
}

const likeReview = (reviewId: number) => {
    // TODO: Call API to like review
    console.log('Like review:', reviewId)
}

const searchByName = (name: string) => {
    router.push({ name: 'search', query: { q: name } })
}
</script>

<template>
    <ShowDetailsSkeleton v-if="isLoading" />
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <div v-if="error" class="py-24 text-center text-red-500">{{ error }}</div>
            <div v-else>
                <!-- Show Header -->
                <Card class="mb-8">
                    <template #content>
                        <ShowHeader v-if="show" :title="show.title" :year="show.year" :seasons="show.seasons"
                            :status="show.status" :averageRating="show.averageRating" :reviewCount="show.reviewCount"
                            :genres="show.genres" :description="show.description" :creators="show.creators"
                            :cast="show.cast" :posterPath="show.posterPath" :isFavorite="isFavorite"
                            :inWatchlist="inWatchlist" @toggleFavorite="toggleFavorite"
                            @toggleWatchlist="toggleWatchlist" @searchByName="searchByName" />
                    </template>
                </Card>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Reviews Section -->
                    <div class="lg:col-span-2">
                        <!-- Write Review Card -->
                        <Card class="mb-6">
                            <template #title>Write Your Review</template>
                            <template #content>
                                <ReviewForm @submit="submitReview" />
                            </template>
                        </Card>

                        <!-- User Reviews -->
                        <Card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span>User Reviews ({{ reviews.length }})</span>
                                    <Button v-if="reviews.length > 0" label="Sort by: Most Helpful" text size="small" />
                                </div>
                            </template>
                            <template #content>
                                <ReviewsList :reviews="reviews" @likeReview="likeReview" />
                            </template>
                        </Card>
                    </div>

                    <!-- Sidebar -->
                    <div class="space-y-6">
                        <!-- Quick Stats -->
                        <Card>
                            <template #title>Stats</template>
                            <template #content>
                                <ShowStats v-if="show" :reviewCount="show.reviewCount"
                                    :averageRating="show.averageRating" :status="show.status" />
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
