import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

export const useAuthUI = () => {
  const store = useUserStore()
  const { user, loading, error } = storeToRefs(store)
  const { loginWithGoogle, loginWithEmail, logout, initSession, registerWithEmail } = store

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    logout,
    initSession,
    registerWithEmail
  }
}
