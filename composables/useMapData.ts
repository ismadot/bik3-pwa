import { collection, getDocs } from 'firebase/firestore'

export const useMapData = () => {
  const { $db } = useNuxtApp()

  const stations = ref<any[]>([])
  const bikes = ref<any[]>([])

  const fetchStations = async () => {
    const querySnapshot = await getDocs(collection($db, 'stations'))
    stations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const fetchBikes = async () => {
    const querySnapshot = await getDocs(collection($db, 'bikes'))
    bikes.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const loadAll = async () => {
    await Promise.all([fetchStations(), fetchBikes()])
  }

  return { stations, bikes, loadAll }
}
