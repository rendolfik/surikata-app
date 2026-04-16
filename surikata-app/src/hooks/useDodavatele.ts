import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Dodavatel } from '../types'

const KEY = 'suri_dodavatele'

function load(): Dodavatel[] {
  return lsGet<Dodavatel[]>(KEY, [])
}

export function useDodavatele() {
  return useQuery({ queryKey: ['dodavatele'], queryFn: load, staleTime: Infinity })
}

export function useCreateDodavatel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Dodavatel, 'id'>) => {
      const list = load()
      const item: Dodavatel = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dodavatele'] }),
  })
}

export function useUpdateDodavatel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Dodavatel> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((d) => d.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dodavatele'] }),
  })
}

export function useDeleteDodavatel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((d) => d.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dodavatele'] }),
  })
}
