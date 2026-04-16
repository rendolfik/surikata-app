import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { lsGet } from '../../lib/storage'
import type { AppUser } from '../../types'

const DEFAULT_USERS: AppUser[] = [
  { id: 'u1', jmeno: 'Renat', pin_hash: '1234', role: 'admin', avatar: '🏄', barva: '#0dc0df' },
  { id: 'u2', jmeno: 'Kamarádka', pin_hash: '5678', role: 'editor', avatar: '🌊', barva: '#0899b5' },
]

function getUsers(): AppUser[] {
  return lsGet<AppUser[]>('suri_users', DEFAULT_USERS)
}

export function PinScreen() {
  const { setUser } = useAuthStore()
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const users = getUsers()

  const handleKey = (k: string) => {
    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      setError(false)
      return
    }
    const newPin = pin + k
    setPin(newPin)
    if (newPin.length === 4) {
      // verify
      setTimeout(() => {
        if (selectedUser && newPin === selectedUser.pin_hash) {
          setUser(selectedUser)
        } else {
          setError(true)
          setTimeout(() => { setPin(''); setError(false) }, 700)
        }
      }, 100)
    }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#066a80] to-[#0dc0df] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="font-serif text-4xl text-white mb-2">Surikata</div>
          <div className="text-white/60 text-sm tracking-widest uppercase mb-12">Surf Camp</div>
          <div className="text-white/80 text-sm mb-6">Kdo jsi?</div>
          <div className="flex gap-4 justify-center">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-transparent rounded-xl px-6 py-4 text-white transition-all"
              >
                <div className="text-3xl">{u.avatar}</div>
                <div className="text-sm font-semibold">{u.jmeno}</div>
                <div className="text-xs text-white/60">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#066a80] to-[#0dc0df] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-2">{selectedUser.avatar}</div>
        <div className="text-white font-semibold text-lg mb-1">{selectedUser.jmeno}</div>
        <div className="text-white/60 text-sm mb-8">Zadej PIN</div>

        {/* PIN dots */}
        <div className={`flex gap-3 justify-center mb-8 ${error ? 'animate-[shake_.4s_ease]' : ''}`}>
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i ? 'bg-white border-white' : 'border-white/40'}`}
              style={pin.length > i ? { background: selectedUser.barva, borderColor: selectedUser.barva } : {}}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 mx-auto w-fit">
          {KEYS.map((k, i) => (
            k === '' ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => k !== '' && handleKey(k)}
                className={`
                  w-[72px] h-[72px] rounded-full font-semibold text-xl text-white transition-all
                  ${k === 'del' ? 'bg-white/10 text-lg' : 'bg-white/12 hover:bg-white/22 active:scale-95'}
                `}
              >
                {k === 'del' ? '⌫' : k}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => { setSelectedUser(null); setPin('') }}
          className="mt-8 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          ← Zpět
        </button>
      </div>
    </div>
  )
}
