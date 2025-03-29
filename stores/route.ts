import { defineStore } from 'pinia'
import type { ActiveRoute } from '~/types'

export const useRouteStore = defineStore('route', () => {
  const activeRoute = ref<ActiveRoute | null>(null)

  const setActiveRoute = (route: ActiveRoute) => {
    console.log('📍 Ruta activa seteada:', route)
    activeRoute.value = route
  }

  const clearRoute = () => {
    activeRoute.value = null
  }

  return {

    activeRoute,
    setActiveRoute,
    clearRoute
  }
}, {
  persist: {
    key: 'route-persist',
  },
})
