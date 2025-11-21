<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'
import ShowCard from '@/components/ShowCard.vue'
import type { ShowCardData } from '@/types/api'

const router = useRouter()

const trendingShows = ref<ShowCardData[]>([])

const newReleases = ref<ShowCardData[]>([])

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
            Popular
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
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white">New Releases</h2>
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
