<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'
import ShowCard from '@/components/ShowCard.vue'
import type { ShowCardData } from '@/types/api'

const router = useRouter()

const trendingShows = ref<ShowCardData[]>([
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
  {
    id: 5,
    title: 'The Crown',
    rating: 4.4,
    year: 2016,
    genre: ['Drama', 'Biography'],
    image: 'https://via.placeholder.com/300x450/059669/FFFFFF?text=The+Crown',
    reviews: 876,
    description: 'The reign and marriages of Queen Elizabeth II...',
  },
  {
    id: 6,
    title: 'Black Mirror',
    rating: 4.6,
    year: 2011,
    genre: ['Sci-Fi', 'Thriller'],
    image: 'https://via.placeholder.com/300x450/000000/FFFFFF?text=Black+Mirror',
    reviews: 654,
    description: 'An anthology series exploring a twisted, high-tech near-future...',
  },
])

const newReleases = ref<ShowCardData[]>([
  {
    id: 7,
    title: 'The Last of Us',
    rating: 4.9,
    year: 2023,
    genre: ['Action', 'Drama'],
    image: 'https://via.placeholder.com/300x450/EA580C/FFFFFF?text=Last+of+Us',
    reviews: 543,
    description: 'Twenty years after a fungal outbreak, survivors Joel and Ellie embark on a journey...',
  },
  {
    id: 8,
    title: 'Wednesday',
    rating: 4.3,
    year: 2022,
    genre: ['Comedy', 'Horror'],
    image: 'https://via.placeholder.com/300x450/64748B/FFFFFF?text=Wednesday',
    reviews: 432,
    description: 'Wednesday Addams attempts to master her emerging psychic ability...',
  },
  {
    id: 9,
    title: 'The Bear',
    rating: 4.7,
    year: 2022,
    genre: ['Drama', 'Comedy'],
    image: 'https://via.placeholder.com/300x450/0891B2/FFFFFF?text=The+Bear',
    reviews: 321,
    description: 'A young chef returns to Chicago to run his family sandwich shop...',
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
              <ShowCard :show="data" image-height="h-64" />
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
          <ShowCard v-for="show in newReleases" :key="show.id" :show="show" image-height="h-64" />
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
