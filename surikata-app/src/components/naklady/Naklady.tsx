import { useState } from 'react'
import { useNaklady, useCreateNaklad, useUpdateNaklad, useDeleteNaklad } from '../../hooks/useNaklady'
import { useDodavatele } from '../../hooks/useDodavatele'
import { useTerminy } from '../../hooks/useTerminy'
import { useUiStore } from '../../store/uiStore'
import { formatCurrency } from '../../lib/utils'
import type { Naklad } from '../../types'

export default function Naklady() {
  const { data: naklady = [] } = useNaklady()
  const { data: dodavatele = [] } = useDodavatele()
  const { data: terminy = [] } = useTerminy()
  const createN = useCreateNaklad()
  const updateN = useUpdateNaklad()
  const deleteN = useDeleteNaklad()
  const { addToast } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const empty = (): Omit<Naklad, 'id'> => ({ nazev: '', dodavatel_id: null, dodavatel_nazev: '', celkem_kc: 0, zaloha_pct: 50, zaloha_kc: 0, termin_id: null, zaloha_zaplacena: false, doplatek_zaplacen: false, poznamka: '' })
  const [form, setForm] = useState<Omit<Naklad, 'id'>>(empty())

  const totalCelkem = naklady.reduce((s, n) => s + n.celkem_kc, 0)
  const totalZaplaceno = naklady.reduce((s, n) => s + (n.zaloha_zaplacena ? n.zaloha_kc : 0) + (n.doplatek_zaplacen ? n.celkem_kc - n.zaloha_kc : 0), 0)

  function calcZaloha(celkem: number, pct: number) { return Math.round(celkem * pct / 100) }

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(n: Naklad) { setEditId(n.id); setForm({ ...n }); setModalOpen(true) }

  async function handleSave() {
    if (!form.nazev.trim()) return alert('Zadej název')
    const dodavatel = dodavatele.find(d => d.id === form.dodavatel_id)
    const data = { ...form, dodavatel_nazev: dodavatel?.nazev || form.dodavatel_nazev || '' }
    try {
      if (editId) { await updateN.mutateAsync({ id: editId, ...data }); addToast('Náklad uložen') }
      else { await createN.mutateAsync(data); addToast('Náklad přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat náklad?')) return
    await deleteN.mutateAsync(id)
    addToast('Náklad smazán')
    setModalOpen(false)
  }

  async function toggleZaloha(n: Naklad) { await updateN.mutateAsync({ id: n.id, zaloha_zaplacena: !n.zaloha_zaplacena }) }
  async function toggleDoplatek(n: Naklad) { await updateN.mutateAsync({ id: n.id, doplatek_zaplacen: !n.doplatek_zaplacen }) }

  return (
    <div>
      <div className="sec-hdr">
        <div><div className="sec-title">Náklady & Dodavatelé</div><div className="sec-subtitle">Zálohy, doplatky, stav úhrad</div></div>
        <button className="btn btn-primary" onClick={openNew}>+ Přidat náklad</button>
      </div>

      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="stat-box"><span className="stat-num" style={{ fontSize: 18 }}>{formatCurrency(totalCelkem)}</span><span className="stat-label">Celkem náklady</span></div>
        <div className="stat-box"><span className="stat-num green" style={{ fontSize: 18 }}>{formatCurrency(totalZaplaceno)}</span><span className="stat-label">Zaplaceno</span></div>
        <div className="stat-box"><span className="stat-num red" style={{ fontSize: 18 }}>{formatCurrency(totalCelkem - totalZaplaceno)}</span><span className="stat-label">Zbývá uhradit</span></div>
      </div>

      {naklady.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">Žádné náklady</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {naklady.map((n) => {
            const termin = terminy.find(t => t.id === n.termin_id)
            const isDone = n.zaloha_zaplacena && n.doplatek_zaplacen
            const doplatek = n.celkem_kc - n.zaloha_kc
            return (
              <div key={n.id} className={`bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow ${isDone ? 'border-l-4 border-l-green-500 opacity-90' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-sm text-[#0d2d35]">{n.nazev}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>🗑</button>
                  </div>
                </div>
                {n.dodavatel_nazev && <div className="text-xs text-[#5a8a96] mb-1">🤝 {n.dodavatel_nazev}</div>}
                {termin && <div className="text-xs text-[#0899b5] font-medium mb-3">🗓 {termin.nazev}</div>}

                <div className="bg-[#f0fbfd] rounded-lg p-3 mb-3">
                  <div className="flex justify-between text-sm py-1 border-b border-[#c8eef5]">
                    <span className="text-[#5a8a96]">Celkem</span>
                    <span className="font-bold">{formatCurrency(n.celkem_kc)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-[#c8eef5] items-center">
                    <span className="text-[#5a8a96]">Záloha ({n.zaloha_pct}%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(n.zaloha_kc)}</span>
                      <button onClick={() => toggleZaloha(n)} className={`tbadge ${n.zaloha_zaplacena ? 'tbadge-low' : 'tbadge-high'} cursor-pointer`}>
                        {n.zaloha_zaplacena ? '✅' : '⏳'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm py-1 items-center">
                    <span className="text-[#5a8a96]">Doplatek</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(doplatek)}</span>
                      <button onClick={() => toggleDoplatek(n)} className={`tbadge ${n.doplatek_zaplacen ? 'tbadge-low' : 'tbadge-neutral'} cursor-pointer`}>
                        {n.doplatek_zaplacen ? '✅' : '⏳'}
                      </button>
                    </div>
                  </div>
                </div>

                {n.poznamka && <div className="text-xs text-[#5a8a96] italic">{n.poznamka}</div>}
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit náklad' : 'Nový náklad'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.nazev} onChange={(e) => setForm({ ...form, nazev: e.target.value })} placeholder="Surf instruktor Fred's Adventures" /></div>
            <div className="form-group">
              <label className="form-label">Dodavatel</label>
              <select className="form-input" value={form.dodavatel_id || ''} onChange={(e) => {
                const d = dodavatele.find(x => x.id === e.target.value)
                setForm({ ...form, dodavatel_id: e.target.value || null, dodavatel_nazev: d?.nazev || '' })
              }}>
                <option value="">— Zadat ručně —</option>
                {dodavatele.map(d => <option key={d.id} value={d.id}>{d.nazev}</option>)}
              </select>
            </div>
            {!form.dodavatel_id && (
              <div className="form-group"><label className="form-label">Název dodavatele</label><input className="form-input" value={form.dodavatel_nazev || ''} onChange={(e) => setForm({ ...form, dodavatel_nazev: e.target.value })} /></div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Celková cena (Kč)</label>
                <input className="form-input" type="number" value={form.celkem_kc} onChange={(e) => {
                  const celkem = Number(e.target.value)
                  setForm({ ...form, celkem_kc: celkem, zaloha_kc: calcZaloha(celkem, form.zaloha_pct) })
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">Záloha (%)</label>
                <input className="form-input" type="number" min="0" max="100" value={form.zaloha_pct} onChange={(e) => {
                  const pct = Number(e.target.value)
                  setForm({ ...form, zaloha_pct: pct, zaloha_kc: calcZaloha(form.celkem_kc, pct) })
                }} />
              </div>
            </div>
            <div className="bg-[#f0fbfd] rounded-lg p-3 mb-3 text-sm">
              <div className="flex justify-between py-1"><span className="text-[#5a8a96]">Záloha:</span><span className="font-bold text-[#066a80]">{formatCurrency(form.zaloha_kc)}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#5a8a96]">Doplatek:</span><span className="font-bold">{formatCurrency(form.celkem_kc - form.zaloha_kc)}</span></div>
            </div>
            <div className="form-group">
              <label className="form-label">Termín kempu</label>
              <select className="form-input" value={form.termin_id || ''} onChange={(e) => setForm({ ...form, termin_id: e.target.value || null })}>
                <option value="">— Bez termínu —</option>
                {terminy.map(t => <option key={t.id} value={t.id}>{t.nazev}</option>)}
              </select>
            </div>
            <div className="flex gap-5 mb-4 flex-wrap">
              <label className="checkbox-label"><input type="checkbox" checked={form.zaloha_zaplacena} onChange={(e) => setForm({ ...form, zaloha_zaplacena: e.target.checked })} /> ✅ Záloha zaplacena</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.doplatek_zaplacen} onChange={(e) => setForm({ ...form, doplatek_zaplacen: e.target.checked })} /> ✅ Doplatek zaplacen</label>
            </div>
            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka || ''} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit náklad</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
