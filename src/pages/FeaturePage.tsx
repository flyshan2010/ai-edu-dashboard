import { useState } from 'react'
import { Icon, type IconName } from '../components/Icons'
import { useToast } from '../components/toast-context'

export interface FeatureField {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
}

export interface FeatureConfig {
  id: string
  title: string
  version?: string
  icon: IconName
  accent: string
  tagline: string
  highlights: { icon: IconName; title: string; desc: string }[]
  outputs?: { label: string; hint?: string }[]
  form?: {
    heading: string
    fields: FeatureField[]
    submitLabel: string
    // 產生示範結果（每列一個項目）
    makeResult: (values: Record<string, string>) => string[]
    resultTitle: string
  }
}

export function FeaturePage({ config }: { config: FeatureConfig }) {
  const toast = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string[] | null>(null)

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }))
  const inputCls =
    'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  function submit() {
    if (!config.form) return
    const missing = config.form.fields.find((f) => !values[f.key]?.trim())
    if (missing) {
      toast(`請填寫「${missing.label}」`)
      return
    }
    setResult(config.form.makeResult(values))
    toast('已送出（示範產出）')
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span
          className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl"
          style={{ background: `${config.accent}22`, color: config.accent }}
        >
          <Icon name={config.icon} width={28} height={28} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            {config.version && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${config.accent}22`, color: config.accent }}
              >
                {config.version}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">{config.tagline}</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {config.highlights.map((h) => (
          <div key={h.title} className="panel-hover rounded-2xl border border-cyan-400/10 bg-white/[0.02] p-4">
            <span
              className="mb-2 grid h-9 w-9 place-items-center rounded-lg"
              style={{ background: `${config.accent}22`, color: config.accent }}
            >
              <Icon name={h.icon} width={18} height={18} />
            </span>
            <h4 className="text-sm font-bold text-white">{h.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{h.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Form */}
        {config.form && (
          <div className="panel bracket rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-bold text-white">{config.form.heading}</h3>
            <div className="space-y-3">
              {config.form.fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[11px] text-slate-400">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  ) : f.type === 'select' ? (
                    <select className={inputCls} value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                      <option value="">請選擇…</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={submit}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
              >
                {config.form.submitLabel}
                <Icon name="arrow" width={15} height={15} />
              </button>
            </div>
          </div>
        )}

        {/* Result / Outputs */}
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-bold text-white">
            {result ? config.form?.resultTitle ?? '產出結果' : '預期產出'}
          </h3>
          {result ? (
            <ul className="space-y-2">
              {result.map((r, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-200">
                  <Icon name="check" width={16} height={16} className="text-neon-green" />
                  {r}
                </li>
              ))}
            </ul>
          ) : config.outputs ? (
            <ul className="space-y-2">
              {config.outputs.map((o) => (
                <li key={o.label} className="flex items-start gap-2 rounded-lg border border-cyan-400/10 bg-white/[0.02] px-3 py-2">
                  <Icon name="doc" width={16} height={16} className="mt-0.5 text-cyan-glow" />
                  <span>
                    <span className="block text-sm text-slate-200">{o.label}</span>
                    {o.hint && <span className="text-[11px] text-slate-500">{o.hint}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">填寫左側表單後，這裡會顯示示範產出。</p>
          )}
          <p className="mt-4 text-[11px] text-slate-500">
            ※ 本介面為前端展示；實際生成由對應的 Claude 技能（如 exam-generator v3.0）在後端執行。
          </p>
        </div>
      </div>
    </div>
  )
}
