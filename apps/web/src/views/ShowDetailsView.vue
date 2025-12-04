<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ShowDetailsSkeleton from '@/components/ShowDetailsSkeleton.vue'
import ShowHeader from '@/components/ShowHeader.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import ReviewsList from '@/components/ReviewsList.vue'
import ShowStats from '@/components/ShowStats.vue'
import { useAuthStore } from '@/stores/auth'
import type { ShowWithDetails, Review, PaginationInfo } from '@/types/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Loading / error state
const isLoading = ref(true)
const error = ref<string | null>(null)
const reviewLoading = ref(false)
const loadingMoreReviews = ref(false)

// Show and related state
const show = ref<ShowWithDetails | null>(null)
const reviews = ref<Review[]>([])
const reviewPagination = ref<PaginationInfo | null>(null)

// User status (from show response)
const isFavorite = ref(false)
const inWatchlist = ref(false)
const watchlistNote = ref<string | null>(null)
const userReview = ref<{ id: number; rating: number; comment: string | null } | null>(null)

// Watchlist note dialog
const showWatchlistDialog = ref(false)
const watchlistNoteInput = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id ?? null)

const fetchShow = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
        const res = await fetch(`/api/show/${id}`, {
            credentials: 'include',
        })
        if (!res.ok) throw new Error(`Failed to fetch show (${res.status})`)
        const data: ShowWithDetails = await res.json()
        show.value = data
        reviews.value = data.reviews

        // Set user status from response
        isFavorite.value = data.userStatus?.isFavorite ?? false
        inWatchlist.value = data.userStatus?.inWatchlist ?? false
        watchlistNote.value = data.userStatus?.watchlistNote ?? null
        userReview.value = data.userStatus?.userReview ?? null

        // Set initial pagination (we got first 10 reviews from show endpoint)
        reviewPagination.value = {
            page: 1,
            limit: 10,
            totalCount: data.reviewCount,
            totalPages: Math.ceil(data.reviewCount / 10),
            hasMore: data.reviewCount > 10,
        }
    } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : String(err)
        error.value = message
    } finally {
        isLoading.value = false
    }
}

const loadMoreReviews = async () => {
    if (!show.value || !reviewPagination.value?.hasMore) return

    loadingMoreReviews.value = true
    try {
        const nextPage = reviewPagination.value.page + 1
        const res = await fetch(`/api/reviews?showId=${show.value.id}&page=${nextPage}&limit=10`)
        if (!res.ok) throw new Error('Failed to load more reviews')

        const data = await res.json()
        reviews.value = [...reviews.value, ...data.reviews]
        reviewPagination.value = data.pagination
    } catch (err) {
        console.error('Failed to load more reviews:', err)
    } finally {
        loadingMoreReviews.value = false
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

// Re-fetch when auth state changes
watch(
    () => authStore.isAuthenticated,
    () => {
        const id = Number(route.params.id)
        if (id && !Number.isNaN(id)) fetchShow(id)
    }
)

const toggleFavorite = () => {
    if (!show.value || !isAuthenticated.value) {
        router.push('/login')
        return
    }

    // Toggle immediately for instant feedback
    const wasInFavorites = isFavorite.value
    isFavorite.value = !wasInFavorites

    // Send request in background
    const request = wasInFavorites
        ? fetch(`/api/favorites/${show.value.id}`, { method: 'DELETE', credentials: 'include' })
        : fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ showId: show.value.id }),
        })

    request.catch((err) => {
        // Revert on error
        console.error('Failed to update favorites:', err)
        isFavorite.value = wasInFavorites
    })
}

const toggleWatchlist = () => {
    if (!show.value || !isAuthenticated.value) {
        router.push('/login')
        return
    }

    if (inWatchlist.value) {
        // Remove immediately for instant feedback
        const wasInWatchlist = true
        const previousNote = watchlistNote.value
        inWatchlist.value = false
        watchlistNote.value = null

        // Send request in background
        fetch(`/api/watchlist/${show.value.id}`, { method: 'DELETE', credentials: 'include' }).catch((err) => {
            // Revert on error
            console.error('Failed to remove from watchlist:', err)
            inWatchlist.value = wasInWatchlist
            watchlistNote.value = previousNote
        })
    } else {
        // Show dialog to add with optional note
        watchlistNoteInput.value = ''
        showWatchlistDialog.value = true
    }
}

const addToWatchlist = () => {
    if (!show.value) return

    // Add immediately for instant feedback
    inWatchlist.value = true
    watchlistNote.value = watchlistNoteInput.value.trim() || null
    showWatchlistDialog.value = false

    // Send request in background
    fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            showId: show.value.id,
            note: watchlistNoteInput.value.trim() || undefined,
        }),
    }).catch((err) => {
        // Revert on error
        console.error('Failed to add to watchlist:', err)
        inWatchlist.value = false
        watchlistNote.value = null
    })
}

const submitReview = async (rating: number, comment: string) => {
    if (!show.value) return

    reviewLoading.value = true
    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                showId: show.value.id,
                rating,
                comment,
            }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to submit review')
        }

        const newReview = await res.json()
        // Add to beginning of reviews list
        reviews.value = [newReview, ...reviews.value]
        userReview.value = { id: newReview.id, rating: newReview.rating, comment: newReview.comment }
        if (reviewPagination.value) {
            reviewPagination.value.totalCount++
        }
        // Update show stats
        if (show.value) {
            show.value.reviewCount++
            // Recalculate average: (oldAvg * oldCount + newRating) / newCount
            const oldCount = show.value.reviewCount - 1
            const oldAvg = show.value.averageRating ?? 0
            show.value.averageRating = oldCount === 0
                ? rating
                : (oldAvg * oldCount + rating) / show.value.reviewCount
        }
    } catch (err) {
        console.error(err)
    } finally {
        reviewLoading.value = false
    }
}

const updateReview = async (reviewId: number, rating: number, comment: string) => {
    if (!show.value) return

    reviewLoading.value = true
    try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                showId: show.value.id,
                rating,
                comment,
            }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to update review')
        }

        const updatedReview = await res.json()
        // Update in reviews list
        const index = reviews.value.findIndex((r) => r.id === reviewId)
        const oldRating = index !== -1 ? reviews.value[index]?.rating ?? null : null
        if (index !== -1) {
            reviews.value[index] = updatedReview
        }
        userReview.value = { id: updatedReview.id, rating: updatedReview.rating, comment: updatedReview.comment }
        // Update average rating if rating changed
        if (show.value && oldRating !== null && oldRating !== rating) {
            const count = show.value.reviewCount
            const oldAvg = show.value.averageRating ?? 0
            // Remove old rating and add new: (oldAvg * count - oldRating + newRating) / count
            show.value.averageRating = (oldAvg * count - oldRating + rating) / count
        }
    } catch (err) {
        console.error(err)
    } finally {
        reviewLoading.value = false
    }
}

const deleteReview = async (reviewId: number) => {
    reviewLoading.value = true
    try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
            credentials: 'include',
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to delete review')
        }

        // Find the review to get its rating before removing
        const deletedReview = reviews.value.find((r) => r.id === reviewId)
        const deletedRating = deletedReview?.rating ?? 0

        // Remove from reviews list
        reviews.value = reviews.value.filter((r) => r.id !== reviewId)
        userReview.value = null
        if (reviewPagination.value) {
            reviewPagination.value.totalCount--
        }
        // Update show stats
        if (show.value) {
            const oldCount = show.value.reviewCount
            const oldAvg = show.value.averageRating ?? 0
            show.value.reviewCount--
            // Recalculate average: (oldAvg * oldCount - deletedRating) / newCount
            show.value.averageRating = show.value.reviewCount === 0
                ? 0
                : (oldAvg * oldCount - deletedRating) / show.value.reviewCount
        }
    } catch (err) {
        console.error(err)
    } finally {
        reviewLoading.value = false
    }
}

const likeReview = (reviewId: number) => {
    // TODO: Implement like functionality
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
                            <template #title>
                                {{ userReview ? 'Your Review' : 'Write Your Review' }}
                            </template>
                            <template #content>
                                <ReviewForm :is-authenticated="isAuthenticated" :existing-review="userReview"
                                    :loading="reviewLoading" @submit="submitReview" @update="updateReview"
                                    @delete="deleteReview" />
                            </template>
                        </Card>

                        <!-- User Reviews -->
                        <Card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span>User Reviews ({{ reviewPagination?.totalCount ?? reviews.length }})</span>
                                    <Button v-if="reviews.length > 0" label="Sort by: Most Recent" text size="small" />
                                </div>
                            </template>
                            <template #content>
                                <ReviewsList :reviews="reviews" :current-user-id="currentUserId"
                                    :pagination="reviewPagination" :loading-more="loadingMoreReviews"
                                    @likeReview="likeReview" @load-more="loadMoreReviews" />
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

                        <!-- Watchlist Note (if in watchlist) -->
                        <Card v-if="inWatchlist && watchlistNote">
                            <template #title>Your Watchlist Note</template>
                            <template #content>
                                <p class="text-gray-700 dark:text-gray-300">{{ watchlistNote }}</p>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Watchlist Dialog -->
    <Dialog v-model:visible="showWatchlistDialog" modal header="Add to Watchlist" :style="{ width: '400px' }">
        <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
                Add <strong>{{ show?.title }}</strong> to your watchlist
            </p>
            <div>
                <label class="block text-sm font-medium mb-2">Note (optional)</label>
                <Textarea v-model="watchlistNoteInput" rows="3" placeholder="e.g., Recommended by John, watch after..."
                    class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" severity="secondary" @click="showWatchlistDialog = false" />
            <Button label="Add to Watchlist" icon="pi pi-plus" @click="addToWatchlist" />
        </template>
    </Dialog>
</template>
