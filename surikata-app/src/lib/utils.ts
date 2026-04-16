import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('cs-CZ') + ' Kč'
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })
  } catch {
    return dateStr
  }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function weekNumber(year: number, month: number, day: number): number {
  const dt = new Date(Date.UTC(year, month, day))
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7))
  const jan1 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  return Math.ceil((((dt.getTime() - jan1.getTime()) / 86400000) + 1) / 7)
}

export function generateFakturaNumber(existing: string[]): string {
  const year = new Date().getFullYear()
  const prefix = `FAK-${year}-`
  const nums = existing
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, '')) || 0)
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

export function genId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7)
}
