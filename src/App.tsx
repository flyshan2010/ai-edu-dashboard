import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { EngineCore } from './components/EngineCore'
import { RadarPanel } from './components/RadarPanel'
import { StatsPanel } from './components/StatsPanel'
import { TrendPanel } from './components/TrendPanel'
import { QuickAccess } from './components/QuickAccess'
import { ToastProvider } from './components/Toast'
import { navItems } from './data'

function App() {
  const [active, setActive] = useState('dashboard')
  const activeLabel = navItems.find((n) => n.id === active)?.label ?? ''

  return (
    <ToastProvider>
      <div className="bg-grid flex h-screen w-screen overflow-hidden text-slate-200">
        <Sidebar active={active} onSelect={setActive} />

        <main className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {active === 'dashboard' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
                  {/* Center engine */}
                  <EngineCore />

                  {/* Right analytics column */}
                  <div className="flex flex-col gap-5">
                    <RadarPanel />
                    <StatsPanel />
                    <TrendPanel />
                  </div>
                </div>

                <QuickAccess />
              </div>
            ) : (
              <div className="grid h-full place-items-center">
                <div className="panel bracket flex flex-col items-center gap-3 rounded-2xl px-12 py-16 text-center">
                  <span className="orbitron text-lg font-bold text-cyan-glow neon-text">{activeLabel}</span>
                  <p className="max-w-sm text-sm text-slate-400">
                    此模組為展示用占位頁。回到「總覽儀表板」即可體驗完整的 3D 引擎與互動數據面板。
                  </p>
                  <button
                    onClick={() => setActive('dashboard')}
                    className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
                  >
                    返回總覽儀表板
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}

export default App
