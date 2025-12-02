<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Rating from 'primevue/rating'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'

const router = useRouter()
const authStore = useAuthStore()

// User data
const user = ref<any>(null)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

// Edit username dialog
const showEditDialog = ref(false)
const editUsername = ref('')
const editLoading = ref(false)
const editError = ref('')

// Computed stats
const stats = computed(() => ({
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

    } catch (error: any) {
        console.error('Failed to fetch profile:', error)
        errorMessage.value = error.message || 'Failed to load profile. Please try again.'
    } finally {
        loading.value = false
    }
}

// Format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Get initials for avatar
const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || 'U'
}

// Navigate to show details
const navigateToShow = (showId: number) => {
    router.push(`/show/${showId}`)
}

// Open edit dialog
const openEditDialog = () => {
    editUsername.value = user.value.username
    editError.value = ''
    showEditDialog.value = true
}

// Validate username
const validateUsername = (value: string): boolean => {
    editError.value = ''

    if (!value) {
        editError.value = 'Username is required'
        return false
    }
    if (value.length < 4) {
        editError.value = 'Username must be at least 4 characters'
        return false
    }
    if (value.length > 16) {
        editError.value = 'Username must be 16 characters or less'
        return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        editError.value = 'Username can only contain letters, numbers, and underscores'
        return false
    }
    return true
}

// Update username
const handleUpdateUsername = async () => {
    editError.value = ''

    if (!validateUsername(editUsername.value)) {
        return
    }

    if (editUsername.value === user.value.username) {
        editError.value = 'Please enter a different username'
        return
    }

    editLoading.value = true

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username: editUsername.value
            })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to update username')
        }

        const data = await response.json()
        user.value.username = data.user.username
        successMessage.value = 'Username updated successfully!'
        showEditDialog.value = false

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = ''
        }, 3000)

    } catch (error: any) {
        console.error('Failed to update username:', error)
        editError.value = error.message || 'Failed to update username'
    } finally {
        editLoading.value = false
    }
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

// Get poster image URL (TMDB)
const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return 'https://via.placeholder.com/300x450?text=No+Image'
    return `https://image.tmdb.org/t/p/w500${posterPath}`
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
            <div v-if="loading" class="space-y-6">
                <Card>
                    <template #content>
                        <div class="flex gap-6">
                            <Skeleton shape="circle" size="8rem" />
                            <div class="flex-1 space-y-3">
                                <Skeleton width="200px" height="2rem" />
                                <Skeleton width="150px" />
                                <Skeleton width="100%" height="3rem" class="mt-4" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Profile Content -->
            <div v-else-if="user" class="space-y-6">

                <!-- Profile Header Card -->
                <Card>
                    <template #content>
                        <div class="flex flex-col md:flex-row gap-6 items-start">

                            <!-- Avatar -->
                            <Avatar :label="getInitials(user.username)" size="xlarge" shape="circle"
                                class="bg-indigo-600 text-white text-4xl"
                                style="width: 120px; height: 120px; font-size: 2.5rem;" />

                            <!-- User Info -->
                            <div class="flex-1">
                                <div class="flex flex-col md:flex-row md:items-start justify-between mb-4">
                                    <div>
                                        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                            {{ user.username }}
                                        </h2>
                                        <p class="text-gray-600 dark:text-gray-400 mb-2">
                                            {{ user.email }}
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-500">
                                            Member since {{ formatDate(user.createdAt) }}
                                        </p>
                                    </div>

                                    <div class="flex gap-2 mt-4 md:mt-0">
                                        <Button label="Edit Profile" icon="pi pi-pencil" outlined
                                            @click="openEditDialog" size="small" />
                                        <Button label="Logout" icon="pi pi-sign-out" severity="danger" outlined
                                            @click="handleLogout" size="small" />
                                    </div>
                                </div>

                                <!-- Stats -->
                                <div class="flex gap-8 mt-6">
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {{ stats.reviewsCount }}
                                        </div>
                                        <div class="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                            {{ stats.favoritesCount }}
                                        </div>
                                        <div class="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {{ stats.watchlistCount }}
                                        </div>
                                        <div class="text-sm text-gray-600 dark:text-gray-400">Watchlist</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Tabs -->
                <TabView>

                    <!-- Reviews Tab -->
                    <TabPanel>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-star"></i>
                                <span>My Reviews ({{ stats.reviewsCount }})</span>
                            </div>
                        </template>

                        <div class="space-y-4">
                            <!-- Review Cards -->
                            <Card v-for="review in user.reviews" :key="review.id"
                                class="hover:shadow-lg transition-shadow">
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
                            <div v-if="stats.reviewsCount === 0" class="text-center py-16">
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
                    </TabPanel>

                    <!-- Favorites Tab -->
                    <TabPanel>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-heart-fill"></i>
                                <span>Favorites ({{ stats.favoritesCount }})</span>
                            </div>
                        </template>

                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <Card v-for="favorite in user.favorites" :key="favorite.id"
                                class="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                                @click="navigateToShow(favorite.show.id)">
                                <template #header>
                                    <img :src="getPosterUrl(favorite.show.posterPath)" :alt="favorite.show.title"
                                        class="w-full h-64 object-cover" />
                                </template>
                                <template #title>
                                    <div class="text-sm font-semibold truncate" :title="favorite.show.title">
                                        {{ favorite.show.title }}
                                    </div>
                                </template>
                                <template #subtitle>
                                    <div class="text-xs text-gray-500 mt-1">
                                        Added {{ formatDate(favorite.createdAt) }}
                                    </div>
                                </template>
                            </Card>

                            <!-- Empty State -->
                            <div v-if="stats.favoritesCount === 0" class="col-span-full text-center py-16">
                                <i class="pi pi-heart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    No favorites yet
                                </h3>
                                <p class="text-gray-500 dark:text-gray-400 mb-6">
                                    Add shows to your favorites to see them here
                                </p>
                                <Button label="Browse Shows" icon="pi pi-search" @click="router.push('/')" />
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Watchlist Tab -->
                    <TabPanel>
                        <template #header>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-bookmark"></i>
                                <span>Watchlist ({{ stats.watchlistCount }})</span>
                            </div>
                        </template>

                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <Card v-for="item in user.watchlist" :key="item.id"
                                class="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                                @click="navigateToShow(item.show.id)">
                                <template #header>
                                    <img :src="getPosterUrl(item.show.posterPath)" :alt="item.show.title"
                                        class="w-full h-64 object-cover" />
                                </template>
                                <template #title>
                                    <div class="text-sm font-semibold truncate" :title="item.show.title">
                                        {{ item.show.title }}
                                    </div>
                                </template>
                                <template #subtitle>
                                    <div class="text-xs text-gray-500 mt-1">
                                        Added {{ formatDate(item.addedAt) }}
                                    </div>
                                </template>
                                <template #footer v-if="item.note">
                                    <div class="text-xs text-gray-600 dark:text-gray-400 italic truncate"
                                        :title="item.note">
                                        Note: {{ item.note }}
                                    </div>
                                </template>
                            </Card>

                            <!-- Empty State -->
                            <div v-if="stats.watchlistCount === 0" class="col-span-full text-center py-16">
                                <i class="pi pi-bookmark text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                                <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Your watchlist is empty
                                </h3>
                                <p class="text-gray-500 dark:text-gray-400 mb-6">
                                    Save shows you want to watch later
                                </p>
                                <Button label="Browse Shows" icon="pi pi-search" @click="router.push('/')" />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>

            <!-- Edit Username Dialog -->
            <Dialog v-model:visible="showEditDialog" header="Change Username" :modal="true" :style="{ width: '450px' }">
                <div class="space-y-4">

                    <Message v-if="editError" severity="error" :closable="false">
                        {{ editError }}
                    </Message>

                    <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Current username: <strong>{{ user?.username }}</strong>
                        </p>
                    </div>

                    <div>
                        <label for="edit-username" class="block text-sm font-medium mb-2">
                            New Username
                        </label>
                        <InputText id="edit-username" v-model="editUsername" class="w-full"
                            placeholder="Enter new username" @keyup.enter="handleUpdateUsername" />
                        <small class="text-gray-500">
                            4-16 characters, letters, numbers, and underscores only
                        </small>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cancel" severity="secondary" @click="showEditDialog = false"
                        :disabled="editLoading" />
                    <Button label="Save Changes" @click="handleUpdateUsername" :loading="editLoading" />
                </template>
            </Dialog>

        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for tabs */
:deep(.p-tabview-panels) {
    padding: 1.5rem 0;
}
</style>