<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'

interface Props {
    selectedGenres: string[]
    selectedYear: string | null
    sortBy: string
    genres: string[]
    years: number[]
    sortOptions: Array<{ label: string; value: string }>
}

interface Emits {
    (e: 'update:selectedGenres', value: string[]): void
    (e: 'update:selectedYear', value: string | null): void
    (e: 'update:sortBy', value: string): void
    (e: 'clear'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localGenres = ref(props.selectedGenres)
const localYear = ref(props.selectedYear)
const localSortBy = ref(props.sortBy)

watch(() => props.selectedGenres, (newVal) => {
    localGenres.value = newVal
})

watch(() => props.selectedYear, (newVal) => {
    localYear.value = newVal
})

watch(() => props.sortBy, (newVal) => {
    localSortBy.value = newVal
})

watch(localGenres, (newVal) => {
    emit('update:selectedGenres', newVal)
})

watch(localYear, (newVal) => {
    emit('update:selectedYear', newVal)
})

watch(localSortBy, (newVal) => {
    emit('update:sortBy', newVal)
})

const handleClear = () => {
    emit('clear')
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Genres Filter -->
        <div>
            <label class="block text-sm font-medium mb-2">Genres</label>
            <MultiSelect v-model="localGenres" :options="genres" placeholder="Select genres" :maxSelectedLabels="2"
                :showToggleAll="false" class="w-full" />
        </div>

        <!-- Year Filter -->
        <div>
            <label class="block text-sm font-medium mb-2">Year</label>
            <Dropdown v-model="localYear" :options="years" placeholder="Select year" showClear class="w-full" />
        </div>

        <!-- Sort By -->
        <div>
            <label class="block text-sm font-medium mb-2">Sort By</label>
            <Dropdown v-model="localSortBy" :options="sortOptions" optionLabel="label" optionValue="value"
                class="w-full" />
        </div>
    </div>

    <!-- Filter Actions -->
    <div class="flex justify-start items-center pt-4">
        <Button label="Clear Filters" icon="pi pi-times" text @click="handleClear" />
    </div>
</template>
