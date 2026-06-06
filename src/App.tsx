import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { EngineCore } from './components/EngineCore'
import { RadarPanel } from './components/RadarPanel'
import { StatsPanel } from './components/StatsPanel'
import { TrendPanel } from './components/TrendPanel'
import { QuickAccess } from './components/QuickAccess'
import { ToastProvider } from './components/Toast'
import { AuthGate, Splash } from './components/AuthGate'
import { AppStoreProvider } from './store/AppStoreProvider'
import { useAppStore } from './store/useAppStore'
import { StudentsPage } from './pages/StudentsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ClassroomPage } from './pages/ClassroomPage'
import { FeaturePage } from './pages/FeaturePage'
import { featureConfigs } from './pages/featureConfigs'

function Shell() {
  const { cloudStatus } = useAppStore()
  const [active, setActive] = useState('dashboard')
  const go = (id: string) => setActive(id)
  const toStudents = () => setActive('students')

  if (cloudStatus === 'connecting') return <Splash />
  if (cloudStatus === 'auth') return <AuthGate />

  function renderPage() {
    switch (active) {
      case 'dashboard':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
              <EngineCore onOpen={go} />
              <div className="flex flex-col gap-5">
                <RadarPanel onManage={toStudents} />
                <StatsPanel onManage={toStudents} />
                <TrendPanel />
              </div>
            </div>
            <QuickAccess onOpen={go} />
          </div>
        )
      case 'students':
        return <StudentsPage />
      case 'analytics':
        return <AnalyticsPage onManage={toStudents} />
      case 'classroom':
        return <ClassroomPage onManage={toStudents} />
      default: {
        const cfg = featureConfigs[active]
        if (cfg) return <FeaturePage config={cfg} />
        return (
          <div className="grid h-full place-items-center">
            <div className="panel bracket flex flex-col items-center gap-3 rounded-2xl px-12 py-16 text-center">
              <span className="orbitron text-lg font-bold text-cyan-glow neon-text">功能開發中</span>
              <button
                onClick={() => setActive('dashboard')}
                className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
              >
                返回總覽儀表板
              </button>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div className="bg-grid flex h-screen w-screen overflow-hidden text-slate-200">
      <Sidebar active={active} onSelect={setActive} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-6 pb-6">{renderPage()}</div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AppStoreProvider>
  )
}

export default App
