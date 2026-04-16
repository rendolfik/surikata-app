import { useMemo } from 'react'
import { useUcastnici } from './useUcastnici'
import { useFaktury } from './useFaktury'
import { useNaklady } from './useNaklady'
import { useTerminy } from './useTerminy'
import { useNastaveniStore } from '../store/nastaveniStore'
import type { Alert } from '../types'
import { daysUntil } from '../lib/utils'

export function useAlerts(): Alert[] {
  const { data: ucastnici = [] } = useUcastnici()
  const { data: faktury = [] } = useFaktury()
  const { data: naklady = [] } = useNaklady()
  const { data: terminy = [] } = useTerminy()
  const { nastaveni } = useNastaveniStore()
  const cfg = nastaveni.alerty

  return useMemo(() => {
    const alerts: Alert[] = []

    // Faktury
    faktury.filter((f) => f.stav === 'vystavena' && f.splatnost).forEach((f) => {
      const dni = daysUntil(f.splatnost)
      if (dni < 0) {
        alerts.push({ typ: 'faktura', uroven: 'error', ikona: '🧾', titul: f.odberatel_jmeno, text: `Faktura ${f.cislo} je po splatnosti ${Math.abs(dni)} dní`, datum: f.splatnost, dni, href: '/fakturace' })
      } else if (dni <= cfg.faktura_pred_dny) {
        alerts.push({ typ: 'faktura', uroven: 'warning', ikona: '🧾', titul: f.odberatel_jmeno, text: `Faktura ${f.cislo} – splatnost za ${dni} dní`, datum: f.splatnost, dni, href: '/fakturace' })
      }
    })

    // Splátky účastníků
    ucastnici.forEach((u) => {
      ;(u.splatky || []).filter((s) => !s.zaplaceno && s.datum).forEach((s, i) => {
        const dni = daysUntil(s.datum)
        const jmeno = `${u.jmeno} ${u.prijmeni}`.trim()
        if (dni < 0 || dni <= cfg.splatka_pred_dny) {
          alerts.push({ typ: 'splatka', uroven: dni < 0 ? 'error' : 'warning', ikona: '👤', titul: jmeno, text: `${i + 1}. splátka ${s.castka.toLocaleString('cs-CZ')} Kč – ${dni < 0 ? `po splatnosti ${Math.abs(dni)} dní` : `za ${dni} dní`}`, datum: s.datum, dni, href: '/ucastnici' })
        }
      })
    })

    // Náklady
    naklady.forEach((n) => {
      const termin = terminy.find((t) => t.id === n.termin_id)
      if (!termin) return
      const dni = daysUntil(termin.datum_od)
      if (dni > cfg.naklad_pred_dny) return
      if (!n.zaloha_zaplacena) {
        alerts.push({ typ: 'naklad', uroven: dni < 0 ? 'error' : 'warning', ikona: '📦', titul: n.nazev, text: `Záloha ${n.zaloha_kc.toLocaleString('cs-CZ')} Kč nezaplacena – termín ${dni < 0 ? 'proběhl' : `za ${dni} dní`}`, datum: termin.datum_od, dni, href: '/naklady' })
      } else if (!n.doplatek_zaplacen) {
        alerts.push({ typ: 'naklad', uroven: dni < 0 ? 'error' : 'warning', ikona: '📦', titul: n.nazev, text: `Doplatek ${(n.celkem_kc - n.zaloha_kc).toLocaleString('cs-CZ')} Kč nezaplacen`, datum: termin.datum_od, dni, href: '/naklady' })
      }
    })

    return alerts.sort((a, b) => a.dni - b.dni)
  }, [ucastnici, faktury, naklady, terminy, cfg])
}
