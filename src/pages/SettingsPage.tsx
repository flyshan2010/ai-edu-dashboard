import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

export function SettingsPage() {
  const toast = useToast()
  const { cloudStatus, user, teacher, classes, students, examQuestions, essayReviews, courses, resources, resetDemo, signOutUser } = useAppStore()

  const modeText = { connecting: '連線中', auth: '待登入', cloud: '雲端同步（Firebase Firestore）', local: '本機模式（localStorage）' }[cloudStatus]

  const counts = [
    { label: '班級', n: classes.length }, { label: '學生', n: students.length },
    { label: '題庫', n: examQuestions.length }, { label: '批改記錄', n: essayReviews.length },
    { label: '課程', n: courses.length }, { label: '資源', n: resources.length },
  ]

  function clearLocal() {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('aiedu.')).forEach((k) => localStorage.removeItem(k))
      toast('已清除本機資料，即將重新整理…')
      setTimeout(() => location.reload(), 800)
    } catch { toast('清除失敗') }
  }

  const card = 'panel bracket rounded-2xl p-5'
  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-400/20 text-slate-300"><Icon name="gear" width={28} height={28} /></span>
        <div><h2 className="text-xl font-bold text-white">系統管理</h2><p className="text-sm text-slate-400">資料模式、語言與資料管理</p></div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={card}>
          <h3 className="mb-3 text-sm font-bold text-white">帳號與模式</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">教師</dt><dd className="text-white">{teacher.name}・{teacher.title}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">學校</dt><dd className="text-white">{teacher.school || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">帳號</dt><dd className="text-white">{user?.email ?? '未登入'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">資料模式</dt><dd className="text-cyan-glow">{modeText}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">輸出語言</dt><dd className="text-white">繁體中文（zh-TW）</dd></div>
          </dl>
          {cloudStatus === 'cloud' && (
            <button onClick={() => void signOutUser()} className="mt-4 w-full rounded-lg border border-neon-pink/40 py-2 text-xs font-semibold text-neon-pink transition hover:bg-neon-pink/10">登出</button>
          )}
        </div>

        <div className={card}>
          <h3 className="mb-3 text-sm font-bold text-white">資料統計</h3>
          <div className="grid grid-cols-3 gap-3">
            {counts.map((c) => (
              <div key={c.label} className="rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3 text-center">
                <p className="orbitron text-xl font-extrabold text-white">{c.n}</p>
                <p className="text-[11px] text-slate-400">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} lg:col-span-2`}>
          <h3 className="mb-1 text-sm font-bold text-white">資料管理</h3>
          <p className="mb-3 text-xs text-slate-400">注意：以下操作會變更資料，請謹慎使用。</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { resetDemo(); toast('已重置為示範資料') }} className="rounded-lg border border-cyan-400/20 px-4 py-2 text-xs text-cyan-glow transition hover:bg-cyan-400/10">重置示範資料（班級／學生）</button>
            <button onClick={clearLocal} className="rounded-lg border border-neon-pink/40 px-4 py-2 text-xs text-neon-pink transition hover:bg-neon-pink/10">清除本機快取並重新整理</button>
          </div>
        </div>
      </div>
    </div>
  )
}
