<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

const props = defineProps<{
    visible: boolean
    currentUsername: string
}>()

const emit = defineEmits<{
    'update:visible': [value: boolean]
    updated: [newUsername: string]
}>()

const editUsername = ref('')
const editLoading = ref(false)
const editError = ref('')

// Reset form when dialog opens
watch(() => props.visible, (isVisible) => {
    if (isVisible) {
        editUsername.value = props.currentUsername
        editError.value = ''
    }
})

const validateUsername = (value: string): boolean => {
    editError.value = ''

    if (!value) {
        editError.value = 'Username is required'
        return false
    }
    if (value.length < 4) {
        editError.value = 'Username must be at least 4 characters'
        return false
    }
    if (value.length > 16) {
        editError.value = 'Username must be 16 characters or less'
        return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        editError.value = 'Username can only contain letters, numbers, and underscores'
        return false
    }
    return true
}

const handleUpdateUsername = async () => {
    editError.value = ''

    if (!validateUsername(editUsername.value)) {
        return
    }

    if (editUsername.value === props.currentUsername) {
        editError.value = 'Please enter a different username'
        return
    }

    editLoading.value = true

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                username: editUsername.value
            })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to update username')
        }

        emit('updated', editUsername.value)
        emit('update:visible', false)
    } catch (error) {
        console.error('Failed to update username:', error)
        editError.value = error instanceof Error ? error.message : 'Failed to update username'
    } finally {
        editLoading.value = false
    }
}

const closeDialog = () => {
    emit('update:visible', false)
}
</script>

<template>
    <Dialog :visible="visible" header="Change Username" :modal="true" :style="{ width: '450px' }"
        @update:visible="emit('update:visible', $event)">
        <div class="space-y-4">
            <Message v-if="editError" severity="error" :closable="false">
                {{ editError }}
            </Message>

            <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Current username: <strong>{{ currentUsername }}</strong>
                </p>
            </div>

            <div>
                <label for="edit-username" class="block text-sm font-medium mb-2">
                    New Username
                </label>
                <InputText id="edit-username" v-model="editUsername" class="w-full" placeholder="Enter new username"
                    @keyup.enter="handleUpdateUsername" />
                <small class="text-gray-500">
                    4-16 characters, letters, numbers, and underscores only
                </small>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" severity="secondary" @click="closeDialog" :disabled="editLoading" />
            <Button label="Save Changes" @click="handleUpdateUsername" :loading="editLoading" />
        </template>
    </Dialog>
</template>
