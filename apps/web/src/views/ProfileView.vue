<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Rating from 'primevue/rating'
import Chip from 'primevue/chip'

const router = useRouter()

// TODO: Replace with actual user data from API
const user = ref({
    id: 1,
    username: 'tv_enthusiast',
    email: 'user@example.com',
    joinDate: 'January 2023',
    bio: 'Love watching TV shows and sharing my thoughts! Huge fan of sci-fi and drama series.',
    stats: {
        reviews: 42,
        favorites: 15,
        watchlist: 28,
    },
})

// TODO: Replace with actual reviews from API
const userReviews = ref([
    {
        id: 1,
        showId: 1,
        showTitle: 'Breaking Bad',
        showImage: 'https://via.placeholder.com/150x225/4F46E5/FFFFFF?text=Breaking+Bad',
        rating: 5,
        reviewText: 'Absolutely phenomenal! One of the best TV shows ever made. The character development and storytelling are unmatched.',
        date: '2024-01-15',
        likes: 24,
    },
    {
        id: 2,
        showId: 2,
        showTitle: 'Stranger Things',
        showImage: 'https://via.placeholder.com/150x225/7C3AED/FFFFFF?text=Stranger+Things',
        rating: 4,
        reviewText: 'Great nostalgia vibes and excellent acting from the young cast. Season 1 was the strongest.',
        date: '2024-01-10',
        likes: 18,
    },
])

// TODO: Replace with actual favorites from API
const favoriteShows = ref([
    {
        id: 1,
        title: 'Breaking Bad',
        image: 'https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=Breaking+Bad',
        rating: 4.8,
    },
    {
        id: 3,
        title: 'The Office',
        image: 'https://via.placeholder.com/200x300/2563EB/FFFFFF?text=The+Office',
        rating: 4.7,
    },
    {
        id: 4,
        title: 'Game of Thrones',
        image: 'https://via.placeholder.com/200x300/DC2626/FFFFFF?text=Game+of+Thrones',
        rating: 4.5,
    },
])

// TODO: Replace with actual watchlist from API
const watchlist = ref([
    {
        id: 7,
        title: 'The Last of Us',
        image: 'https://via.placeholder.com/200x300/EA580C/FFFFFF?text=Last+of+Us',
        rating: 4.9,
    },
    {
        id: 8,
        title: 'Wednesday',
        image: 'https://via.placeholder.com/200x300/64748B/FFFFFF?text=Wednesday',
        rating: 4.3,
    },
])

const navigateToShow = (id: number) => {
    router.push({ name: 'show-details', params: { id } })
}

const editProfile = () => {
    // TODO: Implement edit profile
    console.log('Edit profile clicked')
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <!-- Profile Header -->
            <Card class="mb-8">
                <template #content>
                    <div class="flex flex-col md:flex-row gap-6 items-start">
                        <!-- Avatar -->
                        <Avatar :label="user.username?.[0]?.toUpperCase() || 'U'" size="xlarge" shape="circle"
                            class="bg-indigo-600 text-white text-4xl w-32 h-32" />

                        <!-- User Info -->
                        <div class="flex-1">
                            <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <div>
                                    <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                        {{ user.username }}
                                    </h1>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Member since {{ user.joinDate }}
                                    </p>
                                </div>
                                <Button label="Edit Profile" icon="pi pi-pencil" outlined @click="editProfile" />
                            </div>

                            <p class="text-gray-700 dark:text-gray-300 mb-4">
                                {{ user.bio }}
                            </p>

                            <!-- Stats -->
                            <div class="flex gap-6">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-indigo-600">{{ user.stats.reviews }}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-indigo-600">{{ user.stats.favorites }}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-indigo-600">{{ user.stats.watchlist }}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Watchlist</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Tabs for different sections -->
            <TabView>
                <!-- Reviews Tab -->
                <TabPanel value="0">
                    <template #header>
                        <span>My Reviews</span>
                    </template>
                    <div class="space-y-4">
                        <Card v-for="review in userReviews" :key="review.id">
                            <template #content>
                                <div class="flex gap-4">
                                    <!-- Show Image -->
                                    <img :src="review.showImage" :alt="review.showTitle"
                                        class="w-24 h-36 object-cover rounded cursor-pointer"
                                        @click="navigateToShow(review.showId)" />

                                    <!-- Review Content -->
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 class="text-xl font-semibold hover:text-indigo-600 cursor-pointer"
                                                    @click="navigateToShow(review.showId)">
                                                    {{ review.showTitle }}
                                                </h3>
                                                <div class="flex items-center gap-2 mt-1">
                                                    <Rating :modelValue="review.rating" readonly :cancel="false" />
                                                    <span class="text-sm text-gray-600">{{ review.date }}</span>
                                                </div>
                                            </div>
                                            <div class="flex gap-2">
                                                <Button icon="pi pi-pencil" text rounded size="small" />
                                                <Button icon="pi pi-trash" text rounded severity="danger"
                                                    size="small" />
                                            </div>
                                        </div>

                                        <p class="text-gray-700 dark:text-gray-300 mb-2">
                                            {{ review.reviewText }}
                                        </p>

                                        <div class="flex items-center gap-4 text-sm text-gray-600">
                                            <Chip :label="`${review.likes} likes`" icon="pi pi-heart" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card>

                        <!-- Empty state -->
                        <div v-if="userReviews.length === 0" class="text-center py-12">
                            <i class="pi pi-star text-6xl text-gray-400 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No reviews yet
                            </h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">
                                Start reviewing your favorite shows!
                            </p>
                            <Button label="Explore Shows" @click="router.push('/search')" />
                        </div>
                    </div>
                </TabPanel>

                <!-- Favorites Tab -->
                <TabPanel value="1">
                    <template #header>
                        <span>Favorites</span>
                    </template>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <Card v-for="show in favoriteShows" :key="show.id"
                            class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateToShow(show.id)">
                            <template #header>
                                <img :src="show.image" :alt="show.title" class="w-full h-64 object-cover" />
                            </template>
                            <template #title>
                                <div class="text-sm font-semibold truncate">{{ show.title }}</div>
                            </template>
                            <template #subtitle>
                                <div class="flex items-center gap-1 text-xs">
                                    <i class="pi pi-star-fill text-yellow-500"></i>
                                    <span>{{ show.rating }}</span>
                                </div>
                            </template>
                            <template #footer>
                                <Button icon="pi pi-heart-fill" text severity="danger" size="small" class="w-full"
                                    label="Remove" />
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Watchlist Tab -->
                <TabPanel value="2">
                    <template #header>
                        <span>Watchlist</span>
                    </template>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <Card v-for="show in watchlist" :key="show.id"
                            class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateToShow(show.id)">
                            <template #header>
                                <img :src="show.image" :alt="show.title" class="w-full h-64 object-cover" />
                            </template>
                            <template #title>
                                <div class="text-sm font-semibold truncate">{{ show.title }}</div>
                            </template>
                            <template #subtitle>
                                <div class="flex items-center gap-1 text-xs">
                                    <i class="pi pi-star-fill text-yellow-500"></i>
                                    <span>{{ show.rating }}</span>
                                </div>
                            </template>
                            <template #footer>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-check" text size="small" label="Watched" class="flex-1" />
                                    <Button icon="pi pi-times" text severity="secondary" size="small" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>
