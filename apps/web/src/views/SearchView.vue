<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedGenres = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref('rating')

const genres = ref(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Documentary', 'Romance'])
const years = ref(['2024', '2023', '2022', '2021', '2020', '2019', 'Older'])
const sortOptions = ref([
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Newest', value: 'year' },
    { label: 'Title (A-Z)', value: 'title' },
])

// TODO: Replace with actual API data
const searchResults = ref([
    {
        id: 1,
        title: 'Breaking Bad',
        rating: 4.8,
        year: 2008,
        genre: ['Crime', 'Drama'],
        image: 'https://via.placeholder.com/300x450/4F46E5/FFFFFF?text=Breaking+Bad',
        reviews: 1234,
        description: 'A high school chemistry teacher turned methamphetamine producer...',
    },
    {
        id: 2,
        title: 'Stranger Things',
        rating: 4.6,
        year: 2016,
        genre: ['Sci-Fi', 'Horror'],
        image: 'https://via.placeholder.com/300x450/7C3AED/FFFFFF?text=Stranger+Things',
        reviews: 987,
        description: 'When a young boy disappears, his friends uncover supernatural forces...',
    },
    {
        id: 3,
        title: 'The Office',
        rating: 4.7,
        year: 2005,
        genre: ['Comedy'],
        image: 'https://via.placeholder.com/300x450/2563EB/FFFFFF?text=The+Office',
        reviews: 2341,
        description: 'A mockumentary on a group of typical office workers...',
    },
    {
        id: 4,
        title: 'Game of Thrones',
        rating: 4.5,
        year: 2011,
        genre: ['Fantasy', 'Drama'],
        image: 'https://via.placeholder.com/300x450/DC2626/FFFFFF?text=Game+of+Thrones',
        reviews: 3456,
        description: 'Nine noble families fight for control of the lands of Westeros...',
    },
])

onMounted(() => {
    if (route.query.q) {
        searchQuery.value = route.query.q as string
    }
    if (route.query.genre) {
        selectedGenres.value = [route.query.genre as string]
    }
})

const handleSearch = async () => {
    // TODO: Implement actual search logic
    console.log('Searching:', {
        query: searchQuery.value,
        genres: selectedGenres.value,
        year: selectedYear.value,
        sortBy: sortBy.value,
    })

    const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: searchQuery.value,
        }),
    });

    const data = await response.json();

    searchResults.value = [
        {
            id: data[0].id,
            title: data[0].title,
            description: data[0].description,
            rating: 5,
            year: 2024,
            genre: ["ertert"],
            image: "sfsdf",
            reviews: 123,
        }
    ];

}

const clearFilters = () => {
    searchQuery.value = ''
    selectedGenres.value = []
    selectedYear.value = null
    sortBy.value = 'rating'
}

const navigateToShow = (id: number) => {
    router.push({ name: 'show-details', params: { id } })
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
                <Card v-for="show in searchResults" :key="show.id"
                    class="hover:shadow-xl transition-shadow cursor-pointer">
                    <template #header>
                        <img :src="show.image" :alt="show.title" class="w-full h-72 object-cover"
                            @click="navigateToShow(show.id)" />
                    </template>
                    <template #title>
                        <div class="text-lg font-semibold hover:text-indigo-600 cursor-pointer"
                            @click="navigateToShow(show.id)">
                            {{ show.title }}
                        </div>
                    </template>
                    <template #subtitle>
                        <div class="space-y-1">
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                {{ show.year }} • {{ show.genre.join(', ') }}
                            </div>
                            <div class="flex items-center gap-2">
                                <Rating :modelValue="show.rating" readonly :cancel="false" class="text-sm" />
                                <span class="text-sm font-semibold">{{ show.rating }}</span>
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {{ show.description }}
                        </p>
                        <div class="mt-2 text-xs text-gray-500">
                            {{ show.reviews }} reviews
                        </div>
                    </template>
                    <template #footer>
                        <Button label="View Details" icon="pi pi-arrow-right" iconPos="right" text class="w-full"
                            @click="navigateToShow(show.id)" />
                    </template>
                </Card>
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
