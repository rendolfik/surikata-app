import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import { DEFAULT_IDEAS } from '../lib/constants'
import type { Napad } from '../types'

const KEY = 'suri_napady'

function load(): Napad[] {
  const saved = lsGet<Napad[] | null>(KEY, null)
  return saved && saved.length > 0 ? saved : (DEFAULT_IDEAS as Napad[])
}

export function useNapady() {
  return useQuery({ queryKey: ['napady'], queryFn: load, staleTime: Infinity })
}

export function useCreateNapad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Napad, 'id'>) => {
      const list = load()
      const item: Napad = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['napady'] }),
  })
}

export function useUpdateNapad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Napad> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((n) => n.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['napady'] }),
  })
}

export function useDeleteNapad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((n) => n.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['napady'] }),
  })
}
