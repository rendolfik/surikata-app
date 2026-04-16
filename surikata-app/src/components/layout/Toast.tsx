import { useUiStore } from '../../store/uiStore'

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-modal text-sm font-medium
            animate-[fadeUp_.25s_ease]
            ${t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'info' ? 'bg-[#066a80] text-white' : 'bg-green-600 text-white'}
          `}
        >
          <span>{t.type === 'error' ? '❌' : t.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  )
}
