// 供應商無關的 AI 介面：依 provider 路由到 Claude 或 Gemini。
import { ask as claudeAsk, callClaude, AIError, parseJSON, type AIBlock, type ChatTurn } from './anthropic'
import { geminiAsk, geminiChat } from './gemini'

export type AIProvider = 'claude' | 'gemini'

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  claude: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
}
export const DEFAULT_MODEL: Record<AIProvider, string> = {
  claude: 'claude-sonnet-4-5',
  gemini: 'gemini-2.0-flash',
}
export const PROVIDER_LABEL: Record<AIProvider, string> = {
  claude: 'Claude（付費金鑰）',
  gemini: 'Gemini（免費金鑰）',
}
export const KEY_HELP: Record<AIProvider, string> = {
  claude: 'console.anthropic.com/settings/keys（需付費額度）',
  gemini: 'aistudio.google.com/apikey（免費、免綁卡）',
}

// 單輪：system + 一則使用者訊息（可含檔案 blocks）
export function runAI(provider: AIProvider, key: string, model: string, system: string, blocks: AIBlock[], maxTokens?: number): Promise<string> {
  return provider === 'gemini' ? geminiAsk(key, model, system, blocks, maxTokens) : claudeAsk(key, model, system, blocks, maxTokens)
}

// 多輪對話
export function runChat(provider: AIProvider, key: string, model: string, system: string, turns: ChatTurn[], maxTokens?: number): Promise<string> {
  return provider === 'gemini'
    ? geminiChat(key, model, system, turns, maxTokens)
    : callClaude({ key, model, system, messages: turns, maxTokens })
}

export async function testAI(provider: AIProvider, key: string, model: string): Promise<void> {
  await runAI(provider, key, model, '只回覆兩個字：成功', [{ type: 'text', text: '測試連線' }], 16)
}

export { AIError, parseJSON, type AIBlock, type ChatTurn }
