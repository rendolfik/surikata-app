import { useState } from 'react'
import { useTerminy, useCreateTermin, useUpdateTermin, useDeleteTermin } from '../../hooks/useTerminy'
import { useUcastnici } from '../../hooks/useUcastnici'
import { useUiStore } from '../../store/uiStore'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../lib/utils'
import type { Termin, TerminTyp } from '../../types'

export default function Terminy() {
  const { data: terminy = [] } = useTerminy()
  const { data: ucastnici = [] } = useUcastnici()
  const createT = useCreateTermin()
  const updateT = useUpdateTermin()
  const deleteT = useDeleteTermin()
  const { addToast } = useUiStore()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const empty = (): Omit<Termin, 'id'> => ({
    nazev: '', datum_od: '', datum_do: '', typ: 'jaro', kapacita: 12, barva: 'green', poznamka: ''
  })
  const [form, setForm] = useState<Omit<Termin, 'id'>>(empty())

  function openNew() {
    setEditId(null); setForm(empty()); setModalOpen(true)
  }
  function openEdit(t: Termin) {
    setEditId(t.id); setForm({ ...t }); setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nazev.trim()) return alert('Zadej název')
    try {
      if (editId) { await updateT.mutateAsync({ id: editId, ...form }); addToast('Termín uložen') }
      else { await createT.mutateAsync(form); addToast('Termín přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat termín? Účastníci ztratí přiřazení.')) return
    await deleteT.mutateAsync(id)
    addToast('Termín smazán')
    setModalOpen(false)
  }

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">Termíny kempů</div>
          <div className="sec-subtitle">Správa termínů a jejich obsazenosti</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nový termín</button>
      </div>

      {terminy.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🗓</div><div className="empty-state-title">Žádné termíny</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {terminy.map((t) => {
            const ucast = ucastnici.filter((u) => u.termin_id === t.id)
            const obsazeno = ucast.reduce((s, u) => s + 1 + (u.spolucestujici?.length || 0), 0)
            const volna = t.kapacita - obsazeno
            const pct = Math.min(100, Math.round((obsazeno / t.kapacita) * 100))
            const isJaro = t.typ === 'jaro'
            return (
              <div key={t.id} className={`bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow ${isJaro ? 'border-t-4 border-t-green-500' : 'border-t-4 border-t-amber-500'}`}>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="font-bold text-sm text-[#0d2d35] leading-tight">{t.nazev}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3 text-xs text-[#5a8a96]">
                  <span>📅 {formatDate(t.datum_od)} – {formatDate(t.datum_do)}</span>
                  <span className={`tbadge ${isJaro ? 'tbadge-low' : 'tbadge-medium'}`}>{isJaro ? '🌸 Jaro' : '🍂 Podzim'}</span>
                </div>
                <div className="h-1.5 bg-[#c8eef5] rounded-full mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#16a34a' }} />
                </div>
                <div className="flex justify-between text-xs text-[#5a8a96] mb-3">
                  <span>👥 {obsazeno} / {t.kapacita} míst</span>
                  <span style={{ color: volna <= 2 ? '#dc2626' : undefined }}>{volna} volných</span>
                </div>
                {t.poznamka && <div className="text-xs text-[#5a8a96] italic mb-3 px-2 py-1.5 bg-[#f0fbfd] rounded-lg">{t.poznamka}</div>}
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => navigate(`/ucastnici?termin=${t.id}`)}
                >
                  👥 Zobrazit účastníky ({ucast.length})
                </button>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit termín' : 'Nový termín'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} placeholder="Jarní kemp – rodiny" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Od</label><input className="form-input" type="date" value={form.datum_od} onChange={(e) => setForm({ ...form, datum_od: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Do</label><input className="form-input" type="date" value={form.datum_do} onChange={(e) => setForm({ ...form, datum_do: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Typ</label>
                <select className="form-input" value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value as TerminTyp, barva: e.target.value === 'jaro' ? 'green' : 'amber' })}>
                  <option value="jaro">🌸 Jarní (rodiny)</option>
                  <option value="podzim">🍂 Podzimní (dospělí)</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Kapacita</label><input className="form-input" type="number" min="1" max="50" value={form.kapacita} onChange={(e) => setForm({ ...form, kapacita: Number(e.target.value) })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit termín</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
