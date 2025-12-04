<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const userMenu = ref()

const userMenuItems = computed(() => [
    {
        label: 'My Profile',
        icon: 'pi pi-user',
        command: () => router.push('/profile'),
    },
    {
        separator: true,
    },
    {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: async () => {
            await authStore.logout()
            router.push('/login')
        },
    },
])

const userInitial = computed(() =>
    authStore.user?.username?.charAt(0).toUpperCase() || 'U'
)

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
                    <img src="/couchcritics.png" alt="Couch Critics logo"
                        class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" />
                    <span class="hidden sm:inline couch-critics-brand"><span style="color:#de2886">Couch</span> <span
                            style="color:#f77b29">Critics</span></span>
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
                    <template v-if="authStore.isAuthenticated">

                        <Avatar :label="userInitial" shape="circle" class="cursor-pointer bg-indigo-600 text-white"
                            @click="toggleUserMenu" />

                        <Menu ref="userMenu" :model="userMenuItems" popup />
                    </template>
                    <template v-else>
                        <Button label="Login" icon="pi pi-sign-in" @click="router.push('/login')" />
                    </template>
                </div>
            </div>
        </div>
    </header>
</template>
