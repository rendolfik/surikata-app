import { useState } from 'react'
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../../hooks/useTodos'
import { useUiStore } from '../../store/uiStore'
import { todayISO } from '../../lib/utils'
import { PRIORITY_LABEL, STATUS_LABEL, PERSON_LABEL } from '../../lib/constants'
import type { Todo, TodoPriority, TodoStatus, TodoKategorie } from '../../types'

export default function TodoList() {
  const { data: todos = [] } = useTodos()
  const createT = useCreateTodo()
  const updateT = useUpdateTodo()
  const deleteT = useDeleteTodo()
  const { addToast } = useUiStore()

  const [filter, setFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const today = todayISO()

  const empty = (): Omit<Todo, 'id'> => ({
    title: '', desc: '', priority: 'medium', status: 'todo',
    due: '', person: '', kategorie: 'marketing',
  })
  const [form, setForm] = useState<Omit<Todo, 'id'>>(empty())

  const filtered = todos.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'done') return t.status === 'done'
    if (filter === 'high') return t.priority === 'high' && t.status !== 'done'
    return t.status === filter
  }).sort((a, b) => {
    const p: Record<string, number> = { high: 0, medium: 1, low: 2 }
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  function openNew() { setEditId(null); setForm(empty()); setModalOpen(true) }
  function openEdit(t: Todo) { setEditId(t.id); setForm({ ...t }); setModalOpen(true) }

  async function handleSave() {
    if (!form.title.trim()) return alert('Zadej název')
    try {
      if (editId) { await updateT.mutateAsync({ id: editId, ...form }); addToast('Úkol uložen') }
      else { await createT.mutateAsync(form); addToast('Úkol přidán') }
      setModalOpen(false)
    } catch { addToast('Chyba', 'error') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat úkol?')) return
    await deleteT.mutateAsync(id)
    addToast('Úkol smazán')
    setModalOpen(false)
  }

  async function toggleDone(t: Todo) {
    await updateT.mutateAsync({ id: t.id, status: t.status === 'done' ? 'todo' : 'done' })
  }

  const FILTERS = [
    { id: 'all', label: 'Vše' },
    { id: 'high', label: '🔴 Urgentní' },
    { id: 'todo', label: '📋 K udělání' },
    { id: 'inprog', label: '🔄 Probíhá' },
    { id: 'waiting', label: '⏳ Čeká' },
    { id: 'done', label: '✅ Hotovo' },
  ]

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">To-do list</div>
          <div className="sec-subtitle">Úkoly a projekty – {todos.filter(t => t.status !== 'done').length} aktivních</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nový úkol</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
              ${filter === f.id ? 'bg-[#0dc0df] text-white border-[#0dc0df]' : 'bg-white text-[#5a8a96] border-[#c8eef5] hover:border-[#0dc0df]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">Žádné úkoly</div></div>
      ) : (
        <div className="bg-white border border-[#c8eef5] rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f0fbfd]">
                <th className="w-9 text-center py-2.5 px-3 text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5]"></th>
                <th className="py-2.5 px-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5]">Úkol</th>
                <th className="py-2.5 px-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5] hidden md:table-cell">Priorita</th>
                <th className="py-2.5 px-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5] hidden md:table-cell">Stav</th>
                <th className="py-2.5 px-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#5a8a96] border-b border-[#c8eef5] hidden lg:table-cell">Termín</th>
                <th className="py-2.5 px-3 border-b border-[#c8eef5]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isDone = t.status === 'done'
                const isOverdue = t.due && t.due < today && !isDone
                return (
                  <tr key={t.id} className={`border-b border-[#c8eef5] last:border-0 hover:bg-[#f8fdfe] ${isDone ? 'opacity-60' : ''}`}>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleDone(t)}
                        className={`w-[18px] h-[18px] rounded-full border-2 mx-auto flex items-center justify-center transition-all
                          ${isDone ? 'bg-green-500 border-green-500' : 'border-[#c8eef5] hover:border-green-500'}`}
                      >
                        {isDone && <span className="text-white text-[10px] font-bold">✓</span>}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className={`font-semibold text-sm ${isDone ? 'line-through text-[#5a8a96]' : 'text-[#0d2d35]'}`}>{t.title}</div>
                      {t.desc && <div className="text-xs text-[#5a8a96] mt-0.5">{t.desc}</div>}
                      <div className="flex gap-1 flex-wrap mt-1 md:hidden">
                        <span className={`tbadge tbadge-${isDone ? 'low' : t.priority}`}>{isDone ? '✅ Hotovo' : PRIORITY_LABEL[t.priority]}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className={`tbadge tbadge-${isDone ? 'low' : t.priority}`}>{isDone ? '✅' : PRIORITY_LABEL[t.priority]}</span>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className={`tbadge tbadge-${isDone ? 'done-s' : t.status}`}>{STATUS_LABEL[t.status] || t.status}</span>
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      {t.due && <span className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-[#5a8a96]'}`}>{isOverdue ? '⚠️ ' : '📅 '}{t.due}</span>}
                      {t.person && <div className="mt-0.5"><span className="tbadge tbadge-person text-[10px]">👤 {PERSON_LABEL[t.person] || t.person}</span></div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn btn-secondary btn-xs" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(t.id)}>🗑</button>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary btn-xs" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(t.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-hdr">
              <h2 className="modal-title">{editId ? 'Upravit úkol' : 'Nový úkol'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="form-group"><label className="form-label">Název *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Popis</label><textarea className="form-input" value={form.desc || ''} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priorita</label>
                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TodoPriority })}>
                  <option value="high">🔴 Vysoká</option>
                  <option value="medium">🟡 Střední</option>
                  <option value="low">🟢 Nízká</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stav</label>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TodoStatus })}>
                  <option value="todo">📋 K udělání</option>
                  <option value="inprog">🔄 Probíhá</option>
                  <option value="waiting">⏳ Čeká</option>
                  <option value="done">✅ Hotovo</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Termín do</label><input className="form-input" type="date" value={form.due || ''} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Přiřadit</label>
                <select className="form-input" value={form.person || ''} onChange={(e) => setForm({ ...form, person: e.target.value })}>
                  <option value="">— Nikdo —</option>
                  <option value="ja">Já</option>
                  <option value="kamaradka">Kamarádka</option>
                  <option value="oba">Obě</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kategorie</label>
              <select className="form-input" value={form.kategorie} onChange={(e) => setForm({ ...form, kategorie: e.target.value as TodoKategorie })}>
                <option value="marketing">📱 Marketing</option>
                <option value="admin">📋 Administrativa</option>
                <option value="camp">🏄 Camp</option>
                <option value="finance">💰 Finance</option>
                <option value="other">📌 Ostatní</option>
              </select>
            </div>
            <div className="modal-footer">
              {editId && <button className="btn btn-danger mr-auto" onClick={() => handleDelete(editId)}>🗑 Smazat</button>}
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleSave}>Uložit úkol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
