<script setup lang="ts">
import { useGeolocation } from '@/composables/useGeolocation'
import { useGoogleMaps } from '@/composables/useGoogleMaps'
import { useMapData } from '@/composables/useMapData'
import { useGeolocationSync } from '@/composables/useGeolocationSync'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { storeToRefs } from 'pinia'
import { getDistanceMeters } from '@/utils/geo'
import { unlockBike, cancelReservation, reserveBike, reserveFromStation } from '@/composables/useThisBike'

const config = useRuntimeConfig()
const DEFAULT_POSITION = { lat: -33.45, lng: -70.66 }

const mapDiv = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const userMarker = ref<google.maps.Marker | null>(null)
const stationMarkers = ref<google.maps.Marker[]>([])
const bikeMarkers = ref<google.maps.Marker[]>([])

const userStore = useUserStore()
const routeStore = useRouteStore()
const { user, activeReservation } = storeToRefs(userStore)
const { activeRoute } = storeToRefs(routeStore)

const { coords } = useGeolocation()
const { stations, bikes, loadAll } = useMapData()
useGeolocationSync()

let directionsRenderer: google.maps.DirectionsRenderer | null = null

onMounted(async () => {
  if (!mapDiv.value) return
  const google = await useGoogleMaps(config.public.googleMapsApiKey)

  const center = coords.lat && coords.lng
    ? new google.maps.LatLng(coords.lat, coords.lng)
    : new google.maps.LatLng(DEFAULT_POSITION.lat, DEFAULT_POSITION.lng)

  map.value = new google.maps.Map(mapDiv.value, {
    mapId: 'e982cb200a62d5a3',
    center,
    zoom: 16,
    disableDefaultUI: true,
  })

  await loadAll()
  renderStations(google)
  renderFreeBikes(google)

  if (activeReservation.value && activeReservation.value.location) {
    drawRouteToBike(google)
  }
})

watch(
  () => [coords.lat, coords.lng],
  async () => {
    if (!map.value || !coords.lat || !coords.lng) return
    const position = new google.maps.LatLng(coords.lat, coords.lng)

    if (!userMarker.value) {
      userMarker.value = new google.maps.Marker({
        position,
        map: map.value,
        title: 'Tu ubicación',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: 'white',
        },
      })
    } else {
      userMarker.value.setPosition(position)
    }

    map.value.panTo(position)
  },
  { immediate: true }
)
if (process.client) {
  watch(
    activeReservation,
    async (val) => {
      const google = await useGoogleMaps(config.public.googleMapsApiKey)

      if (!map.value) return

      if (!val) {
        console.log('🧹 Reserva cancelada, limpiando ruta...')
        if (directionsRenderer) {
          directionsRenderer.setMap(null)
          directionsRenderer = null
        }
        routeStore.clearRoute()
      } else {
        console.log('🧭 Nueva reserva activa, dibujando ruta...')
        drawRouteToBike(google)
      }

      renderStations(google)
      renderFreeBikes(google)
    },
    { immediate: true }
  )

}
watch(
  activeReservation,
  async (val) => {
    const google = await useGoogleMaps(config.public.googleMapsApiKey)
    if (!map.value) return

    console.log('🔁 Cambio en reserva activa, actualizando marcadores')

    await loadAll()
    renderStations(google)
    renderFreeBikes(google)

    // Limpia ruta si no hay reserva activa
    if (!val && directionsRenderer) {
      directionsRenderer.setMap(null)
      directionsRenderer = null
      routeStore.clearRoute()
    }
  },
  { deep: true }
)
function renderStations(google: typeof window.google) {
  stationMarkers.value.forEach(m => m.setMap(null))
  stationMarkers.value = []

  stations.value.forEach(st => {
    const hasReservedBike = st.bikes?.some((bikeId: any) => {
      const bike = bikes.value.find(b => b.id === bikeId)
      return bike?.reservedBy === user.value?.uid
    })

    const iconUrl = hasReservedBike
      ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
      : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'

    const marker = new google.maps.Marker({
      position: { lat: st.location.latitude, lng: st.location.longitude },
      map: map.value!,
      icon: iconUrl,
      title: st.name,
    })

    marker.addListener('click', () => {
      if (!st.bikes || st.bikes.length === 0) {
        alert(`📍 Estación: ${st.name}\n🚫 No hay bicis disponibles`)
        return
      }

      const myBikeId = st.bikes.find((bikeId: any) => {
        const bike = bikes.value.find(b => b.id === bikeId)
        return bike?.reservedBy === user.value?.uid
      })

      if (myBikeId) {
        const cancel = confirm(`🟡 Ya tienes una bici reservada en esta estación. ¿Cancelar reserva?`)
        if (cancel) cancelReservation(myBikeId)
        return
      }

      const confirmReserve = confirm(`📍 Estación: ${st.name}\n🚲 Bicis disponibles: ${st.bikes.length}\n¿Apartar una bici?`)
      if (confirmReserve) reserveFromStation(st)
    })

    stationMarkers.value.push(marker)
  })
}

function renderFreeBikes(google: typeof window.google) {
  bikeMarkers.value.forEach(m => m.setMap(null))
  bikeMarkers.value = []

  const freeBikes = bikes.value.filter(b => !b.stationId)

  freeBikes.forEach(bike => {
    const isReserved = bike.status === 'reserved'
    const isMine = bike.reservedBy === user.value?.uid

    const iconUrl = isReserved
      ? (isMine
        ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        : 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png')
      : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'

    const marker = new google.maps.Marker({
      position: { lat: bike.location.latitude, lng: bike.location.longitude },
      map: map.value!,
      icon: iconUrl,
      title: `Bici ${bike.id}`,
    })

    marker.addListener('click', () => {
      if (bike.status === 'reserved' && isMine) {
        const dist = getDistanceMeters(coords.lat, coords.lng, bike.location.latitude, bike.location.longitude)

        if (dist <= 20) {
          const confirmUnlock = confirm(`🔓 Estás a ${dist.toFixed(1)}m. ¿Desbloquear esta bici?`)
          if (confirmUnlock) unlockBike(bike)
        } else {
          const confirmCancel = confirm(`🟡 Esta bici está apartada por ti\nPero estás a ${dist.toFixed(1)}m\n¿Cancelar la reserva?`)
          if (confirmCancel) cancelReservation(bike.id)
        }
        return
      }

      if (bike.status !== 'available') {
        alert('❌ Esta bici no está disponible')
        return
      }

      const confirmReserve = confirm(`🚲 Bici disponible\nBatería: ${bike.battery}%\n¿Apartar esta bici?`)
      if (confirmReserve) reserveBike(bike.id)
    })

    bikeMarkers.value.push(marker)
  })
}

async function drawRouteToBike(google: typeof window.google) {
  if (!coords.ready || !activeReservation.value) return

  const origin = new google.maps.LatLng(coords.lat, coords.lng)
  const destination = new google.maps.LatLng(
    activeReservation.value.location.lat,
    activeReservation.value.location.lng
  )

  const directionsService = new google.maps.DirectionsService()
  const result = await directionsService.route({
    origin,
    destination,
    travelMode: google.maps.TravelMode.BICYCLING,
  })

  if (directionsRenderer) directionsRenderer.setMap(null)
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map.value!,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#34D399',
      strokeWeight: 5,
    }
  })
  directionsRenderer.setDirections(result)

  const leg = result.routes[0].legs[0]
  const polyline = result.routes[0].overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }))
  const segments = leg.steps.map(step => ({
    start: step.start_location.toJSON(),
    end: step.end_location.toJSON(),
    distance: step.distance?.value ?? 0,
    duration: step.duration?.value ?? 0,
  }))

  routeStore.setActiveRoute({
    startedAt: new Date().toISOString(),
    bikeId: activeReservation.value.bikeId,
    from: origin.toJSON(),
    to: destination.toJSON(),
    polyline,
    distance: leg.distance?.value ?? 0,
    duration: leg.duration?.value ?? 0,
    segments,
  })
}
</script>

<template>
  <div ref="mapDiv" class="w-full h-[80vh] rounded-xl shadow-md border border-gray-200" />
</template>
