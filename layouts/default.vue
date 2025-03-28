<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800">
    <header class="p-4 shadow">
      <div class="flex justify-between items-center max-w-6xl mx-auto">
        <h1 class="text-xl font-bold text-emerald-600">BIK3</h1>
        <AuthPanel />
      </div>
    </header>

    <main class="flex-1">
      <NuxtPage />
    </main>

    <footer class="p-2 text-xs text-center text-gray-400">🚲 Demo BIK3 App - Nuxt + Firebase</footer>

    <UserSidePanel
      v-if="isUserPanelVisible"
      :visible="isUserPanelOpen"
      @close="closeUserPanel"
    />
  </div>
</template>

<script setup lang="ts">
import AuthPanel from '@/components/AuthPanel.vue'
import UserSidePanel from '@/components/UserSidePanel.vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useUserStore())
const { isUserPanelOpen,isUserPanelVisible } = storeToRefs(useAppStore())
const { closeUserPanel } = useAppStore()
</script>
