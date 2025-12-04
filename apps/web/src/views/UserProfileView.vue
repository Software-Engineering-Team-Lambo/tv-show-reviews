<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ProfilePagination, ProfileReview, ProfileFavorite, ProfileWatchlistItem, ProfileStats } from '../types/api'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileTabs from '@/components/profile/ProfileTabs.vue'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton.vue'

interface PublicUser {
    id: number
    username: string
    createdAt: string
    reviews: ProfileReview[]
    favorites: ProfileFavorite[]
    watchlist: ProfileWatchlistItem[]
}

const route = useRoute()
const router = useRouter()

// User data
const user = ref<PublicUser | null>(null)
const loading = ref(true)
const loadingMore = ref({ reviews: false, favorites: false, watchlist: false })
const errorMessage = ref('')

// Pagination
const pagination = ref<ProfilePagination | null>(null)
const allReviews = ref<ProfileReview[]>([])
const allFavorites = ref<ProfileFavorite[]>([])
const allWatchlist = ref<ProfileWatchlistItem[]>([])

// Stats
const stats = computed<ProfileStats>(() => ({
    reviewsCount: pagination.value?.reviews.totalCount ?? allReviews.value.length,
    favoritesCount: pagination.value?.favorites.totalCount ?? allFavorites.value.length,
    watchlistCount: pagination.value?.watchlist.totalCount ?? allWatchlist.value.length
}))

// Fetch user profile
const fetchUser = async (username: string) => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}`)

        if (!response.ok) {
            if (response.status === 404) {
                errorMessage.value = 'User not found'
                return
            }
            throw new Error('Failed to load user profile')
        }

        const data = await response.json()
        user.value = data.user
        pagination.value = data.pagination
        allReviews.value = data.user.reviews
        allFavorites.value = data.user.favorites
        allWatchlist.value = data.user.watchlist
    } catch (error) {
        console.error('Failed to fetch user profile:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Failed to load user profile'
    } finally {
        loading.value = false
    }
}

// Load more functions for each tab
const loadMoreReviews = async () => {
    if (!pagination.value?.reviews.hasMore || !user.value) return
    loadingMore.value.reviews = true

    try {
        const nextPage = pagination.value.reviews.page + 1
        const response = await fetch(`/api/users/${encodeURIComponent(user.value.username)}?reviewsPage=${nextPage}&tab=reviews`)

        if (!response.ok) throw new Error('Failed to load more reviews')

        const data = await response.json()
        allReviews.value = [...allReviews.value, ...data.user.reviews]
        pagination.value = {
            ...pagination.value,
            reviews: data.pagination.reviews
        }
    } catch (error) {
        console.error('Failed to load more reviews:', error)
    } finally {
        loadingMore.value.reviews = false
    }
}

const loadMoreFavorites = async () => {
    if (!pagination.value?.favorites.hasMore || !user.value) return
    loadingMore.value.favorites = true

    try {
        const nextPage = pagination.value.favorites.page + 1
        const response = await fetch(`/api/users/${encodeURIComponent(user.value.username)}?favoritesPage=${nextPage}&tab=favorites`)

        if (!response.ok) throw new Error('Failed to load more favorites')

        const data = await response.json()
        allFavorites.value = [...allFavorites.value, ...data.user.favorites]
        pagination.value = {
            ...pagination.value,
            favorites: data.pagination.favorites
        }
    } catch (error) {
        console.error('Failed to load more favorites:', error)
    } finally {
        loadingMore.value.favorites = false
    }
}

const loadMoreWatchlist = async () => {
    if (!pagination.value?.watchlist.hasMore || !user.value) return
    loadingMore.value.watchlist = true

    try {
        const nextPage = pagination.value.watchlist.page + 1
        const response = await fetch(`/api/users/${encodeURIComponent(user.value.username)}?watchlistPage=${nextPage}&tab=watchlist`)

        if (!response.ok) throw new Error('Failed to load more watchlist items')

        const data = await response.json()
        allWatchlist.value = [...allWatchlist.value, ...data.user.watchlist]
        pagination.value = {
            ...pagination.value,
            watchlist: data.pagination.watchlist
        }
    } catch (error) {
        console.error('Failed to load more watchlist items:', error)
    } finally {
        loadingMore.value.watchlist = false
    }
}

onMounted(() => {
    const username = route.params.username as string
    if (username) {
        fetchUser(username)
    } else {
        errorMessage.value = 'No username provided'
        loading.value = false
    }
})

// Watch for username changes
watch(() => route.params.username, (newUsername) => {
    if (newUsername && typeof newUsername === 'string') {
        fetchUser(newUsername)
    }
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div class="container mx-auto px-4 max-w-6xl">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <Button icon="pi pi-arrow-left" label="Back" text @click="router.back()" />
                <h1 class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    User Profile
                </h1>
                <div class="w-24"></div>
            </div>

            <!-- Error Message -->
            <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
                {{ errorMessage }}
            </Message>

            <!-- Loading State -->
            <ProfileSkeleton v-if="loading" />

            <!-- User Profile Content -->
            <div v-else-if="user" class="space-y-6">

                <!-- Profile Header Card -->
                <ProfileHeader :username="user.username" :created-at="user.createdAt" :stats="stats" />

                <!-- Tabs -->
                <ProfileTabs :reviews="allReviews" :favorites="allFavorites" :watchlist="allWatchlist" :stats="stats"
                    :pagination="pagination" :loading-more="loadingMore" @load-more-reviews="loadMoreReviews"
                    @load-more-favorites="loadMoreFavorites" @load-more-watchlist="loadMoreWatchlist" />
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for tabs */
:deep(.p-tabpanels) {
    padding: 1.5rem 0;
}
</style>
