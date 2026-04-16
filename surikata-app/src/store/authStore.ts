import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser } from '../types'

interface AuthStore {
  user: AppUser | null
  setUser: (user: AppUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'surikata-auth' }
  )
)
