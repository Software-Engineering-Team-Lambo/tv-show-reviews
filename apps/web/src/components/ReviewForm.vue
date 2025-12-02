<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import type { UserReviewSummary } from '@/types/api'

interface Props {
    isAuthenticated: boolean
    existingReview?: UserReviewSummary | null
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    existingReview: null,
    loading: false,
})

const emit = defineEmits<{
    submit: [rating: number, comment: string]
    update: [reviewId: number, rating: number, comment: string]
    delete: [reviewId: number]
}>()

const router = useRouter()

const userRating = ref(props.existingReview?.rating ?? 0)
const userReview = ref(props.existingReview?.comment ?? '')
const isEditing = ref(false)

// Watch for changes to existingReview to update form
watch(() => props.existingReview, (newReview) => {
    if (newReview) {
        userRating.value = newReview.rating
        userReview.value = newReview.comment ?? ''
    }
}, { immediate: true })

const handleSubmit = () => {
    if (!userRating.value || !userReview.value.trim()) return

    if (props.existingReview) {
        emit('update', props.existingReview.id, userRating.value, userReview.value.trim())
    } else {
        emit('submit', userRating.value, userReview.value.trim())
    }
}

const handleDelete = () => {
    if (props.existingReview) {
        emit('delete', props.existingReview.id)
    }
}

const startEditing = () => {
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
    if (props.existingReview) {
        userRating.value = props.existingReview.rating
        userReview.value = props.existingReview.comment ?? ''
    }
}

const goToLogin = () => {
    router.push('/login')
}
</script>

<template>
    <!-- Not authenticated -->
    <div v-if="!isAuthenticated" class="text-center py-6">
        <Message severity="info" :closable="false" class="mb-4">
            <template #default>
                <div class="flex flex-col items-center gap-2">
                    <span>You need to sign in to write a review</span>
                    <Button label="Sign In" icon="pi pi-sign-in" size="small" @click="goToLogin" />
                </div>
            </template>
        </Message>
    </div>

    <!-- Has existing review (view mode) -->
    <div v-else-if="existingReview && !isEditing" class="space-y-4">
        <Message severity="success" :closable="false">
            You've already reviewed this show
        </Message>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
                <span class="font-medium">Your Rating:</span>
                <Rating :modelValue="existingReview.rating" readonly :cancel="false" />
            </div>
            <p class="text-gray-700 dark:text-gray-300">{{ existingReview.comment }}</p>
        </div>

        <div class="flex gap-2">
            <Button label="Edit Review" icon="pi pi-pencil" severity="secondary" @click="startEditing" />
            <Button label="Delete Review" icon="pi pi-trash" severity="danger" outlined @click="handleDelete"
                :loading="loading" />
        </div>
    </div>

    <!-- Write/Edit review form -->
    <div v-else class="space-y-4">
        <div>
            <label class="block text-sm font-medium mb-2">Your Rating</label>
            <Rating v-model="userRating" :cancel="false" />
        </div>

        <div>
            <label class="block text-sm font-medium mb-2">Your Review</label>
            <Textarea v-model="userReview" rows="4" placeholder="Share your thoughts about this show..."
                class="w-full" />
        </div>

        <div class="flex gap-2">
            <Button :label="existingReview ? 'Update Review' : 'Submit Review'" icon="pi pi-send" @click="handleSubmit"
                :disabled="!userRating || !userReview.trim()" :loading="loading" />
            <Button v-if="existingReview" label="Cancel" severity="secondary" @click="cancelEditing" />
        </div>
    </div>
</template>
