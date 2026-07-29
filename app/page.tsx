'use client'

import { useState } from 'react'
import { TopBar, type View } from '@/components/top-bar'
import { ReportForm } from '@/components/report-form'
import { Potvrda } from '@/components/potvrda'
import { PsihologGate } from '@/components/psiholog-gate'
import { PsihologDashboard } from '@/components/psiholog-dashboard'
import type { Prijava } from '@/lib/prijave'

export default function PrijavaNasiljaPage() {
  const [view, setView] = useState<View>('report')
  const [poslednjaPrijava, setPoslednjaPrijava] = useState<Prijava | null>(null)

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <TopBar view={view} setView={setView} />

      <main className="mx-auto max-w-2xl px-5 pt-6 pb-24 sm:pt-10">
        {view === 'report' && (
          <ReportForm
            onSubmitted={(prijava) => {
              setPoslednjaPrijava(prijava)
              setView('confirm')
            }}
          />
        )}
        {view === 'confirm' && (
          <Potvrda prijava={poslednjaPrijava} onNova={() => setView('report')} />
        )}
        {view === 'gate' && (
          <PsihologGate onUspeh={() => setView('dashboard')} onNazad={() => setView('report')} />
        )}
        {view === 'dashboard' && <PsihologDashboard onNazad={() => setView('report')} />}
      </main>
    </div>
  )
}
