import { useState } from 'react'
import { useNastaveniStore } from '../../store/nastaveniStore'
import { useTerminy, useCreateTermin, useUpdateTermin, useDeleteTermin } from '../../hooks/useTerminy'
import { useUiStore } from '../../store/uiStore'
import { formatDate } from '../../lib/utils'
import type { Termin, TerminTyp } from '../../types'

type Tab = 'firma' | 'ceny' | 'faktura' | 'alerty' | 'terminy'

export default function Nastaveni() {
  const [tab, setTab] = useState<Tab>('firma')
  const { nastaveni, updateFirma, updateCeny, updateFaktura, updateAlerty } = useNastaveniStore()
  const { addToast } = useUiStore()

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'firma', label: 'Firma', icon: '🏢' },
    { id: 'ceny', label: 'Ceny', icon: '💰' },
    { id: 'faktura', label: 'Faktura', icon: '🧾' },
    { id: 'alerty', label: 'Alerty', icon: '🔔' },
    { id: 'terminy', label: 'Termíny', icon: '🗓' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <div><div className="sec-title">Nastavení</div><div className="sec-subtitle">Firma, ceny, šablony a termíny kempu</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap border-b border-[#c8eef5] pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              tab === t.id
                ? 'border-[#0dc0df] text-[#0dc0df] bg-[#f0fbfd]'
                : 'border-transparent text-[#5a8a96] hover:text-[#0899b5]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'firma' && (
        <FirmaTab
          firma={nastaveni.firma}
          onSave={(f) => { updateFirma(f); addToast('Nastavení firmy uloženo') }}
        />
      )}
      {tab === 'ceny' && (
        <CenyTab
          ceny={nastaveni.ceny}
          onSave={(c) => { updateCeny(c); addToast('Ceny uloženy') }}
        />
      )}
      {tab === 'faktura' && (
        <FakturaTab
          faktura={nastaveni.faktura}
          onSave={(f) => { updateFaktura(f); addToast('Šablony uloženy') }}
        />
      )}
      {tab === 'alerty' && (
        <AlertyTab
          alerty={nastaveni.alerty}
          onSave={(a) => { updateAlerty(a); addToast('Nastavení alertů uloženo') }}
        />
      )}
      {tab === 'terminy' && <TerminyTab />}
    </div>
  )
}

/* ---- Firma ---- */
function FirmaTab({ firma, onSave }: { firma: any; onSave: (f: any) => void }) {
  const [form, setForm] = useState({ ...firma })
  const f = (k: string, v: string) => setForm((prev: any) => ({ ...prev, [k]: v }))

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#c8eef5] rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group"><label className="form-label">Název firmy</label><input className="form-input" value={form.nazev} onChange={(e) => f('nazev', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">IČO</label><input className="form-input" value={form.ico} onChange={(e) => f('ico', e.target.value)} /></div>
          <div className="form-group sm:col-span-2"><label className="form-label">Adresa</label><input className="form-input" value={form.adresa} onChange={(e) => f('adresa', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">PSČ a město</label><input className="form-input" value={form.psc_mesto} onChange={(e) => f('psc_mesto', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Číslo účtu</label><input className="form-input" value={form.ucet} onChange={(e) => f('ucet', e.target.value)} /></div>
          <div className="form-group sm:col-span-2"><label className="form-label">IBAN</label><input className="form-input" value={form.iban} onChange={(e) => f('iban', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.telefon} onChange={(e) => f('telefon', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.email} onChange={(e) => f('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Web</label><input className="form-input" value={form.web} onChange={(e) => f('web', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Zápis v soudu</label><input className="form-input" value={form.soud_zapis} onChange={(e) => f('soud_zapis', e.target.value)} /></div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Uložit</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Ceny ---- */
function CenyTab({ ceny, onSave }: { ceny: any; onSave: (c: any) => void }) {
  const [form, setForm] = useState({ ...ceny })
  const f = (k: string, v: number) => setForm((prev: any) => ({ ...prev, [k]: v }))

  return (
    <div className="max-w-xl">
      <div className="bg-white border border-[#c8eef5] rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">🏄 Dospělý + surf (Kč)</label>
            <input className="form-input" type="number" value={form.dospely_surfujici} onChange={(e) => f('dospely_surfujici', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">🧘 Dospělý bez surfu (Kč)</label>
            <input className="form-input" type="number" value={form.dospely_nesurfujici} onChange={(e) => f('dospely_nesurfujici', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">🏄 Dítě + surf (Kč)</label>
            <input className="form-input" type="number" value={form.dite_surfujici} onChange={(e) => f('dite_surfujici', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">👶 Dítě bez surfu (Kč)</label>
            <input className="form-input" type="number" value={form.dite_nesurfujici} onChange={(e) => f('dite_nesurfujici', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">📅 Splatnost faktury (dní)</label>
            <input className="form-input" type="number" min="1" value={form.splatnost_dni} onChange={(e) => f('splatnost_dni', Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Uložit</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Faktura šablony ---- */
function FakturaTab({ faktura, onSave }: { faktura: any; onSave: (f: any) => void }) {
  const [form, setForm] = useState({ ...faktura })

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#c8eef5] rounded-xl p-5">
        <div className="form-group">
          <label className="form-label">Předmět e-mailu</label>
          <input className="form-input" value={form.email_predmet} onChange={(e) => setForm({ ...form, email_predmet: e.target.value })} />
          <div className="text-xs text-[#5a8a96] mt-1">Proměnné: {'{cislo}'}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Tělo e-mailu</label>
          <textarea className="form-input" rows={6} value={form.email_telo} onChange={(e) => setForm({ ...form, email_telo: e.target.value })} />
          <div className="text-xs text-[#5a8a96] mt-1">Proměnné: {'{cislo}'}, {'{castka}'}, {'{splatnost}'}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Výchozí poznámka na faktuře</label>
          <textarea className="form-input" rows={3} value={form.poznamka_sablona} onChange={(e) => setForm({ ...form, poznamka_sablona: e.target.value })} />
        </div>
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Uložit</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Alerty ---- */
function AlertyTab({ alerty, onSave }: { alerty: any; onSave: (a: any) => void }) {
  const [form, setForm] = useState({ ...alerty })
  const f = (k: string, v: number) => setForm((prev: any) => ({ ...prev, [k]: v }))

  return (
    <div className="max-w-md">
      <div className="bg-white border border-[#c8eef5] rounded-xl p-5">
        <div className="text-xs text-[#5a8a96] mb-4">Počet dní předem, kdy se zobrazí upozornění na dashboardu.</div>
        <div className="form-group">
          <label className="form-label">🧾 Splatnost faktury (dní předem)</label>
          <input className="form-input" type="number" min="0" value={form.faktura_pred_dny} onChange={(e) => f('faktura_pred_dny', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">👤 Splátka účastníka (dní předem)</label>
          <input className="form-input" type="number" min="0" value={form.splatka_pred_dny} onChange={(e) => f('splatka_pred_dny', Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">📦 Záloha / doplatek nákladu (dní předem)</label>
          <input className="form-input" type="number" min="0" value={form.naklad_pred_dny} onChange={(e) => f('naklad_pred_dny', Number(e.target.value))} />
        </div>
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Uložit</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Termíny ---- */
function TerminyTab() {
  const { data: terminy = [] } = useTerminy()
  const createT = useCreateTermin()
  const updateT = useUpdateTermin()
  const deleteT = useDeleteTermin()
  const { addToast } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const empty = (): Omit<Termin, 'id' | 'created_at'> => ({
    nazev: '', datum_od: '', datum_do: '', typ: 'jaro', kapacita: 12, barva: '#0dc0df', poznamka: ''
  })
  const [form, setForm] = useState<Omit<Termin, 'id' | 'created_at'>>(empty())

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(t: Termin) { setEditId(t.id); setForm({ nazev: t.nazev, datum_od: t.datum_od, datum_do: t.datum_do, typ: t.typ, kapacita: t.kapacita, barva: t.barva || '#0dc0df', poznamka: t.poznamka || '' }); setModalOpen(true) }

  async function handleSave() {
    if (!form.nazev.trim() || !form.datum_od || !form.datum_do) return alert('Vyplň název a data')
    try {
      if (editId) { await updateT.mutateAsync({ id: editId, ...form }); addToast('Termín uložen') }
      else { await createT.mutateAsync(form); addToast('Termín přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat termín?')) return
    await deleteT.mutateAsync(id)
    addToast('Termín smazán')
    setModalOpen(false)
  }

  const BARVY = ['#0dc0df', '#ff6b35', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-[#5a8a96]">{terminy.length} termín{terminy.length !== 1 ? 'ů' : ''}</div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Přidat termín</button>
      </div>

      {terminy.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🗓</div><div className="empty-state-title">Žádné termíny</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {terminy.map((t) => (
            <div key={t.id} className="bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow" style={{ borderLeftColor: t.barva, borderLeftWidth: 4 }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-[#0d2d35]">{t.nazev}</div>
                  <div className="text-xs text-[#5a8a96] mt-0.5">{formatDate(t.datum_od)} – {formatDate(t.datum_do)}</div>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`tbadge ${t.typ === 'jaro' ? 'tbadge-low' : 'tbadge-medium'}`}>{t.typ === 'jaro' ? '🌸 Jaro' : '🍂 Podzim'}</span>
                    <span className="tbadge tbadge-neutral">👥 max {t.kapacita}</span>
                  </div>
                  {t.poznamka && <div className="text-xs text-[#5a8a96] italic mt-1">{t.poznamka}</div>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit termín' : 'Nový termín'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} placeholder="Baleal Jaro 2025" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Od</label><input className="form-input" type="date" value={form.datum_od} onChange={(e) => setForm({ ...form, datum_od: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Do</label><input className="form-input" type="date" value={form.datum_do} onChange={(e) => setForm({ ...form, datum_do: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Typ</label>
                <select className="form-input" value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value as TerminTyp })}>
                  <option value="jaro">🌸 Jaro</option>
                  <option value="podzim">🍂 Podzim</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Kapacita</label>
                <input className="form-input" type="number" min="1" value={form.kapacita} onChange={(e) => setForm({ ...form, kapacita: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Barva</label>
              <div className="flex gap-2 flex-wrap">
                {BARVY.map(b => (
                  <button key={b} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.barva === b ? 'border-[#0d2d35] scale-110' : 'border-transparent'}`} style={{ backgroundColor: b }} onClick={() => setForm({ ...form, barva: b })} />
                ))}
                <input type="color" className="w-8 h-8 rounded-full cursor-pointer border-0" value={form.barva} onChange={(e) => setForm({ ...form, barva: e.target.value })} title="Vlastní barva" />
              </div>
            </div>
            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId!)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit termín</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
