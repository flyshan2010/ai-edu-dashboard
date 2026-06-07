// 供應商無關的 AI 介面：依 provider 路由到 Claude 或 Gemini。
import { ask as claudeAsk, callClaude, AIError, parseJSON, type AIBlock, type ChatTurn } from './anthropic'
import { geminiAsk, geminiChat, geminiListModels, geminiImage } from './gemini'

export type AIProvider = 'claude' | 'gemini'

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  claude: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5'],
  gemini: ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
}
export const DEFAULT_MODEL: Record<AIProvider, string> = {
  claude: 'claude-sonnet-4-5',
  gemini: 'gemini-flash-latest',
}

// 偵測金鑰可用模型（目前僅 Gemini）
export function listModels(provider: AIProvider, key: string): Promise<string[]> {
  return provider === 'gemini' ? geminiListModels(key) : Promise.resolve(PROVIDER_MODELS.claude)
}
export const PROVIDER_LABEL: Record<AIProvider, string> = {
  claude: 'Claude（付費金鑰）',
  gemini: 'Gemini（免費金鑰）',
}
export const KEY_HELP: Record<AIProvider, string> = {
  claude: 'console.anthropic.com/settings/keys（需付費額度）',
  gemini: 'aistudio.google.com/apikey（免費、免綁卡）',
}

// 單輪：system + 一則使用者訊息（可含檔案 blocks）。json=true 時要求模型輸出純 JSON。
export function runAI(provider: AIProvider, key: string, model: string, system: string, blocks: AIBlock[], maxTokens?: number, json = false): Promise<string> {
  return provider === 'gemini' ? geminiAsk(key, model, system, blocks, maxTokens, json) : claudeAsk(key, model, system, blocks, maxTokens)
}

// 多輪對話
export function runChat(provider: AIProvider, key: string, model: string, system: string, turns: ChatTurn[], maxTokens?: number): Promise<string> {
  return provider === 'gemini'
    ? geminiChat(key, model, system, turns, maxTokens)
    : callClaude({ key, model, system, messages: turns, maxTokens })
}

// 生圖（目前僅 Gemini；Claude 無 Messages 生圖回 null）
export function genImage(provider: AIProvider, key: string, prompt: string): Promise<string | null> {
  return provider === 'gemini' ? geminiImage(key, prompt) : Promise.resolve(null)
}

export async function testAI(provider: AIProvider, key: string, model: string): Promise<void> {
  // Gemini：用 ListModels 驗證金鑰（避免 thinking 模型在小 token 下回空字串）
  if (provider === 'gemini') { await geminiListModels(key); return }
  await runAI(provider, key, model, '只回覆兩個字：成功', [{ type: 'text', text: '測試連線' }], 64)
}

export { AIError, parseJSON, type AIBlock, type ChatTurn }
