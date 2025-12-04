<script setup lang="ts">
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
</script>

<template>
    <div class="space-y-6">
        <Card>
            <template #content>
                <div class="flex gap-6">
                    <Skeleton shape="circle" size="8rem" />
                    <div class="flex-1 space-y-3">
                        <Skeleton width="200px" height="2rem" />
                        <Skeleton width="150px" />
                        <Skeleton width="100%" height="3rem" class="mt-4" />
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
