<template>
  <div class="flex flex-col items-center justify-center p-4 gap-4">
    <GoogleMap />
    <GameMenu @mode-selected="onModeSelect" />

  </div>
</template>

<script setup lang="ts">
import GoogleMap from '@/components/GoogleMap.vue'
import GameMenu from '@/components/GameMenu.vue'
function onModeSelect(mode: 'duel' | 'logistics' | 'free') {
  console.log('🎮 Modo seleccionado:', mode)
  // aquí lanzaremos la lógica del juego, rutas, puntos, etc.
}
</script>
