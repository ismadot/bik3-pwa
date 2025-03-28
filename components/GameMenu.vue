<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl px-6 py-4 border border-gray-200">
    <h2 class="text-lg font-semibold text-emerald-700">Selecciona un modo</h2>

    <div class="flex flex-col sm:flex-row gap-3 mt-2">
      <button @click="selectMode('duel')" class="game-btn">
        🚴 Ir a (Duelo)
      </button>
      <button @click="selectMode('logistics')" class="game-btn">
        🧭 Ir a (Logístico)
      </button>
      <button @click="selectMode('free')" class="game-btn">
        🪙 Desbloqueo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'mode-selected', mode: 'duel' | 'logistics' | 'free'): void
}>()

function selectMode(mode: 'duel' | 'logistics' | 'free') {
  emit('mode-selected', mode)
}
</script>

<style scoped>
.game-btn {
  @apply px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition;
}
</style>
