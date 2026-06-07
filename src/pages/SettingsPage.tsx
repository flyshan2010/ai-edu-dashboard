import { useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'
import { testAI, listModels, PROVIDER_MODELS, PROVIDER_LABEL, KEY_HELP, DEFAULT_MODEL, type AIProvider } from '../ai/client'

export function SettingsPage() {
  const toast = useToast()
  const { cloudStatus, user, teacher, classes, students, examQuestions, essayReviews, courses, resources, resetDemo, signOutUser, aiProvider, aiKey, aiModel, setAIConfig } = useAppStore()
  const [providerDraft, setProviderDraft] = useState<AIProvider>(aiProvider)
  const [keyDraft, setKeyDraft] = useState(aiKey)
  const [modelDraft, setModelDraft] = useState(aiModel)
  const [testing, setTesting] = useState(false)
  const [detected, setDetected] = useState<string[]>([])
  const pickProvider = (p: AIProvider) => { setProviderDraft(p); setDetected([]); if (!PROVIDER_MODELS[p].includes(modelDraft)) setModelDraft(DEFAULT_MODEL[p]) }
  const modelOptions = detected.length ? detected : PROVIDER_MODELS[providerDraft]

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
          <div className="mb-1 flex items-center gap-2">
            <Icon name="wand" width={16} height={16} className="text-neon-cyan" />
            <h3 className="text-sm font-bold text-white">AI 設定（BYOK 自帶金鑰）</h3>
            <span className={`ml-auto rounded-lg px-2 py-0.5 text-[11px] ${aiKey ? 'bg-neon-green/15 text-neon-green' : 'bg-neon-amber/15 text-neon-amber'}`}>{aiKey ? '已設定金鑰' : '未設定（功能將以示範模式運作）'}</span>
          </div>
          <p className="mb-3 text-xs text-slate-400">啟用「教學套件生成／作文批改／試題生成／AI 助教」的真實 AI。金鑰只存在你的瀏覽器（localStorage），不上傳、不進程式碼庫。</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {(['gemini', 'claude'] as AIProvider[]).map((p) => (
              <button key={p} onClick={() => pickProvider(p)} className={`rounded-xl border px-3 py-1.5 text-xs transition ${providerDraft === p ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-glow' : 'border-cyan-400/15 text-slate-400 hover:border-cyan-400/30'}`}>{PROVIDER_LABEL[p]}</button>
            ))}
          </div>
          <p className="mb-2 text-[11px] text-neon-cyan">免費金鑰申請：{KEY_HELP[providerDraft]}</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">{PROVIDER_LABEL[providerDraft]} 金鑰</label>
              <input type="password" autoComplete="off" className="w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder={providerDraft === 'gemini' ? 'AIza...' : 'sk-ant-...'} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">模型</label>
              <input list="ai-models" className="w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50" value={modelDraft} onChange={(e) => setModelDraft(e.target.value)} placeholder={DEFAULT_MODEL[providerDraft]} />
              <datalist id="ai-models">{modelOptions.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => { setAIConfig(providerDraft, keyDraft, modelDraft); toast('AI 設定已儲存') }} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-xs font-bold text-white shadow-glow transition hover:brightness-110">儲存</button>
            <button
              disabled={testing}
              onClick={async () => {
                if (!keyDraft.trim()) { toast('請先貼上金鑰'); return }
                setTesting(true)
                try { await testAI(providerDraft, keyDraft.trim(), modelDraft.trim() || DEFAULT_MODEL[providerDraft]); setAIConfig(providerDraft, keyDraft, modelDraft); toast('連線成功，金鑰可用 ✓') }
                catch (e) { toast(e instanceof Error ? e.message : '連線失敗') }
                finally { setTesting(false) }
              }}
              className="rounded-lg border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-glow transition hover:bg-cyan-400/10 disabled:opacity-50"
            >{testing ? '測試中…' : '測試連線'}</button>
            {providerDraft === 'gemini' && (
              <button
                disabled={testing}
                onClick={async () => {
                  if (!keyDraft.trim()) { toast('請先貼上金鑰'); return }
                  setTesting(true)
                  try {
                    const ms = await listModels('gemini', keyDraft.trim())
                    setDetected(ms)
                    const best = ms.find((m) => m.includes('flash-latest')) || ms.find((m) => /flash/.test(m)) || ms[0]
                    if (best) setModelDraft(best)
                    toast(`偵測到 ${ms.length} 個可用模型，已選 ${best ?? '—'}`)
                  } catch (e) { toast(e instanceof Error ? e.message : '偵測失敗') }
                  finally { setTesting(false) }
                }}
                className="rounded-lg border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-glow transition hover:bg-cyan-400/10 disabled:opacity-50"
              >偵測可用模型</button>
            )}
            {aiKey && <button onClick={() => { setAIConfig(providerDraft, '', modelDraft); setKeyDraft(''); toast('已清除金鑰') }} className="rounded-lg border border-neon-pink/40 px-4 py-2 text-xs text-neon-pink transition hover:bg-neon-pink/10">清除金鑰</button>}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">※ 金鑰存於本機瀏覽器、用量計入你自己的帳戶；公用電腦請用後清除。Gemini 免費額度即可批改作文與出卷。</p>
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
