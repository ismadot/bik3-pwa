import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { Bike, Station } from '~/types'

export async function reserveBike(bikeId: string) {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  const { setReservation } = userStore

  if (!user.value) {
    alert('Debes estar logueado para apartar una bici')
    return
  }

  const { $db } = useNuxtApp()
  const ref = doc($db, 'bikes', bikeId)

  try {
    // 🔄 Actualiza Firestore
    await updateDoc(ref, {
      status: 'reserved',
      reservedBy: user.value.uid,
      reservedAt: serverTimestamp()
    })

    // 📦 Carga datos actualizados
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      console.error('❌ Documento de bici no encontrado')
      return alert('No se pudo obtener la bici')
    }

    const bike = { id: snap.id, ...snap.data() } as Bike

    if (!bike.location?.latitude || !bike.location?.longitude) {
      console.error('❌ Coordenadas inválidas:', bike.location)
      return alert('Bici sin coordenadas válidas')
    }

    setReservation(bike, bike.stationId || null)

    alert('🟡 Bici apartada. Dirígete a ella para desbloquearla.')
  } catch (e) {
    console.error('❌ Error al apartar bici:', e)
    alert('No se pudo apartar la bici')
  }
}


export async function cancelReservation(bikeId: string) {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  const { clearReservation } = userStore

  if (!user.value) return alert('Debes estar logueado para cancelar una reserva')

  const { $db } = useNuxtApp()
  const ref = doc($db, 'bikes', bikeId)

  try {
    await updateDoc(ref, {
      status: 'available',
      reservedBy: null,
      reservedAt: null,
    })
    clearReservation()
    alert('✅ Reserva cancelada. La bici vuelve a estar disponible.')
  } catch (e) {
    console.error('❌ Error cancelando reserva:', e)
    alert('No se pudo cancelar la reserva.')
  }
}



export async function reserveFromStation(station: Station) {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  const { setReservation } = userStore
  const { $db } = useNuxtApp()

  if (!user.value) return alert('Debes iniciar sesión para reservar una bici')

  if (!station.bikes || station.bikes.length === 0) {
    return alert('❌ Esta estación no tiene bicis disponibles')
  }

  const bikeId = station.bikes[0]
  const bikeRef = doc($db, 'bikes', bikeId)
  const bikeSnap = await getDoc(bikeRef)

  if (!bikeSnap.exists()) {
    return alert('❌ La bici no existe')
  }

  const bike = { id: bikeSnap.id, ...bikeSnap.data() } as Bike

  if (!bike.location?.latitude || !bike.location?.longitude) {
    console.error('❌ Coordenadas inválidas en la bici:', bike.location)
    return alert('Bici sin coordenadas válidas')
  }

  if (bike.status !== 'available') {
    return alert('❌ Esta bici ya no está disponible')
  }

  await updateDoc(bikeRef, {
    status: 'reserved',
    reservedBy: user.value.uid,
    reservedAt: serverTimestamp()
  })

  setReservation(bike, station.id)

  alert(`✅ Has reservado la bici ${bike.id}`)
}

export async function unlockBike(bike: any) {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)
  const { clearReservation } = userStore
  const { $db } = useNuxtApp()

  if (!user.value) {
    alert('Debes estar logueado para desbloquear una bici')
    return
  }

  try {
    await updateDoc(doc($db, 'bikes', bike.id), {
      status: 'in_use',
      reservedBy: user.value.uid,
      unlockedAt: new Date().toISOString(),
    })

    clearReservation()
    alert('🔓 Bici desbloqueada. ¡Disfruta tu viaje!')
  } catch (e) {
    console.error('❌ Error al desbloquear bici:', e)
    alert('No se pudo desbloquear la bici')
  }
}
