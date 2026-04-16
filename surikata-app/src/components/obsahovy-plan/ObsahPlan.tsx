import { useState } from 'react'
import { usePostsMap, useCreatePost, useUpdatePost, useDeletePost } from '../../hooks/usePosts'
import { useNapady, useCreateNapad } from '../../hooks/useNapady'
import { useUiStore } from '../../store/uiStore'
import { MONTHS, DAYS_SHORT, TYPE_ICON, TYPE_LABEL, PILLAR_ICON, PILLAR_LABEL } from '../../lib/constants'
import { weekNumber, todayISO } from '../../lib/utils'
import type { Napad, Post, PostTyp, Pilir } from '../../types'

type ModalTab = 'novy' | 'z-banky'

export default function ObsahPlan() {
  const { data: postsMap = {} } = usePostsMap()
  const { data: napady = [] } = useNapady()
  const createP = useCreatePost()
  const updateP = useUpdatePost()
  const deleteP = useDeletePost()
  const createNapad = useCreateNapad()
  const { addToast } = useUiStore()

  const today = todayISO()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<ModalTab>('novy')
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [bankFilter, setBankFilter] = useState<string>('all')

  const emptyForm = (): Omit<Post, 'id'> => ({ datum: editDate, title: '', typ: 'reel', pilir: 'emotivni', hook: '', media: '' })
  const [form, setForm] = useState<Omit<Post, 'id'>>(emptyForm())

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function openNew(dk: string) {
    setEditDate(dk)
    setEditPost(null)
    setForm({ datum: dk, title: '', typ: 'reel', pilir: 'emotivni', hook: '', media: '' })
    setModalTab('novy')
    setModalOpen(true)
  }

  function openEdit(dk: string, post: Post) {
    setEditDate(dk)
    setEditPost(post)
    setForm({ ...post })
    setModalTab('novy')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return alert('Zadej název')
    try {
      if (editPost) {
        await updateP.mutateAsync({ ...form, id: editPost.id, datum: editDate })
        addToast('Příspěvek uložen')
      } else {
        await createP.mutateAsync({ ...form, datum: editDate })
        addToast('Příspěvek přidán')
      }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete() {
    if (!editPost || !confirm('Smazat příspěvek?')) return
    await deleteP.mutateAsync({ id: editPost.id, datum: editDate })
    addToast('Příspěvek smazán')
    setModalOpen(false)
  }

  async function saveAsNapad() {
    if (!form.title.trim()) return alert('Zadej název')
    await createNapad.mutateAsync({ title: form.title, typ: form.typ, pilir: form.pilir, hook: form.hook, media: form.media })
    addToast('Uloženo jako nápad do banky')
  }

  async function scheduleFromBank(napad: Napad) {
    await createP.mutateAsync({ datum: editDate, title: napad.title, typ: napad.typ, pilir: napad.pilir, hook: napad.hook, media: napad.media })
    addToast('Příspěvek naplánován')
    setModalOpen(false)
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  let dow = firstDay.getDay(); if (dow === 0) dow = 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((dow - 1 + daysInMonth) / 7) * 7
  const cells: (number | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const d = i - (dow - 2)
    cells.push(d >= 1 && d <= daysInMonth ? d : null)
  }

  const TYPE_COLOR: Record<string, string> = {
    reel: 'bg-[#fde8e0] text-[#b83525]',
    carousel: 'bg-[#ddf0fd] text-[#1560a8]',
    foto: 'bg-[#e2fde0] text-[#1e8a32]',
    stories: 'bg-[#fdf6e0] text-[#b07000]',
  }

  const filteredNapady = bankFilter === 'all' ? napady : napady.filter(n => n.typ === bankFilter)

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">Plán příspěvků</div>
          <div className="sec-subtitle">Obsahový kalendář Instagramu</div>
        </div>
      </div>

      {/* Month nav + Legend */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white border border-[#c8eef5] hover:bg-[#0dc0df] hover:text-white hover:border-[#0dc0df] transition-all flex items-center justify-center text-[#0899b5]">‹</button>
          <span className="font-semibold text-sm min-w-[140px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white border border-[#c8eef5] hover:bg-[#0dc0df] hover:text-white hover:border-[#0dc0df] transition-all flex items-center justify-center text-[#0899b5]">›</button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(TYPE_LABEL).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 text-xs text-[#5a8a96]">
              <div className={`w-3 h-3 rounded-sm ${TYPE_COLOR[k].split(' ')[0]}`} />
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div>
        {/* Day headers */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          <div />
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-[#5a8a96] uppercase tracking-wide py-1.5 border-b-2 border-[#c8eef5]">{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {Array.from({ length: cells.length / 7 }).map((_, wi) => {
          const weekDays = cells.slice(wi * 7, wi * 7 + 7)
          const firstValidDay = weekDays.find(d => d !== null)
          const wn = firstValidDay ? weekNumber(year, month, firstValidDay) : null

          return (
            <div key={wi} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
              <div className="flex items-start justify-center pt-2 text-[10px] font-bold text-[#c8eef5]">
                {wn ? `T${wn}` : ''}
              </div>
              {weekDays.map((d, di) => {
                if (d === null) return <div key={di} />
                const dk = toKey(year, month, d)
                const dayPosts = postsMap[dk] || []
                const isToday = dk === today
                return (
                  <div
                    key={di}
                    className={`relative bg-white border rounded-lg min-h-[80px] p-1.5 transition-all hover:border-[#0dc0df] hover:shadow-sm group
                      ${isToday ? 'border-[#0dc0df] bg-[#e8fafd]' : 'border-[#c8eef5]'}`}
                  >
                    <div className={`text-[12px] font-bold mb-1 ${isToday ? 'text-[#0899b5]' : 'text-[#5a8a96]'}`}>{d}</div>
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className={`block text-[10px] font-semibold px-1 py-0.5 rounded mb-0.5 overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:opacity-75 ${TYPE_COLOR[post.typ]}`}
                        title={post.hook || post.title}
                        onClick={() => openEdit(dk, post)}
                      >
                        {TYPE_ICON[post.typ]} {post.title}
                      </div>
                    ))}
                    <button
                      className="absolute bottom-1 right-1 w-5 h-5 bg-[#0dc0df] text-white rounded-full text-xs hidden group-hover:flex items-center justify-center hover:bg-[#ff6b35] transition-colors"
                      onClick={() => openNew(dk)}
                      title="Přidat příspěvek"
                    >+</button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-hdr">
              <h2 className="modal-title">
                {editPost ? 'Upravit příspěvek' : `Nový příspěvek – ${editDate}`}
              </h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            {/* Tabs – jen při novém příspěvku */}
            {!editPost && (
              <div className="flex gap-1 mb-4 border-b border-[#c8eef5]">
                <button
                  onClick={() => setModalTab('novy')}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${modalTab === 'novy' ? 'border-[#0dc0df] text-[#0dc0df]' : 'border-transparent text-[#5a8a96] hover:text-[#0899b5]'}`}
                >
                  ✏️ Nový příspěvek
                </button>
                <button
                  onClick={() => setModalTab('z-banky')}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${modalTab === 'z-banky' ? 'border-[#0dc0df] text-[#0dc0df]' : 'border-transparent text-[#5a8a96] hover:text-[#0899b5]'}`}
                >
                  💡 Z banky nápadů {napady.length > 0 && <span className="ml-1 text-xs bg-[#f0fbfd] border border-[#c8eef5] rounded-full px-1.5">{napady.length}</span>}
                </button>
              </div>
            )}

            {/* Tab: Nový příspěvek */}
            {(editPost || modalTab === 'novy') && (
              <>
                <div className="form-group">
                  <label className="form-label">Název / téma</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Západ slunce na Balealu" autoFocus />
                </div>
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
                <div className="form-group">
                  <label className="form-label">Hook / popis</label>
                  <textarea className="form-input" rows={3} value={form.hook || ''} onChange={(e) => setForm({ ...form, hook: e.target.value })} placeholder="První věta nebo klíčová myšlenka..." />
                </div>
                <div className="form-group">
                  <label className="form-label">🔗 Odkaz na foto / video</label>
                  <input className="form-input" type="url" value={form.media || ''} onChange={(e) => setForm({ ...form, media: e.target.value })} placeholder="https://drive.google.com/..." />
                </div>
                <div className="modal-footer">
                  {editPost && <button className="btn btn-danger mr-auto" onClick={handleDelete}>🗑 Smazat</button>}
                  <button className="btn btn-secondary" onClick={saveAsNapad} title="Uložit jako nápad do banky">💡 Do banky</button>
                  <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
                  <button className="btn btn-primary" onClick={handleSave}>Uložit</button>
                </div>
              </>
            )}

            {/* Tab: Z banky nápadů */}
            {!editPost && modalTab === 'z-banky' && (
              <>
                {/* Filtr podle formátu */}
                <div className="flex gap-1 flex-wrap mb-3">
                  <button onClick={() => setBankFilter('all')} className={`btn btn-sm ${bankFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>Vše</button>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => (
                    <button key={k} onClick={() => setBankFilter(k)} className={`btn btn-sm ${bankFilter === k ? 'btn-primary' : 'btn-secondary'}`}>{TYPE_ICON[k]} {v}</button>
                  ))}
                </div>

                {filteredNapady.length === 0 ? (
                  <div className="text-center py-8 text-[#5a8a96] text-sm">
                    <div className="text-3xl mb-2">💡</div>
                    {napady.length === 0 ? 'Banka nápadů je prázdná' : 'Žádné nápady v tomto formátu'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {filteredNapady.map((n) => (
                      <div
                        key={n.id}
                        className="bg-[#f0fbfd] border border-[#c8eef5] rounded-lg p-3 hover:border-[#0dc0df] hover:bg-white cursor-pointer transition-all group"
                        onClick={() => scheduleFromBank(n)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-[#0d2d35]">{n.title}</div>
                            {n.hook && <div className="text-xs text-[#5a8a96] mt-0.5 line-clamp-1">{n.hook}</div>}
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-[#c8eef5] text-[#5a8a96]">{TYPE_ICON[n.typ]} {TYPE_LABEL[n.typ]}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-[#c8eef5] text-[#5a8a96]">{PILLAR_ICON[n.pilir]} {PILLAR_LABEL[n.pilir]}</span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#0dc0df] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">📅 Naplánovat</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
