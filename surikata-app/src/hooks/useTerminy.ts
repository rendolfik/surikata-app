import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Termin } from '../types'

const KEY = 'suri_terminy'

const DEFAULT: Termin[] = [
  { id: '1', nazev: 'Jarní kemp – rodiny', datum_od: '2025-05-10', datum_do: '2025-05-17', typ: 'jaro', kapacita: 16, barva: 'green', poznamka: 'Zaměřeno na rodiny s dětmi' },
  { id: '2', nazev: 'Jarní kemp – rodiny 2', datum_od: '2025-05-24', datum_do: '2025-05-31', typ: 'jaro', kapacita: 16, barva: 'green', poznamka: '' },
  { id: '3', nazev: 'Podzimní kemp – dospělí', datum_od: '2025-09-13', datum_do: '2025-09-20', typ: 'podzim', kapacita: 12, barva: 'amber', poznamka: 'Páry, kamarádky, solo' },
  { id: '4', nazev: 'Podzimní kemp – dospělí 2', datum_od: '2025-09-27', datum_do: '2025-10-04', typ: 'podzim', kapacita: 12, barva: 'amber', poznamka: '' },
]

function load(): Termin[] {
  return lsGet<Termin[]>(KEY, DEFAULT)
}

export function useTerminy() {
  return useQuery({ queryKey: ['terminy'], queryFn: load, staleTime: Infinity })
}

export function useCreateTermin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Termin, 'id'>) => {
      const list = load()
      const item: Termin = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terminy'] }),
  })
}

export function useUpdateTermin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Termin> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((t) => t.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terminy'] }),
  })
}

export function useDeleteTermin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((t) => t.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terminy'] }),
  })
}
