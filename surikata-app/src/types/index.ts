export type PostTyp = 'reel' | 'carousel' | 'foto' | 'stories'
export type Pilir = 'emotivni' | 'inspirace' | 'edukace' | 'zakulisi' | 'socialproof'
export type TerminTyp = 'jaro' | 'podzim'
export type TodoStatus = 'todo' | 'inprog' | 'waiting' | 'done'
export type TodoPriority = 'high' | 'medium' | 'low'
export type TodoKategorie = 'marketing' | 'admin' | 'camp' | 'finance' | 'other'
export type FakturaStav = 'vystavena' | 'zaplacena' | 'storno'
export type Role = 'admin' | 'editor'
export type DodavatelTyp = 'Surfová škola' | 'Ubytování' | 'Doprava' | 'Jóga' | 'Stravování' | 'Pojištění' | 'Jiné' | ''
export type AlertUroven = 'error' | 'warning'

export interface Termin {
  id: string
  nazev: string
  datum_od: string
  datum_do: string
  typ: TerminTyp
  kapacita: number
  barva: string
  poznamka?: string
  created_at?: string
}

export interface Spolucestujici {
  id?: string
  jmeno: string
  prijmeni: string
  tricko: string
  surf: boolean
}

export interface Splatka {
  id?: string
  castka: number
  datum: string
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
  termin_id?: string | null
  surf: boolean
  ma_deti: boolean
  zaplaceno: boolean
  zaplaceno_castka: number
  poznamka?: string
  spolucestujici: Spolucestujici[]
  splatky: Splatka[]
  created_at?: string
}

export interface Post {
  id: string
  datum: string
  title: string
  typ: PostTyp
  pilir: Pilir
  hook?: string
  media?: string
  created_at?: string
}

export interface Napad {
  id: string
  title: string
  typ: PostTyp
  pilir: Pilir
  hook?: string
  media?: string
  created_at?: string
}

export interface Todo {
  id: string
  title: string
  desc?: string
  priority: TodoPriority
  status: TodoStatus
  due?: string
  person?: string
  kategorie: TodoKategorie
  created_at?: string
}

export interface FakturaItem {
  popis: string
  cena: number
}

export interface Faktura {
  id: string
  cislo: string
  stav: FakturaStav
  datum_vystaveni: string
  splatnost: string
  ucastnik_id?: string | null
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
  created_at?: string
}

export interface SlevovyKod {
  id: string
  kod: string
  sleva: number
  popis: string
}

export interface Naklad {
  id: string
  nazev: string
  dodavatel_id?: string | null
  dodavatel_nazev?: string
  celkem_kc: number
  zaloha_pct: number
  zaloha_kc: number
  termin_id?: string | null
  zaloha_zaplacena: boolean
  doplatek_zaplacen: boolean
  poznamka?: string
  created_at?: string
}

export interface IntPlatba {
  id: string
  nazev: string
  castka: number
  datum: string
  uzivatel: string
  poznamka?: string
  created_at?: string
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
  created_at?: string
}

export interface Uzivatel {
  id: string
  jmeno: string
  pin: string
  role: Role
  avatar: string
  barva: string
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
  href: string
}

export interface AppUser {
  id: string
  jmeno: string
  pin_hash: string
  role: Role
  avatar: string
  barva: string
  created_at?: string
}
