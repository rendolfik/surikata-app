# Surikata Surf Camp – Zadání pro přepsání v React + Vite + Supabase

## Kontext projektu

Existující aplikace je single-page HTML soubor (280 000 znaků, vanilla JS). Funguje ale je neudržovatelná. Cílem je přepsat ji do moderního stacku se zachováním veškeré funkcionality.

Specifikace všech modulů, datového modelu a business logiky viz soubor `Claude.md`.

---

## Tech stack

```
Frontend:   React 18 + TypeScript
Build:      Vite
Styling:    Tailwind CSS
State:      Zustand (globální stav) + TanStack Query (server state)
Backend:    Supabase (PostgreSQL + Auth + Realtime + Storage)
Routing:    React Router v6
Forms:      React Hook Form + Zod (validace)
UI:        shadcn/ui (komponenty)
PDF:        react-to-print nebo @react-pdf/renderer
QR kód:    qrcode.react
Ikony:      lucide-react
Hosting:    Vercel nebo Netlify (zdarma)
```

---

## Struktura projektu

```
surikata-app/
├── public/
│   ├── logo.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── utils.ts             # pomocné funkce (formatCurrency, datePlusDays...)
│   │   └── constants.ts         # FIRMA, CENY, COLORS, TAB_TITLES
│   │
│   ├── types/
│   │   └── index.ts             # všechny TypeScript typy/interfaces
│   │
│   ├── store/
│   │   ├── authStore.ts         # přihlášený uživatel
│   │   ├── nastaveniStore.ts    # nastavení aplikace
│   │   └── alertStore.ts        # alerty/notifikace
│   │
│   ├── hooks/
│   │   ├── useUcastnici.ts
│   │   ├── useFaktury.ts
│   │   ├── useTerminy.ts
│   │   ├── useNaklady.ts
│   │   ├── useTodos.ts
│   │   ├── usePosts.ts
│   │   ├── useIdeas.ts
│   │   ├── useIntPlatby.ts
│   │   ├── useDodavatele.ts
│   │   └── useAlerts.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── PinScreen.tsx
│   │   │
│   │   ├── ui/                  # shadcn/ui + vlastní
│   │   │   ├── StatCard.tsx
│   │   │   ├── DashCard.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AlertPanel.tsx
│   │   │   ├── HoriciUkoly.tsx
│   │   │   ├── CekaPlata.tsx
│   │   │   ├── ObsazenostTerminu.tsx
│   │   │   └── IntPlatbySouhrn.tsx
│   │   │
│   │   ├── obsahovy-plan/
│   │   │   ├── ObsahPlan.tsx
│   │   │   ├── KalendarMesic.tsx
│   │   │   ├── KalendarDen.tsx
│   │   │   ├── PostChip.tsx
│   │   │   └── PostModal.tsx
│   │   │
│   │   ├── napady/
│   │   │   ├── BankaNapadu.tsx
│   │   │   ├── NapadCard.tsx
│   │   │   └── NapadModal.tsx
│   │   │
│   │   ├── ai/
│   │   │   └── AIAsistent.tsx
│   │   │
│   │   ├── ucastnici/
│   │   │   ├── Ucastnici.tsx
│   │   │   ├── UcastnikCard.tsx
│   │   │   ├── UcastnikModal.tsx
│   │   │   ├── SplatkyForm.tsx
│   │   │   └── SpolucestujiciForm.tsx
│   │   │
│   │   ├── todo/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoTable.tsx
│   │   │   ├── TodoRow.tsx
│   │   │   └── TodoModal.tsx
│   │   │
│   │   ├── fakturace/
│   │   │   ├── Fakturace.tsx
│   │   │   ├── FakturaRow.tsx
│   │   │   ├── FakturaModal.tsx
│   │   │   ├── FakturaNahled.tsx
│   │   │   ├── FakturaQR.tsx
│   │   │   └── SlevoveKody.tsx
│   │   │
│   │   ├── platby/
│   │   │   ├── IntPlatby.tsx
│   │   │   ├── PlatbaModal.tsx
│   │   │   └── PlatbySouhrn.tsx
│   │   │
│   │   ├── naklady/
│   │   │   ├── Naklady.tsx
│   │   │   ├── NakladCard.tsx
│   │   │   └── NakladModal.tsx
│   │   │
│   │   ├── dodavatele/
│   │   │   ├── Dodavatele.tsx
│   │   │   ├── DodavatelCard.tsx
│   │   │   └── DodavatelModal.tsx
│   │   │
│   │   └── nastaveni/
│   │       ├── Nastaveni.tsx
│   │       ├── TerminyNast.tsx
│   │       ├── UzivateleNast.tsx
│   │       ├── FirmaNast.tsx
│   │       ├── CenyNast.tsx
│   │       ├── SlevyNast.tsx
│   │       ├── SablonyNast.tsx
│   │       └── AlertyNast.tsx
│   │
│   └── pages/
│       ├── LoginPage.tsx
│       └── AppPage.tsx
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── seed.sql
│
├── .env.local
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## TypeScript typy

```typescript
// src/types/index.ts

export type PostTyp = 'reel' | 'carousel' | 'foto' | 'stories'
export type Pilir = 'emotivni' | 'inspirace' | 'edukace' | 'zakulisi' | 'socialproof'
export type TerminTyp = 'jaro' | 'podzim'
export type TodoStatus = 'todo' | 'inprog' | 'waiting' | 'done'
export type TodoPriority = 'high' | 'medium' | 'low'
export type TodoKategorie = 'marketing' | 'admin' | 'camp' | 'finance' | 'other'
export type FakturaStav = 'vystavena' | 'zaplacena' | 'storno'
export type Role = 'admin' | 'editor'
export type DodavatelTyp = 'surfova_skola' | 'ubytovani' | 'doprava' | 'joga' | 'stravovani' | 'pojisteni' | 'jine'
export type AlertUroven = 'error' | 'warning'

export interface Termin {
  id: string
  nazev: string
  datum_od: string       // ISO date
  datum_do: string
  typ: TerminTyp
  kapacita: number
  barva: string
  poznamka?: string
  created_at: string
}

export interface Spolucestujici {
  id: string
  jmeno: string
  prijmeni: string
  tricko: string
  surf: boolean
}

export interface Splatka {
  id: string
  castka: number
  datum: string          // ISO date – datum splatnosti
  zaplaceno: boolean
  datum_zaplaceni?: string
}

export interface Ucastnik {
  id: string
  jmeno: string
  prijmeni: string
  email: string
  telefon?: string
  adresa?: string
  tricko: string
  termin_id?: string
  surf: boolean
  ma_deti: boolean
  zaplaceno: boolean
  zaplaceno_castka: number
  poznamka?: string
  spolucestujici: Spolucestujici[]
  splatky: Splatka[]
  created_at: string
}

export interface Post {
  id: string
  datum: string          // ISO date
  title: string
  typ: PostTyp
  pilir: Pilir
  hook?: string
  media?: string
  created_at: string
}

export interface Napad {
  id: string
  title: string
  typ: PostTyp
  pilir: Pilir
  hook?: string
  media?: string
  created_at: string
}

export interface Todo {
  id: string
  title: string
  desc?: string
  priority: TodoPriority
  status: TodoStatus
  due?: string           // ISO date
  person?: string
  kategorie: TodoKategorie
  created_at: string
}

export interface FakturaItem {
  popis: string
  cena: number
}

export interface Faktura {
  id: string
  cislo: string          // FAK-2026-001
  stav: FakturaStav
  datum_vystaveni: string
  splatnost: string
  ucastnik_id?: string
  odberatel_jmeno: string
  odberatel_email?: string
  odberatel_adresa?: string
  termin_nazev?: string
  items: FakturaItem[]
  slevovy_kod?: string
  sleva_pct: number
  sleva_kc: number
  mezi_soucet: number
  celkem: number
  poznamka?: string
  datum_zaplaceni?: string
  created_at: string
}

export interface SlevovyKod {
  id: string
  kod: string
  sleva: number          // procenta
  popis: string
}

export interface Naklad {
  id: string
  nazev: string
  dodavatel_id?: string
  dodavatel_nazev?: string  // denormalizováno pro rychlost
  celkem_kc: number
  zaloha_pct: number
  zaloha_kc: number
  termin_id?: string
  zaloha_zaplacena: boolean
  doplatek_zaplacen: boolean
  poznamka?: string
  created_at: string
}

export interface IntPlatba {
  id: string
  nazev: string
  castka: number
  datum: string
  uzivatel: string       // jméno uživatele
  poznamka?: string
  created_at: string
}

export interface Dodavatel {
  id: string
  nazev: string
  typ: DodavatelTyp
  email?: string
  telefon?: string
  ico?: string
  ucet?: string
  adresa?: string
  poznamka?: string
  created_at: string
}

export interface Uzivatel {
  id: string
  jmeno: string
  pin: string            // hash, ne plain text!
  role: Role
  avatar: string         // emoji
  barva: string          // hex
}

export interface FirmaInfo {
  nazev: string
  ico: string
  adresa: string
  psc_mesto: string
  ucet: string
  iban: string
  telefon: string
  email: string
  web: string
  soud_zapis: string
}

export interface CenyConfig {
  dospely_surfujici: number
  dospely_nesurfujici: number
  dite_surfujici: number
  dite_nesurfujici: number
  splatnost_dni: number
}

export interface FakturaTemplates {
  email_predmet: string
  email_telo: string
  poznamka_sablona: string
}

export interface AlertyConfig {
  faktura_pred_dny: number
  splatka_pred_dny: number
  naklad_pred_dny: number
}

export interface Nastaveni {
  firma: FirmaInfo
  ceny: CenyConfig
  faktura: FakturaTemplates
  alerty: AlertyConfig
}

export interface Alert {
  typ: 'faktura' | 'splatka' | 'naklad'
  uroven: AlertUroven
  ikona: string
  titul: string
  text: string
  datum: string
  dni: number
  href: string           // route kam přejít
}
```

---

## Supabase – databázové schéma

```sql
-- supabase/migrations/001_initial.sql

-- Povolení RLS (Row Level Security)
-- Všichni přihlášení uživatelé vidí vše (single-tenant aplikace)

CREATE TABLE terminy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazev TEXT NOT NULL,
  datum_od DATE NOT NULL,
  datum_do DATE NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('jaro', 'podzim')),
  kapacita INTEGER NOT NULL DEFAULT 12,
  barva TEXT DEFAULT 'green',
  poznamka TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ucastnici (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jmeno TEXT NOT NULL,
  prijmeni TEXT,
  email TEXT,
  telefon TEXT,
  adresa TEXT,
  tricko TEXT DEFAULT 'M',
  termin_id UUID REFERENCES terminy(id) ON DELETE SET NULL,
  surf BOOLEAN DEFAULT TRUE,
  ma_deti BOOLEAN DEFAULT FALSE,
  zaplaceno BOOLEAN DEFAULT FALSE,
  zaplaceno_castka INTEGER DEFAULT 0,
  poznamka TEXT,
  spolucestujici JSONB DEFAULT '[]',  -- Spolucestujici[]
  splatky JSONB DEFAULT '[]',          -- Splatka[]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datum DATE NOT NULL,
  title TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('reel', 'carousel', 'foto', 'stories')),
  pilir TEXT NOT NULL,
  hook TEXT,
  media TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE napady (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  typ TEXT NOT NULL,
  pilir TEXT NOT NULL,
  hook TEXT,
  media TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  desc TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'inprog', 'waiting', 'done')),
  due DATE,
  person TEXT,
  kategorie TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE faktury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cislo TEXT NOT NULL UNIQUE,
  stav TEXT DEFAULT 'vystavena' CHECK (stav IN ('vystavena', 'zaplacena', 'storno')),
  datum_vystaveni DATE NOT NULL DEFAULT CURRENT_DATE,
  splatnost DATE NOT NULL,
  ucastnik_id UUID REFERENCES ucastnici(id) ON DELETE SET NULL,
  odberatel_jmeno TEXT NOT NULL,
  odberatel_email TEXT,
  odberatel_adresa TEXT,
  termin_nazev TEXT,
  items JSONB DEFAULT '[]',            -- FakturaItem[]
  slevovy_kod TEXT,
  sleva_pct INTEGER DEFAULT 0,
  sleva_kc INTEGER DEFAULT 0,
  mezi_soucet INTEGER NOT NULL,
  celkem INTEGER NOT NULL,
  poznamka TEXT,
  datum_zaplaceni DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE slevy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kod TEXT NOT NULL UNIQUE,
  sleva INTEGER NOT NULL,
  popis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE naklady (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazev TEXT NOT NULL,
  dodavatel_id UUID REFERENCES dodavatele(id) ON DELETE SET NULL,
  dodavatel_nazev TEXT,
  celkem_kc INTEGER NOT NULL,
  zaloha_pct INTEGER DEFAULT 50,
  zaloha_kc INTEGER NOT NULL,
  termin_id UUID REFERENCES terminy(id) ON DELETE SET NULL,
  zaloha_zaplacena BOOLEAN DEFAULT FALSE,
  doplatek_zaplacen BOOLEAN DEFAULT FALSE,
  poznamka TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE int_platby (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazev TEXT NOT NULL,
  castka INTEGER NOT NULL,
  datum DATE NOT NULL DEFAULT CURRENT_DATE,
  uzivatel TEXT NOT NULL,
  poznamka TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dodavatele (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazev TEXT NOT NULL,
  typ TEXT,
  email TEXT,
  telefon TEXT,
  ico TEXT,
  ucet TEXT,
  adresa TEXT,
  poznamka TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nastavení jako jeden řádek (singleton)
CREATE TABLE nastaveni (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  firma JSONB NOT NULL DEFAULT '{}',
  ceny JSONB NOT NULL DEFAULT '{}',
  faktura JSONB NOT NULL DEFAULT '{}',
  alerty JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uživatelé aplikace (odděleno od Supabase Auth)
CREATE TABLE app_uzivatele (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jmeno TEXT NOT NULL,
  pin_hash TEXT NOT NULL,  -- bcrypt hash PINu
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  avatar TEXT DEFAULT '👤',
  barva TEXT DEFAULT '#0dc0df',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (všichni autentizovaní vidí vše)
ALTER TABLE terminy ENABLE ROW LEVEL SECURITY;
ALTER TABLE ucastnici ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE napady ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faktury ENABLE ROW LEVEL SECURITY;
ALTER TABLE slevy ENABLE ROW LEVEL SECURITY;
ALTER TABLE naklady ENABLE ROW LEVEL SECURITY;
ALTER TABLE int_platby ENABLE ROW LEVEL SECURITY;
ALTER TABLE dodavatele ENABLE ROW LEVEL SECURITY;
ALTER TABLE nastaveni ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_uzivatele ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users see everything
CREATE POLICY "authenticated access" ON terminy FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON ucastnici FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON posts FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON napady FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON todos FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON faktury FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON slevy FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON naklady FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON int_platby FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON dodavatele FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON nastaveni FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "authenticated access" ON app_uzivatele FOR ALL TO authenticated USING (TRUE);
```

---

## Přihlášení – architektura

Aplikace má dva uživatele s PIN přihlášením. Supabase Auth slouží jen pro zabezpečení API (service role key nebo shared account).

```
Možnost A (jednodušší):
- Jeden sdílený Supabase účet (email+heslo)
- Obě uživatelky se přihlašují PINem do appky
- PIN se ověřuje proti tabulce app_uzivatele (pin_hash)
- Supabase session se drží na pozadí

Možnost B (robustnější):
- Každá uživatelka má vlastní Supabase účet
- PIN je jen vizuální zkratka – za ním je normální Supabase session
- Bezpečnější, ale složitější setup
```

**Doporučuji Možnost A** – je to interní nástroj pro 2 lidi.

```typescript
// src/lib/auth.ts
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export async function prihlasit(pin: string) {
  const { data: uzivatele } = await supabase.from('app_uzivatele').select('*')
  const user = uzivatele?.find(u => bcrypt.compareSync(pin, u.pin_hash))
  if (!user) throw new Error('Nesprávný PIN')
  return user
}

export async function zmeniPin(userId: string, novyPin: string) {
  const hash = bcrypt.hashSync(novyPin, 10)
  await supabase.from('app_uzivatele').update({ pin_hash: hash }).eq('id', userId)
}
```

---

## Supabase klient + hooks

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

```typescript
// src/hooks/useUcastnici.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Ucastnik } from '../types'

export function useUcastnici(terminId?: string) {
  return useQuery({
    queryKey: ['ucastnici', terminId],
    queryFn: async () => {
      let q = supabase.from('ucastnici').select('*, terminy(nazev)')
      if (terminId) q = q.eq('termin_id', terminId)
      const { data, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      return data as Ucastnik[]
    }
  })
}

export function useCreateUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Ucastnik, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('ucastnici').insert(data)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] })
  })
}

export function useUpdateUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Ucastnik> & { id: string }) => {
      const { error } = await supabase.from('ucastnici').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] })
  })
}

export function useDeleteUcastnik() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ucastnici').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ucastnici'] })
  })
}
```

Stejný pattern opakuj pro: `useTerminy`, `useFaktury`, `useTodos`, `usePosts`, `useNapady`, `useNaklady`, `useIntPlatby`, `useDodavatele`.

---

## Real-time sync

Supabase Realtime zajistí, že obě uživatelky vidí změny okamžitě bez ručního refreshe.

```typescript
// src/hooks/useRealtimeSync.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const TABLES = ['ucastnici', 'faktury', 'todos', 'terminy', 'naklady', 'int_platby', 'posts', 'napady', 'dodavatele']

export function useRealtimeSync() {
  const qc = useQueryClient()

  useEffect(() => {
    const channels = TABLES.map(table =>
      supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          qc.invalidateQueries({ queryKey: [table] })
        })
        .subscribe()
    )
    return () => { channels.forEach(c => supabase.removeChannel(c)) }
  }, [qc])
}
```

```typescript
// src/App.tsx
function App() {
  useRealtimeSync() // spustí real-time pro celou appku
  // ...
}
```

---

## Zustand store (global state)

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Uzivatel } from '../types'

interface AuthStore {
  user: Uzivatel | null
  setUser: (user: Uzivatel | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'surikata-auth' }
  )
)
```

```typescript
// src/store/nastaveniStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Nastaveni } from '../types'

const DEFAULT: Nastaveni = {
  firma: {
    nazev: 'Surikata surf z.s.',
    ico: '22455191',
    adresa: 'Husova 378, Bílé Předměstí',
    psc_mesto: '530 03 Pardubice',
    ucet: '2703088116/2010',
    iban: 'CZ5620100000002703088116',
    telefon: '603 112 799',
    email: 'jedu@surikatasurfcamp.cz',
    web: 'surikatasurfcamp.cz',
    soud_zapis: 'L 15010/KSHK Krajský soud v Hradci Králové',
  },
  ceny: {
    dospely_surfujici: 22000,
    dospely_nesurfujici: 22000,
    dite_surfujici: 15000,
    dite_nesurfujici: 12000,
    splatnost_dni: 14,
  },
  faktura: {
    email_predmet: 'Faktura {cislo} – Surikata Surf Camp',
    email_telo: 'Dobrý den,\n\nv příloze zasíláme fakturu {cislo}...',
    poznamka_sablona: 'Těšíme se na vás na kempu!',
  },
  alerty: {
    faktura_pred_dny: 5,
    splatka_pred_dny: 5,
    naklad_pred_dny: 7,
  },
}

export const useNastaveniStore = create<{ nastaveni: Nastaveni; update: (n: Partial<Nastaveni>) => void }>()(
  persist(
    (set) => ({
      nastaveni: DEFAULT,
      update: (n) => set((s) => ({ nastaveni: { ...s.nastaveni, ...n } })),
    }),
    { name: 'surikata-nastaveni' }
  )
)
```

---

## Routing

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, lazy: () => import('./components/dashboard/Dashboard') },
      { path: 'obsahovy-plan', lazy: () => import('./components/obsahovy-plan/ObsahPlan') },
      { path: 'napady', lazy: () => import('./components/napady/BankaNapadu') },
      { path: 'ai', lazy: () => import('./components/ai/AIAsistent') },
      { path: 'ucastnici', lazy: () => import('./components/ucastnici/Ucastnici') },
      { path: 'todo', lazy: () => import('./components/todo/TodoList') },
      { path: 'fakturace', lazy: () => import('./components/fakturace/Fakturace') },
      { path: 'platby', lazy: () => import('./components/platby/IntPlatby') },
      { path: 'naklady', lazy: () => import('./components/naklady/Naklady') },
      { path: 'dodavatele', lazy: () => import('./components/dodavatele/Dodavatele') },
      { path: 'nastaveni', lazy: () => import('./components/nastaveni/Nastaveni') },
    ],
  },
])
```

---

## Ukázka komponenty

```tsx
// src/components/ucastnici/UcastnikCard.tsx
import { useState } from 'react'
import { useUpdateUcastnik, useDeleteUcastnik } from '../../hooks/useUcastnici'
import { useTerminy } from '../../hooks/useTerminy'
import { useFaktury } from '../../hooks/useFaktury'
import type { Ucastnik } from '../../types'
import { formatCurrency } from '../../lib/utils'

interface Props {
  ucastnik: Ucastnik
  onEdit: () => void
}

export function UcastnikCard({ ucastnik, onEdit }: Props) {
  const { mutate: update } = useUpdateUcastnik()
  const { mutate: remove } = useDeleteUcastnik()
  const { data: terminy } = useTerminy()

  const termin = terminy?.find(t => t.id === ucastnik.termin_id)
  const celkem = 22000 * (1 + (ucastnik.spolucestujici?.length ?? 0))
  const zaplaceno = ucastnik.splatky?.reduce((s, sp) => s + (sp.zaplaceno ? sp.castka : 0), 0) ?? 0
  const maSplatky = (ucastnik.splatky?.length ?? 0) > 1

  const togglePlatba = () => update({ id: ucastnik.id, zaplaceno: !ucastnik.zaplaceno })

  return (
    <div className={`bg-white border rounded-xl p-4 transition ${!ucastnik.zaplaceno ? 'border-l-4 border-l-amber-400' : 'border-border'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-d to-ocean text-white flex items-center justify-center font-bold">
          {ucastnik.jmeno[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold">{ucastnik.jmeno} {ucastnik.prijmeni}</div>
          <div className="text-sm text-muted truncate">{ucastnik.email}</div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${ucastnik.zaplaceno ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {maSplatky
            ? `💳 ${formatCurrency(zaplaceno)} / ${formatCurrency(celkem)}`
            : ucastnik.zaplaceno ? '✅ Zaplaceno' : '⏳ Čeká platba'
          }
        </span>
      </div>

      {maSplatky && (
        <div className="mb-3">
          <div className="h-1.5 bg-border rounded-full">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (zaplaceno/celkem)*100)}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap">
        {termin && <span className="text-xs bg-bg text-muted px-2 py-0.5 rounded-full border">🗓 {termin.nazev}</span>}
        {ucastnik.surf && <span className="text-xs bg-bg text-muted px-2 py-0.5 rounded-full border">🏄 Surfuje</span>}
        {ucastnik.ma_deti && <span className="text-xs bg-bg text-muted px-2 py-0.5 rounded-full border">👶 S dětmi</span>}
        <span className="text-xs bg-bg text-muted px-2 py-0.5 rounded-full border">👕 {ucastnik.tricko}</span>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t">
        <button onClick={togglePlatba} className={`btn btn-sm flex-1 ${ucastnik.zaplaceno ? 'btn-secondary' : 'btn-primary'}`}>
          {ucastnik.zaplaceno ? 'Zrušit platbu' : '✅ Zaplaceno'}
        </button>
        <button onClick={onEdit} className="btn btn-sm btn-secondary">✏️ Upravit</button>
        <button onClick={() => remove(ucastnik.id)} className="btn btn-sm btn-danger">🗑</button>
      </div>
    </div>
  )
}
```

---

## Faktura – QR kód a PDF

```tsx
// src/components/fakturace/FakturaQR.tsx
import QRCode from 'qrcode.react'
import type { Faktura } from '../../types'
import { useNastaveniStore } from '../../store/nastaveniStore'

export function FakturaQR({ faktura }: { faktura: Faktura }) {
  const { nastaveni } = useNastaveniStore()
  const vs = faktura.cislo.replace(/FAK-|-/g, '')
  const qrData = `SPD*1.0*ACC:${nastaveni.firma.iban}*AM:${faktura.celkem}.00*CC:CZK*X-VS:${vs}*MSG:${faktura.cislo}`

  return (
    <div className="text-center">
      <QRCode value={qrData} size={120} />
      <div className="text-xs text-muted mt-1">QR platba</div>
    </div>
  )
}
```

```tsx
// PDF generování
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

export function FakturaTisk({ faktura }: { faktura: Faktura }) {
  const ref = useRef(null)
  const print = useReactToPrint({ content: () => ref.current })

  return (
    <>
      <div ref={ref} className="p-8 max-w-2xl mx-auto">
        <FakturaNahled faktura={faktura} />
      </div>
      <button onClick={print} className="btn btn-primary">⬇ Tisk / PDF</button>
    </>
  )
}
```

---

## Alert systém

```typescript
// src/hooks/useAlerts.ts
import { useMemo } from 'react'
import { useUcastnici } from './useUcastnici'
import { useFaktury } from './useFaktury'
import { useNaklady } from './useNaklady'
import { useTerminy } from './useTerminy'
import { useNastaveniStore } from '../store/nastaveniStore'
import type { Alert } from '../types'

function dnyDo(datum: string): number {
  const dnes = new Date(); dnes.setHours(0,0,0,0)
  const cil = new Date(datum + 'T00:00:00')
  return Math.round((cil.getTime() - dnes.getTime()) / 86400000)
}

export function useAlerts(): Alert[] {
  const { data: ucastnici = [] } = useUcastnici()
  const { data: faktury = [] } = useFaktury()
  const { data: naklady = [] } = useNaklady()
  const { data: terminy = [] } = useTerminy()
  const { nastaveni } = useNastaveniStore()
  const cfg = nastaveni.alerty

  return useMemo(() => {
    const alerts: Alert[] = []

    // Faktury
    faktury.filter(f => f.stav === 'vystavena' && f.splatnost).forEach(f => {
      const dni = dnyDo(f.splatnost)
      if (dni < 0) {
        alerts.push({ typ: 'faktura', uroven: 'error', ikona: '🧾',
          titul: f.odberatel_jmeno,
          text: `Faktura ${f.cislo} je po splatnosti ${Math.abs(dni)} dní`,
          datum: f.splatnost, dni, href: '/fakturace' })
      } else if (dni <= cfg.faktura_pred_dny) {
        alerts.push({ typ: 'faktura', uroven: 'warning', ikona: '🧾',
          titul: f.odberatel_jmeno,
          text: `Faktura ${f.cislo} – splatnost za ${dni} dní`,
          datum: f.splatnost, dni, href: '/fakturace' })
      }
    })

    // Splátky účastníků
    ucastnici.forEach(u => {
      u.splatky?.filter(s => !s.zaplaceno && s.datum).forEach((s, i) => {
        const dni = dnyDo(s.datum)
        const jmeno = `${u.jmeno} ${u.prijmeni}`.trim()
        if (dni < 0 || dni <= cfg.splatka_pred_dny) {
          alerts.push({ typ: 'splatka', uroven: dni < 0 ? 'error' : 'warning',
            ikona: '👤', titul: jmeno,
            text: `${i+1}. splátka ${s.castka.toLocaleString('cs-CZ')} Kč – ${dni < 0 ? `po splatnosti ${Math.abs(dni)} dní` : `za ${dni} dní`}`,
            datum: s.datum, dni, href: '/ucastnici' })
        }
      })
    })

    // Náklady
    naklady.forEach(n => {
      const termin = terminy.find(t => t.id === n.termin_id)
      if (!termin) return
      const dni = dnyDo(termin.datum_od)
      if (dni > cfg.naklad_pred_dny) return
      if (!n.zaloha_zaplacena) {
        alerts.push({ typ: 'naklad', uroven: dni < 0 ? 'error' : 'warning',
          ikona: '📦', titul: n.nazev,
          text: `Záloha ${n.zaloha_kc.toLocaleString('cs-CZ')} Kč nezaplacena – termín ${dni < 0 ? 'proběhl' : `za ${dni} dní`}`,
          datum: termin.datum_od, dni, href: '/naklady' })
      } else if (!n.doplatek_zaplacen) {
        alerts.push({ typ: 'naklad', uroven: dni < 0 ? 'error' : 'warning',
          ikona: '📦', titul: n.nazev,
          text: `Doplatek ${(n.celkem_kc - n.zaloha_kc).toLocaleString('cs-CZ')} Kč nezaplacen`,
          datum: termin.datum_od, dni, href: '/naklady' })
      }
    })

    return alerts.sort((a, b) => a.dni - b.dni)
  }, [ucastnici, faktury, naklady, terminy, cfg])
}
```

---

## Design systém – Tailwind config

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#0dc0df',
        'ocean-d': '#0899b5',
        'ocean-dd': '#066a80',
        bg: '#f0fbfd',
        border: '#c8eef5',
        text: '#0d2d35',
        muted: '#5a8a96',
        warm: '#ff6b35',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
}
```

---

## .env.local

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_ANTHROPIC_API_KEY=sk-ant-xxx...
```

---

## package.json (klíčové závislosti)

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "@supabase/supabase-js": "^2",
    "@tanstack/react-query": "^5",
    "zustand": "^4",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3",
    "qrcode.react": "^3",
    "react-to-print": "^2",
    "bcryptjs": "^2",
    "lucide-react": "^0.400",
    "clsx": "^2",
    "tailwind-merge": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "@types/react": "^18",
    "@types/bcryptjs": "^2"
  }
}
```

---

## Setup příkazy

```bash
npm create vite@latest surikata-app -- --template react-ts
cd surikata-app
npm install @supabase/supabase-js @tanstack/react-query zustand react-router-dom \
  react-hook-form zod @hookform/resolvers qrcode.react react-to-print \
  bcryptjs lucide-react clsx tailwind-merge
npm install -D tailwindcss autoprefixer @types/bcryptjs
npx tailwindcss init -p
npx shadcn-ui@latest init
```

---

## Plánované funkce (fáze 2)

### Webový přihlašovací formulář
- Samostatná route `/prihlasit/:terminSlug`
- Pole: termín, osoby, tričko, splátky, souhlas
- Po odeslání → vytvoří záznam v `ucastnici` + odešle potvrzovací e-mail (Supabase Edge Function + Resend)
- Real-time notifikace v appce (nový účastník)

### Párování s bankou (Fio API)
- Supabase Edge Function která volá Fio API
- CRON job každých 6h stahuje pohyby
- Párování VS → číslo faktury
- Auto-update `faktury.stav` a `splatky.zaplaceno`
- Dashboard tab "Nepárované platby"

### E-mailové notifikace
- Supabase Edge Function + Resend nebo Postmark
- Při vystavení faktury → pošle e-mail s PDF přílohou
- Připomínky splatností (CRON)

---

## Poznámky pro vývojáře

1. Začni Supabase schématem a typy – vše ostatní z nich vychází
2. Implementuj hooks pro všechny tabulky dřív než začneš psát komponenty
3. `useRealtimeSync` přidej jako první do App.tsx – obě uživatelky pak vidí změny okamžitě
4. PINy hashuj bcrypt, nikdy plaintext
5. Faktury generuj číslo server-side (Supabase function) aby nedošlo ke kolizi
6. JSONB sloupce (spolucestujici, splatky, items) – TypeScript typy jsou kritické, Supabase je vrátí jako `any`
7. Použij `react-to-print` ne html2canvas pro PDF – výsledek je čistší
8. QR kód: SPD formát `SPD*1.0*ACC:{IBAN}*AM:{castka}.00*CC:CZK*X-VS:{vs}*MSG:{cislo}`
