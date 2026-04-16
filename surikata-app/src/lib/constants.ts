export const MONTHS = [
  'Leden','Únor','Březen','Duben','Květen','Červen',
  'Červenec','Srpen','Září','Říjen','Listopad','Prosinec'
]

export const DAYS_SHORT = ['Po','Út','St','Čt','Pá','So','Ne']

export const TYPE_ICON: Record<string, string> = {
  reel: '🎬', carousel: '🖼', foto: '📷', stories: '📲'
}
export const TYPE_LABEL: Record<string, string> = {
  reel: 'Reel', carousel: 'Carousel', foto: 'Foto', stories: 'Stories'
}
export const PILLAR_ICON: Record<string, string> = {
  emotivni: '❤️', inspirace: '🌊', edukace: '📚', zakulisi: '🎭', socialproof: '⭐'
}
export const PILLAR_LABEL: Record<string, string> = {
  emotivni: 'Emotivní', inspirace: 'Inspirace', edukace: 'Edukace',
  zakulisi: 'Zákulisí', socialproof: 'Social proof'
}
export const PRIORITY_LABEL: Record<string, string> = {
  high: '🔴 Vysoká', medium: '🟡 Střední', low: '🟢 Nízká'
}
export const STATUS_LABEL: Record<string, string> = {
  todo: '📋 K udělání', inprog: '🔄 Probíhá', waiting: '⏳ Čeká', done: '✅ Hotovo'
}
export const CAT_LABEL: Record<string, string> = {
  marketing: '📱 Marketing', admin: '📋 Administrativa',
  camp: '🏄 Camp', finance: '💰 Finance', other: '📌 Ostatní'
}
export const PERSON_LABEL: Record<string, string> = {
  ja: 'Já', kamaradka: 'Kamarádka', oba: 'Obě', '': ' — '
}

export const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  calendar: 'Obsahový plán',
  napady: 'Banka nápadů',
  todo: 'To-do list',
  terminy: 'Termíny kempů',
  ucastnici: 'Účastníci',
  fakturace: 'Fakturace',
  platby: 'Interní platby',
  naklady: 'Náklady & Dodavatelé',
  dodavatele: 'Dodavatelé',
  nastaveni: 'Nastavení',
  ai: 'AI Asistent',
}

export const DEFAULT_IDEAS = [
  { id: '1', typ: 'reel' as const, pilir: 'emotivni' as const, title: 'Přestaň si říkat někdy', hook: 'Náš svět se pořád zrychluje. Připadáme si jak v krysím kole. Je čas říct: dost. Teď – ne někdy.', media: '' },
  { id: '2', typ: 'reel' as const, pilir: 'emotivni' as const, title: 'Nevrátíš se jako nový člověk', hook: 'Nevrátíš se jako nový člověk. Ale vrátíš se s dobitýma baterkami. Nebudeš mít chuť křičet na děti, partnera, kolegy. A to sakra není málo.', media: '' },
  { id: '3', typ: 'reel' as const, pilir: 'emotivni' as const, title: 'Přehlcená checklist', hook: 'Odpovídáš na maily ve sprše? Škrtáš věci z kalendáře? Zapomínáš co jsi chtěla říct uprostřed věty?', media: '' },
  { id: '4', typ: 'reel' as const, pilir: 'emotivni' as const, title: 'Oceán tě vrátí zpátky', hook: 'O všechno se postaráme. Dobij baterky, vypni. Šumění vody pomáhá. Slibujem.', media: '' },
  { id: '5', typ: 'carousel' as const, pilir: 'emotivni' as const, title: 'Co dostaneš vs. co necháš za sebou', hook: 'Dostaneš: týden u moře. Necháš: maily co počkají. Dostaneš: ranní jógu. Necháš: budík v 6:00.', media: '' },
  { id: '6', typ: 'reel' as const, pilir: 'inspirace' as const, title: 'Den 1 vs. Den 7 – stejná pláž, jiná hlava', hook: 'Den 1: Kde tady je to Instagram místo? Den 7: Dobré ráno, pláži.', media: '' },
  { id: '7', typ: 'reel' as const, pilir: 'inspirace' as const, title: 'Pojed na surfy, říkali...', hook: 'Budeš vypadat cool, říkali. Záběry z první lekce: pád, smích, pád, smích – a pak... JE TO!', media: '' },
  { id: '8', typ: 'reel' as const, pilir: 'inspirace' as const, title: 'Míň scrollování, víc surfování', hook: 'Split screen: scrolluješ notifikace vs. záběry vln, smíchu, západ slunce, Aperol na pláži.', media: '' },
  { id: '9', typ: 'carousel' as const, pilir: 'edukace' as const, title: '5 způsobů odpočinku bez výkonu', hook: '1. Ležet na písku bez meditační appky 2. Dívat se na vlny bez focení 3. Spát, když tě to bere', media: '' },
  { id: '10', typ: 'carousel' as const, pilir: 'edukace' as const, title: 'Proč Baleal? 5 důvodů', hook: 'Méně turistů. Ideální vlny pro začátečníky. Česky mluvící instruktoři. Jeden dům = jedna komunita.', media: '' },
  { id: '11', typ: 'stories' as const, pilir: 'zakulisi' as const, title: 'Jsi tým Aperol nebo tým káva?', hook: 'Jednoduchá anketa. Skvělý engagement.', media: '' },
  { id: '12', typ: 'reel' as const, pilir: 'zakulisi' as const, title: 'Jak vznikla Surikata', hook: 'Osobní příběh – bez klišé, s chybami, s pochybnostmi.', media: '' },
  { id: '13', typ: 'reel' as const, pilir: 'socialproof' as const, title: 'Testimonial z pláže', hook: 'Účastnice mluví do kamery přímo z pláže – neskriptované. Bála jsem se, že... a pak se stalo...', media: '' },
  { id: '14', typ: 'stories' as const, pilir: 'socialproof' as const, title: 'Zbývají 2 místa – urgency', hook: 'Soft, ne agresivní. Ještě 3 místa. Pokud uvažuješ, teď je čas.', media: '' },
]
