import { useState, useRef } from 'react'
import { useFaktury, useCreateFaktura, useUpdateFaktura, useDeleteFaktura } from '../../hooks/useFaktury'
import { useSlevy, useCreateSleva, useDeleteSleva } from '../../hooks/useSlevy'
import { useTerminy } from '../../hooks/useTerminy'
import { useNastaveniStore } from '../../store/nastaveniStore'
import { useUiStore } from '../../store/uiStore'
import { formatCurrency, formatDate, todayISO, addDays } from '../../lib/utils'
import type { Faktura, FakturaItem, FakturaStav } from '../../types'
import { QRCodeSVG } from 'qrcode.react'
import { useReactToPrint } from 'react-to-print'

export default function Fakturace() {
  const { data: faktury = [] } = useFaktury()
  const { data: slevy = [] } = useSlevy()
  const { data: terminy = [] } = useTerminy()

  const { nastaveni } = useNastaveniStore()
  const { addToast } = useUiStore()
  const createF = useCreateFaktura()
  const updateF = useUpdateFaktura()
  const deleteF = useDeleteFaktura()
  const createS = useCreateSleva()
  const deleteS = useDeleteSleva()

  const [filterStav, setFilterStav] = useState<string>('all')
  const [modalNew, setModalNew] = useState(false)
  const [nahledId, setNahledId] = useState<string | null>(null)
  const [newSleva, setNewSleva] = useState({ kod: '', sleva: 10, popis: '' })
  const printRef = useRef<HTMLDivElement>(null)

  // New invoice form
  const emptyForm = () => ({
    odberatel_jmeno: '', odberatel_email: '', odberatel_adresa: '',
    termin_nazev: '', ucastnik_id: null as string | null,
    items: [{ popis: 'Surf camp – účast', cena: nastaveni.ceny.dospely_surfujici }] as FakturaItem[],
    slevovy_kod: '', sleva_pct: 0, sleva_kc: 0,
    splatnost: addDays(todayISO(), nastaveni.ceny.splatnost_dni),
    poznamka: nastaveni.faktura.poznamka_sablona,
    stav: 'vystavena' as FakturaStav,
    mezi_soucet: nastaveni.ceny.dospely_surfujici,
    celkem: nastaveni.ceny.dospely_surfujici,
    datum_vystaveni: todayISO(),
  })
  const [form, setForm] = useState(emptyForm())
  const [slevaMssg, setSlevaMssg] = useState('')

  const filtered = faktury.filter((f) => filterStav === 'all' || f.stav === filterStav)
  const celkemVystaveno = faktury.filter(f => f.stav === 'vystavena').reduce((s, f) => s + f.celkem, 0)

  const nahled = nahledId ? faktury.find(f => f.id === nahledId) : null

  function calcSoucty(items: FakturaItem[], slevaPct: number): { mezi: number; sleva: number; celkem: number } {
    const mezi = items.reduce((s, i) => s + (i.cena || 0), 0)
    const sleva = Math.round(mezi * slevaPct / 100)
    return { mezi, sleva, celkem: mezi - sleva }
  }

  function updateItems(items: FakturaItem[]) {
    const { mezi, sleva, celkem } = calcSoucty(items, form.sleva_pct)
    setForm(f => ({ ...f, items, mezi_soucet: mezi, sleva_kc: sleva, celkem }))
  }

  function applySlevovyKod() {
    const kod = form.slevovy_kod.toUpperCase()
    const found = slevy.find(s => s.kod === kod)
    if (!found) { setSlevaMssg('❌ Kód nenalezen'); return }
    const { mezi, sleva, celkem } = calcSoucty(form.items, found.sleva)
    setForm(f => ({ ...f, sleva_pct: found.sleva, sleva_kc: sleva, mezi_soucet: mezi, celkem }))
    setSlevaMssg(`✅ Sleva ${found.sleva}% použita`)
  }

  async function handleCreate() {
    if (!form.odberatel_jmeno.trim()) return alert('Zadej odběratele')
    if (form.items.length === 0) return alert('Přidej alespoň jednu položku')
    try {
      await createF.mutateAsync({ ...form, splatnost_dni: nastaveni.ceny.splatnost_dni })
      addToast('Faktura vystavena')
      setModalNew(false)
      setForm(emptyForm())
    } catch { addToast('Chyba', 'error') }
  }

  async function markZaplacena(id: string) {
    await updateF.mutateAsync({ id, stav: 'zaplacena', datum_zaplaceni: todayISO() })
    addToast('Faktura označena jako zaplacená')
  }

  async function markStorno(id: string) {
    if (!confirm('Stornovat fakturu?')) return
    await updateF.mutateAsync({ id, stav: 'storno' })
    addToast('Faktura stornována')
  }

  async function handleDelete(id: string) {
    if (!confirm('Smazat fakturu?')) return
    await deleteF.mutateAsync(id)
    addToast('Faktura smazána')
    setNahledId(null)
  }

  const handlePrint = useReactToPrint({ contentRef: printRef })



  const STAV_BADGE: Record<string, string> = {
    vystavena: 'bg-amber-50 text-amber-700 border-amber-200',
    zaplacena: 'bg-green-50 text-green-700 border-green-200',
    storno: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  const STAV_LABEL: Record<string, string> = {
    vystavena: '⏳ Vystavena', zaplacena: '✅ Zaplacena', storno: '🚫 Storno'
  }

  return (
    <div>
      <div className="sec-hdr">
        <div>
          <div className="sec-title">Fakturace</div>
          <div className="sec-subtitle">Vydané faktury a slevové kódy</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="stat-box"><span className="stat-num">{faktury.length}</span><span className="stat-label">Celkem faktur</span></div>
        <div className="stat-box"><span className="stat-num green">{faktury.filter(f => f.stav === 'zaplacena').length}</span><span className="stat-label">Zaplaceno</span></div>
        <div className="stat-box"><span className="stat-num amber">{faktury.filter(f => f.stav === 'vystavena').length}</span><span className="stat-label">Čeká platba</span></div>
        <div className="stat-box" style={{ minWidth: 160 }}><span className="stat-num red" style={{ fontSize: 18 }}>{formatCurrency(celkemVystaveno)}</span><span className="stat-label">Dlužná částka</span></div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-2">
          {['all','vystavena','zaplacena','storno'].map(s => (
            <button key={s} onClick={() => setFilterStav(s)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${filterStav === s ? 'bg-[#0dc0df] text-white border-[#0dc0df]' : 'bg-white text-[#5a8a96] border-[#c8eef5] hover:border-[#0dc0df]'}`}>
              {s === 'all' ? 'Vše' : STAV_LABEL[s]}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm()); setModalNew(true) }}>+ Nová faktura</button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🧾</div><div className="empty-state-title">Žádné faktury</div></div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white border border-[#c8eef5] rounded-xl p-4 hover:shadow-ocean transition-shadow">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0899b5] mb-0.5">{f.cislo}</div>
                  <div className="font-bold text-[#0d2d35]">{f.odberatel_jmeno}</div>
                  {f.termin_nazev && <div className="text-xs text-[#5a8a96]">🗓 {f.termin_nazev}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-[#0d2d35]">{formatCurrency(f.celkem)}</div>
                  <div className="text-xs text-[#5a8a96]">Splatnost: {formatDate(f.splatnost)}</div>
                  <span className={`tbadge border mt-1 inline-block ${STAV_BADGE[f.stav]}`}>{STAV_LABEL[f.stav]}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#c8eef5] flex-wrap">
                <button className="btn btn-secondary btn-sm" onClick={() => setNahledId(f.id)}>👁 Náhled</button>
                {f.stav === 'vystavena' && <button className="btn btn-success btn-sm" onClick={() => markZaplacena(f.id)}>✅ Zaplacena</button>}
                {f.stav === 'vystavena' && <button className="btn btn-secondary btn-sm" onClick={() => markStorno(f.id)}>🚫 Storno</button>}
                <button className="btn btn-danger btn-sm ml-auto" onClick={() => handleDelete(f.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slevové kódy */}
      <div className="bg-white border border-[#c8eef5] rounded-xl p-5 mt-6">
        <div className="font-bold text-[#0d2d35] mb-4">🎟 Slevové kódy</div>
        {slevy.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {slevy.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 bg-[#f0fbfd] rounded-lg border border-[#c8eef5]">
                <code className="font-mono font-bold text-[#066a80] bg-white px-2 py-0.5 rounded border border-[#c8eef5]">{s.kod}</code>
                <span className="font-bold text-green-700">{s.sleva}%</span>
                <span className="text-xs text-[#5a8a96] flex-1">{s.popis}</span>
                <button className="btn btn-danger btn-xs" onClick={() => deleteS.mutateAsync(s.id)}>🗑</button>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 80px 1fr auto' }}>
          <input className="form-input" placeholder="Kód (velká písm.)" value={newSleva.kod} onChange={(e) => setNewSleva({ ...newSleva, kod: e.target.value.toUpperCase() })} />
          <input className="form-input" type="number" placeholder="%" value={newSleva.sleva} onChange={(e) => setNewSleva({ ...newSleva, sleva: Number(e.target.value) })} />
          <input className="form-input" placeholder="Popis" value={newSleva.popis} onChange={(e) => setNewSleva({ ...newSleva, popis: e.target.value })} />
          <button className="btn btn-primary" onClick={async () => {
            if (!newSleva.kod) return
            await createS.mutateAsync(newSleva)
            setNewSleva({ kod: '', sleva: 10, popis: '' })
            addToast('Slevový kód přidán')
          }}>+ Přidat</button>
        </div>
      </div>

      {/* New invoice modal */}
      {modalNew && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModalNew(false)}>
          <div className="modal-box" style={{ width: 640 }}>
            <div className="modal-hdr">
              <h2 className="modal-title">Nová faktura</h2>
              <button className="modal-close" onClick={() => setModalNew(false)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Odběratel</label><input className="form-input" value={form.odberatel_jmeno} onChange={(e) => setForm({ ...form, odberatel_jmeno: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.odberatel_email} onChange={(e) => setForm({ ...form, odberatel_email: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Adresa odběratele</label><input className="form-input" value={form.odberatel_adresa} onChange={(e) => setForm({ ...form, odberatel_adresa: e.target.value })} /></div>
            <div className="form-group">
              <label className="form-label">Termín kempu</label>
              <select className="form-input" value={form.termin_nazev} onChange={(e) => setForm({ ...form, termin_nazev: e.target.value })}>
                <option value="">— Vyberte termín —</option>
                {terminy.map((t) => <option key={t.id} value={t.nazev}>{t.nazev}</option>)}
              </select>
            </div>

            {/* Items */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label m-0">Položky faktury</label>
                <button className="btn btn-secondary btn-sm" onClick={() => updateItems([...form.items, { popis: '', cena: 0 }])}>+ Řádek</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr 120px auto' }}>
                  <input className="form-input" placeholder="Popis" value={item.popis} onChange={(e) => { const items = [...form.items]; items[i] = { ...item, popis: e.target.value }; updateItems(items) }} />
                  <input className="form-input" type="number" placeholder="Kč" value={item.cena} onChange={(e) => { const items = [...form.items]; items[i] = { ...item, cena: Number(e.target.value) }; updateItems(items) }} />
                  <button className="btn btn-danger btn-sm" onClick={() => updateItems(form.items.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>

            <div className="form-row mb-3">
              <div className="form-group">
                <label className="form-label">Slevový kód</label>
                <div className="flex gap-2">
                  <input className="form-input" placeholder="Kód kupónu" value={form.slevovy_kod} onChange={(e) => setForm({ ...form, slevovy_kod: e.target.value.toUpperCase() })} />
                  <button className="btn btn-secondary btn-sm flex-shrink-0" onClick={applySlevovyKod}>Použít</button>
                </div>
                {slevaMssg && <div className="text-xs mt-1">{slevaMssg}</div>}
              </div>
              <div className="form-group"><label className="form-label">Datum splatnosti</label><input className="form-input" type="date" value={form.splatnost} onChange={(e) => setForm({ ...form, splatnost: e.target.value })} /></div>
            </div>

            <div className="bg-[#f0fbfd] rounded-xl p-4 mb-3">
              <div className="flex justify-between py-1 text-sm"><span className="text-[#5a8a96]">Mezisoučet</span><span>{formatCurrency(form.mezi_soucet)}</span></div>
              <div className="flex justify-between py-1 text-sm"><span className="text-[#5a8a96]">Sleva</span><span className="text-red-600">-{formatCurrency(form.sleva_kc)}</span></div>
              <div className="flex justify-between px-3.5 py-2.5 bg-[#066a80] rounded-lg mt-2 text-white font-bold text-base"><span>Celkem k úhradě</span><span>{formatCurrency(form.celkem)}</span></div>
              <div className="text-[11px] text-[#5a8a96] mt-1">Spolek není plátcem DPH</div>
            </div>

            <div className="form-group"><label className="form-label">Poznámka</label><textarea className="form-input" value={form.poznamka} onChange={(e) => setForm({ ...form, poznamka: e.target.value })} /></div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalNew(false)}>Zrušit</button>
              <button className="btn btn-primary" onClick={handleCreate}>🧾 Vystavit fakturu</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice preview modal */}
      {nahled && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setNahledId(null)}>
          <div className="modal-box" style={{ width: 760, maxHeight: '92vh' }}>
            <div className="modal-hdr">
              <h2 className="modal-title">Náhled faktury</h2>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => handlePrint()}>⬇ Tisk / PDF</button>
                <button className="modal-close" onClick={() => setNahledId(null)}>×</button>
              </div>
            </div>
            <div style={{ maxHeight: '72vh', overflowY: 'auto', padding: 4 }}>
              <div ref={printRef}>
                <FakturaNahled faktura={nahled} firma={nastaveni.firma} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FakturaNahled({ faktura, firma }: { faktura: Faktura; firma: any }) {
  const vs = faktura.cislo.replace(/FAK-|-/g, '')
  const qrData = `SPD*1.0*ACC:${firma.iban}*AM:${faktura.celkem}.00*CC:CZK*X-VS:${vs}*MSG:${faktura.cislo}`

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: '#0d2d35', padding: '40px', maxWidth: 680, margin: '0 auto', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#066a80', marginBottom: 4 }}>FAKTURA</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#0dc0df' }}>{faktura.cislo}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{firma.nazev}</div>
          <div style={{ color: '#5a8a96' }}>{firma.adresa}</div>
          <div style={{ color: '#5a8a96' }}>{firma.psc_mesto}</div>
          <div style={{ color: '#5a8a96' }}>IČO: {firma.ico}</div>
          <div style={{ color: '#5a8a96' }}>Tel: {firma.telefon}</div>
          <div style={{ color: '#5a8a96' }}>{firma.email}</div>
        </div>
      </div>

      {/* Dates + odberatel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#5a8a96', letterSpacing: '1px', marginBottom: 6 }}>Odběratel</div>
          <div style={{ fontWeight: 700 }}>{faktura.odberatel_jmeno}</div>
          {faktura.odberatel_adresa && <div style={{ color: '#5a8a96', fontSize: 12 }}>{faktura.odberatel_adresa}</div>}
          {faktura.odberatel_email && <div style={{ color: '#5a8a96', fontSize: 12 }}>{faktura.odberatel_email}</div>}
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5a8a96' }}>Datum vystavení:</span><strong>{formatDate(faktura.datum_vystaveni)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5a8a96' }}>Datum splatnosti:</span><strong style={{ color: '#d97706' }}>{formatDate(faktura.splatnost)}</strong></div>
            {faktura.termin_nazev && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5a8a96' }}>Termín kempu:</span><strong>{faktura.termin_nazev}</strong></div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f0fbfd' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#5a8a96', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #c8eef5' }}>Popis</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#5a8a96', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #c8eef5' }}>Částka</th>
          </tr>
        </thead>
        <tbody>
          {(faktura.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #c8eef5' }}>
              <td style={{ padding: '10px 12px' }}>{item.popis}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.cena)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Soucty */}
      <div style={{ background: '#f0fbfd', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}><span style={{ color: '#5a8a96' }}>Mezisoučet</span><span>{formatCurrency(faktura.mezi_soucet)}</span></div>
        {faktura.sleva_kc > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: '#5a8a96' }}>Sleva {faktura.sleva_pct > 0 ? `(${faktura.sleva_pct}%)` : ''}</span>
            <span style={{ color: '#dc2626' }}>-{formatCurrency(faktura.sleva_kc)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#066a80', borderRadius: 8, marginTop: 8, color: '#fff', fontWeight: 700, fontSize: 16 }}>
          <span>Celkem k úhradě</span><span>{formatCurrency(faktura.celkem)}</span>
        </div>
        <div style={{ fontSize: 11, color: '#5a8a96', marginTop: 4 }}>Spolek není plátcem DPH</div>
      </div>

      {/* Bank + QR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Platební údaje</div>
          <div><span style={{ color: '#5a8a96' }}>Číslo účtu: </span><strong>{firma.ucet}</strong></div>
          <div><span style={{ color: '#5a8a96' }}>IBAN: </span><strong>{firma.iban}</strong></div>
          <div><span style={{ color: '#5a8a96' }}>VS: </span><strong>{vs}</strong></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <QRCodeSVG value={qrData} size={100} />
          <div style={{ fontSize: 11, color: '#5a8a96', marginTop: 4 }}>QR platba</div>
        </div>
      </div>

      {faktura.poznamka && (
        <div style={{ background: '#f0fbfd', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#5a8a96', fontStyle: 'italic' }}>
          {faktura.poznamka}
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 10, color: '#5a8a96', borderTop: '1px solid #c8eef5', paddingTop: 10 }}>
        {firma.nazev} · IČO {firma.ico} · {firma.soud_zapis}
      </div>
    </div>
  )
}
