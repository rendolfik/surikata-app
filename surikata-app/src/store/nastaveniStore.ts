import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Nastaveni } from '../types'

const DEFAULT: Nastaveni = {
  firma: {
    nazev: 'Surikata surf z.s.',
    ico: '22455191',
    adresa: 'Husova 378, Bílé Předměstí',
    psc_mesto: '530 03 Pardubice',
    ucet: '2703088116/2010',
    iban: 'CZ5620100000002703088116',
    telefon: '603 112 799',
    email: 'jedu@surikatasurfcamp.cz',
    web: 'surikatasurfcamp.cz',
    soud_zapis: 'L 15010/KSHK Krajský soud v Hradci Králové',
  },
  ceny: {
    dospely_surfujici: 22000,
    dospely_nesurfujici: 22000,
    dite_surfujici: 15000,
    dite_nesurfujici: 12000,
    splatnost_dni: 14,
  },
  faktura: {
    email_predmet: 'Faktura {cislo} – Surikata Surf Camp',
    email_telo: 'Dobrý den,\n\nv příloze zasíláme fakturu {cislo}.\n\nTěšíme se na Vás!\n\nSurikata Surf Camp',
    poznamka_sablona: 'Těšíme se na vás na kempu!',
  },
  alerty: {
    faktura_pred_dny: 5,
    splatka_pred_dny: 5,
    naklad_pred_dny: 7,
  },
}

interface NastaveniStore {
  nastaveni: Nastaveni
  update: (n: Partial<Nastaveni>) => void
  updateFirma: (f: Partial<Nastaveni['firma']>) => void
  updateCeny: (c: Partial<Nastaveni['ceny']>) => void
  updateFaktura: (f: Partial<Nastaveni['faktura']>) => void
  updateAlerty: (a: Partial<Nastaveni['alerty']>) => void
}

export const useNastaveniStore = create<NastaveniStore>()(
  persist(
    (set) => ({
      nastaveni: DEFAULT,
      update: (n) => set((s) => ({ nastaveni: { ...s.nastaveni, ...n } })),
      updateFirma: (f) => set((s) => ({ nastaveni: { ...s.nastaveni, firma: { ...s.nastaveni.firma, ...f } } })),
      updateCeny: (c) => set((s) => ({ nastaveni: { ...s.nastaveni, ceny: { ...s.nastaveni.ceny, ...c } } })),
      updateFaktura: (f) => set((s) => ({ nastaveni: { ...s.nastaveni, faktura: { ...s.nastaveni.faktura, ...f } } })),
      updateAlerty: (a) => set((s) => ({ nastaveni: { ...s.nastaveni, alerty: { ...s.nastaveni.alerty, ...a } } })),
    }),
    { name: 'surikata-nastaveni' }
  )
)
