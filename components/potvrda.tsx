'use client'

import { PhoneCall } from 'lucide-react'
import type { Prijava } from '@/lib/prijave'

function DisajuciKrug({ tone = 'calm' }: { tone?: 'calm' | 'urgent' }) {
  const boja = tone === 'urgent' ? 'var(--urgent)' : '#7fa99b'
  return (
    <div className="relative mx-auto size-16" aria-hidden="true">
      <div
        className="animate-breathe absolute inset-0 rounded-full opacity-30"
        style={{ backgroundColor: boja }}
      />
      <div
        className="animate-breathe-inner absolute inset-2 rounded-full opacity-60"
        style={{ backgroundColor: boja }}
      />
      <div className="absolute inset-5 rounded-full" style={{ backgroundColor: boja }} />
    </div>
  )
}

export function Potvrda({ prijava, onNova }: { prijava: Prijava | null; onNova: () => void }) {
  if (!prijava) return null

  return (
    <div className="py-10 text-center">
      <DisajuciKrug tone={prijava.hitno ? 'urgent' : 'calm'} />
      <h2 className="mt-8 font-serif text-[24px] text-primary">Prijava je bezbedno stigla</h2>
      <p className="mx-auto mt-3 max-w-md font-sans text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
        {prijava.anoniman
          ? 'Poslata je anonimno. Psiholog će je pročitati i razmisliti o sledećem koraku.'
          : 'Psiholog zna da je poruka od tebe i javiće se čim bude mogao.'}
      </p>

      {prijava.hitno && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-urgent-border bg-urgent-muted p-4 text-left">
          <p className="flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-urgent-foreground">
            <PhoneCall className="size-4" strokeWidth={1.75} />
            Ako se sada osećaš nebezbedno
          </p>
          <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-urgent-foreground">
            Javi se odmah nastavniku, dežurnom ili nekom odraslom u koga imaš poverenja. Dečji telefon
            116 111 je besplatan i dostupan, i tu je za razgovor u svakom trenutku.
          </p>
        </div>
      )}

      <button
        onClick={onNova}
        className="mt-8 rounded-xl border border-border px-5 py-2.5 font-sans text-[13.5px] text-primary transition-colors hover:border-primary"
      >
        Pošalji još jednu prijavu
      </button>
    </div>
  )
}
