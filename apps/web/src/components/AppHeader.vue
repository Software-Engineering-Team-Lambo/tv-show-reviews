<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'

const router = useRouter()
const searchQuery = ref('')
const userMenu = ref()

const userMenuItems = ref([
    {
        label: 'My Profile',
        icon: 'pi pi-user',
        command: () => router.push('/profile'),
    },
    {
        label: 'My Reviews',
        icon: 'pi pi-star',
        command: () => console.log('TODO: Navigate to my reviews'),
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => console.log('TODO: Navigate to settings'),
    },
    {
        separator: true,
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
            console.log('TODO: Implement logout')
            router.push('/login')
        },
    },
])

const toggleUserMenu = (event: Event) => {
    userMenu.value.toggle(event)
}

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ name: 'search', query: { q: searchQuery.value } })
        // Clear local search after navigating
        searchQuery.value = ''
    }
}
</script>

<template>
    <header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between gap-4">
                <!-- Logo -->
                <router-link to="/"
                    class="flex items-center gap-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    <span>🛋️</span>
                    <span class="hidden sm:inline">Couch Critics</span>
                </router-link>

                <!-- Search Bar -->
                <div class="flex-1 max-w-2xl">
                    <form @submit.prevent="handleSearch" class="flex gap-2">
                        <div class="relative flex-1">
                            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <InputText v-model="searchQuery" placeholder="Search TV shows..." class="w-full !pl-10" />
                        </div>
                        <Button type="submit" icon="pi pi-search" label="Search" :disabled="!searchQuery.trim()"
                            severity="success" class="hidden sm:inline-flex" />
                    </form>
                </div>

                <!-- User Menu -->
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-bell" text rounded severity="secondary" badge="3" badgeClass="bg-red-500"
                        @click="() => console.log('TODO: Show notifications')" />

                    <Avatar label="U" shape="circle" class="cursor-pointer bg-indigo-600 text-white"
                        @click="toggleUserMenu" />

                    <Menu ref="userMenu" :model="userMenuItems" popup />
                </div>
            </div>
        </div>
    </header>
</template>
