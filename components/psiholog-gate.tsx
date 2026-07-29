'use client'

import { useEffect, useRef, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { PIN } from '@/lib/prijave'
import { ulazKlasa } from '@/components/report-form'

export function PsihologGate({ onUspeh, onNazad }: { onUspeh: () => void; onNazad: () => void }) {
  const [pin, setPin] = useState('')
  const [greska, setGreska] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function proveri(e: React.FormEvent) {
    e.preventDefault()
    if (pin === PIN) {
      onUspeh()
    } else {
      setGreska('Pogrešan PIN.')
    }
  }

  return (
    <div className="mx-auto max-w-xs py-16 text-center">
      <KeyRound className="mx-auto size-6 text-primary" strokeWidth={1.75} />
      <h2 className="mt-4 font-serif text-[21px] text-primary">Pristup za psihologa</h2>
      <p className="mt-1.5 font-sans text-[13px] text-muted-foreground">Unesi PIN za pregled prijava</p>

      <form onSubmit={proveri} className="mt-6">
        <label htmlFor="pin" className="sr-only">
          PIN
        </label>
        <input
          id="pin"
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className={ulazKlasa + ' text-center tracking-[0.3em]'}
          placeholder="••••"
        />
        {greska && (
          <p role="alert" className="mt-2 font-sans text-[12.5px] text-destructive">
            {greska}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-primary py-2.5 font-sans text-[13.5px] font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Uđi
        </button>
      </form>

      <button
        onClick={onNazad}
        className="mt-5 font-sans text-[12.5px] text-subtle transition-colors hover:text-muted-foreground"
      >
        Nazad
      </button>
    </div>
  )
}
