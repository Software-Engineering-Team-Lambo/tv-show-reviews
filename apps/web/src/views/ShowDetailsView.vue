<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import Avatar from 'primevue/avatar'


const router = useRouter()
const route = useRoute()

type RawReview = {
    id: number
    rating: number
    reviewText?: string
    comment?: string
    userId: number
    date?: string
    likes?: number
}

const imageUrl = computed(() => {
    return `/show_images${show.value.posterPath}`
})

// Loading / error state
const isLoading = ref(true)
const error = ref<string | null>(null)

// Show and related state
import type { ShowWithDetails, Review } from '@/types/api'

const show = ref<ShowWithDetails | null>(null)
const isFavorite = ref(false)
const inWatchlist = ref(false)
const userRating = ref(0)
const userReview = ref('')
const reviews = ref<Review[]>([])

const fetchShow = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
        const res = await fetch(`/api/show/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`)
        const data = await res.json()
        // Map backend shape to view model
        show.value = {
            id: data.id,
            title: data.title,
            year: data.year,
            description: data.description,
            seasons: data.seasons,
            status: data.status,
            posterPath: data.posterPath ?? data.image ?? null,
            createdAt: data.createdAt ?? new Date().toISOString(),
            updatedAt: data.updatedAt ?? new Date().toISOString(),
            genres: (data.genres || []).map((name: string) => ({ genre: { id: 0, name } })),
            // backend returns an array of actor names (top 15); keep as strings for display
            cast: (data.cast || []),
            creators: (data.creators || []),

            reviews: (data.reviews || []).map((r: RawReview) => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.reviewText ?? r.comment ?? null,
                    userId: r.userId,
                    showId: data.id,
                    createdAt: r.date ?? new Date().toISOString(),
                    updatedAt: r.date ?? new Date().toISOString(),
                })),
            averageRating: data.rating ?? 0,
            reviewCount: data.totalReviews ?? (data.reviews?.length ?? 0),
        }

        reviews.value = (data.reviews || []).map((r: RawReview) => ({
            id: r.id,
            rating: r.rating,
            comment: r.reviewText ?? null,
            userId: r.userId,
            showId: data.id,
            createdAt: r.date ?? new Date().toISOString(),
            updatedAt: r.date ?? new Date().toISOString(),
        }))
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

const submitReview = () => {
    // TODO: Call API to submit review
    if (!userRating.value || !userReview.value.trim()) return
    console.log('Submit review:', { rating: userRating.value, review: userReview.value })
    userReview.value = ''
    userRating.value = 0
}

const likeReview = (reviewId: number) => {
    // TODO: Call API to like review
    console.log('Like review:', reviewId)
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <div v-if="isLoading" class="py-24 text-center text-gray-600">Loading show...</div>
            <div v-else-if="error" class="py-24 text-center text-red-500">{{ error }}</div>
            <div v-else>
                <!-- Show Header -->
                <Card class="mb-8">
                    <template #content>
                        <div class="flex flex-col md:flex-row gap-8">
                            <!-- Show Poster -->
                            <div class="flex-shrink-0">
                                <img :src="imageUrl" :alt="show?.title" class="w-full md:w-80 rounded-lg shadow-lg" />
                            </div>

                            <!-- Show Info -->
                            <div class="flex-1">
                                <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">{{ show?.title }}</h1>

                                <div class="flex flex-wrap gap-2 mb-4">
                                    <Chip :label="String(show?.year ?? '')" />
                                    <Chip :label="`${show?.seasons ?? 0} Seasons`" />
                                    <Chip :label="show?.status" severity="success" />
                                </div>

                                <div class="flex items-center gap-4 mb-4">
                                    <div class="flex items-center gap-2">
                                        <Rating :modelValue="show?.averageRating ?? show?.rating" readonly :cancel="false" />
                                        <span class="text-2xl font-bold">{{ show?.averageRating ?? show?.rating ?? 0 }}</span>
                                    </div>
                                    <span class="text-gray-600 dark:text-gray-400">{{ show?.reviewCount ?? show?.totalReviews ?? 0 }} reviews</span>
                                </div>

                                <div class="flex flex-wrap gap-2 mb-6">
                                    <Chip v-for="genre in (show?.genres || [])" :key="genre.genre?.name ?? genre" :label="genre.genre?.name ?? genre" outlined />
                                </div>

                                <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{{ show?.description }}</p>

                                <div class="mb-4">
                                    <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created by</h3>
                                    <p class="text-gray-800 dark:text-white">{{ (show?.creators || []).join(', ') }}</p>
                                </div>

                                <div class="mb-6">
                                    <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Starring</h3>
                                    <p class="text-gray-800 dark:text-white">{{ (show?.cast || []).map(c => c.actor?.name ?? c).join(', ') }}</p>
                                </div>

                                <!-- Action Buttons -->
                                <div class="flex gap-3">
                                    <Button :label="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'" :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'" :severity="isFavorite ? 'danger' : 'secondary'" @click="toggleFavorite" />
                                    <Button :label="inWatchlist ? 'In Watchlist' : 'Add to Watchlist'" :icon="inWatchlist ? 'pi pi-check' : 'pi pi-plus'" :outlined="!inWatchlist" @click="toggleWatchlist" />
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Reviews Section -->
                    <div class="lg:col-span-2">
                        <!-- Write Review Card -->
                        <Card class="mb-6">
                            <template #title>Write Your Review</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Your Rating</label>
                                        <Rating v-model="userRating" :cancel="false" />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium mb-2">Your Review</label>
                                        <Textarea v-model="userReview" rows="4" placeholder="Share your thoughts about this show..." class="w-full" />
                                    </div>

                                    <Button label="Submit Review" icon="pi pi-send" @click="submitReview" :disabled="!userRating || !userReview.trim()" />
                                </div>
                            </template>
                        </Card>

                        <!-- User Reviews -->
                        <Card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span>User Reviews ({{ reviews.length }})</span>
                                    <Button label="Sort by: Most Helpful" text size="small" />
                                </div>
                            </template>
                            <template #content>
                                <div class="space-y-6">
                                    <div v-for="(review, index) in reviews" :key="review.id">
                                        <div class="flex gap-4">
                                            <Avatar :label="review.username?.[0]?.toUpperCase() || 'U'" shape="circle" class="bg-indigo-600 text-white" />

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
                                                    <Button :label="`Helpful (${review.likes})`" icon="pi pi-thumbs-up" text size="small" @click="likeReview(review.id)" />
                                                    <Button label="Report" icon="pi pi-flag" text severity="secondary" size="small" />
                                                </div>
                                            </div>
                                        </div>

                                        <Divider v-if="index < reviews.length - 1" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <!-- Sidebar -->
                    <div class="space-y-6">
                        <!-- Similar Shows -->
                        <!-- <Card>
                            <template #title>Similar Shows</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div v-for="similarShow in [ { id: 2, title: 'Better Call Saul', rating: 4.7 }, { id: 3, title: 'The Sopranos', rating: 4.8 }, { id: 4, title: 'The Wire', rating: 4.9 } ]" :key="similarShow.id" class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition" @click="router.push({ name: 'show-details', params: { id: similarShow.id } })">
                                        <div class="w-12 h-16 bg-gray-300 rounded"></div>
                                        <div class="flex-1">
                                            <div class="font-semibold text-sm">{{ similarShow.title }}</div>
                                            <div class="flex items-center gap-1 text-xs text-gray-600"><i class="pi pi-star-fill text-yellow-500"></i><span>{{ similarShow.rating }}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card> -->

                        <!-- Quick Stats -->
                        <Card>
                            <template #title>Stats</template>
                            <template #content>
                                <div class="space-y-3">
                                    <div class="flex justify-between"><span class="text-gray-600">Total Reviews</span><span class="font-semibold">{{ show?.reviewCount ?? show?.totalReviews ?? 0 }}</span></div>
                                    <div class="flex justify-between"><span class="text-gray-600">Average Rating</span><span class="font-semibold">{{ show?.averageRating ?? show?.rating ?? 0 }}/5</span></div>
                                    <div class="flex justify-between"><span class="text-gray-600">Status</span><Chip :label="show?.status" size="small" severity="success" /></div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
