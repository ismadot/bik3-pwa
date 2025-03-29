import { db } from './firebaseAdmin'

async function deleteAllFromCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get()
  const batch = db.batch()

  snapshot.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  console.log(`🧹 ${collectionName} limpiada (${snapshot.size} documentos eliminados)`)
}

async function resetFirestore() {
  await deleteAllFromCollection('stations')
  await deleteAllFromCollection('bikes')
  console.log('✅ Firestore reseteado con éxito')
}

resetFirestore().catch((err) => {
  console.error('❌ Error limpiando Firestore:', err)
})
