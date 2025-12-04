<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'
import Skeleton from 'primevue/skeleton'
import ShowCard from '@/components/ShowCard.vue'
import type { ShowCardData, HomePageResponse, Genre } from '@/types/api'

const router = useRouter()

const popularShows = ref<ShowCardData[]>([])
const newReleases = ref<ShowCardData[]>([])
const genres = ref<Genre[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/api/home-page')
    const data: HomePageResponse = await response.json()

    popularShows.value = data.popularShows.map((show) => ({
      id: show.id,
      title: show.title,
      year: show.releaseDate ? new Date(show.releaseDate).getFullYear() : null,
      description: show.description,
      image: show.posterPath ?? undefined,
      rating: show.rating,
      reviews: show.reviewCount,
      genre: show.genres,
    }))

    newReleases.value = data.newReleases.map((show) => ({
      id: show.id,
      title: show.title,
      year: show.releaseDate ? new Date(show.releaseDate).getFullYear() : null,
      description: show.description,
      image: show.posterPath ?? undefined,
      rating: show.rating,
      reviews: show.reviewCount,
      genre: show.genres,
    }))

    genres.value = data.genres
  } catch (error) {
    console.error('Failed to load home page data:', error)
  } finally {
    isLoading.value = false
  }
})

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
    <div class="text-white py-16" style="background: linear-gradient(to right, #de2886, #f77b29);">
      <div class="container mx-auto px-4">
        <h1 class="text-5xl font-bold mb-4">
          Welcome to <span class="couch-critics-brand"><span style="color:#ffffff">Couch</span> <span
              style="color:#ffffff">Critics</span></span>!
        </h1>
        <p class="text-xl mb-6">
          Discover, review, and discuss your favorite TV shows with the community
        </p>
        <Button label="Explore Shows" icon="pi pi-search" size="large" severity="secondary"
          @click="router.push('/search')" />
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Popular Shows Section -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white">
            Popular
          </h2>
          <Button label="View All" text icon="pi pi-arrow-right" iconPos="right" @click="router.push('/search')" />
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="p-2">
            <Skeleton height="16rem" class="mb-2"></Skeleton>
            <Skeleton width="75%" height="1.5rem" class="mb-2"></Skeleton>
            <Skeleton width="50%" height="1rem"></Skeleton>
          </div>
        </div>
        <Carousel v-else :value="popularShows" :numVisible="4" :numScroll="1" :responsiveOptions="responsiveOptions">
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

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i">
            <Skeleton height="16rem" class="mb-2"></Skeleton>
            <Skeleton width="75%" height="1.5rem" class="mb-2"></Skeleton>
            <Skeleton width="50%" height="1rem"></Skeleton>
          </div>
        </div>
        <Carousel v-else :value="newReleases" :numVisible="4" :numScroll="1" :responsiveOptions="responsiveOptions">
          <template #item="{ data }">
            <div class="p-2">
              <ShowCard :show="data" image-height="h-64" />
            </div>
          </template>
        </Carousel>
      </section>

      <!-- Categories/Genres Section -->
      <section>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Browse by Genre
        </h2>
        <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Skeleton v-for="i in 6" :key="i" height="4rem"></Skeleton>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Button v-for="genre in genres" :key="genre.id" :label="genre.name" outlined class="h-16"
            @click="router.push({ name: 'search', query: { genre: genre.name } })" />
        </div>
      </section>
    </div>
  </div>
</template>
