export const VRSTE = [
  'Fizičko nasilje',
  'Verbalno nasilje / vređanje',
  'Isključivanje ili ignorisanje',
  'Onlajn / sajber nasilje',
  'Ucena ili pretnja',
  'Nešto drugo',
] as const

export const MESTA = [
  'Učionica',
  'Hodnik ili stepenište',
  'Školsko dvorište',
  'Onlajn (društvene mreže, poruke)',
  'Van škole',
  'Nešto drugo',
] as const

export const PIN = '1985'
export const STORAGE_KEY = 'vrsnjacko-nasilje-prijave'

export type Status = 'nova' | 'u obradi' | 'rešena'

export const STATUSI: Status[] = ['nova', 'u obradi', 'rešena']

export const STATUS_LABEL: Record<Status, string> = {
  nova: 'Nova',
  'u obradi': 'U obradi',
  rešena: 'Rešena',
}

export type Prijava = {
  id: string
  vreme: string
  anoniman: boolean
  ime: string
  razred: string
  vrsta: string
  mesto: string
  ponavljaSe: boolean
  opis: string
  ukljuceni: string
  hitno: boolean
  kontakt: string
  status: Status
}

export const EMAILJS = {
  serviceId: 'TVOJ_SERVICE_ID',
  templateId: 'TVOJ_TEMPLATE_ID',
  publicKey: 'TVOJ_PUBLIC_KEY',
  psihologEmail: 'psiholog@skola.rs',
}

export async function posaljiMejl(prijava: Prijava) {
  if (EMAILJS.serviceId === 'TVOJ_SERVICE_ID') return
  await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.publicKey,
      template_params: {
        to_email: EMAILJS.psihologEmail,
        hitno: prijava.hitno ? 'DA — HITNO' : 'Ne',
        podnosilac: prijava.anoniman ? 'Anonimno' : prijava.ime || 'Bez imena',
        razred: prijava.razred || '—',
        vrsta: prijava.vrsta,
        mesto: prijava.mesto,
        ponavlja_se: prijava.ponavljaSe ? 'Da' : 'Ne',
        opis: prijava.opis,
        ukljuceni: prijava.ukljuceni || '—',
        kontakt: prijava.kontakt || '—',
        vreme: formatDatum(prijava.vreme),
      },
    }),
  })
}

export function noviId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function formatDatum(iso: string) {
  try {
    const d = new Date(iso)
    return (
      d.toLocaleDateString('sr-Latn-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString('sr-Latn-RS', { hour: '2-digit', minute: '2-digit' })
    )
  } catch {
    return iso
  }
}

export function ucitajPrijave(): Prijava[] {
  if (typeof window === 'undefined') return []
  try {
    const sirovo = window.localStorage.getItem(STORAGE_KEY)
    if (!sirovo) return []
    const lista = JSON.parse(sirovo)
    return Array.isArray(lista) ? (lista as Prijava[]) : []
  } catch {
    return []
  }
}

export function sacuvajPrijave(lista: Prijava[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
}
