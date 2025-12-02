<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Card from 'primevue/card'

const emit = defineEmits<{
    close: []
    submit: [email: string]
}>()

const email = ref('')

const handleSubmit = () => {
    emit('submit', email.value)
}
</script>

<template>
    <Card class="mb-4">
        <template #title>
            <div class="flex justify-between items-center">
                <span>Reset Password</span>
                <Button icon="pi pi-times" text rounded @click="emit('close')" />
            </div>
        </template>
        <template #content>
            <div class="space-y-4">
                <div>
                    <label for="reset-email" class="block text-sm font-medium mb-2">Email</label>
                    <InputText id="reset-email" v-model="email" type="email" placeholder="Enter your email"
                        class="w-full" />
                </div>
                <Button label="Send Reset Link" icon="pi pi-send" class="w-full" @click="handleSubmit" />
            </div>
        </template>
    </Card>
</template>
