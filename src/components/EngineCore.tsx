import { lazy, Suspense } from 'react'
import { engineModules, type EngineModule } from '../data'
import { Icon } from './Icons'

const Brain3D = lazy(() =>
  import('./Brain3D').then((m) => ({ default: m.Brain3D })),
)

function EngineCard({
  m,
  align,
  onOpen,
}: {
  m: EngineModule
  align: 'left' | 'right'
  onOpen: (id: string) => void
}) {
  return (
    <button
      onClick={() => onOpen(m.id)}
      className="panel panel-hover bracket group flex w-full flex-col gap-3 rounded-2xl p-4 text-left"
      style={{ boxShadow: `inset 0 0 0 1px ${m.accent}22` }}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <span
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl"
          style={{ background: `${m.accent}22`, color: m.accent }}
        >
          <Icon name={m.icon} width={20} height={20} />
        </span>
        <div className={align === 'right' ? 'text-right' : ''}>
          <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
            <h4 className="text-sm font-bold text-white">{m.title}</h4>
            {m.badge && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                style={{ background: `${m.accent}22`, color: m.accent }}
              >
                {m.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">{m.desc}</p>
        </div>
      </div>
      <span
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition group-hover:brightness-125 ${
          align === 'right' ? 'self-end' : 'self-start'
        }`}
        style={{ borderColor: `${m.accent}55`, color: m.accent, background: `${m.accent}11` }}
      >
        {m.cta}
        <Icon name="arrow" width={14} height={14} />
      </span>
    </button>
  )
}

export function EngineCore({ onOpen }: { onOpen: (id: string) => void }) {
  const left = engineModules.filter((m) => ['resource', 'analytics'].includes(m.id))
  const right = engineModules.filter((m) => ['exam', 'essay'].includes(m.id))

  return (
    <section className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_minmax(280px,1.1fr)_1fr]">
      {/* Left cards */}
      <div className="flex flex-col gap-4">
        {left.map((m) => (
          <EngineCard key={m.id} m={m} align="left" onOpen={onOpen} />
        ))}
      </div>

      {/* Center: title + 3D */}
      <div className="flex flex-col items-center">
        <div className="mb-1 text-center">
          <h3 className="orbitron text-2xl font-extrabold text-white neon-text">AI 教學引擎</h3>
          <span className="mt-1 inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-glow">
            v4.5
          </span>
          <p className="mt-1 text-xs text-slate-400">智慧驅動教學創新</p>
        </div>

        <div className="relative aspect-square w-full max-w-[340px]">
          <div className="pointer-events-none absolute inset-x-8 bottom-4 h-16 rounded-[50%] bg-cyan-400/20 blur-2xl" />
          <Suspense
            fallback={
              <div className="grid h-full w-full place-items-center">
                <div className="h-16 w-16 animate-spinSlow rounded-full border-2 border-cyan-400/30 border-t-cyan-glow" />
              </div>
            }
          >
            <Brain3D />
          </Suspense>
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-cyan-400/10" />
        </div>
      </div>

      {/* Right cards */}
      <div className="flex flex-col gap-4">
        {right.map((m) => (
          <EngineCard key={m.id} m={m} align="right" onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
