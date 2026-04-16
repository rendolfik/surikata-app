import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAlerts } from '../../hooks/useAlerts'
import { useUiStore } from '../../store/uiStore'

const NAV = [
  { section: null, items: [
    { path: '/', label: 'Dashboard', icon: '📊', id: 'dashboard' },
  ]},
  { section: 'Marketing', items: [
    { path: '/obsahovy-plan', label: 'Plán příspěvků', icon: '📅', id: 'obsahovy-plan' },
    { path: '/napady', label: 'Banka nápadů', icon: '💡', id: 'napady' },
    { path: '/ai', label: 'AI Asistent', icon: '✨', id: 'ai' },
  ]},
  { section: 'Camp', items: [
    { path: '/terminy', label: 'Termíny', icon: '🏖', id: 'terminy' },
    { path: '/ucastnici', label: 'Účastníci', icon: '👥', id: 'ucastnici' },
    { path: '/todo', label: 'To-do list', icon: '✅', id: 'todo' },
  ]},
  { section: 'Finance', items: [
    { path: '/fakturace', label: 'Fakturace', icon: '🧾', id: 'fakturace' },
    { path: '/platby', label: 'Interní platby', icon: '💳', id: 'platby' },
    { path: '/naklady', label: 'Náklady', icon: '📦', id: 'naklady' },
    { path: '/dodavatele', label: 'Dodavatelé', icon: '🤝', id: 'dodavatele' },
  ]},
  { section: null, items: [
    { path: '/nastaveni', label: 'Nastavení', icon: '⚙️', id: 'nastaveni' },
  ]},
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const alerts = useAlerts()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const location = useLocation()

  const alertCount = alerts.length

  const close = () => setSidebarOpen(false)

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[19] lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-20
          w-[220px] flex-shrink-0 flex flex-col h-screen overflow-hidden
          bg-[#066a80] transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-[18px] py-5 border-b border-white/10 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">🏄</div>
          <div>
            <span className="font-serif text-base text-white leading-none block">Surikata</span>
            <span className="text-[9px] tracking-widest uppercase text-white/40">Surf Camp</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="px-[18px] pt-3 pb-1 text-[9.5px] font-bold uppercase tracking-[1.5px] text-white/30">
                  {group.section}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
                const badge = item.id === 'dashboard' ? (alertCount > 0 ? alertCount : null) : null
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={close}
                    className={`
                      relative flex items-center gap-2.5 px-[18px] py-2.5 w-full
                      font-medium text-[13.5px] transition-all duration-150
                      ${isActive
                        ? 'text-white bg-white/14 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#0dc0df] before:rounded-r-sm'
                        : 'text-white/65 hover:text-white hover:bg-white/8'
                      }
                    `}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {badge !== null && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        {user && (
          <div className="px-[18px] py-3 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: user.barva || '#0dc0df' }}
              >
                {user.avatar || user.jmeno[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user.jmeno}</div>
                <div className="text-white/40 text-[10px] truncate">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="text-white/40 hover:text-white text-xs transition-colors"
                title="Odhlásit"
              >
                ↩
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
