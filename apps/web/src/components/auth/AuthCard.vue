<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import LoginForm from './LoginForm.vue'
import SignupForm from './SignupForm.vue'

const props = defineProps<{
    errorMessage: string
    successMessage: string
    loading: boolean
}>()

const emit = defineEmits<{
    login: [emailOrUsername: string, password: string]
    signup: [username: string, email: string, password: string]
    forgotPassword: []
    clearError: []
    clearSuccess: []
}>()

const activeTab = ref<'login' | 'signup'>('login')
const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null)
const signupFormRef = ref<InstanceType<typeof SignupForm> | null>(null)

// Clear form validation errors when switching tabs
const switchTab = (tab: 'login' | 'signup') => {
    activeTab.value = tab
    emit('clearError')
    emit('clearSuccess')
    loginFormRef.value?.clearValidationError()
    signupFormRef.value?.clearValidationError()
}

// Clear form validation errors when parent error changes (to avoid showing both)
watch(() => props.errorMessage, (newError) => {
    if (newError) {
        loginFormRef.value?.clearValidationError()
        signupFormRef.value?.clearValidationError()
    }
})
</script>

<template>
    <Card>
        <template #title>
            <!-- Tab Buttons -->
            <div class="flex gap-2 mb-4">
                <Button label="Login" :severity="activeTab === 'login' ? 'primary' : 'secondary'"
                    :outlined="activeTab !== 'login'" class="flex-1" @click="switchTab('login')" />
                <Button label="Sign Up" :severity="activeTab === 'signup' ? 'primary' : 'secondary'"
                    :outlined="activeTab !== 'signup'" class="flex-1" @click="switchTab('signup')" />
            </div>
        </template>

        <template #content>
            <!-- Error Message (from API) -->
            <Message v-if="errorMessage" severity="error" :closable="true" @close="emit('clearError')" class="mb-4">
                {{ errorMessage }}
            </Message>

            <!-- Success Message -->
            <Message v-if="successMessage" severity="success" :closable="true" @close="emit('clearSuccess')"
                class="mb-4">
                {{ successMessage }}
            </Message>

            <!-- Login Form -->
            <LoginForm v-if="activeTab === 'login'" ref="loginFormRef" :loading="loading"
                @submit="(emailOrUsername, password) => emit('login', emailOrUsername, password)"
                @forgot-password="emit('forgotPassword')" />

            <!-- Signup Form -->
            <SignupForm v-else ref="signupFormRef" :loading="loading"
                @submit="(username, email, password) => emit('signup', username, email, password)" />

            <Divider />

            <div class="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            </div>
        </template>
    </Card>
</template>
