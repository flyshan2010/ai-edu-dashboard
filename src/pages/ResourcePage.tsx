import { useState } from 'react'
import { Icon, type IconName } from '../components/Icons'
import { useToast } from '../components/toast-context'
import { useAppStore } from '../store/useAppStore'

const KINDS: { type: string; icon: IconName; accent: string }[] = [
  { type: '簡報', icon: 'ppt', accent: '#3b82f6' },
  { type: '資訊圖卡', icon: 'grid', accent: '#22d3ee' },
  { type: '影片', icon: 'video', accent: '#a855f7' },
  { type: 'Podcast', icon: 'mic', accent: '#ec4899' },
]

export function ResourcePage({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const toast = useToast()
  const { addResource, resources, cloudStatus } = useAppStore()
  const [type, setType] = useState('簡報')
  const [f, setF] = useState({ subject: '', grade: '', topic: '' })
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }))
  const input = 'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  function generate() {
    if (!f.topic.trim()) { toast('請輸入主題'); return }
    const title = `${f.grade || ''}${f.subject || ''}_${f.topic.trim()}_${type}`.replace(/^_+/, '')
    addResource({ title, type, subject: f.subject.trim(), grade: f.grade.trim(), createdAt: Date.now() })
    toast(`已生成「${type}」並存入資源庫`)
    setF((s) => ({ ...s, topic: '' }))
  }

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-blue/20 text-neon-blue"><Icon name="layers" width={28} height={28} /></span>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white">教學套件生成中心</h2><span className="rounded bg-neon-blue/20 px-2 py-0.5 text-[10px] font-bold text-neon-blue">v3.3</span></div>
          <p className="text-sm text-slate-400">一鍵生成 PPT、資訊圖卡、影片與 Podcast，產物存入資源庫{cloudStatus === 'cloud' && <span className="ml-1 text-neon-green">● 雲端</span>}</p>
        </div>
        <button onClick={onOpenLibrary} className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-glow transition hover:bg-cyan-400/10">前往資源庫（{resources.length}）→</button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">選擇素材類型</h3>
          <div className="grid grid-cols-2 gap-3">
            {KINDS.map((k) => (
              <button key={k.type} onClick={() => setType(k.type)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${type === k.type ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-cyan-400/15 bg-white/[0.02] hover:border-cyan-400/30'}`}>
                <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${k.accent}22`, color: k.accent }}><Icon name={k.icon} width={18} height={18} /></span>
                <span className="text-sm font-medium text-white">{k.type}</span>
                {type === k.type && <Icon name="check" width={16} height={16} className="ml-auto text-cyan-glow" />}
              </button>
            ))}
          </div>
        </div>

        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">生成「{type}」</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">科目</label><input className={input} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="自然科學" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">年段</label><input className={input} value={f.grade} onChange={(e) => set('grade', e.target.value)} placeholder="五年級" /></div>
          </div>
          <label className="mb-1 mt-3 block text-[11px] text-slate-400">主題 / 單元</label>
          <input className={input} value={f.topic} onChange={(e) => set('topic', e.target.value)} placeholder="水域環境" />
          <button onClick={generate} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110">開始生成 <Icon name="sparkles" width={15} height={15} /></button>
          <p className="mt-3 text-[11px] text-slate-500">※ 介面為前端展示，實際內容由對應 Claude 技能在後端生成；此處將生成記錄寫入資源庫（雲端同步）。</p>
        </div>
      </div>
    </div>
  )
}
