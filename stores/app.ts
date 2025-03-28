import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isUserPanelVisible = ref(false)
  const isUserPanelOpen = ref(false)

  const openUserPanel = () => {
    isUserPanelVisible.value = true
    // esperar microtick antes de abrir visualmente
    nextTick(() => isUserPanelOpen.value = true)
  }
  const closeUserPanel = () => {
    isUserPanelOpen.value = false
    setTimeout(() => {
      isUserPanelVisible.value = false
    }, 300) // tiempo de animación opcional
  }

  const toggleUserPanel = () => {
    isUserPanelOpen.value = !isUserPanelOpen.value
  }

  // 🔮 Future example: estado global de modo de juego
  const activeGameMode = ref<'duel' | 'logistics' | 'free' | null>(null)

  const setGameMode = (mode: typeof activeGameMode.value) => {
    activeGameMode.value = mode
  }

  return {
    // user panel
    isUserPanelVisible,
    isUserPanelOpen,
    openUserPanel,
    closeUserPanel,
    toggleUserPanel,

    // game state (extensible)
    activeGameMode,
    setGameMode,
  }
})
