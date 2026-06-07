import { useRef, useState } from 'react'
import { Icon } from '../components/Icons'
import { useAppStore } from '../store/useAppStore'
import { callClaude, AIError, type ChatTurn } from '../ai/anthropic'

interface Msg { id: number; role: 'user' | 'ai'; text: string }

const SUGGESTIONS = [
  '幫我設計「水域環境」探究式活動',
  '五年級數學小數乘法的常見迷思？',
  '怎麼寫給家長的學習狀況聯絡簿？',
  '幫我規劃一份素養導向的評量藍圖',
]

const SYSTEM = '你是台灣國中小教師的 AI 助教，精通 108 課綱、教學設計、命題、班級經營與親師溝通。請用繁體中文（台灣用語）、條理清楚、可立即落地地回答；必要時用條列。'

function templateReply(q: string): string {
  if (q.includes('迷思')) return '常見迷思與對策：\n1. 概念混淆 → 用具體實例對比澄清\n2. 程序錯誤 → 拆解步驟逐步檢核\n3. 過度類化 → 提供反例\n（設定 AI 金鑰後可得到更完整的個別化建議）'
  return `針對「${q}」的建議：\n1. 引起動機：生活情境提問\n2. 探究活動：分組觀察與討論\n3. 形成性評量：素養題＋後設認知反思\n（提示：到「系統管理 → AI 設定」貼上金鑰即可啟用真實 AI 對話）`
}

export function AssistantPage() {
  const { aiKey, aiModel } = useAppStore()
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: 'ai', text: aiKey ? '您好，我是 AI 助教（已連線真實 Claude）。請問需要什麼協助？' : '您好，我是 AI 助教。目前為示範模式；到「系統管理 → AI 設定」貼上金鑰即可啟用真實對話。' }])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const seqRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function send(q: string) {
    const query = q.trim()
    if (!query || busy) return
    seqRef.current += 1
    const uid = seqRef.current
    const history = msgs
    setMsgs((p) => [...p, { id: uid, role: 'user', text: query }])
    setText('')

    if (!aiKey) {
      seqRef.current += 1
      const aid = seqRef.current
      setMsgs((p) => [...p, { id: aid, role: 'ai', text: templateReply(query) }])
      return
    }
    setBusy(true)
    try {
      const turns: ChatTurn[] = [
        ...history.filter((m) => m.id !== 0).map((m) => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.text })),
        { role: 'user', content: query },
      ]
      const reply = await callClaude({ key: aiKey, model: aiModel, system: SYSTEM, messages: turns, maxTokens: 2048 })
      seqRef.current += 1
      setMsgs((p) => [...p, { id: seqRef.current, role: 'ai', text: reply }])
    } catch (e) {
      seqRef.current += 1
      setMsgs((p) => [...p, { id: seqRef.current, role: 'ai', text: '⚠️ ' + (e instanceof AIError ? e.message : '對話失敗，請稍後再試') }])
    } finally {
      setBusy(false)
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 60)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-cyan/20 text-neon-cyan"><Icon name="robot" width={28} height={28} /></span>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">AI 助教</h2><p className="text-sm text-slate-400">教學設計、命題、班級經營與親師溝通的即時建議</p></div>
        <span className={`rounded-lg px-2.5 py-1 text-[11px] ${aiKey ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-amber/15 text-neon-amber'}`}>{aiKey ? '真實 AI' : '示範模式'}</span>
      </div>

      <div className="panel bracket flex min-h-0 flex-1 flex-col rounded-2xl p-4">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-neon-blue to-neon-violet text-white' : 'border border-cyan-400/15 bg-white/[0.03] text-slate-200'}`}>{m.text}</div>
            </div>
          ))}
          {busy && <div className="flex justify-start"><div className="rounded-2xl border border-cyan-400/15 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-400">AI 思考中…</div></div>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} disabled={busy} className="rounded-full border border-cyan-400/15 bg-white/[0.02] px-3 py-1 text-[11px] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow disabled:opacity-50">{s}</button>)}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(text) }} className="mt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="輸入你的問題…" className="flex-1 rounded-xl border border-cyan-400/15 bg-ink-800 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/50" />
          <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">送出 <Icon name="arrow" width={15} height={15} /></button>
        </form>
      </div>
    </div>
  )
}
