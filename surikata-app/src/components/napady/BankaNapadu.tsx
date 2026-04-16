import { useState } from 'react'
import { useNapady, useCreateNapad, useUpdateNapad, useDeleteNapad } from '../../hooks/useNapady'
import { useCreatePost } from '../../hooks/usePosts'
import { useUiStore } from '../../store/uiStore'
import { TYPE_ICON, TYPE_LABEL, PILLAR_ICON, PILLAR_LABEL } from '../../lib/constants'
import { todayISO } from '../../lib/utils'
import type { Napad, PostTyp, Pilir } from '../../types'

export default function BankaNapadu() {
  const { data: napady = [] } = useNapady()
  const createN = useCreateNapad()
  const updateN = useUpdateNapad()
  const deleteN = useDeleteNapad()
  const createPost = useCreatePost()
  const { addToast } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [scheduleNapad, setScheduleNapad] = useState<Napad | null>(null)
  const [scheduleDate, setScheduleDate] = useState(todayISO())
  const [filterTyp, setFilterTyp] = useState<string>('all')
  const [filterPilir, setFilterPilir] = useState<string>('all')

  const empty = (): Omit<Napad, 'id' | 'created_at'> => ({ title: '', typ: 'reel', pilir: 'emotivni', hook: '', media: '' })
  const [form, setForm] = useState<Omit<Napad, 'id' | 'created_at'>>(empty())

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(n: Napad) { setEditId(n.id); setForm({ title: n.title, typ: n.typ, pilir: n.pilir, hook: n.hook, media: n.media }); setModalOpen(true) }
  function openSchedule(n: Napad) { setScheduleNapad(n); setScheduleDate(todayISO()); setScheduleOpen(true) }

  async function handleSave() {
    if (!form.title.trim()) return alert('Zadej název')
    try {
      if (editId) { await updateN.mutateAsync({ id: editId, ...form }); addToast('Nápad uložen') }
      else { await createN.mutateAsync(form); addToast('Nápad přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat nápad?')) return
    await deleteN.mutateAsync(id)
    addToast('Nápad smazán')
    setModalOpen(false)
  }

  async function handleSchedule() {
    if (!scheduleNapad || !scheduleDate) return
    await createPost.mutateAsync({ datum: scheduleDate, title: scheduleNapad.title, typ: scheduleNapad.typ, pilir: scheduleNapad.pilir, hook: scheduleNapad.hook, media: scheduleNapad.media })
    addToast('Naplánováno do kalendáře')
    setScheduleOpen(false)
  }

  const filtered = napady.filter(n => {
    if (filterTyp !== 'all' && n.typ !== filterTyp) return false
    if (filterPilir !== 'all' && n.pilir !== filterPilir) return false
    return true
  })

  const PILLAR_COLOR: Record<string, string> = {
    emotivni: 'bg-[#fde8e0] text-[#b83525]',
    inspirace: 'bg-[#ddf0fd] text-[#1560a8]',
    edukace: 'bg-[#e2fde0] text-[#1e8a32]',
    zakulisi: 'bg-[#fdf6e0] text-[#b07000]',
    socialproof: 'bg-[#ede0fd] text-[#6b25b8]',
  }

  const TYPE_COLOR: Record<string, string> = {
    reel: 'bg-[#fde8e0] text-[#b83525]',
    carousel: 'bg-[#ddf0fd] text-[#1560a8]',
    foto: 'bg-[#e2fde0] text-[#1e8a32]',
    stories: 'bg-[#fdf6e0] text-[#b07000]',
  }

  return (
    <div>
      <div className="sec-hdr">
        <div><div className="sec-title">Banka nápadů</div><div className="sec-subtitle">Nápady na příspěvky, které ještě nebyly naplánované</div></div>
        <button className="btn btn-primary" onClick={openNew}>+ Nový nápad</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterTyp('all')} className={`btn btn-sm ${filterTyp === 'all' ? 'btn-primary' : 'btn-secondary'}`}>Vše</button>
          {Object.entries(TYPE_LABEL).map(([k, v]) => (
            <button key={k} onClick={() => setFilterTyp(k)} className={`btn btn-sm ${filterTyp === k ? 'btn-primary' : 'btn-secondary'}`}>{TYPE_ICON[k]} {v}</button>
          ))}
        </div>
        <div className="w-px bg-[#c8eef5] mx-1 hidden sm:block" />
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterPilir('all')} className={`btn btn-sm ${filterPilir === 'all' ? 'btn-primary' : 'btn-secondary'}`}>Všechny pilíře</button>
          {Object.entries(PILLAR_LABEL).map(([k, v]) => (
            <button key={k} onClick={() => setFilterPilir(k)} className={`btn btn-sm ${filterPilir === k ? 'btn-primary' : 'btn-secondary'}`}>{PILLAR_ICON[k]} {v}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💡</div><div className="empty-state-title">Žádné nápady</div><div className="empty-state-sub">Přidej nový nápad nebo změň filtr</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((n) => (
            <div key={n.id} className="bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow flex flex-col">
              <div className="flex items-start gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0d2d35] leading-snug">{n.title}</div>
                  {n.hook && <div className="text-xs text-[#5a8a96] mt-1 line-clamp-2">{n.hook}</div>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-auto">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[n.typ]}`}>{TYPE_ICON[n.typ]} {TYPE_LABEL[n.typ]}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PILLAR_COLOR[n.pilir]}`}>{PILLAR_ICON[n.pilir]} {PILLAR_LABEL[n.pilir]}</span>
              </div>
              {n.media && <div className="mt-2 text-xs text-[#0899b5] truncate">🔗 <a href={n.media} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline">{n.media}</a></div>}
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#f0fbfd]">
                <button className="btn btn-primary btn-sm flex-1" onClick={() => openSchedule(n)}>📅 Naplánovat</button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit nápad' : 'Nový nápad'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název / téma *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Západ slunce na Balealu..." /></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Formát</label>
                <select className="form-input" value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value as PostTyp })}>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{TYPE_ICON[k]} {v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pilíř</label>
                <select className="form-input" value={form.pilir} onChange={(e) => setForm({ ...form, pilir: e.target.value as Pilir })}>
                  {Object.entries(PILLAR_LABEL).map(([k, v]) => <option key={k} value={k}>{PILLAR_ICON[k]} {v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Hook / popis</label><textarea className="form-input" rows={3} value={form.hook || ''} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="První věta nebo klíčová myšlenka..." /></div>
            <div className="form-group"><label className="form-label">🔗 Odkaz na foto / video</label><input className="form-input" type="url" value={form.media || ''} onChange={(e) => setForm({ ...form, media: e.target.value })} placeholder="https://drive.google.com/..." /></div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId!)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit nápad</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleOpen && scheduleNapad && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setScheduleOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-hdr">
              <h2 className="modal-title">Naplánovat příspěvek</h2>
              <button className="modal-close" onClick={() => setScheduleOpen(false)}>×</button>
            </div>
            <div className="bg-[#f0fbfd] rounded-lg p-3 mb-4">
              <div className="font-bold text-sm text-[#0d2d35]">{scheduleNapad.title}</div>
              <div className="text-xs text-[#5a8a96] mt-0.5">{TYPE_ICON[scheduleNapad.typ]} {TYPE_LABEL[scheduleNapad.typ]} · {PILLAR_ICON[scheduleNapad.pilir]} {PILLAR_LABEL[scheduleNapad.pilir]}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Datum publikace</label>
              <input className="form-input" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setScheduleOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSchedule}>📅 Přidat do kalendáře</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
