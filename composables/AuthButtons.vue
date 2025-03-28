<template>
  <div class="flex flex-col items-center gap-2">
    <button v-if="!user" @click="loginWithGoogle" class="px-4 py-2 bg-emerald-500 text-white rounded">
      Iniciar sesión con Google
    </button>

    <div v-else class="flex flex-col items-center gap-2">
      <p>Hola, {{ user.displayName }}</p>
      <img :src="user.photoURL ?? ''" class="w-12 h-12 rounded-full" />
      <button @click="logout" class="px-3 py-1 bg-red-500 text-white rounded">
        Cerrar sesión
      </button>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthUI } from '@/composables/useAuthUI'

const { user, loading, error, loginWithGoogle, logout, initSession } = useAuthUI()

onMounted(() => {
  initSession()
})
</script>
