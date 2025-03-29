import { watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { doc, updateDoc, GeoPoint } from 'firebase/firestore'
import { useGeolocation } from './useGeolocation'

export function useGeolocationSync() {
  const { coords } = useGeolocation()
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)

  const syncLocation = async () => {
    if (!coords.ready || !user.value) return

    const { $db } = useNuxtApp()
    const ref = doc($db, 'users', user.value.uid)
    const location = new GeoPoint(coords.lat, coords.lng)

    try {
      await updateDoc(ref, { location })
      console.log('📡 Ubicación subida:', location.toJSON())
    } catch (e) {
      console.error('❌ Error actualizando ubicación:', e)
    }
  }

  // Observa cambios
  watch(() => coords.lat, syncLocation)
  onMounted(syncLocation) // por si ya estaba disponible
}
