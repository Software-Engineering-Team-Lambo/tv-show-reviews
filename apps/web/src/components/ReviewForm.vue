<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'

const emit = defineEmits<{
    submit: [rating: number, review: string]
}>()

const userRating = ref(0)
const userReview = ref('')

const handleSubmit = () => {
    if (!userRating.value || !userReview.value.trim()) return
    emit('submit', userRating.value, userReview.value)
    userReview.value = ''
    userRating.value = 0
}
</script>

<template>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium mb-2">Your Rating</label>
            <Rating v-model="userRating" :cancel="false" />
        </div>

        <div>
            <label class="block text-sm font-medium mb-2">Your Review</label>
            <Textarea v-model="userReview" rows="4" placeholder="Share your thoughts about this show..."
                class="w-full" />
        </div>

        <Button label="Submit Review" icon="pi pi-send" @click="handleSubmit"
            :disabled="!userRating || !userReview.trim()" />
    </div>
</template>
