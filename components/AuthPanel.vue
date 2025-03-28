<template>
  <div>
    <button
      v-if="!user"
      @click="showLoginModal = true"
      class="px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700"
    >
      Iniciar sesión
    </button>

  <div v-else class="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded" @click="openUserPanel">
    <div class="flex flex-col text-sm text-right leading-tight">
      <span class="font-medium">{{ user.displayName || user.email }}</span>
    </div>
    <img :src="user.photoURL || ''" class="w-8 h-8 rounded-full border border-emerald-500" />
  </div>

    <AuthModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import AuthModal from '@/components/AuthModal.vue'

const showLoginModal = ref(false)

const userStore = useUserStore()
const { user, userData } = storeToRefs(userStore)

const handleLoginSuccess = async () => {
  console.log('🔑 handleLoginSuccess fired')

  await userStore.initSession()
  await userStore.fetchUserData()

  console.log('👤 User after login:', user.value)
  showLoginModal.value = false
}


const app = useAppStore()
const openUserPanel = () => {
  console.log('🔑 openUserPanel fired', user.value);

  if (user.value) {
    app.openUserPanel()
  } else {
    console.warn('🔒 Intento de abrir panel sin sesión activa')
  }
}

onMounted(() => {
  console.log('🌱 AuthPanel mounted, initSession()')
  userStore.initSession()
})

watch(user, (val) => {
  console.log('👀 user changed:', val)
})
</script>
