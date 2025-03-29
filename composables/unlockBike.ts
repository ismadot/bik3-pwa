import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export async function unlockBike(bike: any) {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  if (!user.value) return alert('Debes estar logueado para usar una bici')

  const { $db } = useNuxtApp()
  const ref = doc($db, 'bikes', bike.id)

  try {
    await updateDoc(ref, {
      status: 'in_use',
      riderId: user.value.uid,
      startTime: serverTimestamp()
    })

    alert('✅ Bici desbloqueada, empieza tu viaje 🚴‍♀️')
  } catch (e) {
    console.error('❌ Error desbloqueando bici:', e)
    alert('No se pudo desbloquear la bici')
  }
}
