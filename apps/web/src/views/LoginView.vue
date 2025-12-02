<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthCard from '../components/auth/AuthCard.vue'
import ForgotPasswordCard from '../components/auth/ForgotPasswordCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const showForgotPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleLogin = async (emailOrUsername: string, password: string) => {
    errorMessage.value = ''
    successMessage.value = ''
    loading.value = true

    try {
        await authStore.login(emailOrUsername, password)
        router.push('/')
    } catch (error) {
        console.error('Login failed:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Login failed. Please try again.'
    } finally {
        loading.value = false
    }
}

const handleSignup = async (username: string, email: string, password: string) => {
    errorMessage.value = ''
    successMessage.value = ''
    loading.value = true

    try {
        await authStore.signup(username, email, password)
        router.push('/')
    } catch (error) {
        console.error('Signup failed:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Signup failed. Please try again.'
    } finally {
        loading.value = false
    }
}

const handleForgotPassword = (email: string) => {
    // TODO: Implement forgot password logic
    console.log('Forgot password:', email)
    showForgotPassword.value = false
    successMessage.value = 'If an account exists with this email, you will receive a password reset link.'
}
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div class="w-full max-w-md">
            <!-- Logo/Brand -->
            <div class="text-center mb-8">
                <router-link to="/" class="inline-block hover:opacity-80 transition-opacity">
                    <h1 class="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        🛋️ Couch Critics
                    </h1>
                </router-link>
                <p class="text-gray-600 dark:text-gray-400">Your TV Show Review Community</p>
            </div>

            <!-- Forgot Password Card -->
            <ForgotPasswordCard v-if="showForgotPassword" @close="showForgotPassword = false"
                @submit="handleForgotPassword" />

            <!-- Auth Card (Login/Signup) -->
            <AuthCard v-else :error-message="errorMessage" :success-message="successMessage" :loading="loading"
                @login="handleLogin" @signup="handleSignup" @forgot-password="showForgotPassword = true"
                @clear-error="errorMessage = ''" @clear-success="successMessage = ''" />
        </div>
    </div>
</template>
