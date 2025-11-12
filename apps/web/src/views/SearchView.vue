<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import ShowCard from '@/components/ShowCard.vue'
import type { ShowCardData, SearchResponse } from '@/types/api'
import { transformToShowCard } from '@/lib/api'

const route = useRoute()

const searchQuery = ref('')
const selectedGenres = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref('rating')

const genres = ref<string[]>([])
const years = ref<number[]>([])
const sortOptions = ref([
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Newest', value: 'year' },
    { label: 'Title (A-Z)', value: 'title' },
])

// TODO: Replace with actual API data
const searchResults = ref<ShowCardData[]>([])

onMounted(() => {
    if (route.query.q) {
        searchQuery.value = route.query.q as string
        handleSearch()
    }
    if (route.query.genre) {
        selectedGenres.value = [route.query.genre as string]
    }
})

const handleSearch = async () => {
    const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: searchQuery.value,
        }),
    });

    const data: SearchResponse[] = await response.json();

    // Transform API response to ShowCardData format
    searchResults.value = data.map(transformToShowCard);

}

const clearFilters = () => {
    searchQuery.value = ''
    selectedGenres.value = []
    selectedYear.value = null
    sortBy.value = 'rating'
}


</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">Search TV Shows</h1>
                <p class="text-gray-600 dark:text-gray-400">
                    Find your next binge-worthy series
                </p>
            </div>

            <!-- Search and Filters -->
            <Card class="mb-8">
                <template #content>
                    <div class="space-y-4">
                        <!-- Search Input -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Search</label>
                            <div class="flex gap-2">
                                <span class="p-input-icon-left flex-1">
                                    <i class="pi pi-search" />
                                    <InputText v-model="searchQuery" placeholder="Search by title, actor, or keyword..."
                                        class="w-full" @keyup.enter="handleSearch" />
                                </span>
                                <Button label="Search" icon="pi pi-search" @click="handleSearch" />
                            </div>
                        </div>

                        <!-- Filters Row -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Genres Filter -->
                            <div>
                                <label class="block text-sm font-medium mb-2">Genres</label>
                                <MultiSelect v-model="selectedGenres" :options="genres" placeholder="Select genres"
                                    :maxSelectedLabels="2" class="w-full" />
                            </div>

                            <!-- Year Filter -->
                            <div>
                                <label class="block text-sm font-medium mb-2">Year</label>
                                <Dropdown v-model="selectedYear" :options="years" placeholder="Select year" showClear
                                    class="w-full" />
                            </div>

                            <!-- Sort By -->
                            <div>
                                <label class="block text-sm font-medium mb-2">Sort By</label>
                                <Dropdown v-model="sortBy" :options="sortOptions" optionLabel="label"
                                    optionValue="value" class="w-full" />
                            </div>
                        </div>

                        <!-- Filter Actions -->
                        <div class="flex justify-between items-center pt-2">
                            <Button label="Clear Filters" icon="pi pi-times" text @click="clearFilters" />
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                {{ searchResults.length }} results found
                            </span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Search Results -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ShowCard v-for="show in searchResults" :key="show.id" :show="show" :show-description="true" />
            </div>

            <!-- Empty State (TODO: Show when no results) -->
            <!-- <div class="text-center py-16">
        <i class="pi pi-search text-6xl text-gray-400 mb-4"></i>
        <h3 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No shows found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div> -->
        </div>
    </div>
</template>
