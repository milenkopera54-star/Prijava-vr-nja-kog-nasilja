'use client'

import { ArrowLeft, DoorOpen, KeyRound } from 'lucide-react'

export type View = 'report' | 'confirm' | 'gate' | 'dashboard'

export function TopBar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const naPrijavi = view === 'report' || view === 'confirm'

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <DoorOpen className="size-5 text-primary" strokeWidth={1.75} />
          <span className="font-serif text-[17px] tracking-tight text-primary">Vrata su otvorena</span>
        </div>

        {naPrijavi ? (
          <button
            onClick={() => setView('gate')}
            className="flex items-center gap-1.5 font-sans text-[13px] text-muted-foreground transition-colors hover:text-primary"
          >
            <KeyRound className="size-3.5" strokeWidth={1.75} />
            Za psihologa
          </button>
        ) : (
          <button
            onClick={() => setView('report')}
            className="flex items-center gap-1.5 font-sans text-[13px] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.75} />
            Nazad na prijavu
          </button>
        )}
      </div>
    </header>
  )
}
