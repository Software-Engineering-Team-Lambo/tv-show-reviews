<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import Divider from 'primevue/divider'

const router = useRouter()
const activeTab = ref<'login' | 'signup'>('login')
const showForgotPassword = ref(false)

// Form fields
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const username = ref('')

const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login:', { email: email.value, password: password.value })
    router.push('/')
}

const handleSignup = () => {
    // TODO: Implement signup logic
    console.log('Signup:', {
        username: username.value,
        email: email.value,
        password: password.value,
    })
    router.push('/')
}

const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
    console.log('Forgot password:', email.value)
    showForgotPassword.value = false
}
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div class="w-full max-w-md">
            <!-- Logo/Brand -->
            <div class="text-center mb-8">
                <h1 class="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    <img src="/couchcritics.png" alt="Couch Critics logo"
                        class="inline-block w-30 h-30 mr-3 align-middle" />
                    <span class="couch-critics-brand"><span style="color:#de2886">Couch</span> <span style="color:#f77b29">Critics</span></span>
                </h1>
                <p class="text-gray-600 dark:text-gray-400">Your TV Show Review Community</p>
            </div>

            <!-- Forgot Password Modal -->
            <Card v-if="showForgotPassword" class="mb-4">
                <template #title>
                    <div class="flex justify-between items-center">
                        <span>Reset Password</span>
                        <Button icon="pi pi-times" text rounded @click="showForgotPassword = false" />
                    </div>
                </template>
                <template #content>
                    <div class="space-y-4">
                        <div>
                            <label for="reset-email" class="block text-sm font-medium mb-2">Email</label>
                            <InputText id="reset-email" v-model="email" type="email" placeholder="Enter your email"
                                class="w-full" />
                        </div>
                        <Button label="Send Reset Link" icon="pi pi-send" class="w-full"
                            @click="handleForgotPassword" />
                    </div>
                </template>
            </Card>

            <!-- Login/Signup Card -->
            <Card v-else>
                <template #title>
                    <!-- Tab Buttons -->
                    <div class="flex gap-2 mb-4">
                        <Button :label="'Login'" :severity="activeTab === 'login' ? 'primary' : 'secondary'"
                            :outlined="activeTab !== 'login'" class="flex-1" @click="activeTab = 'login'" />
                        <Button :label="'Sign Up'" :severity="activeTab === 'signup' ? 'primary' : 'secondary'"
                            :outlined="activeTab !== 'signup'" class="flex-1" @click="activeTab = 'signup'" />
                    </div>
                </template>

                <template #content>
                    <!-- Login Form -->
                    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
                        <div>
                            <label for="login-email" class="block text-sm font-medium mb-2">Email</label>
                            <InputText id="login-email" v-model="email" type="email" placeholder="Enter your email"
                                class="w-full" required />
                        </div>

                        <div>
                            <label for="login-password" class="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <Password id="login-password" v-model="password" placeholder="Enter your password"
                                :feedback="false" toggleMask class="w-full" inputClass="w-full" required />
                        </div>

                        <div class="flex justify-between items-center">
                            <Button label="Forgot Password?" link size="small" @click="showForgotPassword = true" />
                        </div>

                        <Button type="submit" label="Login" icon="pi pi-sign-in" class="w-full" />
                    </form>

                    <!-- Signup Form -->
                    <form v-else @submit.prevent="handleSignup" class="space-y-4">
                        <div>
                            <label for="signup-username" class="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <InputText id="signup-username" v-model="username" placeholder="Choose a username"
                                class="w-full" required />
                        </div>

                        <div>
                            <label for="signup-email" class="block text-sm font-medium mb-2">Email</label>
                            <InputText id="signup-email" v-model="email" type="email" placeholder="Enter your email"
                                class="w-full" required />
                        </div>

                        <div>
                            <label for="signup-password" class="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <Password id="signup-password" v-model="password" placeholder="Create a password" toggleMask
                                class="w-full" inputClass="w-full" required />
                        </div>

                        <div>
                            <label for="confirm-password" class="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <Password id="confirm-password" v-model="confirmPassword"
                                placeholder="Confirm your password" :feedback="false" toggleMask class="w-full"
                                inputClass="w-full" required />
                        </div>

                        <Button type="submit" label="Create Account" icon="pi pi-user-plus" class="w-full" />
                    </form>

                    <Divider />

                    <div class="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
