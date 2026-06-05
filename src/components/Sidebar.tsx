import { navItems } from '../data'
import { Icon } from './Icons'
import { useToast } from './toast-context'

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  const toast = useToast()

  return (
    <aside className="flex h-full w-[260px] flex-shrink-0 flex-col border-r border-cyan-400/10 bg-ink-900/60 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet shadow-glow">
          <span className="orbitron text-lg font-extrabold text-white">A</span>
          <span className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/40 animate-pulseGlow" />
        </div>
        <div className="leading-tight">
          <h1 className="text-[15px] font-bold text-white">未來學院 AI 教育平台</h1>
          <p className="orbitron text-[10px] tracking-widest text-cyan-glow/70">AI EDUCATION PLATFORM</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-neon-blue/30 to-transparent text-white shadow-glow-soft'
                  : 'text-slate-400 hover:bg-white/5 hover:text-cyan-100'
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  isActive ? 'bg-cyan-400/20 text-cyan-glow' : 'text-slate-400 group-hover:text-cyan-glow'
                }`}
              >
                <Icon name={item.icon} width={18} height={18} />
              </span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow shadow-glow" />}
            </button>
          )
        })}
      </nav>

      {/* Upgrade card */}
      <div className="px-3 pb-2">
        <div className="panel bracket overflow-hidden rounded-2xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="diamond" width={18} height={18} className="text-neon-violet" />
            <span className="text-sm font-bold text-white">升級到專業版</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-slate-400">
            解鎖更多 AI 功能與無限資源
          </p>
          <button
            onClick={() => toast('已開啟專業版升級流程')}
            className="w-full rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2 text-xs font-bold text-white shadow-glow transition hover:brightness-110"
          >
            立即升級
          </button>
        </div>
      </div>

      {/* Teacher profile */}
      <button
        onClick={() => onSelect('teacher')}
        className="m-3 flex items-center gap-3 rounded-xl border border-cyan-400/10 bg-white/[0.02] px-3 py-3 text-left transition hover:border-cyan-400/30"
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue text-sm font-bold text-ink-900">
          王
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">王小明 老師</p>
          <p className="text-[11px] text-slate-400">學校管理員</p>
        </div>
      </button>
    </aside>
  )
}
