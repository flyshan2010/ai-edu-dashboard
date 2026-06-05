import { quickActions } from '../data'
import { Icon } from './Icons'

export function QuickAccess({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
        <span className="h-4 w-1 rounded-full bg-cyan-glow shadow-glow" />
        快速功能入口
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickActions.map((a) => (
          <div
            key={a.id}
            className="panel-hover bracket group flex flex-col rounded-xl border border-cyan-400/10 bg-white/[0.02] p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg transition group-hover:scale-110"
                style={{ background: `${a.accent}22`, color: a.accent }}
              >
                <Icon name={a.icon} width={18} height={18} />
              </span>
            </div>
            <h4 className="mb-1 text-sm font-bold text-white">{a.title}</h4>
            <p className="mb-3 flex-1 text-[11px] leading-relaxed text-slate-400">{a.desc}</p>
            <button
              onClick={() => onOpen(a.target)}
              className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:brightness-125"
              style={{ borderColor: `${a.accent}44`, color: a.accent, background: `${a.accent}11` }}
            >
              立即使用
              <Icon name="arrow" width={14} height={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
