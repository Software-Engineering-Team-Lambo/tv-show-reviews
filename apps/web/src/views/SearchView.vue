<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card from 'primevue/card'
import SearchHeader from '@/components/SearchHeader.vue'
import SearchBar from '@/components/SearchBar.vue'
import SearchFilters from '@/components/SearchFilters.vue'
import SearchResults from '@/components/SearchResults.vue'
import type { ShowCardData, SearchResponse } from '@/types/api'
import { transformToShowCard } from '@/lib/api'

const route = useRoute()

const searchQuery = ref('')
const selectedGenres = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref('rating')
const isLoading = ref(false)
const hasSearched = ref(false)

const genres = ref<string[]>([])
const years = ref<number[]>([])
const sortOptions = ref([
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Newest', value: 'year' },
    { label: 'Title (A-Z)', value: 'title' },
])

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
    isLoading.value = true
    hasSearched.value = true

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: searchQuery.value,
            }),
        })

        const data: SearchResponse[] = await response.json()

        // Transform API response to ShowCardData format
        searchResults.value = data.map(transformToShowCard)
    } catch (error) {
        console.error('Search failed:', error)
        searchResults.value = []
    } finally {
        isLoading.value = false
    }
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
            <SearchHeader :result-count="searchResults.length" :loading="isLoading" />

            <!-- Search and Filters -->
            <Card class="mb-8">
                <template #content>
                    <div class="space-y-4">
                        <!-- Search Bar -->
                        <SearchBar v-model="searchQuery" @search="handleSearch" />

                        <!-- Filters -->
                        <SearchFilters v-model:selected-genres="selectedGenres" v-model:selected-year="selectedYear"
                            v-model:sort-by="sortBy" :genres="genres" :years="years" :sort-options="sortOptions"
                            @clear="clearFilters" />
                    </div>
                </template>
            </Card>

            <!-- Search Results with Loading & Empty States -->
            <SearchResults :shows="searchResults" :loading="isLoading" />
        </div>
    </div>
</template>
