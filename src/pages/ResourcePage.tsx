import { useState } from 'react'
import { Icon, type IconName } from '../components/Icons'
import { FileDrop } from '../components/FileDrop'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { runAI, genImage, parseJSON, type AIBlock } from '../ai/client'
import { parseFiles } from '../ai/files'
import {
  mdToHtmlBody, downloadDocx, downloadHtml, printToPdf,
  downloadPptx, downloadSlidesHtml, printSlidesPdf, slidesToMd, type Slide,
} from '../ai/generate'

type Kind = 'slides' | 'md'
interface ItemDef { key: string; label: string; icon: IconName; kind: Kind; sys: string }
const ITEMS: ItemDef[] = [
  { key: 'slides', label: '教學簡報', icon: 'ppt', kind: 'slides', sys: '你是教學簡報設計師。請先仔細閱讀上傳教材，依「教材實際的各章節／各節重點」逐節規劃投影片，內容必須具體取自教材（概念、定義、例子、步驟），不要空泛大綱。輸出 JSON：{"deckTitle":"標題","slides":[{"section":"節次標籤，如「封面」「學習目標」「第一節 ○○」「總結」","title":"頁標題","bullets":["該節重點（具體、取自教材）"],"notes":"講者備註","imagePrompt":"a clean flat educational illustration about <該頁主題>, white background, no text"}]}。規則：每一頁都要有 section 節次標籤；封面 1 頁→學習目標 1 頁→依教材逐節各 1–2 頁（涵蓋所有主要小節）→總結 1 頁；每頁 bullets 3–5 點；總數 8–16 張；section/title/bullets/notes 用繁體中文（台灣用語），imagePrompt 一律用英文且具體描述該頁主題。只輸出 JSON。' },
  { key: 'infographic', label: '資訊圖卡文案', icon: 'grid', kind: 'md', sys: '你是資訊圖卡設計師。依教材輸出一張資訊圖卡的文案 Markdown：主標、3–5 個重點區塊（每塊標題+一句話+圖示建議）、底部一句總結。繁體中文。' },
  { key: 'video', label: '教學影片腳本', icon: 'video', kind: 'md', sys: '你是教學影片編劇。依教材輸出 3–5 分鐘教學影片腳本 Markdown：分鏡表（時間｜畫面｜旁白｜字幕），繁體中文。' },
  { key: 'podcast', label: 'Podcast 腳本', icon: 'mic', kind: 'md', sys: '你是教育 Podcast 編劇。依教材輸出雙人對談 Podcast 腳本 Markdown（主持人＋來賓，含開場、3 段主題、總結），繁體中文、口語自然。' },
  { key: 'worksheet', label: '學習單', icon: 'doc', kind: 'md', sys: '你是學習單設計師。依教材輸出學習單 Markdown：學習目標、暖身、核心練習（含題目）、延伸思考、自我檢核，繁體中文。' },
]

interface Result { key: string; label: string; kind: Kind; md?: string; slides?: Slide[]; deckTitle?: string }

export function ResourcePage({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const toast = useToast()
  const { addResource, resources, aiProvider, aiKey, aiModel, cloudStatus } = useAppStore()
  const [files, setFiles] = useState<File[]>([])
  const [f, setF] = useState({ subject: '', grade: '', topic: '' })
  const [sel, setSel] = useState<Set<string>>(new Set(['slides']))
  const [slideFmt, setSlideFmt] = useState<'pptx' | 'pdf' | 'html'>('pptx')
  const [withImages, setWithImages] = useState(false)
  const [busy, setBusy] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [err, setErr] = useState('')
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const toggle = (k: string) => setSel((p) => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n })

  async function run() {
    if (!files.length && !f.topic.trim()) { toast('請上傳教材檔，或至少填寫主題'); return }
    if (!sel.size) { toast('請至少選一個要生成的項目'); return }
    if (!aiKey) { toast('尚未設定 AI 金鑰，請到「系統管理 → AI 設定」'); return }
    setErr('')
    const parsed = files.length ? await parseFiles(files) : []
    const ctx: AIBlock[] = [
      { type: 'text', text: `科目：${f.subject || '依教材'}；年段：${f.grade || '依教材'}；主題：${f.topic || '依教材'}。教材如下：` },
      ...parsed.map((p) => p.block),
    ]
    if (!parsed.length) ctx.push({ type: 'text', text: `（未提供教材檔，請就主題「${f.topic}」自行取材。）` })
    const out: Result[] = []
    try {
      for (const def of ITEMS.filter((i) => sel.has(i.key))) {
        setBusy(def.label)
        const text = await runAI(aiProvider, aiKey, aiModel, def.sys, ctx, def.kind === 'slides' ? 8192 : 3072, def.kind === 'slides')
        const baseTitle = `${f.grade}${f.subject}_${f.topic || def.label}`.replace(/^_+/, '')
        if (def.kind === 'slides') {
          const json = parseJSON<{ deckTitle: string; slides: (Slide & { imagePrompt?: string; image_prompt?: string })[] }>(text)
          const arr = Array.isArray(json?.slides) ? json!.slides : []
          const slides: Slide[] = arr.map((s) => ({ title: s.title, bullets: s.bullets ?? [], notes: s.notes, section: s.section }))
          // 可選：用 Gemini 免費金鑰為每頁生圖（best-effort，失敗該頁略過）
          if (slides.length && withImages && aiProvider === 'gemini' && aiKey) {
            let imgFail = 0
            for (let i = 0; i < slides.length; i++) {
              setBusy(`簡報配圖 ${i + 1}/${slides.length}`)
              const p = arr[i].imagePrompt || arr[i].image_prompt || `educational illustration about ${slides[i].title}`
              try {
                const img = await genImage(aiProvider, aiKey, p)
                if (img) slides[i] = { ...slides[i], image: img }
              } catch (e) {
                imgFail++
                setErr(`配圖失敗（已略過 ${imgFail} 頁）：${e instanceof Error ? e.message : '未知錯誤'}`)
                if (imgFail >= 2) break // 連續失敗就停止，避免空轉/耗額度
              }
            }
          }
          const deckTitle = json?.deckTitle || `${baseTitle}_簡報`
          if (slides.length) {
            out.push({ key: def.key, label: def.label, kind: 'slides', slides, deckTitle })
            addResource({ title: deckTitle, type: '簡報', subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now(), content: slidesToMd(deckTitle, slides), format: slideFmt })
          } else {
            // JSON 解析失敗 → 以文字方式呈現，避免空白
            out.push({ key: def.key, label: `${def.label}（文字稿）`, kind: 'md', md: text || '（生成失敗，請重試或換模型）' })
            addResource({ title: `${baseTitle}_簡報`, type: '簡報', subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now(), content: text, format: 'md' })
          }
        } else {
          out.push({ key: def.key, label: def.label, kind: 'md', md: text })
          addResource({ title: `${baseTitle}_${def.label}`, type: def.label, subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now(), content: text, format: 'docx' })
        }
        setResults([...out])
      }
      toast(`已生成 ${out.length} 項並存資料庫 ✓`)
    } catch (e) {
      const m = e instanceof Error ? e.message : '生成失敗'
      setErr(m); toast(m)
    } finally { setBusy('') }
  }

  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-blue/20 text-neon-blue"><Icon name="layers" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white">教學套件生成中心</h2><span className="rounded bg-neon-blue/20 px-2 py-0.5 text-[10px] font-bold text-neon-blue">v3.3</span></div>
          <p className="text-sm text-slate-400">上傳教材 → 勾選項目 → 一鍵生成（簡報可選 PPT/PDF/HTML）→ 存資料庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
        </div>
        <button onClick={onOpenLibrary} className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-glow transition hover:bg-cyan-400/10">資源庫（{resources.length}）→</button>
      </div>

      {!aiKey && <div className="rounded-xl border border-neon-amber/40 bg-neon-amber/10 px-4 py-2 text-xs text-neon-amber">尚未設定 AI 金鑰：請到「系統管理 → AI 設定」貼上金鑰。</div>}
      {err && <div className="rounded-xl border border-neon-pink/40 bg-neon-pink/10 px-4 py-2 text-xs text-neon-pink">⚠️ {err}</div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">① 上傳教材</h3>
          <FileDrop files={files} onFiles={setFiles} accept="image/*,.pdf,.docx,.txt,.md" label="上傳要分析的教材" hint="課本／講義／PDF／Word／圖片（可多檔）" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="科目" />
            <input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="年段" />
            <input className={input} value={f.topic} onChange={(e) => set('topic', e.target.value)} placeholder="主題" />
          </div>

          <h3 className="mb-2 mt-4 text-sm font-bold text-white">② 選擇生成項目</h3>
          <div className="grid grid-cols-2 gap-2">
            {ITEMS.map((it) => (
              <button key={it.key} onClick={() => toggle(it.key)} className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition ${sel.has(it.key) ? 'border-cyan-400/50 bg-cyan-400/10 text-white' : 'border-cyan-400/15 bg-white/[0.02] text-slate-300 hover:border-cyan-400/30'}`}>
                <Icon name={it.icon} width={16} height={16} className={sel.has(it.key) ? 'text-cyan-glow' : 'text-slate-400'} />
                <span className="flex-1">{it.label}</span>
                {sel.has(it.key) && <Icon name="check" width={15} height={15} className="text-cyan-glow" />}
              </button>
            ))}
          </div>

          {sel.has('slides') && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">簡報格式：</span>
              {(['pptx', 'pdf', 'html'] as const).map((fmt) => (
                <button key={fmt} onClick={() => setSlideFmt(fmt)} className={`rounded-lg border px-2.5 py-1 text-[11px] uppercase ${slideFmt === fmt ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-glow' : 'border-cyan-400/15 text-slate-400'}`}>{fmt}</button>
              ))}
            </div>
          )}
          {sel.has('slides') && (
            <label className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
              每頁用 Gemini 生圖（較耗時/耗免費額度；Claude 不支援）
            </label>
          )}

          <button onClick={run} disabled={!!busy} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">{busy ? `生成中：${busy}…` : '③ 一鍵生成'} <Icon name="sparkles" width={15} height={15} /></button>
        </div>

        <div className="panel bracket flex flex-col rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">生成結果</h3>
          {results.length === 0 ? (
            <div className="grid flex-1 place-items-center py-12 text-center text-xs text-slate-400">{busy ? `AI 正在生成：${busy}…` : '結果會顯示在這裡，並可下載與存入資源庫。'}</div>
          ) : (
            <div className="max-h-[460px] space-y-3 overflow-y-auto">
              {results.map((r) => (
                <div key={r.key} className="rounded-xl border border-cyan-400/10 bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{r.label}</span>
                    {r.kind === 'slides' ? (
                      <span className="flex gap-1.5">
                        <button onClick={() => r.slides && downloadPptx(r.deckTitle!, r.slides)} className="rounded border border-cyan-400/30 px-2 py-0.5 text-[11px] text-cyan-glow hover:bg-cyan-400/10">PPT</button>
                        <button onClick={() => r.slides && printSlidesPdf(r.deckTitle!, r.slides)} className="rounded border border-cyan-400/20 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/5">PDF</button>
                        <button onClick={() => r.slides && downloadSlidesHtml(r.deckTitle!, r.slides)} className="rounded border border-cyan-400/20 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/5">HTML</button>
                      </span>
                    ) : (
                      <span className="flex gap-1.5">
                        <button onClick={() => downloadDocx(r.label, r.md!)} className="rounded border border-cyan-400/30 px-2 py-0.5 text-[11px] text-cyan-glow hover:bg-cyan-400/10">Word</button>
                        <button onClick={() => downloadHtml(r.label, r.md!)} className="rounded border border-cyan-400/20 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/5">HTML</button>
                        <button onClick={() => printToPdf(r.label, r.md!)} className="rounded border border-cyan-400/20 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/5">PDF</button>
                      </span>
                    )}
                  </div>
                  {r.kind === 'slides'
                    ? <div className="max-h-48 overflow-y-auto text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: mdToHtmlBody(slidesToMd(r.deckTitle!, r.slides ?? [])) }} />
                    : <div className="max-h-48 overflow-y-auto text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: mdToHtmlBody(r.md ?? '') }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
