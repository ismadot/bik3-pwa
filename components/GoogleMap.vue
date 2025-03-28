<script setup lang="ts">
import { useGeolocation } from '@/composables/useGeolocation'
import { useGoogleMaps } from '@/composables/useGoogleMaps'
const config = useRuntimeConfig()
const mapDiv = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const userMarker = ref<google.maps.Marker | null>(null)

const { coords } = useGeolocation()

watch(
  () => coords.lat,
  async () => {
    if (!coords.ready || !mapDiv.value) return

    const google = await useGoogleMaps(config.public.googleMapsApiKey)
    const position = new google.maps.LatLng(coords.lat, coords.lng)

    if (!map.value) {
      map.value = new google.maps.Map(mapDiv.value, {
        mapId:'e982cb200a62d5a3',
        center: position,
        zoom: 16,
        disableDefaultUI: true,
      })

      userMarker.value = new google.maps.Marker({
        position,
        map: map.value,
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
      userMarker.value?.setPosition(position)
      map.value.panTo(position)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div ref="mapDiv" class="w-full h-[80vh] rounded-xl shadow-md border border-gray-200" />
</template>
