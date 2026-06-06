import { lazy, Suspense } from 'react'
import { engineModules, type EngineModule } from '../data'
import { Icon } from './Icons'
import { useAppStore } from '../store/useAppStore'

const Brain3D = lazy(() => import('./Brain3D').then((m) => ({ default: m.Brain3D })))

function ModuleCard({ m, onOpen }: { m: EngineModule; onOpen: (id: string) => void }) {
  const { students, classes, examQuestions, essayReviews } = useAppStore()
  const liveValue = (() => {
    switch (m.statLive) {
      case 'students': return `${students.length} 位學生`
      case 'classes': return `${classes.length} 個`
      case 'examQuestions': return `${examQuestions.length.toLocaleString('en-US')} 題`
      case 'essayReviews': return `${essayReviews.length.toLocaleString('en-US')} 篇`
      default: return m.statValue
    }
  })()

  return (
    <div className="panel panel-hover bracket flex flex-col rounded-2xl p-3.5" style={{ boxShadow: `inset 0 0 0 1px ${m.accent}22` }}>
      <button onClick={() => onOpen(m.id)} className="mb-2 flex w-full items-center gap-2 text-left">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl" style={{ background: `${m.accent}22`, color: m.accent }}>
          <Icon name={m.icon} width={19} height={19} />
        </span>
        <span className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold text-white">{m.title}</h4>
          {m.badge && <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${m.accent}22`, color: m.accent }}>{m.badge}</span>}
        </span>
      </button>

      <div className="space-y-1">
        {m.items.map((it) => (
          <button
            key={it.label}
            onClick={() => onOpen(it.target)}
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-slate-300 transition hover:bg-white/5"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 transition group-hover:scale-110" style={{ color: m.accent }}>
              <Icon name={it.icon} width={13} height={13} />
            </span>
            <span className="flex-1 group-hover:text-white">{it.label}</span>
            <Icon name="arrow" width={12} height={12} className="text-slate-600 group-hover:text-cyan-glow" />
          </button>
        ))}
      </div>

      <div className="mt-2.5 border-t border-cyan-400/10 pt-2 text-[11px] text-slate-400">
        {m.statLabel} <span className="font-bold" style={{ color: m.accent }}>{liveValue}</span>
      </div>
    </div>
  )
}

export function EngineCore({ onOpen }: { onOpen: (id: string) => void }) {
  const byCorner = (c: EngineModule['corner']) => engineModules.find((m) => m.corner === c)!

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        <ModuleCard m={byCorner('tl')} onOpen={onOpen} />
        <ModuleCard m={byCorner('bl')} onOpen={onOpen} />
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">
        <div className="mb-1 text-center">
          <h3 className="orbitron text-2xl font-extrabold text-white neon-text">AI 教學引擎</h3>
          <p className="mt-1 text-xs text-slate-400">智慧連接 · 精準教學 · 成就每一個學生</p>
        </div>
        <div className="relative aspect-square w-full max-w-[300px]">
          <div className="pointer-events-none absolute inset-x-6 bottom-2 h-14 rounded-[50%] bg-cyan-400/25 blur-2xl" />
          <Suspense fallback={<div className="grid h-full w-full place-items-center"><div className="h-14 w-14 animate-spinSlow rounded-full border-2 border-cyan-400/30 border-t-cyan-glow" /></div>}>
            <Brain3D />
          </Suspense>
        </div>
        <span className="orbitron -mt-2 text-[11px] tracking-widest text-cyan-glow/70">EducationOS AI Engine v3.3</span>
        <div className="mt-3 w-full max-w-[320px]">
          <ModuleCard m={byCorner('bc')} onOpen={onOpen} />
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <ModuleCard m={byCorner('tr')} onOpen={onOpen} />
        <ModuleCard m={byCorner('br')} onOpen={onOpen} />
      </div>
    </section>
  )
}
