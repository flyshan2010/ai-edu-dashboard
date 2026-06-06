import { useEffect, useRef, useState } from 'react'
import { notifications as allNotifications, topNav } from '../data'
import { Icon } from './Icons'
import { useToast } from './toast-context'
import { useAppStore } from '../store/useAppStore'

interface TopbarProps {
  active: string
  onSelect: (id: string) => void
}

export function Topbar({ active, onSelect }: TopbarProps) {
  const toast = useToast()
  const { cloudStatus, user, signOutUser, teacher, updateTeacher } = useAppStore()
  const [query, setQuery] = useState('')
  const [openNotif, setOpenNotif] = useState(false)
  const [openUser, setOpenUser] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [draft, setDraft] = useState(teacher)
  const [notifs, setNotifs] = useState(allNotifications)
  const popRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  function openProfileEditor() {
    setDraft(teacher)
    setOpenProfile(true)
    setOpenUser(false)
  }
  function saveProfile() {
    if (!draft.name.trim()) { toast('請輸入姓名'); return }
    updateTeacher({ name: draft.name.trim(), title: draft.title.trim(), school: draft.school.trim() })
    setOpenProfile(false)
    toast('教師資料已更新')
  }
  const avatarChar = teacher.name.trim().charAt(0) || '師'

  const unread = notifs.filter((n) => n.unread).length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpenNotif(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setOpenUser(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) toast(`搜尋：「${query.trim()}」`)
  }

  const cloudMap = {
    connecting: { label: '連線中', color: '#fbbf24' },
    auth: { label: '待登入', color: '#fbbf24' },
    cloud: { label: '雲端同步', color: '#34d399' },
    local: { label: '本機模式', color: '#94a3b8' },
  }[cloudStatus]

  return (
    <header className="flex items-center gap-4 border-b border-cyan-400/10 bg-ink-900/70 px-5 py-3 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex w-[200px] flex-shrink-0 items-center gap-2.5">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet shadow-glow">
          <Icon name="grid" width={20} height={20} className="text-white" />
          <span className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/40 animate-pulseGlow" />
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="orbitron text-base font-extrabold text-white">EducationOS</span>
            <span className="rounded bg-cyan-400/15 px-1.5 text-[9px] font-bold text-cyan-glow">v3.3</span>
          </div>
          <p className="text-[10px] tracking-wide text-slate-400">AI 智慧教育平台</p>
        </div>
      </div>

      {/* Top nav */}
      <nav className="flex flex-1 items-center justify-center gap-1">
        {topNav.map((t) => {
          const isActive = t.target === active
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.target)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-1.5 text-[11px] transition ${
                isActive ? 'bg-cyan-400/15 text-cyan-glow' : 'text-slate-400 hover:bg-white/5 hover:text-cyan-100'
              }`}
            >
              <Icon name={t.icon} width={18} height={18} />
              {t.label}
            </button>
          )
        })}
      </nav>

      {/* Right cluster */}
      <div className="flex flex-shrink-0 items-center gap-2.5">
        <form onSubmit={submitSearch} className="relative hidden lg:block">
          <Icon name="search" width={15} height={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋功能、課程、學生…"
            className="w-56 rounded-xl border border-cyan-400/15 bg-white/[0.03] py-2 pl-8 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:shadow-glow"
          />
        </form>

        {/* Notifications */}
        <div className="relative" ref={popRef}>
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/15 bg-white/[0.03] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow"
          >
            <Icon name="bell" width={17} height={17} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-neon-pink px-1 text-[9px] font-bold text-white shadow-glow">
                {unread}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="panel bracket absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border-cyan-400/30 p-2 shadow-glow">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-bold text-white">通知中心</span>
                <button onClick={() => setNotifs((p) => p.map((n) => ({ ...n, unread: false })))} className="text-[11px] text-cyan-glow hover:underline">全部標為已讀</button>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { setNotifs((p) => p.map((x) => (x.id === n.id ? { ...x, unread: false } : x))); toast('已開啟通知詳情') }}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <span className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-glow"><Icon name={n.icon} width={16} height={16} /></span>
                    <span className="flex-1">
                      <span className="block text-xs leading-snug text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </span>
                    {n.unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-neon-pink" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setOpenUser((v) => !v)} className="flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-white/[0.03] py-1.5 pl-1.5 pr-2.5 transition hover:border-cyan-400/40">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-bold text-ink-900">{avatarChar}</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-xs font-semibold text-white">{teacher.name}</span>
              <span className="block text-[10px] text-slate-400">{teacher.title}</span>
            </span>
            <Icon name="arrow" width={13} height={13} className="rotate-90 text-slate-500" />
          </button>
          {openUser && (
            <div className="panel absolute right-0 top-12 z-50 w-60 rounded-2xl border-cyan-400/30 p-2 shadow-glow">
              <div className="border-b border-cyan-400/10 px-3 py-2">
                <p className="text-xs font-semibold text-white">{teacher.name} <span className="font-normal text-slate-400">{teacher.title}</span></p>
                <p className="truncate text-[11px] text-slate-400">{user?.email ?? '本機模式（未登入）'}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px]" style={{ color: cloudMap.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: cloudMap.color }} />{cloudMap.label}
                </span>
              </div>
              <button onClick={openProfileEditor} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5">
                <Icon name="teacher" width={15} height={15} /> 個人資料
              </button>
              <button onClick={() => { setOpenUser(false); onSelect('settings') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5">
                <Icon name="gear" width={15} height={15} /> 系統設定
              </button>
              {cloudStatus === 'cloud' && (
                <button onClick={() => { setOpenUser(false); void signOutUser() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neon-pink transition hover:bg-neon-pink/10">
                  <Icon name="arrow" width={15} height={15} className="rotate-180" /> 登出
                </button>
              )}
            </div>
          )}
        </div>

      {/* 個人資料編輯 Modal */}
      {openProfile && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpenProfile(false)}>
          <div className="panel w-full max-w-sm rounded-2xl border-cyan-400/30 p-5 shadow-glow" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">編輯個人資料</h3>
              <button onClick={() => setOpenProfile(false)} className="text-slate-400 hover:text-white"><Icon name="close" width={18} height={18} /></button>
            </div>
            <label className="mb-1 block text-xs text-slate-400">姓名</label>
            <input className="w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="王小明" />
            <label className="mb-1 mt-3 block text-xs text-slate-400">職稱</label>
            <input className="w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="教師 / 學年主任…" />
            <label className="mb-1 mt-3 block text-xs text-slate-400">學校</label>
            <input className="w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50" value={draft.school} onChange={(e) => setDraft((d) => ({ ...d, school: e.target.value }))} placeholder="崑山國小" />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpenProfile(false)} className="rounded-lg border border-cyan-400/20 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40">取消</button>
              <button onClick={saveProfile} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:brightness-110">儲存</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
  )
}
