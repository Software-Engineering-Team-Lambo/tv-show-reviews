<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { UserProfile, ProfileStats, ProfilePagination, ProfileReview, ProfileFavorite, ProfileWatchlistItem } from '../types/api'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileTabs from '@/components/profile/ProfileTabs.vue'
import EditUsernameDialog from '@/components/profile/EditUsernameDialog.vue'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton.vue'

const router = useRouter()
const authStore = useAuthStore()

// User data
const user = ref<UserProfile | null>(null)
const loading = ref(true)
const loadingMore = ref({ reviews: false, favorites: false, watchlist: false })
const errorMessage = ref('')
const successMessage = ref('')

// Pagination
const pagination = ref<ProfilePagination | null>(null)
const allReviews = ref<ProfileReview[]>([])
const allFavorites = ref<ProfileFavorite[]>([])
const allWatchlist = ref<ProfileWatchlistItem[]>([])

// Edit username dialog
const showEditDialog = ref(false)

// Computed stats (use pagination totals when available)
const stats = computed<ProfileStats>(() => ({
    reviewsCount: pagination.value?.reviews.totalCount ?? allReviews.value.length,
    favoritesCount: pagination.value?.favorites.totalCount ?? allFavorites.value.length,
    watchlistCount: pagination.value?.watchlist.totalCount ?? allWatchlist.value.length
}))

// Fetch profile data
const fetchProfile = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        })

        if (!response.ok) {
            if (response.status === 401) {
                errorMessage.value = 'Please log in to view your profile'
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
                return
            }
            throw new Error('Failed to load profile')
        }

        const data = await response.json()
        user.value = data.user
        pagination.value = data.pagination
        allReviews.value = data.user.reviews
        allFavorites.value = data.user.favorites
        allWatchlist.value = data.user.watchlist
    } catch (error) {
        console.error('Failed to fetch profile:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Failed to load profile. Please try again.'
    } finally {
        loading.value = false
    }
}

// Load more functions for each tab
const loadMoreReviews = async () => {
    if (!pagination.value?.reviews.hasMore) return
    loadingMore.value.reviews = true

    try {
        const nextPage = pagination.value.reviews.page + 1
        const response = await fetch(`/api/profile?reviewsPage=${nextPage}&tab=reviews`, {
            credentials: 'include'
        })

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
    if (!pagination.value?.favorites.hasMore) return
    loadingMore.value.favorites = true

    try {
        const nextPage = pagination.value.favorites.page + 1
        const response = await fetch(`/api/profile?favoritesPage=${nextPage}&tab=favorites`, {
            credentials: 'include'
        })

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
    if (!pagination.value?.watchlist.hasMore) return
    loadingMore.value.watchlist = true

    try {
        const nextPage = pagination.value.watchlist.page + 1
        const response = await fetch(`/api/profile?watchlistPage=${nextPage}&tab=watchlist`, {
            credentials: 'include'
        })

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

// Handle username update from dialog
const handleUsernameUpdated = (newUsername: string) => {
    if (user.value) {
        user.value.username = newUsername
    }
    successMessage.value = 'Username updated successfully!'
    setTimeout(() => {
        successMessage.value = ''
    }, 3000)
}

// Logout
const handleLogout = async () => {
    try {
        await authStore.logout()
        router.push('/login')
    } catch (error) {
        console.error('Logout failed:', error)
        errorMessage.value = 'Failed to logout'
    }
}

onMounted(() => {
    fetchProfile()
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div class="container mx-auto px-4 max-w-6xl">

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <Button icon="pi pi-arrow-left" label="Back to Home" text @click="router.push('/')" />
                <h1 class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    My Profile
                </h1>
                <div class="w-32"></div>
            </div>

            <!-- Messages -->
            <Message v-if="successMessage" severity="success" :closable="true" @close="successMessage = ''"
                class="mb-4">
                {{ successMessage }}
            </Message>

            <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = ''" class="mb-4">
                {{ errorMessage }}
            </Message>

            <!-- Loading State -->
            <ProfileSkeleton v-if="loading" />

            <!-- Profile Content -->
            <div v-else-if="user" class="space-y-6">

                <!-- Profile Header Card -->
                <ProfileHeader :username="user.username" :email="user.email" :created-at="user.createdAt" :stats="stats"
                    :is-own-profile="true" @edit="showEditDialog = true" @logout="handleLogout" />

                <!-- Tabs -->
                <ProfileTabs :reviews="allReviews" :favorites="allFavorites" :watchlist="allWatchlist" :stats="stats"
                    :pagination="pagination" :loading-more="loadingMore" :is-own-profile="true"
                    @load-more-reviews="loadMoreReviews" @load-more-favorites="loadMoreFavorites"
                    @load-more-watchlist="loadMoreWatchlist" />
            </div>

            <!-- Edit Username Dialog -->
            <EditUsernameDialog v-model:visible="showEditDialog" :current-username="user?.username ?? ''"
                @updated="handleUsernameUpdated" />
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for tabs */
:deep(.p-tabpanels) {
    padding: 1.5rem 0;
}
</style>