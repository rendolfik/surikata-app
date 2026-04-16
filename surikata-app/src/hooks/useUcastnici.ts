import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Ucastnik } from '../types'

const KEY = 'suri_ucastnici'

const DEFAULT: Ucastnik[] = [
  { id: '1001', jmeno: 'Jana', prijmeni: 'Nováková', email: 'jana@email.cz', telefon: '+420 777 111 222', adresa: 'Česká 12, Praha 1, 110 00', tricko: 'M', termin_id: '1', surf: true, ma_deti: false, zaplaceno: false, zaplaceno_castka: 0, poznamka: '', spolucestujici: [], splatky: [] },
  { id: '1002', jmeno: 'Petra', prijmeni: 'Svobodová', email: 'petra@email.cz', telefon: '+420 777 333 444', adresa: 'Moravská 5, Brno, 602 00', tricko: 'S', termin_id: '1', surf: true, ma_deti: true, zaplaceno: true, zaplaceno_castka: 22000, poznamka: 'Jede s dcerou Anežkou', spolucestujici: [{ jmeno: 'Anežka', prijmeni: 'Svobodová', tricko: 'XS', surf: false }], splatky: [] },
  { id: '1003', jmeno: 'Marie', prijmeni: 'Horáková', email: 'marie@email.cz', telefon: '+420 777 555 666', adresa: 'Slezská 8, Ostrava, 702 00', tricko: 'L', termin_id: '2', surf: false, ma_deti: false, zaplaceno: false, zaplaceno_castka: 0, poznamka: '', spolucestujici: [], splatky: [] },
]

function load(): Ucastnik[] {
  return lsGet<Ucastnik[]>(KEY, DEFAULT)
}

export function useUcastnici(terminId?: string) {
  return useQuery({
    queryKey: ['ucastnici', terminId],
    queryFn: () => {
      const list = load()
      if (terminId) return list.filter((u) => u.termin_id === terminId)
      return list
    },
    staleTime: Infinity,
  })
}

export function useCreateUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Ucastnik, 'id'>) => {
      const list = load()
      const item: Ucastnik = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] }),
  })
}

export function useUpdateUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Ucastnik> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((u) => u.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] }),
  })
}

export function useDeleteUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((u) => u.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] }),
  })
}
