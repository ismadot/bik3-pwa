import { defineStore } from 'pinia'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import type { Bike } from "~/types";

interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}
interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  coins: number;
  km: number;
  rides: number;
  createdAt: any;
}

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<User | null>(null);
    const userData = ref<UserData | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const activeReservation = ref<null | {
      bikeId: string;
      fromStationId?: string | null;
      location: { lat: number; lng: number };
      battery: number;
      reservedAt: Date;
    }>(null);

    const fetchUserData = async () => {
      if (!user.value) return;
      const { $db } = useNuxtApp();
      const ref = doc($db, "users", user.value.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        userData.value = snap.data() as UserData;
      }
    };

    const loginWithGoogle = async () => {
      const { $auth } = useNuxtApp();
      const provider = new GoogleAuthProvider();
      loading.value = true;
      error.value = null;

      try {
        const result = await signInWithPopup($auth, provider);
        user.value = result.user;
        await ensureUserDoc(result.user);
        await fetchUserData();
      } catch (e: any) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    const logout = async () => {
      const { $auth } = useNuxtApp();
      loading.value = true;
      error.value = null;

      try {
        await signOut($auth);
        user.value = null;
      } catch (e: any) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    const initSession = () => {
      const { $auth } = useNuxtApp();
      loading.value = true;
      onAuthStateChanged($auth, (u) => {
        user.value = u;
        loading.value = false;
      });
    };
    const loginWithEmail = async (email: string, password: string) => {
      const { $auth } = useNuxtApp();
      loading.value = true;
      error.value = null;

      try {
        const result = await signInWithEmailAndPassword($auth, email, password);
        user.value = result.user;
      } catch (e: any) {
        if (e.code === "auth/user-not-found") {
          try {
            const newUser = await createUserWithEmailAndPassword(
              $auth,
              email,
              password
            );
            user.value = newUser.user;
            await fetchUserData();
          } catch (createErr: any) {
            error.value = createErr.message;
          }
        } else {
          error.value = e.message;
        }
      } finally {
        loading.value = false;
      }
    };

    const registerWithEmail = async (email: string, password: string) => {
      const { $auth } = useNuxtApp();
      loading.value = true;
      error.value = null;

      try {
        const newUser = await createUserWithEmailAndPassword(
          $auth,
          email,
          password
        );
        user.value = newUser.user;
        await ensureUserDoc(user.value);
        await fetchUserData();
      } catch (e: any) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };
    const ensureUserDoc = async (user: User) => {
      const { $db } = useNuxtApp();
      const ref = doc($db, "users", user.uid);
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || null,
          coins: 0,
          km: 0,
          rides: 0,
          createdAt: serverTimestamp(),
        });
      }
    };
    const setReservation = (bike: Bike, fromStationId?: string | null) => {
      activeReservation.value = {
        bikeId: bike.id,
        location: {
          lat: bike.location.latitude,
          lng: bike.location.longitude,
        },
        battery: bike.battery,
        fromStationId: fromStationId || null,
        reservedAt: new Date(),
      };
    };
    const clearReservation = () => {
      activeReservation.value = null;
    };

    return {
      user,
      userData,
      loading,
      error,
      loginWithGoogle,
      logout,
      initSession,
      loginWithEmail,
      registerWithEmail,
      fetchUserData,
      activeReservation,
      clearReservation,
      setReservation,
    };
  },
  {
    persist: {
      key: "user-persist",
    },
  }
);
