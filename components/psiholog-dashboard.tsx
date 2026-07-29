'use client'

import { useEffect, useState } from 'react'
import { Circle, CircleDot, CheckCircle2, ClipboardList, Filter } from 'lucide-react'
import {
  STATUSI,
  STATUS_LABEL,
  formatDatum,
  sacuvajPrijave,
  ucitajPrijave,
  type Prijava,
  type Status,
} from '@/lib/prijave'

const STATUS_ICON = {
  nova: CircleDot,
  'u obradi': Circle,
  rešena: CheckCircle2,
} as const

function Detalj({ label, vrednost }: { label: string; vrednost: string }) {
  return (
    <div>
      <div className="font-sans text-[11px] tracking-wide text-subtle uppercase">{label}</div>
      <div className="font-sans text-[13.5px] leading-relaxed whitespace-pre-line text-foreground">
        {vrednost}
      </div>
    </div>
  )
}

export function PsihologDashboard({ onNazad }: { onNazad: () => void }) {
  const [prijave, setPrijave] = useState<Prijava[] | null>(null)
  const [filter, setFilter] = useState<'sve' | 'hitno' | Status>('sve')
  const [otvorena, setOtvorena] = useState<string | null>(null)

  useEffect(() => {
    const lista = ucitajPrijave()
    lista.sort((a, b) => new Date(b.vreme).getTime() - new Date(a.vreme).getTime())
    setPrijave(lista)
  }, [])

  function promeniStatus(id: string, status: Status) {
    if (!prijave) return
    const azurirano = prijave.map((p) => (p.id === id ? { ...p, status } : p))
    setPrijave(azurirano)
    try {
      sacuvajPrijave(azurirano)
    } catch {
      /* tiho, lokalni prikaz ostaje ažuran */
    }
  }

  if (prijave === null) {
    return (
      <p className="py-16 text-center font-sans text-[13.5px] text-subtle">Učitavanje prijava…</p>
    )
  }

  const filtrirane = prijave.filter((p) => {
    if (filter === 'sve') return true
    if (filter === 'hitno') return p.hitno
    return p.status === filter
  })

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-[22px] text-primary">
          <ClipboardList className="size-5" strokeWidth={1.75} />
          Prijave ({prijave.length})
        </h2>
        <button
          onClick={onNazad}
          className="font-sans text-[12.5px] text-subtle transition-colors hover:text-muted-foreground"
        >
          Odjavi se
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <Filter className="mr-1 size-3.5 text-subtle" strokeWidth={1.75} />
        {(['sve', 'hitno', ...STATUSI] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-3 py-1.5 font-sans text-[12px] transition-colors ${
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-subtle'
            }`}
          >
            {f === 'sve' ? 'Sve' : f === 'hitno' ? 'Hitno' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {filtrirane.length === 0 && (
        <p className="py-16 text-center font-sans text-[13.5px] text-subtle">
          Nema prijava u ovoj kategoriji.
        </p>
      )}

      <div className="space-y-3">
        {filtrirane.map((p) => {
          const Ikona = STATUS_ICON[p.status] ?? CircleDot
          const jeOtvorena = otvorena === p.id
          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-card/70 transition-colors ${
                p.hitno ? 'border-urgent-border' : 'border-border'
              }`}
            >
              <button
                onClick={() => setOtvorena(jeOtvorena ? null : p.id)}
                aria-expanded={jeOtvorena}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.hitno && (
                      <span className="rounded-full border border-urgent-border bg-urgent-muted px-2 py-0.5 font-sans text-[10.5px] font-semibold tracking-wide text-urgent-foreground uppercase">
                        Hitno
                      </span>
                    )}
                    <span className="truncate font-sans text-[13.5px] font-medium text-foreground">
                      {p.vrsta}
                    </span>
                  </div>
                  <div className="mt-1 font-sans text-[12px] text-subtle">
                    {p.anoniman ? 'Anonimno' : p.ime || 'Bez imena'} · {formatDatum(p.vreme)}
                  </div>
                </div>
                <Ikona className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
              </button>

              {jeOtvorena && (
                <div className="space-y-3 border-t border-border px-4 pt-3 pb-4">
                  <Detalj label="Mesto" vrednost={p.mesto} />
                  {p.razred && <Detalj label="Razred" vrednost={p.razred} />}
                  <Detalj
                    label="Ponavlja se"
                    vrednost={p.ponavljaSe ? 'Da' : 'Ne / nije naznačeno'}
                  />
                  <Detalj label="Opis" vrednost={p.opis} />
                  {p.ukljuceni && <Detalj label="Ko je uključen" vrednost={p.ukljuceni} />}
                  {p.kontakt && <Detalj label="Kontakt" vrednost={p.kontakt} />}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="mr-1 font-sans text-[12px] text-subtle">Status:</span>
                    {STATUSI.map((s) => (
                      <button
                        key={s}
                        onClick={() => promeniStatus(p.id, s)}
                        aria-pressed={p.status === s}
                        className={`rounded-full border px-2.5 py-1 font-sans text-[11.5px] transition-colors ${
                          p.status === s
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-subtle'
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
