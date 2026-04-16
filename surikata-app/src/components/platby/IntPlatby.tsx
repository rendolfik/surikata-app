import { useState } from 'react'
import { useIntPlatby, useCreateIntPlatba, useUpdateIntPlatba, useDeleteIntPlatba } from '../../hooks/useIntPlatby'
import { useUiStore } from '../../store/uiStore'
import { formatCurrency, formatDate, todayISO } from '../../lib/utils'
import type { IntPlatba } from '../../types'

export default function IntPlatby() {
  const { data: platby = [] } = useIntPlatby()
  const createP = useCreateIntPlatba()
  const updateP = useUpdateIntPlatba()
  const deleteP = useDeleteIntPlatba()
  const { addToast } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const empty = (): Omit<IntPlatba, 'id'> => ({ nazev: '', castka: 0, datum: todayISO(), uzivatel: 'Já', poznamka: '' })
  const [form, setForm] = useState<Omit<IntPlatba, 'id'>>(empty())

  // Saldo
  const saldo: Record<string, number> = {}
  platby.forEach(p => { saldo[p.uzivatel] = (saldo[p.uzivatel] || 0) + p.castka })
  const jmena = Object.keys(saldo)
  const total = Object.values(saldo).reduce((s, v) => s + v, 0)
  const podil = jmena.length > 0 ? total / jmena.length : 0

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(p: IntPlatba) { setEditId(p.id); setForm({ ...p }); setModalOpen(true) }

  async function handleSave() {
    if (!form.nazev.trim()) return alert('Zadej název')
    try {
      if (editId) { await updateP.mutateAsync({ id: editId, ...form }); addToast('Platba uložena') }
      else { await createP.mutateAsync(form); addToast('Platba přidána') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat platbu?')) return
    await deleteP.mutateAsync(id)
    addToast('Platba smazána')
    setModalOpen(false)
  }

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">Interní platby</div>
          <div className="sec-subtitle">Platby ze společného účtu – kdo kolik platil a co dluží</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Přidat platbu</button>
      </div>

      {/* Saldo summary */}
      {jmena.length > 0 && (
        <div className="bg-white border border-[#c8eef5] rounded-xl p-5 mb-5">
          <div className="font-bold text-sm text-[#0d2d35] mb-4">💳 Souhrn plateb</div>
          <div className="flex gap-4 flex-wrap items-start">
            {jmena.map(jmeno => {
              const diff = saldo[jmeno] - podil
              return (
                <div key={jmeno} className="flex-1 min-w-[140px] bg-[#f0fbfd] rounded-xl p-4">
                  <div className="font-bold text-[#066a80] text-base">{jmeno}</div>
                  <div className="text-2xl font-bold text-[#0d2d35] mt-1">{formatCurrency(saldo[jmeno])}</div>
                  <div className={`text-sm font-semibold mt-1 ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-[#5a8a96]'}`}>
                    {diff > 0 ? `dostane zpět ${formatCurrency(diff)}` : diff < 0 ? `dluží ${formatCurrency(Math.abs(diff))}` : '✅ Vyrovnáno'}
                  </div>
                </div>
              )
            })}
            <div className="flex-1 min-w-[140px] bg-[#f0fbfd] rounded-xl p-4 border-2 border-[#0dc0df]">
              <div className="font-bold text-[#5a8a96] text-sm">Celkem zaplaceno</div>
              <div className="text-2xl font-bold text-[#066a80] mt-1">{formatCurrency(total)}</div>
              <div className="text-xs text-[#5a8a96] mt-1">Podíl na osobu: {formatCurrency(podil)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {platby.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💳</div><div className="empty-state-title">Žádné platby</div></div>
      ) : (
        <div className="bg-white border border-[#c8eef5] rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f0fbfd]">
                {['Název','Částka','Datum','Kdo platil','Poznámka',''].map((h, i) => (
                  <th key={i} className="py-2.5 px-4 text-left text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platby.map((p) => (
                <tr key={p.id} className="border-b border-[#c8eef5] last:border-0 hover:bg-[#f8fdfe]">
                  <td className="py-2.5 px-4 font-semibold text-sm text-[#0d2d35]">{p.nazev}</td>
                  <td className="py-2.5 px-4 font-bold text-[#0d2d35]">{formatCurrency(p.castka)}</td>
                  <td className="py-2.5 px-4 text-sm text-[#5a8a96]">{formatDate(p.datum)}</td>
                  <td className="py-2.5 px-4"><span className="tbadge tbadge-neutral">👤 {p.uzivatel}</span></td>
                  <td className="py-2.5 px-4 text-xs text-[#5a8a96] italic">{p.poznamka}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-1">
                      <button className="btn btn-secondary btn-xs" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">Interní platba</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} placeholder="Ubytování Baleal – záloha" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Částka (Kč)</label><input className="form-input" type="number" value={form.castka} onChange={(e) => setForm({ ...form, castka: Number(e.target.value) })} /></div>
              <div className="form-group"><label className="form-label">Datum</label><input className="form-input" type="date" value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Kdo platil</label>
              <select className="form-input" value={form.uzivatel} onChange={(e) => setForm({ ...form, uzivatel: e.target.value })}>
                <option value="Já">Já</option>
                <option value="Kamarádka">Kamarádka</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
