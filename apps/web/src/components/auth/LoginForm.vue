<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const emit = defineEmits<{
    submit: [emailOrUsername: string, password: string]
    forgotPassword: []
}>()

defineProps<{
    loading: boolean
}>()

const emailOrUsername = ref('')
const password = ref('')
const validationError = ref('')

// Validation matching backend: emailOrUsername minLength 1, password minLength 1
const validate = (): boolean => {
    validationError.value = ''

    if (!emailOrUsername.value.trim()) {
        validationError.value = 'Please enter your email or username.'
        return false
    }

    if (!password.value) {
        validationError.value = 'Please enter your password.'
        return false
    }

    return true
}

const handleSubmit = () => {
    if (validate()) {
        emit('submit', emailOrUsername.value.trim(), password.value)
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
            <label for="login-email-username" class="block text-sm font-medium mb-2">
                Email or Username
            </label>
            <InputText id="login-email-username" v-model="emailOrUsername" type="text"
                placeholder="Enter your email or username" class="w-full" />
        </div>

        <div>
            <label for="login-password" class="block text-sm font-medium mb-2">
                Password
            </label>
            <Password id="login-password" v-model="password" placeholder="Enter your password" :feedback="false"
                toggleMask class="w-full" inputClass="w-full" />
        </div>

        <div class="flex justify-between items-center">
            <Button label="Forgot Password?" link size="small" @click="emit('forgotPassword')" />
        </div>

        <Button type="submit" label="Login" icon="pi pi-sign-in" class="w-full" :loading="loading"
            :disabled="loading" />
    </form>
</template>
