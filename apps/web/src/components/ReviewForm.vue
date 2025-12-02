<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
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

// Watch for changes to existingReview to update form and exit edit mode
watch(() => props.existingReview, (newReview, oldReview) => {
    if (newReview) {
        userRating.value = newReview.rating
        userReview.value = newReview.comment ?? ''
        // If the review was updated (same id but different content), exit edit mode
        if (oldReview && oldReview.id === newReview.id && isEditing.value) {
            isEditing.value = false
        }
    }
}, { immediate: true })

// Also watch loading to exit edit mode when loading becomes false after an update
watch(() => props.loading, (newLoading, oldLoading) => {
    if (oldLoading && !newLoading && isEditing.value && props.existingReview) {
        // Loading finished - exit edit mode
        isEditing.value = false
    }
})

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
    <div v-if="!isAuthenticated"
        class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-center">
        <i class="pi pi-user text-4xl text-indigo-400 mb-3"></i>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Share Your Thoughts</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Sign in to write a review and rate this show</p>
        <Button label="Sign In to Review" icon="pi pi-sign-in" @click="goToLogin" />
    </div>

    <!-- Has existing review (view mode) -->
    <div v-else-if="existingReview && !isEditing" class="space-y-4">
        <div class="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <i class="pi pi-check-circle"></i>
            <span class="font-medium">You've reviewed this show</span>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3 mb-3">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Your Rating:</span>
                <Rating :modelValue="existingReview.rating" readonly :cancel="false" />
            </div>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ existingReview.comment }}</p>
        </div>

        <div class="flex gap-3 pt-2">
            <Button label="Edit Review" icon="pi pi-pencil" severity="secondary" outlined @click="startEditing" />
            <Button label="Delete" icon="pi pi-trash" severity="danger" text @click="handleDelete" :loading="loading" />
        </div>
    </div>

    <!-- Write/Edit review form -->
    <div v-else class="space-y-5">
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="pi pi-star mr-2"></i>Your Rating
            </label>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 inline-block">
                <Rating v-model="userRating" :cancel="false" />
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <i class="pi pi-pencil mr-2"></i>Your Review
            </label>
            <Textarea v-model="userReview" rows="4"
                placeholder="What did you think about this show? Share your thoughts..." class="w-full" />
        </div>

        <div class="flex gap-3 pt-2">
            <Button :label="existingReview ? 'Update Review' : 'Submit Review'"
                :icon="existingReview ? 'pi pi-check' : 'pi pi-send'" @click="handleSubmit"
                :disabled="!userRating || !userReview.trim()" :loading="loading" />
            <Button v-if="existingReview" label="Cancel" severity="secondary" text @click="cancelEditing" />
        </div>
    </div>
</template>
