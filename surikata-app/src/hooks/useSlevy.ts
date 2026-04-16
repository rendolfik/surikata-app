import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { SlevovyKod } from '../types'

const KEY = 'suri_slevy'

function load(): SlevovyKod[] {
  return lsGet<SlevovyKod[]>(KEY, [])
}

export function useSlevy() {
  return useQuery({ queryKey: ['slevy'], queryFn: load, staleTime: Infinity })
}

export function useCreateSleva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<SlevovyKod, 'id'>) => {
      const list = load()
      const item: SlevovyKod = { ...data, id: genId() }
      lsSet(KEY, [...list, item])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slevy'] }),
  })
}

export function useDeleteSleva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((s) => s.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slevy'] }),
  })
}
