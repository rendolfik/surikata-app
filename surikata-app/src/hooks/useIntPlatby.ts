import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { IntPlatba } from '../types'

const KEY = 'suri_int_platby'

function load(): IntPlatba[] {
  return lsGet<IntPlatba[]>(KEY, [])
}

export function useIntPlatby() {
  return useQuery({ queryKey: ['int_platby'], queryFn: load, staleTime: Infinity })
}

export function useCreateIntPlatba() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<IntPlatba, 'id'>) => {
      const list = load()
      const item: IntPlatba = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['int_platby'] }),
  })
}

export function useUpdateIntPlatba() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<IntPlatba> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((p) => p.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['int_platby'] }),
  })
}

export function useDeleteIntPlatba() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((p) => p.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['int_platby'] }),
  })
}
