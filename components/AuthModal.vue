<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button @click="$emit('close')" class="absolute top-2 right-3 text-gray-400 hover:text-black text-xl">×</button>

      <h2 class="text-xl font-semibold mb-4 text-center text-emerald-700">Autenticación</h2>

      <div class="flex justify-center gap-4 mb-4">
        <button @click="mode = 'login'" :class="tabClass('login')">Iniciar sesión</button>
        <button @click="mode = 'register'" :class="tabClass('register')">Registrarse</button>
      </div>

      <div v-if="mode === 'login'">
        <button @click="loginWithGoogleAndClose" class="w-full bg-emerald-600 text-white py-2 rounded mb-3 hover:bg-emerald-700">
          Google
        </button>
        <form @submit.prevent="handleEmailLogin" class="flex flex-col gap-2">
          <input v-model="email" type="email" required placeholder="Email" class="input" />
          <input v-model="password" type="password" required placeholder="Contraseña" class="input" />
          <button type="submit" class="btn-blue">Login con Email</button>
        </form>
      </div>

      <div v-else>
        <form @submit.prevent="handleRegister" class="flex flex-col gap-2">
          <input v-model="email" type="email" required placeholder="Email" class="input" />
          <input v-model="password" type="password" required placeholder="Contraseña" class="input" />
          <button type="submit" class="btn-emerald">Registrarse</button>
        </form>
      </div>

      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
      <p v-if="loading" class="text-sm mt-2 text-gray-500">Cargando...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthUI } from '@/composables/useAuthUI'

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')

const { loginWithGoogle, loginWithEmail, registerWithEmail, error, loading } = useAuthUI()

const handleEmailLogin = async () => {
  await loginWithEmail(email.value, password.value)
  if (!error.value) emit('success') // ← cerrar si login fue exitoso
}

const handleRegister = async () => {
  await registerWithEmail(email.value, password.value)
  if (!error.value) emit('success') // ← cerrar si registro fue exitoso
}

const loginWithGoogleAndClose = async () => {
  await loginWithGoogle()
  if (!error.value) emit('success') // ← cerrar si login fue exitoso
}
const emit = defineEmits(['close', 'success']) // nuevo emit "success"

const tabClass = (val: string) => `px-4 py-1 rounded border ${mode.value === val ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`
</script>

<style scoped>
.input {
  @apply px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-400;
}
.btn-blue {
  @apply bg-blue-600 text-white py-2 rounded hover:bg-blue-700;
}
.btn-emerald {
  @apply bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700;
}
</style>
