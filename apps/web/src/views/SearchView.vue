<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import SearchHeader from '@/components/SearchHeader.vue'
import SearchBar from '@/components/SearchBar.vue'
import SearchFilters from '@/components/SearchFilters.vue'
import SearchResults from '@/components/SearchResults.vue'
import type { ShowCardData, SearchRequestBody, SearchResult, FilterOptions } from '@/types/api'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedGenres = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref<'rating' | 'reviews' | 'year' | 'title'>('rating')
const isLoading = ref(false)
const isLoadingFilters = ref(true)
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

// Watch for route query changes (when searching from header or back/forward nav)
watch(() => route.query.q, (newQuery) => {
    if (newQuery && typeof newQuery === 'string' && newQuery !== searchQuery.value) {
        searchQuery.value = newQuery
        handleSearch()
    } else if (!newQuery && searchQuery.value) {
        searchQuery.value = ''
    }
})

onMounted(async () => {
    // Load available filters from the API
    await loadFilters()

    // Check for query params and sync with URL
    if (route.query.q) {
        searchQuery.value = route.query.q as string
    }
    if (route.query.genre) {
        selectedGenres.value = [route.query.genre as string]
    }

    // Auto-search if we have query params
    if (route.query.q || route.query.genre) {
        handleSearch()
    }
})

const loadFilters = async () => {
    isLoadingFilters.value = true
    try {
        const response = await fetch('/api/search/filters')
        const data: FilterOptions = await response.json()
        genres.value = data.genres
        years.value = data.years
    } catch (error) {
        console.error('Failed to load filters:', error)
    } finally {
        isLoadingFilters.value = false
    }
}

const handleSearch = async () => {
    // Allow search with just filters (no text required)
    const hasQuery = searchQuery.value.trim().length > 0
    const hasFilters = selectedGenres.value.length > 0 || selectedYear.value !== null

    // Require at least a query or filters
    if (!hasQuery && !hasFilters) {
        searchResults.value = []
        hasSearched.value = false
        return
    }

    // Update URL query params
    const query = searchQuery.value.trim()
    router.push({
        name: 'search',
        query: query ? { q: query } : {}
    })

    isLoading.value = true
    hasSearched.value = true

    try {
        // Build the request body with all filters
        const requestBody: SearchRequestBody = {}

        // Add query if provided
        if (hasQuery) {
            requestBody.query = searchQuery.value
        }

        // Add optional filters if they have values
        if (selectedGenres.value.length > 0) {
            requestBody.genres = selectedGenres.value
        }

        if (selectedYear.value) {
            requestBody.year = parseInt(selectedYear.value)
        }

        requestBody.sortBy = sortBy.value

        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`)
        }

        const data: SearchResult[] = await response.json()

        // Map the API response to ShowCardData format
        searchResults.value = data.map((show) => ({
            id: show.id,
            title: show.title,
            year: show.releaseDate ? new Date(show.releaseDate).getFullYear() : null,
            description: show.description,
            rating: show.rating,
            reviews: show.reviewCount,
            genre: show.genres,
        }))
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
    searchResults.value = []
    hasSearched.value = false
}

// Watch for filter changes and auto-search
watch([selectedGenres, selectedYear, sortBy], () => {
    const hasQuery = searchQuery.value.trim().length > 0
    const hasFilters = selectedGenres.value.length > 0 || selectedYear.value !== null

    // If we have either query or filters, search immediately
    if (hasQuery || hasFilters) {
        handleSearch()
    } else if (hasSearched.value) {
// If all filters cleared and no query, clear results
        searchResults.value = []
        hasSearched.value = false
    }
})
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
                        <div v-if="isLoadingFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div v-for="i in 3" :key="i">
                                <Skeleton height="2.5rem" class="mb-2" width="5rem"></Skeleton>
                                <Skeleton height="2.5rem"></Skeleton>
                            </div>
                        </div>
                        <SearchFilters v-else v-model:selected-genres="selectedGenres"
                            v-model:selected-year="selectedYear" v-model:sort-by="sortBy" :genres="genres"
                            :years="years" :sort-options="sortOptions" @clear="clearFilters" />
                    </div>
                </template>
            </Card>

            <!-- Search Results with Loading & Empty States -->
            <SearchResults :shows="searchResults" :loading="isLoading" />
        </div>
    </div>
</template>
