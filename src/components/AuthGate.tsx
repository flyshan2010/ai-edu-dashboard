import { useState } from 'react'
import { Icon } from './Icons'
import { useAppStore } from '../store/useAppStore'

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'Email 格式不正確',
    'auth/missing-password': '請輸入密碼',
    'auth/weak-password': '密碼至少需 6 碼',
    'auth/email-already-in-use': '此 Email 已被註冊，請改為登入',
    'auth/invalid-credential': 'Email 或密碼錯誤',
    'auth/wrong-password': '密碼錯誤',
    'auth/user-not-found': '查無此帳號，請先註冊',
    'auth/too-many-requests': '嘗試次數過多，請稍後再試',
    'auth/network-request-failed': '網路連線失敗',
  }
  return map[code] ?? '操作失敗，請稍後再試'
}

export function AuthGate() {
  const { signIn, register, useLocalMode } = useAppStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await signIn(email.trim(), password)
      else await register(email.trim(), password)
      // 成功後 onAuthStateChanged 會切換畫面
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      setError(friendlyError(code))
      setBusy(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-cyan-400/15 bg-ink-800 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50 focus:shadow-glow'

  return (
    <div className="bg-grid grid h-screen w-screen place-items-center px-4">
      <div className="panel bracket w-full max-w-sm rounded-2xl border-cyan-400/25 p-7 shadow-glow">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-neon-blue to-neon-violet shadow-glow">
            <span className="orbitron text-xl font-extrabold text-white">A</span>
            <span className="absolute inset-0 rounded-2xl ring-1 ring-cyan-400/40 animate-pulseGlow" />
          </div>
          <h1 className="text-lg font-bold text-white">未來學院 AI 教育平台</h1>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'login' ? '請以 Email 登入以同步雲端資料' : '建立教師帳號'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Email</label>
            <input
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder="teacher@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-400">密碼</label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputCls}
              placeholder="至少 6 碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-neon-pink/40 bg-neon-pink/10 px-3 py-2 text-xs text-neon-pink">
              <Icon name="help" width={14} height={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet py-3 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? '處理中…' : mode === 'login' ? '登入' : '註冊並登入'}
            {!busy && <Icon name="arrow" width={15} height={15} />}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'))
              setError(null)
            }}
            className="text-cyan-glow hover:underline"
          >
            {mode === 'login' ? '沒有帳號？前往註冊' : '已有帳號？前往登入'}
          </button>
          <button onClick={useLocalMode} className="text-slate-400 hover:text-slate-200">
            以本機模式試用 →
          </button>
        </div>
      </div>
    </div>
  )
}

export function Splash() {
  return (
    <div className="bg-grid grid h-screen w-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spinSlow rounded-full border-2 border-cyan-400/30 border-t-cyan-glow" />
        <p className="text-xs text-slate-400">連線中…</p>
      </div>
    </div>
  )
}
