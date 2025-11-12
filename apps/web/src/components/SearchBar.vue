<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'

interface Props {
    modelValue: string
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'search'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
    localValue.value = newVal
})

watch(localValue, (newVal) => {
    emit('update:modelValue', newVal)
})

const handleSearch = () => {
    emit('search')
}
</script>

<template>
    <div>
        <label class="block text-sm font-medium mb-2">Search</label>
        <div class="flex gap-2">
            <IconField icon-position="left" class="flex-1">
                <InputIcon class="pi pi-search" />
                <InputText v-model="localValue" placeholder="Search by title, actor, or keyword..." class="w-full"
                    @keyup.enter="handleSearch" />
            </IconField>
            <Button label="Search" icon="pi pi-search" @click="handleSearch" />
        </div>
    </div>
</template>
