import { db } from './firebaseAdmin'
import { GeoPoint } from "firebase-admin/firestore";

// Funciones utilitarias
function getRandomStatus() {
  const options = ["available", "charging", "in_use"];
  return options[Math.floor(Math.random() * options.length)];
}

function randomBattery() {
  return Math.floor(40 + Math.random() * 60);
}

function offsetLocation(base: GeoPoint): GeoPoint {
  return new GeoPoint(
    base.latitude + (Math.random() - 0.5) * 0.002,
    base.longitude + (Math.random() - 0.5) * 0.002
  );
}

const BASE_LAT = -33.728881;
const BASE_LNG = -70.719435;
function offsetNearUser(): GeoPoint {
  return new GeoPoint(
    BASE_LAT + (Math.random() - 0.5) * 0.002,
    BASE_LNG + (Math.random() - 0.5) * 0.002
  );
}

async function deleteAllFromCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(
    `🧹 ${collectionName} limpiada (${snapshot.size} documentos eliminados)`
  );
}

async function seed() {
  console.log("🚧 Limpiando Firestore...");
  await deleteAllFromCollection("stations");
  await deleteAllFromCollection("bikes");

  const stations: any[] = [];
  const bikes: any[] = [];

  // 🔁 Estaciones base (genéricas)
  const stationTemplates = [
    {
      name: "Estación Central",
      location: new GeoPoint(-33.45, -70.66),
      docks: 5,
    },
    {
      name: "Estación Norte",
      location: new GeoPoint(-33.43, -70.655),
      docks: 4,
    },
    {
      name: "Estación Sur",
      location: new GeoPoint(-33.47, -70.665),
      docks: 3,
    },
    {
      name: "Estación Parque",
      location: new GeoPoint(-33.44, -70.67),
      docks: 6,
    },
  ];

  for (const base of stationTemplates) {
    const stationId = db.collection("stations").doc().id;
    const station = {
      id: stationId,
      name: base.name,
      location: base.location,
      docks: base.docks,
      bikes: [] as string[],
    };

    const count = Math.floor(2 + Math.random() * (base.docks - 2));
    for (let i = 0; i < count; i++) {
      const bikeId = db.collection("bikes").doc().id;
      station.bikes.push(bikeId);
      bikes.push({
        id: bikeId,
        status: getRandomStatus(),
        battery: randomBattery(),
        location: offsetLocation(base.location),
        stationId: station.id,
      });
    }

    stations.push(station);
  }

  // 🔁 Estaciones cerca del usuario
  for (let i = 0; i < 10; i++) {
    const stationId = db.collection("stations").doc().id;
    const location = offsetNearUser();
    const station = {
      id: stationId,
      name: `Estación cercana ${i + 1}`,
      location,
      docks: 4 + Math.floor(Math.random() * 3),
      bikes: [] as string[],
    };

    const bikesInStation = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < bikesInStation; j++) {
      const bikeId = db.collection("bikes").doc().id;
      station.bikes.push(bikeId);
      bikes.push({
        id: bikeId,
        status: getRandomStatus(),
        battery: randomBattery(),
        location: offsetNearUser(),
        stationId: stationId,
      });
    }

    stations.push(station);
  }

  // 🔁 Bicis libres cerca del usuario
  for (let i = 0; i < 10; i++) {
    const bikeId = db.collection("bikes").doc().id;
    bikes.push({
      id: bikeId,
      status: "available",
      battery: randomBattery(),
      location: offsetNearUser(),
      stationId: null,
    });
  }

  // ✅ Subida a Firestore
  const batch = db.batch();
  stations.forEach((st) => batch.set(db.collection("stations").doc(st.id), st));
  bikes.forEach((bk) => batch.set(db.collection("bikes").doc(bk.id), bk));
  await batch.commit();

  console.log(
    `✅ ${stations.length} estaciones y ${bikes.length} bicis creadas`
  );
}

seed().catch((err) => console.error("❌ Error al sembrar Firestore:", err));
