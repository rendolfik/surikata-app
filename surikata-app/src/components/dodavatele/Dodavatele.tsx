import { useState } from 'react'
import { useDodavatele, useCreateDodavatel, useUpdateDodavatel, useDeleteDodavatel } from '../../hooks/useDodavatele'
import { useUiStore } from '../../store/uiStore'
import type { Dodavatel, DodavatelTyp } from '../../types'

export default function Dodavatele() {
  const { data: dodavatele = [] } = useDodavatele()
  const createD = useCreateDodavatel()
  const updateD = useUpdateDodavatel()
  const deleteD = useDeleteDodavatel()
  const { addToast } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const empty = (): Omit<Dodavatel, 'id'> => ({ nazev: '', typ: '', email: '', telefon: '', ico: '', ucet: '', adresa: '', poznamka: '' })
  const [form, setForm] = useState<Omit<Dodavatel, 'id'>>(empty())

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(d: Dodavatel) { setEditId(d.id); setForm({ ...d }); setModalOpen(true) }

  async function handleSave() {
    if (!form.nazev.trim()) return alert('Zadej název')
    try {
      if (editId) { await updateD.mutateAsync({ id: editId, ...form }); addToast('Dodavatel uložen') }
      else { await createD.mutateAsync(form); addToast('Dodavatel přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat dodavatele?')) return
    await deleteD.mutateAsync(id)
    addToast('Dodavatel smazán')
    setModalOpen(false)
  }

  const TYP_IKONY: Record<string, string> = {
    'Surfová škola': '🏄', 'Ubytování': '🏠', 'Doprava': '🚌',
    'Jóga': '🧘', 'Stravování': '🍽', 'Pojištění': '🛡', 'Jiné': '📌'
  }

  return (
    <div>
      <div className="sec-hdr">
        <div><div className="sec-title">Dodavatelé</div><div className="sec-subtitle">Surfová škola, ubytování, doprava a další</div></div>
        <button className="btn btn-primary" onClick={openNew}>+ Přidat dodavatele</button>
      </div>

      {dodavatele.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🤝</div><div className="empty-state-title">Žádní dodavatelé</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {dodavatele.map((d) => (
            <div key={d.id} className="bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-bold text-sm text-[#0d2d35]">{d.nazev}</div>
                  {d.typ && <div className="text-xs text-[#0899b5] font-medium">{TYP_IKONY[d.typ] || '📌'} {d.typ}</div>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>🗑</button>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap mb-2 text-xs text-[#5a8a96]">
                {d.email && <span>✉️ {d.email}</span>}
                {d.telefon && <span>📞 {d.telefon}</span>}
              </div>
              {d.ico && <div className="text-xs text-[#5a8a96]">IČO: {d.ico}</div>}
              {d.ucet && <div className="text-xs text-[#5a8a96]">Účet: {d.ucet}</div>}
              {d.adresa && <div className="text-xs text-[#5a8a96]">📍 {d.adresa}</div>}
              {d.poznamka && <div className="text-xs text-[#5a8a96] italic mt-2">{d.poznamka}</div>}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">Dodavatel</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} placeholder="Fred's Adventures" /></div>
              <div className="form-group">
                <label className="form-label">Typ</label>
                <select className="form-input" value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value as DodavatelTyp })}>
                  <option value="">— vyberte —</option>
                  {['Surfová škola','Ubytování','Doprava','Jóga','Stravování','Pojištění','Jiné'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={form.telefon || ''} onChange={(e) => setForm({ ...form, telefon: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">IČO</label><input className="form-input" value={form.ico || ''} onChange={(e) => setForm({ ...form, ico: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Číslo účtu / IBAN</label><input className="form-input" value={form.ucet || ''} onChange={(e) => setForm({ ...form, ucet: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Adresa</label><input className="form-input" value={form.adresa || ''} onChange={(e) => setForm({ ...form, adresa: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit dodavatele</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
