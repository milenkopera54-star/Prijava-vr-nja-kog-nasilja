'use client'

import { useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Clock3,
  MapPin,
  MessageCircleHeart,
  Send,
  ShieldCheck,
  UserRound,
  UserRoundX,
} from 'lucide-react'
import {
  MESTA,
  VRSTE,
  noviId,
  posaljiMejl,
  sacuvajPrijave,
  ucitajPrijave,
  type Prijava,
} from '@/lib/prijave'

export const ulazKlasa =
  'w-full font-sans text-[14px] text-foreground bg-card border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-shadow placeholder:text-subtle'

export function Polje({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-sans text-[13px] font-medium text-primary">{label}</span>
      {children}
    </label>
  )
}

export function ReportForm({ onSubmitted }: { onSubmitted: (prijava: Prijava) => void }) {
  const [anoniman, setAnoniman] = useState(true)
  const [ime, setIme] = useState('')
  const [razred, setRazred] = useState('')
  const [vrsta, setVrsta] = useState<string>(VRSTE[0])
  const [mesto, setMesto] = useState<string>(MESTA[0])
  const [ponavljaSe, setPonavljaSe] = useState(false)
  const [opis, setOpis] = useState('')
  const [ukljuceni, setUkljuceni] = useState('')
  const [hitno, setHitno] = useState(false)
  const [kontakt, setKontakt] = useState('')
  const [greska, setGreska] = useState('')
  const [saljem, setSaljem] = useState(false)

  async function posalji(e: React.FormEvent) {
    e.preventDefault()
    if (opis.trim().length < 10) {
      setGreska('Napiši nekoliko rečenica o tome šta se dešava — to psihologu najviše pomaže.')
      return
    }
    setGreska('')
    setSaljem(true)

    const prijava: Prijava = {
      id: noviId(),
      vreme: new Date().toISOString(),
      anoniman,
      ime: anoniman ? '' : ime.trim(),
      razred: razred.trim(),
      vrsta,
      mesto,
      ponavljaSe,
      opis: opis.trim(),
      ukljuceni: ukljuceni.trim(),
      hitno,
      kontakt: kontakt.trim(),
      status: 'nova',
    }

    try {
      const postojece = ucitajPrijave()
      postojece.push(prijava)
      sacuvajPrijave(postojece)
      try {
        await posaljiMejl(prijava)
      } catch {
        /* mejl nije stigao, ali prijava je sačuvana i vidljiva u pregledu za psihologa */
      }
      onSubmitted(prijava)
    } catch {
      setGreska('Prijava nije mogla da se pošalje. Pokušaj ponovo za trenutak.')
    } finally {
      setSaljem(false)
    }
  }

  return (
    <form onSubmit={posalji} className="space-y-8">
      <div>
        <h1 className="font-serif text-[28px] leading-tight text-primary text-balance sm:text-[32px]">
          Ako ti neko otežava dane u školi,
          <br /> ovde to možeš da kažeš.
        </h1>
        <p className="mt-2.5 font-sans text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          Ovu poruku vidi samo školski psiholog. Nema pogrešnog trenutka da je pošalješ.
        </p>
      </div>

      <div>
        <p className="mb-2.5 font-sans text-[13px] font-medium text-primary">
          Kako želiš da pošalješ prijavu?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAnoniman(true)}
            aria-pressed={anoniman}
            className={`rounded-2xl border p-4 text-left transition-all ${
              anoniman
                ? 'border-primary bg-secondary shadow-sm'
                : 'border-border bg-card/60 hover:border-subtle'
            }`}
          >
            <UserRoundX
              className={`mb-2 size-5 ${anoniman ? 'text-primary' : 'text-subtle'}`}
              strokeWidth={1.75}
            />
            <div className="font-sans text-[14px] font-semibold text-primary">Anonimno</div>
            <div className="mt-0.5 font-sans text-[12px] text-muted-foreground">Ne ostavljaš ime</div>
          </button>
          <button
            type="button"
            onClick={() => setAnoniman(false)}
            aria-pressed={!anoniman}
            className={`rounded-2xl border p-4 text-left transition-all ${
              !anoniman
                ? 'border-primary bg-secondary shadow-sm'
                : 'border-border bg-card/60 hover:border-subtle'
            }`}
          >
            <UserRound
              className={`mb-2 size-5 ${!anoniman ? 'text-primary' : 'text-subtle'}`}
              strokeWidth={1.75}
            />
            <div className="font-sans text-[14px] font-semibold text-primary">Sa mojim imenom</div>
            <div className="mt-0.5 font-sans text-[12px] text-muted-foreground">Psiholog zna ko si</div>
          </button>
        </div>
      </div>

      {!anoniman && (
        <Polje label="Ime i prezime">
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="Kako da te oslovljavamo"
            className={ulazKlasa}
          />
        </Polje>
      )}

      <Polje label="Razred i odeljenje (opciono)">
        <input
          value={razred}
          onChange={(e) => setRazred(e.target.value)}
          placeholder="npr. 7-2"
          className={ulazKlasa}
        />
      </Polje>

      <div className="grid gap-5 sm:grid-cols-2">
        <Polje label="O kakvom nasilju je reč">
          <select value={vrsta} onChange={(e) => setVrsta(e.target.value)} className={ulazKlasa}>
            {VRSTE.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Polje>
        <Polje
          label={
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" strokeWidth={1.75} />
              Gde se dešava
            </span>
          }
        >
          <select value={mesto} onChange={(e) => setMesto(e.target.value)} className={ulazKlasa}>
            {MESTA.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Polje>
      </div>

      <Polje label="Šta se dešava — opiši svojim rečima">
        <textarea
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          rows={5}
          placeholder="Piši koliko god ti prija — datumi, situacije, kako se osećaš. Sve pomaže."
          className={ulazKlasa + ' resize-none leading-relaxed'}
        />
      </Polje>

      <Polje label="Ko je uključen (opciono, ako želiš da podeliš)">
        <textarea
          value={ukljuceni}
          onChange={(e) => setUkljuceni(e.target.value)}
          rows={2}
          placeholder="Imena ili opis — nije obavezno"
          className={ulazKlasa + ' resize-none leading-relaxed'}
        />
      </Polje>

      <label className="flex cursor-pointer items-center gap-2.5 select-none">
        <input
          type="checkbox"
          checked={ponavljaSe}
          onChange={(e) => setPonavljaSe(e.target.checked)}
          className="size-4 accent-primary"
        />
        <span className="flex items-center gap-1.5 font-sans text-[13.5px] text-primary">
          <Clock3 className="size-3.5" strokeWidth={1.75} />
          Ovo se dešava više puta, ne prvi put
        </span>
      </label>

      <div
        className={`rounded-2xl border p-4 transition-colors ${
          hitno ? 'border-urgent-border bg-urgent-muted' : 'border-border bg-card/60'
        }`}
      >
        <label className="flex cursor-pointer items-start gap-2.5 select-none">
          <input
            type="checkbox"
            checked={hitno}
            onChange={(e) => setHitno(e.target.checked)}
            className="mt-0.5 size-4 accent-urgent"
          />
          <span>
            <span className="flex items-center gap-1.5 font-sans text-[13.5px] font-semibold text-urgent-foreground">
              <AlertTriangle className="size-3.5" strokeWidth={1.75} />
              Hitno je — potrebna mi je pomoć što pre
            </span>
            <span className="mt-1 block font-sans text-[12.5px] leading-relaxed text-urgent-foreground">
              Ovo obeleži ako se osećaš nebezbedno sada. Psiholog dobija hitne prijave odmah.
            </span>
          </span>
        </label>
      </div>

      <Polje
        label={
          <span className="flex items-center gap-1.5">
            <MessageCircleHeart className="size-3.5" strokeWidth={1.75} />
            Kako da ti odgovorimo (opciono)
          </span>
        }
      >
        <input
          value={kontakt}
          onChange={(e) => setKontakt(e.target.value)}
          placeholder="Mejl, broj telefona, ili gde te psiholog može pronaći"
          className={ulazKlasa}
        />
      </Polje>

      {greska && (
        <p
          role="alert"
          className="rounded-xl border border-urgent-border bg-urgent-muted px-3.5 py-2.5 font-sans text-[13px] text-destructive"
        >
          {greska}
        </p>
      )}

      <button
        type="submit"
        disabled={saljem}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-sans text-[14.5px] font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
      >
        <Send className="size-4" strokeWidth={1.75} />
        {saljem ? 'Šaljem…' : 'Pošalji prijavu psihologu'}
      </button>

      <p className="flex items-center justify-center gap-1.5 font-sans text-[12px] text-subtle">
        <ShieldCheck className="size-3.5" strokeWidth={1.75} />
        Prijavu čita samo školski psiholog
      </p>
    </form>
  )
}
