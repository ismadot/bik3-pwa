import { Loader } from '@googlemaps/js-api-loader'

let googleMapsInstance: typeof google | null = null

export async function useGoogleMaps(apiKey: string) {
  if (googleMapsInstance) return googleMapsInstance

  const loader = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places'], // puedes quitar si no lo usas
  })

  googleMapsInstance = await loader.load()
  return googleMapsInstance
}
