import { db } from './firebaseAdmin'
import { GeoPoint, Timestamp } from 'firebase-admin/firestore'

// Estaciones base
const stationTemplates = [
  {
    name: 'Estación Central',
    location: new GeoPoint(40.7141, -74.0059),
    docks: 5
  },
  {
    name: 'Estación Norte',
    location: new GeoPoint(40.7165, -74.004),
    docks: 4
  },
  {
    name: 'Estación Sur',
    location: new GeoPoint(40.7123, -74.008),
    docks: 3
  },
  {
    name: 'Estación Parque',
    location: new GeoPoint(40.7138, -74.002),
    docks: 6
  }
]

function getRandomStatus() {
  const options = ['available', 'charging', 'in_use']
  return options[Math.floor(Math.random() * options.length)]
}

function randomBattery() {
  return Math.floor(40 + Math.random() * 60)
}

function offsetLocation(base: GeoPoint): GeoPoint {
  return new GeoPoint(
    base.latitude + (Math.random() - 0.5) * 0.002,
    base.longitude + (Math.random() - 0.5) * 0.002
  )
}

async function seed() {
  const stations: any[] = []
  const bikes: any[] = []

  // Crear estaciones con IDs únicos
  for (const base of stationTemplates) {
    const stationId = db.collection('stations').doc().id
    const station = {
      id: stationId,
      name: base.name,
      location: base.location,
      docks: base.docks,
      bikes: [] as string[]
    }

    // Agrega entre 2 y docks bicis a la estación
    const count = Math.floor(2 + Math.random() * (base.docks - 2))

    for (let i = 0; i < count; i++) {
      const bikeId = db.collection('bikes').doc().id
      station.bikes.push(bikeId)
      bikes.push({
        id: bikeId,
        status: getRandomStatus(),
        battery: randomBattery(),
        location: offsetLocation(base.location),
        stationId: station.id
      })
    }

    stations.push(station)
  }

  // Bicis fuera de estaciones (libres)
  for (let i = 0; i < 5; i++) {
    const freeId = db.collection('bikes').doc().id
    bikes.push({
      id: freeId,
      status: 'available',
      battery: randomBattery(),
      location: offsetLocation(new GeoPoint(40.713, -74.006)),
      stationId: null
    })
  }

  // Carga a Firestore
  const batch = db.batch()
  stations.forEach(st => batch.set(db.collection('stations').doc(st.id), st))
  bikes.forEach(bk => batch.set(db.collection('bikes').doc(bk.id), bk))
  await batch.commit()

  console.log(`✅ ${stations.length} estaciones y ${bikes.length} bicis creadas`)
}

seed()
