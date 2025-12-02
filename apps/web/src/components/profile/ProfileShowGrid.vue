<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ProfileFavorite, ProfileWatchlistItem } from '@/types/api'
import Card from 'primevue/card'
import Button from 'primevue/button'

const props = defineProps<{
    items: ProfileFavorite[] | ProfileWatchlistItem[]
    emptyIcon: string
    emptyTitle: string
    emptyMessage: string
    type: 'favorites' | 'watchlist'
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getPosterUrl = (posterPath: string | null) => {
    return `/show_images${posterPath}`
}

const navigateToShow = (showId: number) => {
    router.push(`/show/${showId}`)
}

const getDateField = (item: ProfileFavorite | ProfileWatchlistItem): string => {
    if (props.type === 'watchlist') {
        return (item as ProfileWatchlistItem).addedAt
    }
    return (item as ProfileFavorite).createdAt
}

const getNote = (item: ProfileFavorite | ProfileWatchlistItem): string | null => {
    if (props.type === 'watchlist') {
        return (item as ProfileWatchlistItem).note
    }
    return null
}
</script>

<template>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Card v-for="item in items" :key="item.id"
            class="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
            @click="navigateToShow(item.show.id)">
            <template #header>
                <img :src="getPosterUrl(item.show.posterPath)" :alt="item.show.title"
                    class="w-full aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700" />
            </template>
            <template #title>
                <div class="text-sm font-semibold truncate" :title="item.show.title">
                    {{ item.show.title }}
                </div>
            </template>
            <template #subtitle>
                <div class="text-xs text-gray-500 mt-1">
                    Added {{ formatDate(getDateField(item)) }}
                </div>
            </template>
            <template #footer v-if="getNote(item)">
                <div class="text-xs text-gray-600 dark:text-gray-400 italic truncate" :title="getNote(item) ?? ''">
                    Note: {{ getNote(item) }}
                </div>
            </template>
        </Card>

        <!-- Empty State -->
        <div v-if="items.length === 0" class="col-span-full text-center py-16">
            <i :class="[emptyIcon, 'text-6xl text-gray-300 dark:text-gray-600 mb-4']"></i>
            <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {{ emptyTitle }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
                {{ emptyMessage }}
            </p>
            <Button label="Browse Shows" icon="pi pi-search" @click="router.push('/')" />
        </div>
    </div>
</template>
