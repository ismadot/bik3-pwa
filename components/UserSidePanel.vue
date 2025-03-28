<template>
  <Transition name="slide">
    <div v-if="visible" class="fixed top-0 right-0 h-full w-[300px] bg-white shadow-xl border-l border-gray-200 z-50 p-4 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-emerald-700">Mi Perfil</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-black text-2xl leading-none">×</button>
      </div>

      <div v-if="user" class="flex flex-col items-center gap-2">
        <img v-if="user.photoURL" :src="user.photoURL" class="w-16 h-16 rounded-full border border-emerald-500" />
        <p class="text-center font-semibold">{{ user.displayName || user.email }}</p>

        <div class="mt-4 w-full">
          <div class="mb-2 text-sm text-gray-500">Puntos:</div>
          <div class="text-xl font-bold text-emerald-600">🏅 {{ coins }} coins</div>

          <div class="mt-4 text-sm text-gray-500">KM recorridos:</div>
          <div class="text-md font-bold text-gray-800">🚴 {{ km }} km</div>
        </div>

        <button @click="logout" class="mt-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full">
          Cerrar sesión
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAuthUI } from '@/composables/useAuthUI'

// defineProps<{ visible: boolean }>()
defineEmits(['close'])
const props = defineProps<{ visible: boolean }>()
onMounted(() => {
  console.log('👤 UserSidePanel mounted. Props:', { visible: props.visible })
})
const { user, logout } = useAuthUI()

// Placeholder temporal
const coins = 320
const km = 18.5
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}
</style>
