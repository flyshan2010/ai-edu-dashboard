// BYOK（Bring Your Own Key）瀏覽器直連 Claude API。
// 金鑰由使用者存於本機（localStorage），不上傳、不進 git。
// 使用官方 anthropic-dangerous-direct-browser-access 標頭以允許瀏覽器直呼。

const API = 'https://api.anthropic.com/v1/messages'

export type AIBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string | AIBlock[]
}

export class AIError extends Error {}

interface CallOpts {
  key: string
  model: string
  system?: string
  messages: ChatTurn[]
  maxTokens?: number
}

export async function callClaude({ key, model, system, messages, maxTokens = 4096 }: CallOpts): Promise<string> {
  if (!key) throw new AIError('尚未設定 Anthropic API 金鑰（請至「系統管理 → AI 設定」貼上金鑰）')
  let res: Response
  try {
    res = await fetch(API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, ...(system ? { system } : {}), messages }),
    })
  } catch {
    throw new AIError('無法連線到 Claude API（請檢查網路）')
  }
  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error?.message ?? ''
    } catch { /* ignore */ }
    if (res.status === 401) throw new AIError('金鑰無效或未授權（401）')
    if (res.status === 429) throw new AIError('請求過於頻繁或額度不足（429）')
    throw new AIError(`Claude API 錯誤（${res.status}）${detail ? '：' + detail : ''}`)
  }
  const data = await res.json()
  const text = (data?.content ?? []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim()
  if (!text) throw new AIError('Claude 沒有回傳內容')
  return text
}

// 單輪：一段 system + 一則使用者訊息（可含檔案 blocks）
export function ask(key: string, model: string, system: string, blocks: AIBlock[], maxTokens?: number): Promise<string> {
  return callClaude({ key, model, system, messages: [{ role: 'user', content: blocks }], maxTokens })
}

// 嘗試把回傳內容解析為 JSON（容忍 ```json 圍欄）
export function parseJSON<T>(text: string): T | null {
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    return JSON.parse(m ? m[1] : text) as T
  } catch {
    return null
  }
}
