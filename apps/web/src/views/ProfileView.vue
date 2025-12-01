<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Rating from 'primevue/rating'
import Chip from 'primevue/chip'

const router = useRouter()

// reactive state, populated from /api/profile
const user = ref<any>({
    id: null,
    username: '',
    email: '',
    joinDate: '',
    bio: '',
    stats: { reviews: 0, favorites: 0, watchlist: 0 },
})

const userReviews = ref<any[]>([])
const favoriteShows = ref<any[]>([])
const watchlist = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const route = useRoute()

// fetch profile from API on mount — prefer route `:id` when available so UI reflects DB-backed user
onMounted(async () => {
    loading.value = true
    error.value = null
    try {
        const routeId = route.params.id as string | undefined
        const fetchUrl = routeId ? `/api/profile?id=${routeId}` : '/api/profile'
        const res = await fetch(fetchUrl)
        if (!res.ok) {
            const text = await res.text()
            throw new Error(text || `HTTP ${res.status}`)
        }
        const data = await res.json()

        // Map user fields with fallbacks to support session-only or DB-backed responses
        user.value = {
            id: data.id ?? null,
            username: data.username ?? data.name ?? "",
            email: data.email ?? null,
            joinDate:
                data.joinDate ?? (data.createdAt ? new Date(data.createdAt).toISOString().split("T")[0] : ""),
            bio: data.bio ?? "",
            stats: data.stats ?? { reviews: 0, favorites: 0, watchlist: 0 },
        }

        // Normalize reviews. Accept either the frontend-shaped review objects or
        // DB-shaped ones (with nested `show`) or session-shaped ones.
        userReviews.value = (data.reviews || []).map((r: any) => ({
            id: r.id,
            showId: r.showId ?? r.show?.id ?? null,
            showTitle: r.showTitle ?? r.show?.title ?? r.show?.name ?? "",
            showImage: r.showImage ?? r.show?.image ?? null,
            rating: r.rating ?? r.score ?? 0,
            reviewText: r.reviewText ?? r.comment ?? "",
            date: r.date ?? (r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : ""),
            likes: r.likes ?? 0,
        }))

        // Favorites: mapped from `data.favorites` (user's favorite shows)
        favoriteShows.value = data.favorites || []
        // Watchlist: mapped from `data.watchlist` (user's saved to-watch list)
        watchlist.value = data.watchlist || []
    } catch (e: any) {
        console.error('Failed to load profile', e)
        error.value = e?.message ?? String(e)
    } finally {
        loading.value = false
    }
})

const navigateToShow = (id: number) => {
    router.push({ name: 'show-details', params: { id } })
}

// Edit UI state
const editing = ref(false)
const editName = ref('')
const saving = ref(false)

const editProfile = () => {
    editing.value = true
    editName.value = user.value.username || ''
}

const cancelEdit = () => {
    editing.value = false
    editName.value = ''
}

const saveProfile = async () => {
    if (!editName.value || editName.value.trim() === '') return
    saving.value = true
    try {
        const idParam = user.value?.id ? `?id=${user.value.id}` : ''
        const res = await fetch(`/api/profile${idParam}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: editName.value.trim() }),
        })
        if (!res.ok) {
            const text = await res.text()
            throw new Error(text || `HTTP ${res.status}`)
        }
        const data = await res.json()
        // update local state with returned profile
        user.value.username = data.username ?? data.name ?? editName.value.trim()
        user.value.email = data.email ?? user.value.email
        editing.value = false
    } catch (e: any) {
        console.error('Failed to save profile', e)
        error.value = e?.message ?? String(e)
    } finally {
        saving.value = false
    }
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
                                <div>
                                    <template v-if="!editing">
                                        <Button label="Edit Profile" icon="pi pi-pencil" outlined
                                            @click="editProfile" />
                                    </template>
                                    <template v-else>
                                        <div class="flex items-center gap-2">
                                            <input v-model="editName" class="border rounded px-3 py-2 text-sm" />
                                            <Button label="Save" icon="pi pi-check" @click="saveProfile"
                                                :loading="saving" />
                                            <Button label="Cancel" text icon="pi pi-times" @click="cancelEdit" />
                                        </div>
                                    </template>
                                </div>
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
