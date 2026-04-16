import { useNavigate } from 'react-router-dom'
import { useUcastnici } from '../../hooks/useUcastnici'
import { useFaktury } from '../../hooks/useFaktury'
import { useTerminy } from '../../hooks/useTerminy'
import { useTodos } from '../../hooks/useTodos'
import { useIntPlatby } from '../../hooks/useIntPlatby'
import { useAlerts } from '../../hooks/useAlerts'
import { formatCurrency, formatDate, todayISO } from '../../lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: ucastnici = [] } = useUcastnici()
  const { data: faktury = [] } = useFaktury()
  const { data: terminy = [] } = useTerminy()
  const { data: todos = [] } = useTodos()
  const { data: platby = [] } = useIntPlatby()
  const alerts = useAlerts()
  const today = todayISO()

  // Stats
  const totalUcastnici = ucastnici.reduce((s, u) => s + 1 + (u.spolucestujici?.length || 0), 0)
  const zaplaceniUcastnici = ucastnici.filter((u) => u.zaplaceno).length
  const fakturayCekaji = faktury.filter((f) => f.stav === 'vystavena')
  const celkemDluh = fakturayCekaji.reduce((s, f) => s + f.celkem, 0)
  const activeTodos = todos.filter((t) => t.status !== 'done')
  const urgentTodos = todos.filter((t) => t.priority === 'high' && t.status !== 'done')

  // Interní platby – saldo
  const saldo: Record<string, number> = {}
  platby.forEach((p) => {
    saldo[p.uzivatel] = (saldo[p.uzivatel] || 0) + p.castka
  })
  const jmena = Object.keys(saldo)
  const totalPlatby = Object.values(saldo).reduce((s, v) => s + v, 0)
  const podil = jmena.length > 0 ? totalPlatby / jmena.length : 0

  return (
    <div>
      {/* Alerty */}
      {alerts.length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5a8a96] mb-2">
            {alerts.filter(a => a.uroven === 'error').length > 0 ? '🚨' : '⚠️'} Upozornění ({alerts.length})
          </div>
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 5).map((a, i) => (
              <div
                key={i}
                onClick={() => navigate(a.href)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm
                  ${a.uroven === 'error'
                    ? 'bg-red-50 border-red-200 hover:border-red-400'
                    : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                  }`}
              >
                <span className="text-xl flex-shrink-0">{a.ikona}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0d2d35]">{a.titul}</div>
                  <div className="text-xs text-[#5a8a96] mt-0.5">{a.text}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.uroven === 'error' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                  {a.dni < 0 ? `${Math.abs(a.dni)}d po' spl.` : a.dni === 0 ? 'Dnes' : `za ${a.dni}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { num: totalUcastnici, label: 'Účastníků celkem', color: '' },
          { num: zaplaceniUcastnici, label: 'Zaplaceno', color: 'text-green-600' },
          { num: aktivniTermin(), label: 'Aktivní termíny', color: '' },
          { num: urgentTodos.length, label: 'Urgentní úkoly', color: urgentTodos.length > 0 ? 'text-red-600' : '' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#c8eef5] rounded-xl p-4">
            <div className={`text-3xl font-bold leading-none ${s.color || 'text-[#066a80]'}`}>{s.num}</div>
            <div className="text-xs text-[#5a8a96] mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Termíny obsazenost */}
        <div className="bg-white border border-[#c8eef5] rounded-2xl overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#c8eef5] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d2d35]">Obsazenost termínů</span>
            <button onClick={() => navigate('/terminy')} className="text-xs text-[#0899b5] hover:underline">Zobrazit vše →</button>
          </div>
          <div>
            {terminy.length === 0 ? (
              <div className="px-[18px] py-5 text-sm text-[#5a8a96] italic">Žádné termíny</div>
            ) : terminy.map((t) => {
              const obsazeno = ucastnici
                .filter((u) => u.termin_id === t.id)
                .reduce((s, u) => s + 1 + (u.spolucestujici?.length || 0), 0)
              const pct = Math.min(100, Math.round((obsazeno / t.kapacita) * 100))
              return (
                <div key={t.id} className="px-[18px] py-3 border-b border-[#c8eef5] last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-sm text-[#0d2d35]">{t.nazev}</div>
                    <span className={`text-xs font-bold ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>
                      {obsazeno}/{t.kapacita}
                    </span>
                  </div>
                  <div className="text-xs text-[#5a8a96] mb-2">{formatDate(t.datum_od)} – {formatDate(t.datum_do)}</div>
                  <div className="h-1.5 bg-[#c8eef5] rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#16a34a' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Čekající platby */}
        <div className="bg-white border border-[#c8eef5] rounded-2xl overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#c8eef5] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d2d35]">Čeká platba ({fakturayCekaji.length})</span>
            {celkemDluh > 0 && <span className="text-xs font-bold text-red-600">{formatCurrency(celkemDluh)}</span>}
          </div>
          <div>
            {fakturayCekaji.length === 0 ? (
              <div className="px-[18px] py-5 text-sm text-[#5a8a96] italic">Všechny faktury zaplaceny ✅</div>
            ) : fakturayCekaji.slice(0, 5).map((f) => {
              const dni = Math.round((new Date(f.splatnost + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
              return (
                <div key={f.id} className="flex items-center gap-3 px-[18px] py-2.5 border-b border-[#c8eef5] last:border-0 cursor-pointer hover:bg-[#f0fbfd]" onClick={() => navigate('/fakturace')}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0899b5] to-[#0dc0df] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {(f.odberatel_jmeno || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#0d2d35] truncate">{f.odberatel_jmeno}</div>
                    <div className="text-xs text-[#5a8a96]">{f.cislo}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm text-[#0d2d35]">{formatCurrency(f.celkem)}</div>
                    <div className={`text-xs ${dni < 0 ? 'text-red-600 font-bold' : 'text-[#5a8a96]'}`}>
                      {dni < 0 ? `${Math.abs(dni)}d po splatnosti` : dni === 0 ? 'Dnes' : `za ${dni}d`}
                    </div>
                  </div>
                </div>
              )
            })}
            {fakturayCekaji.length > 5 && (
              <div className="px-[18px] py-2 text-xs text-[#5a8a96] italic">+ {fakturayCekaji.length - 5} dalších…</div>
            )}
          </div>
        </div>

        {/* Hořící úkoly */}
        <div className="bg-white border border-[#c8eef5] rounded-2xl overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#c8eef5] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d2d35]">Hořící úkoly</span>
            <button onClick={() => navigate('/todo')} className="text-xs text-[#0899b5] hover:underline">Zobrazit vše →</button>
          </div>
          <div>
            {activeTodos.length === 0 ? (
              <div className="px-[18px] py-5 text-sm text-[#5a8a96] italic">Žádné aktivní úkoly ✅</div>
            ) : activeTodos
              .sort((a, b) => {
                const po = { high: 0, medium: 1, low: 2 }
                return (po[a.priority] ?? 1) - (po[b.priority] ?? 1)
              })
              .slice(0, 5)
              .map((t) => {
                const isOverdue = t.due && t.due < today
                return (
                  <div key={t.id} className="flex items-start gap-3 px-[18px] py-2.5 border-b border-[#c8eef5] last:border-0">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 ${t.priority === 'high' ? 'border-red-500' : t.priority === 'medium' ? 'border-amber-500' : 'border-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0d2d35] leading-snug">{t.title}</div>
                      {t.due && (
                        <div className={`text-xs mt-0.5 ${isOverdue ? 'text-red-600 font-bold' : 'text-[#5a8a96]'}`}>
                          {isOverdue ? '⚠️ ' : '📅 '}{t.due}
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      t.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                      t.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {t.priority === 'high' ? 'Vysoká' : t.priority === 'medium' ? 'Střední' : 'Nízká'}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Interní platby souhrn */}
        <div className="bg-white border border-[#c8eef5] rounded-2xl overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#c8eef5] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d2d35]">Interní platby – saldo</span>
            <button onClick={() => navigate('/platby')} className="text-xs text-[#0899b5] hover:underline">Zobrazit vše →</button>
          </div>
          <div className="px-[18px] py-4">
            {platby.length === 0 ? (
              <div className="text-sm text-[#5a8a96] italic">Žádné platby</div>
            ) : (
              <>
                {jmena.map((jmeno) => {
                  const diff = saldo[jmeno] - podil
                  return (
                    <div key={jmeno} className="flex items-center justify-between py-2 border-b border-[#c8eef5] last:border-0">
                      <span className="font-semibold text-sm text-[#0d2d35]">{jmeno}</span>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#0d2d35]">{formatCurrency(saldo[jmeno])}</div>
                        <div className={`text-xs ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-[#5a8a96]'}`}>
                          {diff > 0 ? `dostane ${formatCurrency(diff)}` : diff < 0 ? `dluží ${formatCurrency(Math.abs(diff))}` : 'vyrovnáno'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  function aktivniTermin() {
    return terminy.filter((t) => t.datum_od >= today || t.datum_do >= today).length
  }
}
