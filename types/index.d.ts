export interface Station {
  id: string
  name: string
  location: firebase.firestore.GeoPoint
  docks: number
  bikes: string[]
}

export interface Bike {
  id: string
  status: 'available' | 'in_use' | 'charging'
  battery: number
  location: firebase.firestore.GeoPoint
  stationId: string | null
}
