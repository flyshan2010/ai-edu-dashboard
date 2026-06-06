import { navItems } from '../data'
import { Icon } from './Icons'
import { SystemStatus } from './SystemStatus'
import { Clock } from './Clock'

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-full w-[228px] flex-shrink-0 flex-col border-r border-cyan-400/10 bg-ink-900/60 backdrop-blur-xl">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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

      <div className="space-y-3 px-3 pb-3">
        <SystemStatus />
        <Clock />
      </div>
    </aside>
  )
}
