import { useRef, useState } from 'react'
import { Icon } from '../components/Icons'

interface Msg { id: number; role: 'user' | 'ai'; text: string }

const SUGGESTIONS = [
  '幫我設計「水域環境」探究式活動',
  '五年級數學小數乘法的常見迷思？',
  '怎麼寫給家長的學習狀況聯絡簿？',
  '幫我規劃一份素養導向的評量藍圖',
]

function reply(q: string): string {
  if (q.includes('迷思')) return '常見迷思與對策：\n1. 概念混淆 → 用具體實例對比澄清\n2. 程序錯誤 → 拆解步驟並逐步檢核\n3. 過度類化 → 提供反例\n建議搭配形成性評量即時回饋。'
  if (q.includes('家長') || q.includes('聯絡簿')) return '聯絡簿草稿：\n親愛的家長您好，本週孩子在課堂參與積極，作業完成度良好；建議在家可多鼓勵閱讀與口頭表達。如有需要歡迎與我聯繫。'
  if (q.includes('評量') || q.includes('藍圖')) return '素養評量藍圖建議：\n· 選擇題 10（記憶/理解）\n· 填充題 5（應用）\n· 問答題 2（分析/評鑑，含情境）\n預估作答 40 分鐘，並附後設認知反思題一題。'
  return `針對「${q}」的教學建議：\n1. 引起動機：以生活情境提問\n2. 探究活動：分組觀察、記錄與討論\n3. 形成性評量：素養題＋後設認知反思\n可到「教學套件生成」一鍵產出對應簡報與試卷。`
}

export function AssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: 'ai', text: '您好，我是 AI 助教。可以詢問教學設計、命題建議、班級經營或親師溝通～' }])
  const [text, setText] = useState('')
  const seqRef = useRef(0)

  function send(q: string) {
    const query = q.trim()
    if (!query) return
    seqRef.current += 2
    const s = seqRef.current
    setMsgs((prev) => [...prev, { id: s - 1, role: 'user', text: query }, { id: s, role: 'ai', text: reply(query) }])
    setText('')
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-cyan/20 text-neon-cyan"><Icon name="robot" width={28} height={28} /></span>
        <div><h2 className="text-xl font-bold text-white">AI 助教</h2><p className="text-sm text-slate-400">教學設計、命題、班級經營與親師溝通的即時建議</p></div>
      </div>

      <div className="panel bracket flex min-h-0 flex-1 flex-col rounded-2xl p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-neon-blue to-neon-violet text-white' : 'border border-cyan-400/15 bg-white/[0.03] text-slate-200'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-cyan-400/15 bg-white/[0.02] px-3 py-1 text-[11px] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow">{s}</button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(text) }} className="mt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="輸入你的問題…" className="flex-1 rounded-xl border border-cyan-400/15 bg-ink-800 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/50" />
          <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">送出 <Icon name="arrow" width={15} height={15} /></button>
        </form>
      </div>
    </div>
  )
}
