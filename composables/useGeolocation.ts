export function useGeolocation() {
  const coords = reactive({
    lat: 0,
    lng: 0,
    accuracy: 0,
    error: '',
    ready: false,
  })

  const fallback = {
    lat: 40.7128, // NYC
    lng: -74.0060,
  }

  const updateCoords = (pos: GeolocationPosition) => {
    coords.lat = pos.coords.latitude
    coords.lng = pos.coords.longitude
    coords.accuracy = pos.coords.accuracy
    coords.error = ''
    coords.ready = true
  }

  const handleError = (err: GeolocationPositionError) => {
    console.warn('📡 Geolocation error', err.code, err.message)
    coords.error = err.message
    coords.ready = false

    // fallback a ubicación por defecto
    coords.lat = fallback.lat
    coords.lng = fallback.lng

    // alertar solo si el error no es silencioso
    if (err.code === 1) {
      alert('Permisos de ubicación denegados. Por favor habilítalos.')
    } else if (err.code === 2) {
      console.log("🚀 >> err:", err)
      console.log("🚀 >> err.code:", err.code, 'Ubicación no disponible. Intentando de nuevo...')
    }

    // Intentar de nuevo tras breve delay
    setTimeout(retry, 3000)
  }

  const retry = () => {
    navigator.geolocation.getCurrentPosition(updateCoords, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
    })
  }

  onMounted(() => {
    if (!navigator.geolocation) {
      coords.error = 'Geolocalización no soportada'
      return
    }

    retry()

    navigator.geolocation.watchPosition(updateCoords, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })

  return { coords, retry }
}
