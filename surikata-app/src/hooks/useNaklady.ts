import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Naklad } from '../types'

const KEY = 'suri_naklady'

function load(): Naklad[] {
  return lsGet<Naklad[]>(KEY, [])
}

export function useNaklady() {
  return useQuery({ queryKey: ['naklady'], queryFn: load, staleTime: Infinity })
}

export function useCreateNaklad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Naklad, 'id'>) => {
      const list = load()
      const item: Naklad = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['naklady'] }),
  })
}

export function useUpdateNaklad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Naklad> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((n) => n.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['naklady'] }),
  })
}

export function useDeleteNaklad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((n) => n.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['naklady'] }),
  })
}
