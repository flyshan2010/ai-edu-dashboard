import { quickActions } from '../data'
import { Icon } from './Icons'

export function QuickBar({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="panel flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3">
      <span className="mr-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <span className="h-3 w-1 rounded-full bg-cyan-glow shadow-glow" />快速操作
      </span>
      {quickActions.map((a) => (
        <button
          key={a.id}
          onClick={() => onOpen(a.target)}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:brightness-125"
          style={{ borderColor: `${a.accent}44`, color: a.accent, background: `${a.accent}11` }}
        >
          <Icon name={a.icon} width={15} height={15} />
          {a.label}
        </button>
      ))}
    </div>
  )
}
