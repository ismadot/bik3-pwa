// composables/useGoogleMaps.ts
import { Loader } from "@googlemaps/js-api-loader";

let loader: Loader | null = null;
let loaded = false;

export async function useGoogleMaps(apiKey: string): Promise<typeof google> {
  if (typeof window === "undefined" || !process.client) {
    return Promise.reject(
      new Error("❌ Google Maps sólo puede usarse en el cliente (navegador)")
    );
  }

  if (!loader) {
    loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });
  }

  if (loaded) return Promise.resolve(google);
  const g = await loader.load();
  loaded = true;
  return g;
}
