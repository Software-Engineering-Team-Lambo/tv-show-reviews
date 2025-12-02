<script setup lang="ts">
import type { ProfileStats } from '@/types/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

interface Props {
    username: string
    email?: string | null
    createdAt: string
    stats: ProfileStats
    isOwnProfile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: null,
    isOwnProfile: false,
})

const emit = defineEmits<{
    edit: []
    logout: []
}>()

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: props.isOwnProfile ? 'numeric' : undefined
    })
}

const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || 'U'
}
</script>

<template>
    <Card>
        <template #content>
            <div class="flex flex-col md:flex-row gap-6 items-start">
                <!-- Avatar -->
                <Avatar :label="getInitials(username)" size="xlarge" shape="circle"
                    class="bg-indigo-600 text-white text-4xl" style="width: 120px; height: 120px; font-size: 2.5rem;" />

                <!-- User Info -->
                <div class="flex-1">
                    <div class="flex flex-col md:flex-row md:items-start justify-between mb-4">
                        <div>
                            <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                {{ username }}
                            </h2>
                            <p v-if="email" class="text-gray-600 dark:text-gray-400 mb-2">
                                {{ email }}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-500">
                                <i class="pi pi-calendar mr-2"></i>
                                Member since {{ formatDate(createdAt) }}
                            </p>
                        </div>

                        <div v-if="isOwnProfile" class="flex gap-2 mt-4 md:mt-0">
                            <Button label="Edit Profile" icon="pi pi-pencil" outlined @click="emit('edit')"
                                size="small" />
                            <Button label="Logout" icon="pi pi-sign-out" severity="danger" outlined
                                @click="emit('logout')" size="small" />
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
</template>
