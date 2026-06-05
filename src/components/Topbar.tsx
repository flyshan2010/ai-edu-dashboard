import { useEffect, useRef, useState } from 'react'
import { notifications as allNotifications } from '../data'
import { Icon } from './Icons'
import { useToast } from './toast-context'

export function Topbar() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [openNotif, setOpenNotif] = useState(false)
  const [notifs, setNotifs] = useState(allNotifications)
  const popRef = useRef<HTMLDivElement>(null)

  const unread = notifs.filter((n) => n.unread).length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpenNotif(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) toast(`搜尋：「${query.trim()}」`)
  }

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4">
      {/* Welcome */}
      <div className="leading-tight">
        <h2 className="whitespace-nowrap text-xl font-bold text-white">
          歡迎回來，王小明老師！ <span className="animate-pulseGlow">👋</span>
        </h2>
        <p className="text-xs text-slate-400">今天是 2024 年 5 月 24 日，星期五</p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        <form onSubmit={submitSearch} className="relative hidden md:block">
          <Icon
            name="search"
            width={16}
            height={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋功能、學生或資源…"
            className="w-72 rounded-xl border border-cyan-400/15 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:shadow-glow"
          />
        </form>

        {/* Notifications */}
        <div className="relative" ref={popRef}>
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/15 bg-white/[0.03] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow"
          >
            <Icon name="bell" width={18} height={18} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-neon-pink px-1 text-[10px] font-bold text-white shadow-glow">
                {unread}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="panel bracket absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border-cyan-400/30 p-2 shadow-glow">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-bold text-white">通知中心</span>
                <button
                  onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })))}
                  className="text-[11px] text-cyan-glow hover:underline"
                >
                  全部標為已讀
                </button>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
                      toast('已開啟通知詳情')
                    }}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <span className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-glow">
                      <Icon name={n.icon} width={16} height={16} />
                    </span>
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

        <button
          onClick={() => toast('說明中心開啟中…')}
          className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/15 bg-white/[0.03] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow"
        >
          <Icon name="help" width={18} height={18} />
        </button>

        <button
          onClick={() => toast('個人設定面板')}
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-bold text-ink-900 shadow-glow ring-2 ring-cyan-400/30 transition hover:brightness-110"
        >
          王
        </button>
      </div>
    </header>
  )
}
