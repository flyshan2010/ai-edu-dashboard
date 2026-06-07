import type { AIBlock } from './anthropic'

export interface ParsedFile {
  name: string
  kind: 'text' | 'image' | 'pdf' | 'docx'
  block: AIBlock
  preview: string // 給使用者看的簡短說明
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result ?? ''))
    r.onerror = () => reject(new Error('讀取失敗'))
    r.readAsText(file)
  })
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const s = String(r.result ?? '')
      resolve(s.slice(s.indexOf(',') + 1)) // 去掉 data:...;base64,
    }
    r.onerror = () => reject(new Error('讀取失敗'))
    r.readAsDataURL(file)
  })
}

// 將上傳檔案轉成 Claude 可讀的 content block
export async function parseFile(file: File): Promise<ParsedFile> {
  const name = file.name
  const lower = name.toLowerCase()
  const type = file.type

  // 圖片 → vision
  if (type.startsWith('image/')) {
    const data = await readAsBase64(file)
    return { name, kind: 'image', preview: `圖片：${name}`, block: { type: 'image', source: { type: 'base64', media_type: type, data } } }
  }
  // PDF → document block（Claude 原生讀取）
  if (type === 'application/pdf' || lower.endsWith('.pdf')) {
    const data = await readAsBase64(file)
    return { name, kind: 'pdf', preview: `PDF：${name}`, block: { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } } }
  }
  // Word → mammoth 抽純文字
  if (lower.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth')
    const buf = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf })
    return { name, kind: 'docx', preview: `Word：${name}（${value.length} 字）`, block: { type: 'text', text: `【檔案：${name}】\n${value}` } }
  }
  // 其餘當純文字（txt/md/csv…）
  const text = await readAsText(file)
  return { name, kind: 'text', preview: `文字檔：${name}（${text.length} 字）`, block: { type: 'text', text: `【檔案：${name}】\n${text}` } }
}

export async function parseFiles(files: FileList | File[]): Promise<ParsedFile[]> {
  const arr = Array.from(files)
  const out: ParsedFile[] = []
  for (const f of arr) out.push(await parseFile(f))
  return out
}
