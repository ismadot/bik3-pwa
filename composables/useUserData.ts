import { doc, getDoc } from "firebase/firestore"

export const useUserData = async (uid: string) => {
  const { $db } = useNuxtApp()
  const ref = doc($db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}
