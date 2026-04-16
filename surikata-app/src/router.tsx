import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, lazy: async () => { const m = await import('./components/dashboard/Dashboard'); return { Component: m.default } } },
      { path: 'obsahovy-plan', lazy: async () => { const m = await import('./components/obsahovy-plan/ObsahPlan'); return { Component: m.default } } },
      { path: 'napady', lazy: async () => { const m = await import('./components/napady/BankaNapadu'); return { Component: m.default } } },
      { path: 'ai', lazy: async () => { const m = await import('./components/ai/AIAsistent'); return { Component: m.default } } },
      { path: 'ucastnici', lazy: async () => { const m = await import('./components/ucastnici/Ucastnici'); return { Component: m.default } } },
      { path: 'todo', lazy: async () => { const m = await import('./components/todo/TodoList'); return { Component: m.default } } },
      { path: 'fakturace', lazy: async () => { const m = await import('./components/fakturace/Fakturace'); return { Component: m.default } } },
      { path: 'platby', lazy: async () => { const m = await import('./components/platby/IntPlatby'); return { Component: m.default } } },
      { path: 'naklady', lazy: async () => { const m = await import('./components/naklady/Naklady'); return { Component: m.default } } },
      { path: 'dodavatele', lazy: async () => { const m = await import('./components/dodavatele/Dodavatele'); return { Component: m.default } } },
      { path: 'nastaveni', lazy: async () => { const m = await import('./components/nastaveni/Nastaveni'); return { Component: m.default } } },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
