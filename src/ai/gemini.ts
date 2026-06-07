// Google Gemini 免費金鑰客戶端（generativelanguage API，瀏覽器可直連、CORS 允許）。
// 免費金鑰申請：https://aistudio.google.com/apikey （免綁信用卡）
import { AIError, type AIBlock, type ChatTurn } from './anthropic'

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

interface GeminiPart { text?: string; inlineData?: { mimeType: string; data: string } }

function blockToPart(b: AIBlock): GeminiPart {
  if (b.type === 'text') return { text: b.text }
  if (b.type === 'image') return { inlineData: { mimeType: b.source.media_type, data: b.source.data } }
  return { inlineData: { mimeType: 'application/pdf', data: b.source.data } }
}

interface GeminiContent { role: 'user' | 'model'; parts: GeminiPart[] }

async function call(key: string, model: string, system: string | undefined, contents: GeminiContent[], maxTokens: number, jsonMode = false): Promise<string> {
  if (!key) throw new AIError('尚未設定 Gemini 金鑰（請至「系統管理 → AI 設定」貼上免費金鑰）')
  let res: Response
  try {
    res = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7, ...(jsonMode ? { responseMimeType: 'application/json' } : {}) },
      }),
    })
  } catch {
    throw new AIError('無法連線到 Gemini API（請檢查網路）')
  }
  if (!res.ok) {
    let detail = ''
    try { const j = await res.json(); detail = j?.error?.message ?? '' } catch { /* ignore */ }
    if (res.status === 400 && /API key not valid|API_KEY_INVALID/i.test(detail)) throw new AIError('Gemini 金鑰無效（請確認已從 aistudio.google.com 複製）')
    if (res.status === 429) throw new AIError('Gemini 免費額度已達上限，請稍後再試（429）')
    throw new AIError(`Gemini API 錯誤（${res.status}）${detail ? '：' + detail : ''}`)
  }
  const data = await res.json()
  const cand = data?.candidates?.[0]
  const text = (cand?.content?.parts ?? []).map((p: GeminiPart) => p.text ?? '').join('').trim()
  if (!text) {
    if (cand?.finishReason === 'SAFETY') throw new AIError('內容被 Gemini 安全機制阻擋，請調整輸入')
    throw new AIError('Gemini 沒有回傳內容')
  }
  return text
}

// 用金鑰列出「可用且支援 generateContent」的模型（驗證金鑰 + 取得最新清單）
export async function geminiListModels(key: string): Promise<string[]> {
  if (!key) throw new AIError('尚未設定 Gemini 金鑰')
  let res: Response
  try {
    res = await fetch(`${BASE}?key=${encodeURIComponent(key)}&pageSize=200`, { headers: { 'content-type': 'application/json' } })
  } catch {
    throw new AIError('無法連線到 Gemini API（請檢查網路）')
  }
  if (!res.ok) {
    let detail = ''
    try { const j = await res.json(); detail = j?.error?.message ?? '' } catch { /* ignore */ }
    if (res.status === 400 || res.status === 403) throw new AIError('Gemini 金鑰無效或未開通（請至 aistudio.google.com/apikey 確認）')
    throw new AIError(`Gemini 列出模型失敗（${res.status}）${detail ? '：' + detail : ''}`)
  }
  const data = await res.json()
  const models: string[] = (data?.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
    .map((m: { name: string }) => m.name.replace(/^models\//, ''))
    .filter((id: string) => id.startsWith('gemini'))
  // 偏好較新的 flash/pro 排前面
  return models.sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))
}

export function geminiAsk(key: string, model: string, system: string, blocks: AIBlock[], maxTokens = 4096, jsonMode = false): Promise<string> {
  return call(key, model, system, [{ role: 'user', parts: blocks.map(blockToPart) }], maxTokens, jsonMode)
}

// Gemini 生圖（用使用者免費金鑰）；回 data URL，失敗回 null（不丟錯，best-effort）
export async function geminiImage(key: string, prompt: string): Promise<string | null> {
  if (!key) return null
  try {
    const res = await fetch(`${BASE}/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `Generate a clean, flat, child-friendly educational illustration (no text in image): ${prompt}` }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
    })
    if (!res.ok) return null
    const d = await res.json()
    const parts = d?.candidates?.[0]?.content?.parts ?? []
    const img = parts.find((p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.data)
    if (!img?.inlineData?.data) return null
    return `data:${img.inlineData.mimeType || 'image/png'};base64,${img.inlineData.data}`
  } catch {
    return null
  }
}

export function geminiChat(key: string, model: string, system: string, turns: ChatTurn[], maxTokens = 2048): Promise<string> {
  const contents: GeminiContent[] = turns.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: typeof t.content === 'string' ? [{ text: t.content }] : t.content.map(blockToPart),
  }))
  return call(key, model, system, contents, maxTokens)
}
