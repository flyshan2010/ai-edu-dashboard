import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { EngineCore } from './components/EngineCore'
import { RightRail } from './components/RightRail'
import { QuickBar } from './components/QuickBar'
import { ToastProvider } from './components/Toast'
import { AuthGate, Splash } from './components/AuthGate'
import { AppStoreProvider } from './store/AppStoreProvider'
import { useAppStore } from './store/useAppStore'
import { StudentsPage } from './pages/StudentsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ClassroomPage } from './pages/ClassroomPage'
import { ExamPage } from './pages/ExamPage'
import { EssayPage } from './pages/EssayPage'
import { CoursesPage } from './pages/CoursesPage'
import { LibraryPage } from './pages/LibraryPage'
import { ResourcePage } from './pages/ResourcePage'
import { GradesPage } from './pages/GradesPage'
import { AssistantPage } from './pages/AssistantPage'
import { SettingsPage } from './pages/SettingsPage'
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
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_330px]">
              <EngineCore onOpen={go} />
              <RightRail onOpen={go} />
            </div>
            <QuickBar onOpen={go} />
          </div>
        )
      case 'students':
        return <StudentsPage />
      case 'analytics':
        return <AnalyticsPage onManage={toStudents} />
      case 'grades':
        return <GradesPage onManage={toStudents} />
      case 'classroom':
        return <ClassroomPage onManage={toStudents} />
      case 'exam':
        return <ExamPage />
      case 'essay':
        return <EssayPage />
      case 'courses':
        return <CoursesPage />
      case 'library':
        return <LibraryPage />
      case 'resource':
        return <ResourcePage onOpenLibrary={() => setActive('library')} />
      case 'ai-assistant':
        return <AssistantPage />
      case 'settings':
        return <SettingsPage />
      default: {
        const cfg = featureConfigs[active]
        if (cfg) return <FeaturePage config={cfg} />
        return (
          <div className="grid h-full place-items-center">
            <div className="panel bracket flex flex-col items-center gap-3 rounded-2xl px-12 py-16 text-center">
              <span className="orbitron text-lg font-bold text-cyan-glow neon-text">功能開發中</span>
              <button onClick={() => setActive('dashboard')} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:brightness-110">
                返回 AI 教學引擎
              </button>
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div className="bg-grid flex h-screen w-screen flex-col overflow-hidden text-slate-200">
      <Topbar active={active} onSelect={setActive} />
      <div className="flex min-h-0 flex-1">
        <Sidebar active={active} onSelect={setActive} />
        <main className="min-w-0 flex-1 overflow-y-auto px-5 py-4">{renderPage()}</main>
      </div>
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
