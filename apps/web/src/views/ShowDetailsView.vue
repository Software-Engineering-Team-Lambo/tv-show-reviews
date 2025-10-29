<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Textarea from 'primevue/textarea'
import Avatar from 'primevue/avatar'

const router = useRouter()

// TODO: Replace with actual show data from API
const show = ref({
    id: 1,
    title: 'Breaking Bad',
    year: 2008,
    genres: ['Crime', 'Drama', 'Thriller'],
    rating: 4.8,
    totalReviews: 1234,
    seasons: 5,
    status: 'Ended',
    image: 'https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Breaking+Bad',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future. Breaking Bad follows protagonist Walter White, a chemistry teacher who lives in New Mexico with his wife and teenage son who has cerebral palsy.',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
    creators: ['Vince Gilligan'],
})

const isFavorite = ref(false)
const inWatchlist = ref(false)
const userRating = ref(0)
const userReview = ref('')

// TODO: Replace with actual reviews from API
const reviews = ref([
    {
        id: 1,
        userId: 1,
        username: 'tv_critic_pro',
        rating: 5,
        reviewText: 'Absolutely phenomenal! One of the best TV shows ever made. The character development is unmatched.',
        date: '2024-01-15',
        likes: 142,
        helpful: true,
    },
    {
        id: 2,
        userId: 2,
        username: 'binge_watcher',
        rating: 5,
        reviewText: 'From start to finish, this show kept me on the edge of my seat. The writing, acting, and cinematography are all top-tier.',
        date: '2024-01-10',
        likes: 98,
        helpful: false,
    },
    {
        id: 3,
        userId: 3,
        username: 'series_addict',
        rating: 4,
        reviewText: 'Great show overall, though some middle episodes dragged a bit. The finale was perfect.',
        date: '2024-01-05',
        likes: 56,
        helpful: false,
    },
])

const toggleFavorite = () => {
    isFavorite.value = !isFavorite.value
    // TODO: Call API to add/remove from favorites
    console.log('Toggle favorite:', isFavorite.value)
}

const toggleWatchlist = () => {
    inWatchlist.value = !inWatchlist.value
    // TODO: Call API to add/remove from watchlist
    console.log('Toggle watchlist:', inWatchlist.value)
}

const submitReview = () => {
    // TODO: Call API to submit review
    console.log('Submit review:', {
        rating: userRating.value,
        review: userReview.value,
    })
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
            <!-- Show Header -->
            <Card class="mb-8">
                <template #content>
                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Show Poster -->
                        <div class="flex-shrink-0">
                            <img :src="show.image" :alt="show.title" class="w-full md:w-80 rounded-lg shadow-lg" />
                        </div>

                        <!-- Show Info -->
                        <div class="flex-1">
                            <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                {{ show.title }}
                            </h1>

                            <div class="flex flex-wrap gap-2 mb-4">
                                <Chip :label="show.year.toString()" />
                                <Chip :label="`${show.seasons} Seasons`" />
                                <Chip :label="show.status" severity="success" />
                            </div>

                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex items-center gap-2">
                                    <Rating :modelValue="show.rating" readonly :cancel="false" />
                                    <span class="text-2xl font-bold">{{ show.rating }}</span>
                                </div>
                                <span class="text-gray-600 dark:text-gray-400">
                                    {{ show.totalReviews }} reviews
                                </span>
                            </div>

                            <div class="flex flex-wrap gap-2 mb-6">
                                <Chip v-for="genre in show.genres" :key="genre" :label="genre" outlined />
                            </div>

                            <p class="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                {{ show.description }}
                            </p>

                            <div class="mb-4">
                                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Created by
                                </h3>
                                <p class="text-gray-800 dark:text-white">{{ show.creators.join(', ') }}</p>
                            </div>

                            <div class="mb-6">
                                <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    Starring
                                </h3>
                                <p class="text-gray-800 dark:text-white">{{ show.cast.join(', ') }}</p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-3">
                                <Button :label="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
                                    :icon="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"
                                    :severity="isFavorite ? 'danger' : 'secondary'" @click="toggleFavorite" />
                                <Button :label="inWatchlist ? 'In Watchlist' : 'Add to Watchlist'"
                                    :icon="inWatchlist ? 'pi pi-check' : 'pi pi-plus'" :outlined="!inWatchlist"
                                    @click="toggleWatchlist" />
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
                                    <Textarea v-model="userReview" rows="4"
                                        placeholder="Share your thoughts about this show..." class="w-full" />
                                </div>

                                <Button label="Submit Review" icon="pi pi-send" @click="submitReview"
                                    :disabled="!userRating || !userReview.trim()" />
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
                                        <Avatar :label="review.username?.[0]?.toUpperCase() || 'U'" shape="circle"
                                            class="bg-indigo-600 text-white" />

                                        <div class="flex-1">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 class="font-semibold text-gray-800 dark:text-white">
                                                        {{ review.username }}
                                                    </h4>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <Rating :modelValue="review.rating" readonly :cancel="false"
                                                            class="text-sm" />
                                                        <span class="text-xs text-gray-600">{{ review.date }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p class="text-gray-700 dark:text-gray-300 mb-3">
                                                {{ review.reviewText }}
                                            </p>

                                            <div class="flex items-center gap-4">
                                                <Button :label="`Helpful (${review.likes})`" icon="pi pi-thumbs-up" text
                                                    size="small" @click="likeReview(review.id)" />
                                                <Button label="Report" icon="pi pi-flag" text severity="secondary"
                                                    size="small" />
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
                    <Card>
                        <template #title>Similar Shows</template>
                        <template #content>
                            <div class="space-y-4">
                                <div v-for="similarShow in [
                                    { id: 2, title: 'Better Call Saul', rating: 4.7 },
                                    { id: 3, title: 'The Sopranos', rating: 4.8 },
                                    { id: 4, title: 'The Wire', rating: 4.9 },
                                ]" :key="similarShow.id"
                                    class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition"
                                    @click="router.push({ name: 'show-details', params: { id: similarShow.id } })">
                                    <div class="w-12 h-16 bg-gray-300 rounded"></div>
                                    <div class="flex-1">
                                        <div class="font-semibold text-sm">{{ similarShow.title }}</div>
                                        <div class="flex items-center gap-1 text-xs text-gray-600">
                                            <i class="pi pi-star-fill text-yellow-500"></i>
                                            <span>{{ similarShow.rating }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Quick Stats -->
                    <Card>
                        <template #title>Stats</template>
                        <template #content>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Total Reviews</span>
                                    <span class="font-semibold">{{ show.totalReviews }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Average Rating</span>
                                    <span class="font-semibold">{{ show.rating }}/5</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Status</span>
                                    <Chip :label="show.status" size="small" severity="success" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>
