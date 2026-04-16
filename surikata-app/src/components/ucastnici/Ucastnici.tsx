import { useState } from 'react'
import { useUcastnici, useCreateUcastnik, useUpdateUcastnik, useDeleteUcastnik } from '../../hooks/useUcastnici'
import { useTerminy } from '../../hooks/useTerminy'
import { useNastaveniStore } from '../../store/nastaveniStore'
import { useUiStore } from '../../store/uiStore'
import { todayISO, addDays, genId } from '../../lib/utils'
import type { Ucastnik, Splatka, Spolucestujici } from '../../types'

export default function Ucastnici() {
  const { data: ucastnici = [] } = useUcastnici()
  const { data: terminy = [] } = useTerminy()
  const { nastaveni } = useNastaveniStore()
  const { addToast } = useUiStore()
  const createU = useCreateUcastnik()
  const updateU = useUpdateUcastnik()
  const deleteU = useDeleteUcastnik()

  const [filterPlatba, setFilterPlatba] = useState<'all'|'zaplaceno'|'nezaplaceno'>('all')
  const [filterTermin, setFilterTermin] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const emptyForm = (): Omit<Ucastnik, 'id'> => ({
    jmeno: '', prijmeni: '', email: '', telefon: '', adresa: '',
    tricko: 'M', termin_id: terminy[0]?.id || null,
    surf: true, ma_deti: false, zaplaceno: false, zaplaceno_castka: 0,
    poznamka: '', spolucestujici: [], splatky: [],
  })
  const [form, setForm] = useState<Omit<Ucastnik, 'id'>>(emptyForm())

  const filtered = ucastnici.filter((u) => {
    if (filterTermin !== 'all' && u.termin_id !== filterTermin) return false
    if (filterPlatba === 'zaplaceno' && !u.zaplaceno) return false
    if (filterPlatba === 'nezaplaceno' && u.zaplaceno) return false
    if (search) {
      const q = search.toLowerCase()
      return `${u.jmeno} ${u.prijmeni} ${u.email}`.toLowerCase().includes(q)
    }
    return true
  })

  const totalOsoby = filtered.reduce((s, u) => s + 1 + (u.spolucestujici?.length || 0), 0)
  const zaplaceno = filtered.filter((u) => u.zaplaceno).length
  const nezaplaceno = filtered.length - zaplaceno

  function openNew() {
    setEditId(null)
    setForm({ ...emptyForm(), termin_id: terminy[0]?.id || null })
    setModalOpen(true)
  }

  function openEdit(u: Ucastnik) {
    setEditId(u.id)
    setForm({ ...u })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.jmeno.trim()) return alert('Zadej jméno')
    try {
      if (editId) {
        await updateU.mutateAsync({ id: editId, ...form })
        addToast('Účastník uložen')
      } else {
        await createU.mutateAsync(form)
        addToast('Účastník přidán')
      }
      setModalOpen(false)
    } catch { addToast('Chyba při ukládání', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat účastníka?')) return
    await deleteU.mutateAsync(id)
    addToast('Účastník smazán')
    setModalOpen(false)
  }

  async function togglePlatba(u: Ucastnik) {
    await updateU.mutateAsync({ id: u.id, zaplaceno: !u.zaplaceno })
  }

  function addSpolucestujici() {
    setForm((f) => ({ ...f, spolucestujici: [...f.spolucestujici, { jmeno: '', prijmeni: '', tricko: 'M', surf: true }] }))
  }

  function updateSpolucestujici(i: number, data: Partial<Spolucestujici>) {
    setForm((f) => {
      const s = [...f.spolucestujici]
      s[i] = { ...s[i], ...data }
      return { ...f, spolucestujici: s }
    })
  }

  function removeSpolucestujici(i: number) {
    setForm((f) => ({ ...f, spolucestujici: f.spolucestujici.filter((_, j) => j !== i) }))
  }

  function addSplatka() {
    const today = todayISO()
    setForm((f) => ({
      ...f,
      splatky: [...f.splatky, {
        id: genId(),
        castka: Math.round(nastaveni.ceny.dospely_surfujici / 2),
        datum: addDays(today, nastaveni.ceny.splatnost_dni),
        zaplaceno: false,
      }]
    }))
  }

  function updateSplatka(i: number, data: Partial<Splatka>) {
    setForm((f) => {
      const s = [...f.splatky]
      s[i] = { ...s[i], ...data }
      return { ...f, splatky: s }
    })
  }

  function removeSplatka(i: number) {
    setForm((f) => ({ ...f, splatky: f.splatky.filter((_, j) => j !== i) }))
  }

  const TRICKA = ['XS','S','M','L','XL','XXL']

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">Účastníci</div>
          <div className="sec-subtitle">Správa přihlášených účastníků kempů</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Přidat účastníka</button>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        {[
          { num: filtered.length, label: 'Přihlášených', color: '' },
          { num: totalOsoby, label: 'Osob celkem', color: '' },
          { num: zaplaceno, label: 'Zaplaceno', color: 'green' },
          { num: nezaplaceno, label: 'Čeká platba', color: nezaplaceno > 0 ? 'red' : '' },
        ].map((s, i) => (
          <div key={i} className="stat-box">
            <span className={`stat-num ${s.color}`}>{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          className="form-input max-w-[220px]"
          placeholder="🔍 Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-input max-w-[200px]" value={filterTermin} onChange={(e) => setFilterTermin(e.target.value)}>
          <option value="all">Všechny termíny</option>
          {terminy.map((t) => <option key={t.id} value={t.id}>{t.nazev}</option>)}
        </select>
        {(['all','zaplaceno','nezaplaceno'] as const).map((f) => (
          <button key={f} onClick={() => setFilterPlatba(f)}
            className={`filter-btn px-3 py-1.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer
              ${filterPlatba === f ? 'bg-[#0dc0df] text-white border-[#0dc0df]' : 'bg-white text-[#5a8a96] border-[#c8eef5] hover:border-[#0dc0df]'}`}>
            {f === 'all' ? 'Vše' : f === 'zaplaceno' ? '✅ Zaplaceno' : '⏳ Nezaplaceno'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">Žádní účastníci</div>
          <p className="text-sm text-[#5a8a96]">Přidej prvního účastníka kliknutím na tlačítko výše.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((u) => {
            const termin = terminy.find((t) => t.id === u.termin_id)
            const hasSplatky = u.splatky && u.splatky.length > 1
            const celkem = nastaveni.ceny.dospely_surfujici * (1 + (u.spolucestujici?.length || 0))
            const zapCastka = u.splatky?.reduce((s, x) => s + (x.zaplaceno ? x.castka : 0), 0) || 0
            const zbyva = celkem - zapCastka

            return (
              <div key={u.id} className={`bg-white border rounded-xl p-3.5 transition-shadow hover:shadow-ocean ${!u.zaplaceno ? 'border-l-4 border-l-amber-400 border-t-[#c8eef5] border-r-[#c8eef5] border-b-[#c8eef5]' : 'border-[#c8eef5]'}`}>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0899b5] to-[#0dc0df] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {u.jmeno[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#0d2d35]">{u.jmeno} {u.prijmeni}</div>
                    <div className="text-xs text-[#5a8a96] truncate">{u.email}</div>
                  </div>
                  <span className={`tbadge ${hasSplatky ? (zbyva <= 0 ? 'tbadge-low' : 'tbadge-medium') : (u.zaplaceno ? 'tbadge-low' : 'tbadge-high')}`}>
                    {hasSplatky
                      ? (zbyva <= 0 ? '✅ Zaplaceno' : `💳 ${zapCastka.toLocaleString('cs-CZ')} / ${celkem.toLocaleString('cs-CZ')} Kč`)
                      : (u.zaplaceno ? '✅ Zaplaceno' : '⏳ Čeká platba')}
                  </span>
                </div>

                {hasSplatky && (
                  <div className="mb-2.5">
                    <div className="h-1.5 bg-[#c8eef5] rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (zapCastka / celkem) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {termin && <span className="tbadge tbadge-neutral">🗓 {termin.nazev}</span>}
                  {u.surf && <span className="tbadge tbadge-neutral">🏄 Surfuje</span>}
                  {u.ma_deti && <span className="tbadge tbadge-neutral">👶 S dětmi</span>}
                  <span className="tbadge tbadge-neutral">👕 {u.tricko}</span>
                  {u.telefon && <span className="tbadge tbadge-neutral">📞 {u.telefon}</span>}
                </div>

                {u.spolucestujici?.length > 0 && (
                  <div className="bg-[#f0fbfd] rounded-lg p-2 mb-2.5 text-xs">
                    <div className="font-bold text-[#5a8a96] uppercase tracking-wide text-[10px] mb-1">Spolucestující:</div>
                    {u.spolucestujici.map((s, i) => (
                      <div key={i} className="text-[#0d2d35]">{s.jmeno} {s.prijmeni}{s.tricko ? ` · 👕 ${s.tricko}` : ''}{s.surf ? ' · 🏄' : ''}</div>
                    ))}
                  </div>
                )}

                {u.poznamka && <div className="text-xs text-[#5a8a96] italic mb-2.5 px-2 py-1.5 bg-[#f0fbfd] rounded-lg">💬 {u.poznamka}</div>}

                <div className="flex gap-1.5 pt-2.5 border-t border-[#c8eef5] flex-wrap">
                  <button onClick={() => togglePlatba(u)} className={`btn btn-sm flex-1 ${u.zaplaceno ? 'btn-secondary' : 'btn-primary'}`}>
                    {u.zaplaceno ? 'Zrušit platbu' : '✅ Zaplaceno'}
                  </button>
                  <button onClick={() => openEdit(u)} className="btn btn-secondary btn-sm">✏️</button>
                  <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm">🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box" style={{ width: 580 }}>
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit účastníka' : 'Nový účastník'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="form-row">
              <div className="form-group"><label className="form-label">Jméno *</label><input className="form-input" value={form.jmeno} onChange={(e) => setForm({ ...form, jmeno: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Příjmení</label><input className="form-input" value={form.prijmeni} onChange={(e) => setForm({ ...form, prijmeni: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.telefon || ''} onChange={(e) => setForm({ ...form, telefon: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Termín kempu</label>
                <select className="form-input" value={form.termin_id || ''} onChange={(e) => setForm({ ...form, termin_id: e.target.value || null })}>
                  <option value="">— Bez termínu —</option>
                  {terminy.map((t) => <option key={t.id} value={t.id}>{t.nazev} ({t.datum_od})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Velikost trička</label>
                <select className="form-input" value={form.tricko} onChange={(e) => setForm({ ...form, tricko: e.target.value })}>
                  {TRICKA.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Adresa</label><input className="form-input" value={form.adresa || ''} onChange={(e) => setForm({ ...form, adresa: e.target.value })} /></div>

            <div className="flex gap-5 mb-4 flex-wrap">
              <label className="checkbox-label"><input type="checkbox" checked={form.surf} onChange={(e) => setForm({ ...form, surf: e.target.checked })} /> 🏄 Bude surfovat</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.ma_deti} onChange={(e) => setForm({ ...form, ma_deti: e.target.checked })} /> 👶 Jede s dětmi</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.zaplaceno} onChange={(e) => setForm({ ...form, zaplaceno: e.target.checked })} /> ✅ Platba přijata</label>
            </div>

            {/* Spolucestující */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label m-0">Spolucestující</label>
                <button className="btn btn-secondary btn-sm" onClick={addSpolucestujici}>+ Přidat osobu</button>
              </div>
              {form.spolucestujici.map((s, i) => (
                <div key={i} className="grid gap-2 mb-2 p-2.5 bg-[#f0fbfd] rounded-lg" style={{ gridTemplateColumns: '1fr 1fr auto auto auto' }}>
                  <input className="form-input" placeholder="Jméno" value={s.jmeno} onChange={(e) => updateSpolucestujici(i, { jmeno: e.target.value })} />
                  <input className="form-input" placeholder="Příjmení" value={s.prijmeni} onChange={(e) => updateSpolucestujici(i, { prijmeni: e.target.value })} />
                  <select className="form-input" value={s.tricko} onChange={(e) => updateSpolucestujici(i, { tricko: e.target.value })}>
                    {TRICKA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="checkbox-label text-xs whitespace-nowrap"><input type="checkbox" checked={s.surf} onChange={(e) => updateSpolucestujici(i, { surf: e.target.checked })} /> Surf</label>
                  <button className="btn btn-danger btn-sm" onClick={() => removeSpolucestujici(i)}>×</button>
                </div>
              ))}
            </div>

            {/* Splátky */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label m-0">Splátky</label>
                <button className="btn btn-secondary btn-sm" onClick={addSplatka}>+ Přidat splátku</button>
              </div>
              {form.splatky.map((s, i) => (
                <div key={i} className={`grid gap-2 mb-2 p-2.5 rounded-lg ${s.zaplaceno ? 'bg-green-50 border border-green-200' : 'bg-[#f0fbfd] border border-[#c8eef5]'}`} style={{ gridTemplateColumns: '24px 1fr 1fr auto auto' }}>
                  <span className="text-xs font-bold text-[#5a8a96] pt-2">{i + 1}.</span>
                  <div>
                    <div className="text-[10px] text-[#5a8a96] uppercase font-bold mb-1">Částka (Kč)</div>
                    <input className="form-input" type="number" value={s.castka} onChange={(e) => updateSplatka(i, { castka: Number(e.target.value) })} />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5a8a96] uppercase font-bold mb-1">Datum splatnosti</div>
                    <input className="form-input" type="date" value={s.datum} onChange={(e) => updateSplatka(i, { datum: e.target.value })} />
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="text-[10px] text-[#5a8a96] uppercase font-bold">Zaplaceno</div>
                    <input type="checkbox" checked={s.zaplaceno} onChange={(e) => updateSplatka(i, { zaplaceno: e.target.checked })} className="w-4 h-4 accent-[#0dc0df]" />
                  </div>
                  <button className="btn btn-danger btn-sm self-end" onClick={() => removeSplatka(i)}>×</button>
                </div>
              ))}
            </div>

            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>

            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit účastníka</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
