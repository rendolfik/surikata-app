import { useState, useRef, useEffect } from 'react'
import { useCreateNapad } from '../../hooks/useNapady'
import { useUiStore } from '../../store/uiStore'
import { TYPE_ICON, TYPE_LABEL, PILLAR_ICON, PILLAR_LABEL } from '../../lib/constants'
import type { PostTyp, Pilir } from '../../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ParsedIdea {
  title: string
  typ: PostTyp
  pilir: Pilir
  hook: string
}

const SYSTEM_PROMPT = `Jsi AI asistent pro Surikata Surf Camp – cestovní kancelář specializující se na surf kempy v Portuguezi (Baleal, Peniche). Pomáháš vytvářet obsah na Instagram.

Firma: Surikata surf z.s.
Cílová skupina: Češi a Slováci 25-45 let, milovníci moře, dobrodružství, zdravého životního stylu.
Tón: Přátelský, autentický, inspirativní. Česky.

Typy příspěvků: reel (krátké video), carousel (více fotek), foto (single foto), stories (dočasný obsah).
Obsahové pilíře:
- emotivni: Silné emoce, nostalgie, láska k moři
- inspirace: Inspirace k cestování a surfování
- edukace: Tipy na surf, cestování, Portugalsko
- zakulisi: Za kulisami kempu, tým, přípravy
- socialproof: Reference, fotky účastníků, hodnocení

Když uživatel požádá o nápady, vrať je ve formátu:
[NÁPAD]
Název: ...
Formát: reel/carousel/foto/stories
Pilíř: emotivni/inspirace/edukace/zakulisi/socialproof
Hook: ...
[/NÁPAD]

Buď konkrétní, kreativní a přizpůsob obsah českému publiku.`

function parseIdeas(text: string): ParsedIdea[] {
  const ideas: ParsedIdea[] = []
  const blocks = text.match(/\[NÁPAD\]([\s\S]*?)\[\/NÁPAD\]/g) || []
  for (const block of blocks) {
    const nazev = block.match(/Název:\s*(.+)/)?.[1]?.trim()
    const format = block.match(/Formát:\s*(\w+)/)?.[1]?.trim() as PostTyp
    const pilir = block.match(/Pilíř:\s*(\w+)/)?.[1]?.trim() as Pilir
    const hook = block.match(/Hook:\s*(.+)/)?.[1]?.trim()
    if (nazev && format && pilir) {
      ideas.push({ title: nazev, typ: format, pilir, hook: hook || '' })
    }
  }
  return ideas
}

const QUICK_PROMPTS = [
  { label: '5 nápadů na reels', prompt: 'Vymysli 5 nápadů na Instagram Reels pro Surikata Surf Camp.' },
  { label: 'Tipy pro začátečníky', prompt: 'Vytvoř 3 nápady na edukativní carousel příspěvky – tipy pro lidi, kteří nikdy nesurfovali.' },
  { label: 'Zákulisí kempu', prompt: 'Navrhni 4 nápady na zákulisní příspěvky z kempu – přípravy, tým, místo.' },
  { label: 'Social proof', prompt: 'Vymysli 3 nápady jak kreativně sdílet reference a fotky účastníků.' },
  { label: 'Inspirace Portugalsko', prompt: 'Navrhni 4 inspirativní příspěvky o Portugalu, Balealu a surfování.' },
]

export default function AIAsistent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedIdeas, setParsedIdeas] = useState<ParsedIdea[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const createNapad = useCreateNapad()
  const { addToast } = useUiStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)
    setParsedIdeas([])

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ API klíč pro AI není nastaven. Přidej `VITE_ANTHROPIC_API_KEY` do souboru `.env.local`.' }])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const assistantMsg = data.content?.[0]?.text || ''
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }])
      const ideas = parseIdeas(assistantMsg)
      if (ideas.length > 0) setParsedIdeas(ideas)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Neznámá chyba'
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Chyba: ${errorMsg}` }])
    } finally {
      setLoading(false)
    }
  }

  async function saveIdea(idea: ParsedIdea) {
    await createNapad.mutateAsync(idea)
    addToast('Nápad uložen do banky nápadů')
  }

  async function saveAllIdeas() {
    for (const idea of parsedIdeas) {
      await createNapad.mutateAsync(idea)
    }
    addToast(`${parsedIdeas.length} nápadů uloženo`)
    setParsedIdeas([])
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="sec-hdr">
        <div><div className="sec-title">AI Asistent</div><div className="sec-subtitle">Generátor obsahu pro Instagram powered by Claude</div></div>
        {messages.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setMessages([]); setParsedIdeas([]) }}>🗑 Vymazat chat</button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white border border-[#c8eef5] rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-5xl mb-4">🤖</div>
              <div className="font-bold text-[#0d2d35] mb-2">AI Asistent pro obsah</div>
              <div className="text-sm text-[#5a8a96] mb-6 max-w-sm">Zeptej se na nápady pro Instagram, popros o hooka, caption, nebo obsah pro konkrétní pilíř.</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((qp) => (
                  <button key={qp.label} className="btn btn-secondary btn-sm" onClick={() => sendMessage(qp.prompt)}>{qp.label}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#0dc0df] text-white rounded-br-sm'
                  : 'bg-[#f0fbfd] text-[#0d2d35] rounded-bl-sm border border-[#c8eef5]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f0fbfd] border border-[#c8eef5] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-[#0dc0df] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#0dc0df] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#0dc0df] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#c8eef5] p-3 flex gap-2">
          <input
            className="form-input flex-1 !mb-0"
            placeholder="Napiš, co potřebuješ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      {/* Parsed Ideas */}
      {parsedIdeas.length > 0 && (
        <div className="mt-4 bg-white border border-[#c8eef5] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-sm text-[#0d2d35]">💡 Nalezeno {parsedIdeas.length} {parsedIdeas.length === 1 ? 'nápad' : parsedIdeas.length < 5 ? 'nápady' : 'nápadů'}</div>
            <button className="btn btn-primary btn-sm" onClick={saveAllIdeas}>💾 Uložit vše do banky</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {parsedIdeas.map((idea, i) => (
              <div key={i} className="bg-[#f0fbfd] rounded-lg p-3 border border-[#c8eef5]">
                <div className="font-semibold text-sm text-[#0d2d35] mb-1">{idea.title}</div>
                {idea.hook && <div className="text-xs text-[#5a8a96] mb-2 line-clamp-2">{idea.hook}</div>}
                <div className="flex gap-1 flex-wrap mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-[#c8eef5] text-[#5a8a96]">{TYPE_ICON[idea.typ]} {TYPE_LABEL[idea.typ]}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-[#c8eef5] text-[#5a8a96]">{PILLAR_ICON[idea.pilir]} {PILLAR_LABEL[idea.pilir]}</span>
                </div>
                <button className="btn btn-secondary btn-xs w-full" onClick={() => saveIdea(idea)}>💾 Uložit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick prompts (when chat has messages) */}
      {messages.length > 0 && !loading && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp) => (
            <button key={qp.label} className="btn btn-secondary btn-xs" onClick={() => sendMessage(qp.prompt)}>{qp.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}
