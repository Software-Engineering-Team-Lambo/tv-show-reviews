<script setup lang="ts">
import type { ProfileReview, ProfileFavorite, ProfileWatchlistItem, ProfilePagination, ProfileStats } from '@/types/api'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ProfileReviewsList from './ProfileReviewsList.vue'
import ProfileShowGrid from './ProfileShowGrid.vue'

interface Props {
    reviews: ProfileReview[]
    favorites: ProfileFavorite[]
    watchlist: ProfileWatchlistItem[]
    stats: ProfileStats
    pagination: ProfilePagination | null
    loadingMore: { reviews: boolean; favorites: boolean; watchlist: boolean }
    isOwnProfile?: boolean
}

withDefaults(defineProps<Props>(), {
    isOwnProfile: false,
})

const emit = defineEmits<{
    loadMoreReviews: []
    loadMoreFavorites: []
    loadMoreWatchlist: []
}>()
</script>

<template>
    <TabView>
        <!-- Reviews Tab -->
        <TabPanel value="reviews">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-star"></i>
                    <span>{{ isOwnProfile ? 'My Reviews' : 'Reviews' }} ({{ stats.reviewsCount }})</span>
                </div>
            </template>
            <ProfileReviewsList :reviews="reviews" />
            <div v-if="pagination?.reviews.hasMore" class="text-center mt-6">
                <Button label="Load More Reviews" icon="pi pi-chevron-down" severity="secondary" outlined
                    :loading="loadingMore.reviews" @click="emit('loadMoreReviews')" />
            </div>
            <div v-if="reviews.length > 0 && pagination"
                class="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Showing {{ reviews.length }} of {{ pagination.reviews.totalCount }} reviews
            </div>
        </TabPanel>

        <!-- Favorites Tab -->
        <TabPanel value="favorites">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-heart-fill"></i>
                    <span>Favorites ({{ stats.favoritesCount }})</span>
                </div>
            </template>
            <ProfileShowGrid :items="favorites" type="favorites" empty-icon="pi pi-heart" empty-title="No favorites yet"
                :empty-message="isOwnProfile ? 'Add shows to your favorites to see them here' : 'This user hasn\'t added any favorites yet'" />
            <div v-if="pagination?.favorites.hasMore" class="text-center mt-6">
                <Button label="Load More Favorites" icon="pi pi-chevron-down" severity="secondary" outlined
                    :loading="loadingMore.favorites" @click="emit('loadMoreFavorites')" />
            </div>
            <div v-if="favorites.length > 0 && pagination"
                class="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Showing {{ favorites.length }} of {{ pagination.favorites.totalCount }} favorites
            </div>
        </TabPanel>

        <!-- Watchlist Tab -->
        <TabPanel value="watchlist">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-bookmark"></i>
                    <span>Watchlist ({{ stats.watchlistCount }})</span>
                </div>
            </template>
            <ProfileShowGrid :items="watchlist" type="watchlist" empty-icon="pi pi-bookmark"
                :empty-title="isOwnProfile ? 'Your watchlist is empty' : 'Empty watchlist'"
                :empty-message="isOwnProfile ? 'Save shows you want to watch later' : 'This user hasn\'t added any shows to their watchlist'" />
            <div v-if="pagination?.watchlist.hasMore" class="text-center mt-6">
                <Button label="Load More" icon="pi pi-chevron-down" severity="secondary" outlined
                    :loading="loadingMore.watchlist" @click="emit('loadMoreWatchlist')" />
            </div>
            <div v-if="watchlist.length > 0 && pagination"
                class="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Showing {{ watchlist.length }} of {{ pagination.watchlist.totalCount }} items
            </div>
        </TabPanel>
    </TabView>
</template>
