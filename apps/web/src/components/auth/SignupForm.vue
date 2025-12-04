<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const emit = defineEmits<{
    submit: [username: string, email: string, password: string]
}>()

defineProps<{
    loading: boolean
}>()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const validationError = ref('')

// Validation matching backend schema:
// username: minLength 4, maxLength 16, pattern ^[a-zA-Z0-9_]+$
// email: format email
// password: minLength 8
const validate = (): boolean => {
    validationError.value = ''

    const trimmedUsername = username.value.trim()

    // Username validation - matching backend
    if (!trimmedUsername) {
        validationError.value = 'Please enter a username.'
        return false
    }

    if (trimmedUsername.length < 4) {
        validationError.value = 'Username must be at least 4 characters long.'
        return false
    }

    if (trimmedUsername.length > 16) {
        validationError.value = 'Username must be at most 16 characters long.'
        return false
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/
    if (!usernamePattern.test(trimmedUsername)) {
        validationError.value = 'Username can only contain letters, numbers, and underscores.'
        return false
    }

    // Email validation - matching backend
    if (!email.value.trim()) {
        validationError.value = 'Please enter your email address.'
        return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value.trim())) {
        validationError.value = 'Please enter a valid email address.'
        return false
    }

    // Password validation - matching backend (minLength 8)
    if (!password.value) {
        validationError.value = 'Please enter a password.'
        return false
    }

    if (password.value.length < 8) {
        validationError.value = 'Password must be at least 8 characters long.'
        return false
    }

    // Confirm password (frontend only)
    if (!confirmPassword.value) {
        validationError.value = 'Please confirm your password.'
        return false
    }

    if (password.value !== confirmPassword.value) {
        validationError.value = 'Passwords do not match.'
        return false
    }

    return true
}

const handleSubmit = () => {
    if (validate()) {
        emit('submit', username.value.trim(), email.value.trim(), password.value)
    }
}

defineExpose({
    validationError,
    clearValidationError: () => { validationError.value = '' }
})
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Validation Error -->
        <div v-if="validationError" class="text-red-500 text-sm mb-2">
            {{ validationError }}
        </div>

        <div>
            <label for="signup-username" class="block text-sm font-medium mb-2">
                Username
            </label>
            <InputText id="signup-username" v-model="username" placeholder="Choose a username (4-16 characters)"
                class="w-full" />
            <small class="text-gray-500">Letters, numbers, and underscores only</small>
        </div>

        <div>
            <label for="signup-email" class="block text-sm font-medium mb-2">Email</label>
            <InputText id="signup-email" v-model="email" type="email" placeholder="Enter your email" class="w-full" />
        </div>

        <div>
            <label for="signup-password" class="block text-sm font-medium mb-2">
                Password
            </label>
            <Password id="signup-password" v-model="password" placeholder="Create a password (min 8 characters)"
                toggleMask class="w-full" inputClass="w-full" />
        </div>

        <div>
            <label for="signup-confirm-password" class="block text-sm font-medium mb-2">
                Confirm Password
            </label>
            <Password id="signup-confirm-password" v-model="confirmPassword" placeholder="Confirm your password"
                :feedback="false" toggleMask class="w-full" inputClass="w-full" />
        </div>

        <Button type="submit" label="Create Account" icon="pi pi-user-plus" class="w-full" :loading="loading"
            :disabled="loading" />
    </form>
</template>
