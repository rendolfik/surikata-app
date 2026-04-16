import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId, generateFakturaNumber, todayISO, addDays } from '../lib/utils'
import type { Faktura } from '../types'

const KEY = 'suri_faktury'

function load(): Faktura[] {
  return lsGet<Faktura[]>(KEY, [])
}

export function useFaktury() {
  return useQuery({ queryKey: ['faktury'], queryFn: load, staleTime: Infinity })
}

export function useCreateFaktura() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Faktura, 'id' | 'cislo' | 'datum_vystaveni'> & { splatnost_dni?: number }) => {
      const list = load()
      const cislo = generateFakturaNumber(list.map((f) => f.cislo))
      const splatnost_dni = data.splatnost_dni ?? 14
      const item: Faktura = {
        ...data,
        id: genId(),
        cislo,
        datum_vystaveni: todayISO(),
        splatnost: data.splatnost || addDays(todayISO(), splatnost_dni),
        stav: 'vystavena',
      }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faktury'] }),
  })
}

export function useUpdateFaktura() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Faktura> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((f) => f.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faktury'] }),
  })
}

export function useDeleteFaktura() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((f) => f.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faktury'] }),
  })
}
