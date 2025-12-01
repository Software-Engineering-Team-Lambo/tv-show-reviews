<script setup lang="ts">
import Chip from 'primevue/chip'

interface Props {
    reviewCount: number
    averageRating: number
    status: string | null
}

defineProps<Props>()
</script>

<template>
    <div class="space-y-3">
        <div class="flex justify-between">
            <span class="text-gray-600">Total Reviews</span>
            <span class="font-semibold">{{ reviewCount }}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Average Rating</span>
            <span class="font-semibold">{{ averageRating }}/5</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Status</span>
            <Chip :label="status ?? 'Unknown'" size="small" severity="success" />
        </div>
    </div>
</template>
