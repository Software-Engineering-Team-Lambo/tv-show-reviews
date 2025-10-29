<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Carousel from 'primevue/carousel'

const router = useRouter()

// TODO: Replace with actual API data
const trendingShows = ref([
  {
    id: 1,
    title: 'Breaking Bad',
    rating: 4.8,
    year: 2008,
    genre: 'Crime, Drama',
    image: 'https://via.placeholder.com/300x450/4F46E5/FFFFFF?text=Breaking+Bad',
    reviews: 1234,
  },
  {
    id: 2,
    title: 'Stranger Things',
    rating: 4.6,
    year: 2016,
    genre: 'Sci-Fi, Horror',
    image: 'https://via.placeholder.com/300x450/7C3AED/FFFFFF?text=Stranger+Things',
    reviews: 987,
  },
  {
    id: 3,
    title: 'The Office',
    rating: 4.7,
    year: 2005,
    genre: 'Comedy',
    image: 'https://via.placeholder.com/300x450/2563EB/FFFFFF?text=The+Office',
    reviews: 2341,
  },
  {
    id: 4,
    title: 'Game of Thrones',
    rating: 4.5,
    year: 2011,
    genre: 'Fantasy, Drama',
    image: 'https://via.placeholder.com/300x450/DC2626/FFFFFF?text=Game+of+Thrones',
    reviews: 3456,
  },
  {
    id: 5,
    title: 'The Crown',
    rating: 4.4,
    year: 2016,
    genre: 'Drama, Biography',
    image: 'https://via.placeholder.com/300x450/059669/FFFFFF?text=The+Crown',
    reviews: 876,
  },
  {
    id: 6,
    title: 'Black Mirror',
    rating: 4.6,
    year: 2011,
    genre: 'Sci-Fi, Thriller',
    image: 'https://via.placeholder.com/300x450/000000/FFFFFF?text=Black+Mirror',
    reviews: 654,
  },
])

const newReleases = ref([
  {
    id: 7,
    title: 'The Last of Us',
    rating: 4.9,
    year: 2023,
    genre: 'Action, Drama',
    image: 'https://via.placeholder.com/300x450/EA580C/FFFFFF?text=Last+of+Us',
    reviews: 543,
  },
  {
    id: 8,
    title: 'Wednesday',
    rating: 4.3,
    year: 2022,
    genre: 'Comedy, Horror',
    image: 'https://via.placeholder.com/300x450/64748B/FFFFFF?text=Wednesday',
    reviews: 432,
  },
  {
    id: 9,
    title: 'The Bear',
    rating: 4.7,
    year: 2022,
    genre: 'Drama, Comedy',
    image: 'https://via.placeholder.com/300x450/0891B2/FFFFFF?text=The+Bear',
    reviews: 321,
  },
])

const responsiveOptions = ref([
  {
    breakpoint: '1400px',
    numVisible: 4,
    numScroll: 1,
  },
  {
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1,
  },
])

const navigateToShow = (id: number) => {
  router.push({ name: 'show-details', params: { id } })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
      <div class="container mx-auto px-4">
        <h1 class="text-5xl font-bold mb-4">Welcome to Couch Critics! 🛋️</h1>
        <p class="text-xl mb-6">
          Discover, review, and discuss your favorite TV shows with the community
        </p>
        <Button label="Explore Shows" icon="pi pi-search" size="large" severity="secondary"
          @click="router.push('/search')" />
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Trending Shows Section -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white">
            🔥 Trending Now
          </h2>
          <Button label="View All" text icon="pi pi-arrow-right" iconPos="right" @click="router.push('/search')" />
        </div>

        <Carousel :value="trendingShows" :numVisible="4" :numScroll="1" :responsiveOptions="responsiveOptions">
          <template #item="{ data }">
            <div class="p-2">
              <Card class="hover:shadow-xl transition-shadow cursor-pointer">
                <template #header>
                  <img :src="data.image" :alt="data.title" class="w-full h-64 object-cover"
                    @click="navigateToShow(data.id)" />
                </template>
                <template #title>
                  <div class="text-lg font-semibold truncate cursor-pointer hover:text-indigo-600"
                    @click="navigateToShow(data.id)">
                    {{ data.title }}
                  </div>
                </template>
                <template #subtitle>
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{{ data.year }}</span>
                    <span>•</span>
                    <span>{{ data.genre }}</span>
                  </div>
                </template>
                <template #content>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Rating :modelValue="data.rating" readonly :cancel="false" />
                      <span class="text-sm font-semibold">{{ data.rating }}</span>
                    </div>
                    <span class="text-xs text-gray-500">{{ data.reviews }} reviews</span>
                  </div>
                </template>
                <template #footer>
                  <Button label="View Details" icon="pi pi-arrow-right" iconPos="right" text class="w-full"
                    @click="navigateToShow(data.id)" />
                </template>
              </Card>
            </div>
          </template>
        </Carousel>
      </section>

      <!-- New Releases Section -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white">✨ New Releases</h2>
          <Button label="View All" text icon="pi pi-arrow-right" iconPos="right" @click="router.push('/search')" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="show in newReleases" :key="show.id" class="hover:shadow-xl transition-shadow cursor-pointer">
            <template #header>
              <img :src="show.image" :alt="show.title" class="w-full h-64 object-cover"
                @click="navigateToShow(show.id)" />
            </template>
            <template #title>
              <div class="text-lg font-semibold truncate cursor-pointer hover:text-indigo-600"
                @click="navigateToShow(show.id)">
                {{ show.title }}
              </div>
            </template>
            <template #subtitle>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{{ show.year }}</span>
                <span>•</span>
                <span>{{ show.genre }}</span>
              </div>
            </template>
            <template #content>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Rating :modelValue="show.rating" readonly :cancel="false" />
                  <span class="text-sm font-semibold">{{ show.rating }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ show.reviews }} reviews</span>
              </div>
            </template>
            <template #footer>
              <Button label="View Details" icon="pi pi-arrow-right" iconPos="right" text class="w-full"
                @click="navigateToShow(show.id)" />
            </template>
          </Card>
        </div>
      </section>

      <!-- Categories/Genres Section -->
      <section>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Browse by Genre
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Button v-for="genre in ['Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Action', 'Documentary']" :key="genre"
            :label="genre" outlined class="h-16" @click="router.push({ name: 'search', query: { genre } })" />
        </div>
      </section>
    </div>
  </div>
</template>
