<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import Card from 'primevue/card'
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div class="container mx-auto px-4">
            <!-- Show Header Skeleton -->
            <Card class="mb-8">
                <template #content>
                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Poster Skeleton -->
                        <div class="flex-shrink-0">
                            <Skeleton width="20rem" height="30rem" class="rounded-lg" />
                        </div>

                        <!-- Info Skeleton -->
                        <div class="flex-1 space-y-4">
                            <Skeleton width="60%" height="3rem" />

                            <div class="flex gap-2">
                                <Skeleton width="5rem" height="2rem" />
                                <Skeleton width="8rem" height="2rem" />
                                <Skeleton width="6rem" height="2rem" />
                            </div>

                            <div class="flex items-center gap-4">
                                <Skeleton width="10rem" height="2rem" />
                                <Skeleton width="8rem" height="1.5rem" />
                            </div>

                            <div class="flex gap-2">
                                <Skeleton width="5rem" height="2rem" />
                                <Skeleton width="6rem" height="2rem" />
                                <Skeleton width="7rem" height="2rem" />
                            </div>

                            <Skeleton width="100%" height="6rem" />

                            <div>
                                <Skeleton width="8rem" height="1.5rem" class="mb-2" />
                                <Skeleton width="80%" height="1.5rem" />
                            </div>

                            <div>
                                <Skeleton width="6rem" height="1.5rem" class="mb-2" />
                                <Skeleton width="90%" height="1.5rem" />
                            </div>

                            <div class="flex gap-3">
                                <Skeleton width="12rem" height="2.5rem" />
                                <Skeleton width="10rem" height="2.5rem" />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Reviews Section Skeleton -->
                <div class="lg:col-span-2 space-y-6">
                    <Card>
                        <template #title>
                            <Skeleton width="10rem" height="2rem" />
                        </template>
                        <template #content>
                            <div class="space-y-4">
                                <Skeleton width="100%" height="8rem" />
                                <Skeleton width="8rem" height="2.5rem" />
                            </div>
                        </template>
                    </Card>

                    <Card>
                        <template #title>
                            <Skeleton width="12rem" height="2rem" />
                        </template>
                        <template #content>
                            <div class="space-y-6">
                                <div v-for="i in 3" :key="i" class="flex gap-4">
                                    <Skeleton shape="circle" size="3rem" />
                                    <div class="flex-1 space-y-2">
                                        <Skeleton width="10rem" height="1.5rem" />
                                        <Skeleton width="8rem" height="1rem" />
                                        <Skeleton width="100%" height="4rem" />
                                        <Skeleton width="8rem" height="1.5rem" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Sidebar Skeleton -->
                <div class="space-y-6">
                    <Card>
                        <template #title>
                            <Skeleton width="6rem" height="2rem" />
                        </template>
                        <template #content>
                            <div class="space-y-3">
                                <div v-for="i in 3" :key="i" class="flex justify-between">
                                    <Skeleton width="8rem" height="1.5rem" />
                                    <Skeleton width="4rem" height="1.5rem" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>
