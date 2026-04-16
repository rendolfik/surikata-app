import { useLocation } from 'react-router-dom'
import { useUiStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/obsahovy-plan': 'Plán příspěvků',
  '/napady': 'Banka nápadů',
  '/ai': 'AI Asistent',
  '/terminy': 'Termíny kempů',
  '/ucastnici': 'Účastníci',
  '/todo': 'To-do list',
  '/fakturace': 'Fakturace',
  '/platby': 'Interní platby',
  '/naklady': 'Náklady & Dodavatelé',
  '/dodavatele': 'Dodavatelé',
  '/nastaveni': 'Nastavení',
}

export function Topbar() {
  const location = useLocation()
  const { setSidebarOpen } = useUiStore()
  const { user } = useAuthStore()
  const title = TITLES[location.pathname] || 'Surikata'

  return (
    <header className="h-[52px] flex-shrink-0 bg-white border-b border-[#c8eef5] flex items-center px-6 gap-3 shadow-sm z-10">
      <button
        className="lg:hidden text-[#066a80] text-xl p-1"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>
      <h1 className="font-serif text-lg text-[#066a80]">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2 text-sm text-[#5a8a96]">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: user.barva || '#0dc0df' }}
            >
              {user.avatar || user.jmeno[0]}
            </span>
            <span className="hidden sm:block font-medium">{user.jmeno}</span>
          </div>
        )}
      </div>
    </header>
  )
}
