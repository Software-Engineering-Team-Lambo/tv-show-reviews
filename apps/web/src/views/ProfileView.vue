<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { UserProfile, ProfileStats } from '../types/api'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileReviewsList from '@/components/profile/ProfileReviewsList.vue'
import ProfileShowGrid from '@/components/profile/ProfileShowGrid.vue'
import EditUsernameDialog from '@/components/profile/EditUsernameDialog.vue'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton.vue'

const router = useRouter()
const authStore = useAuthStore()

// User data
const user = ref<UserProfile | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

// Edit username dialog
const showEditDialog = ref(false)

// Computed stats
const stats = computed<ProfileStats>(() => ({
    reviewsCount: user.value?.reviews?.length || 0,
    favoritesCount: user.value?.favorites?.length || 0,
    watchlistCount: user.value?.watchlist?.length || 0
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
    } catch (error) {
        console.error('Failed to fetch profile:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Failed to load profile. Please try again.'
    } finally {
        loading.value = false
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
                <ProfileHeader :user="user" :stats="stats" @edit="showEditDialog = true" @logout="handleLogout" />

                <!-- Tabs -->
                <TabView>
                    <!-- Reviews Tab -->
                    <TabPanel value="reviews">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-star"></i>
                                <span>My Reviews ({{ stats.reviewsCount }})</span>
                            </div>
                        </template>
                        <ProfileReviewsList :reviews="user.reviews" />
                    </TabPanel>

                    <!-- Favorites Tab -->
                    <TabPanel value="favorites">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-heart-fill"></i>
                                <span>Favorites ({{ stats.favoritesCount }})</span>
                            </div>
                        </template>
                        <ProfileShowGrid :items="user.favorites" type="favorites" empty-icon="pi pi-heart"
                            empty-title="No favorites yet"
                            empty-message="Add shows to your favorites to see them here" />
                    </TabPanel>

                    <!-- Watchlist Tab -->
                    <TabPanel value="watchlist">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-bookmark"></i>
                                <span>Watchlist ({{ stats.watchlistCount }})</span>
                            </div>
                        </template>
                        <ProfileShowGrid :items="user.watchlist" type="watchlist" empty-icon="pi pi-bookmark"
                            empty-title="Your watchlist is empty" empty-message="Save shows you want to watch later" />
                    </TabPanel>
                </TabView>
            </div>

            <!-- Edit Username Dialog -->
            <EditUsernameDialog v-model:visible="showEditDialog" :current-username="user?.username ?? ''"
                @updated="handleUsernameUpdated" />
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for tabs */
:deep(.p-tabview-panels) {
    padding: 1.5rem 0;
}
</style>