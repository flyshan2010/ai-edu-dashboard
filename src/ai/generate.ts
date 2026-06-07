// 客戶端檔案產生器：把 AI 產出的 Markdown / 投影片結構轉成可下載的 HTML / Word / PPTX / PDF。
// 重型函式庫（docx / pptxgenjs）以動態 import 延遲載入。

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

// 清掉 AI 偶爾輸出的 HTML 標籤／實體（如 &emsp; &nbsp; <br>），改為一般空白
export function cleanMd(s: string): string {
  return s
    .replace(/&(?:emsp|ensp|nbsp|thinsp|#8195|#8194|#160);/g, '　')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
}

// ── 極簡 Markdown → HTML（標題/清單/粗體/段落/水平線/表格列） ──
function inline(s: string): string {
  return cleanMd(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

export function mdToHtmlBody(md: string): string {
  const lines = cleanMd(md).split('\n')
  let html = ''
  let inList = false
  const closeList = () => { if (inList) { html += '</ul>'; inList = false } }
  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = line.match(/^(#{1,6})\s+(.*)/)
    if (h) { closeList(); const lvl = Math.min(h[1].length, 4); html += `<h${lvl}>${inline(h[2])}</h${lvl}>` }
    else if (/^[-*]\s+/.test(line)) { if (!inList) { html += '<ul>'; inList = true } html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>` }
    else if (/^(-{3,}|={3,})$/.test(line)) { closeList(); html += '<hr/>' }
    else if (line === '') { closeList() }
    else { closeList(); html += `<p>${inline(line)}</p>` }
  }
  closeList()
  return html
}

export function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
:root{color-scheme:light}
body{font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;max-width:820px;margin:32px auto;padding:0 20px;line-height:1.8;color:#1f2937}
h1{font-size:26px;border-bottom:3px solid #2563eb;padding-bottom:8px;color:#1e3a8a}
h2{font-size:20px;color:#1d4ed8;margin-top:24px;border-left:4px solid #2563eb;padding-left:10px}
h3{font-size:16px;color:#374151;margin-top:18px}
h4{font-size:14px;color:#475569;margin-top:14px}
ul{padding-left:22px} li{margin:4px 0}
code{background:#f1f5f9;padding:1px 5px;border-radius:4px}
hr{border:none;border-top:1px solid #e5e7eb;margin:18px 0}
@media print{body{margin:0}}
</style></head><body>${bodyHtml}</body></html>`
}

export function downloadHtml(title: string, md: string) {
  downloadBlob(`${title}.html`, new Blob([wrapHtml(title, mdToHtmlBody(md))], { type: 'text/html;charset=utf-8' }))
}

// PDF：開新視窗載入 HTML 後呼叫列印（使用者另存為 PDF，中文完整、零相依）
export function printToPdf(title: string, md: string) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(wrapHtml(title, mdToHtmlBody(md)))
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
}

// Word .docx（lazy docx）
export async function downloadDocx(title: string, md: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
  const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4]
  const runs = (s: string) => {
    const parts = cleanMd(s).split(/(\*\*.+?\*\*)/g).filter(Boolean)
    return parts.map((p) => p.startsWith('**') && p.endsWith('**')
      ? new TextRun({ text: p.slice(2, -2), bold: true })
      : new TextRun(p))
  }
  const paras: InstanceType<typeof Paragraph>[] = []
  for (const raw of cleanMd(md).split('\n')) {
    const line = raw.trimEnd()
    const h = line.match(/^(#{1,6})\s+(.*)/)
    if (h) paras.push(new Paragraph({ heading: HEADINGS[Math.min(h[1].length, 4) - 1], children: runs(h[2]) }))
    else if (/^[-*]\s+/.test(line)) paras.push(new Paragraph({ bullet: { level: 0 }, children: runs(line.replace(/^[-*]\s+/, '')) }))
    else if (line === '') paras.push(new Paragraph({ children: [] }))
    else paras.push(new Paragraph({ children: runs(line) }))
  }
  const doc = new Document({ sections: [{ children: paras }] })
  const blob = await Packer.toBlob(doc)
  downloadBlob(`${title}.docx`, blob)
}

// ── Excel（.xlsx）：給配分答案卡、雙向細目表用 ──
export async function downloadXlsx(filename: string, sheets: { name: string; aoa: (string | number)[][] }[]) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.aoa)
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 28) || 'Sheet1')
  }
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// 免金鑰生圖（Pollinations）：把英文描述轉成圖片 URL
export function imageUrl(prompt: string): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=432&nologo=true`
}

async function urlToDataUrl(url: string): Promise<string> {
  const r = await fetch(url)
  if (!r.ok) throw new Error('image fetch failed')
  const blob = await r.blob()
  return await new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = () => rej(new Error('read failed'))
    fr.readAsDataURL(blob)
  })
}

// ── 投影片 ──
export interface Slide { title: string; bullets: string[]; notes?: string; image?: string }

export function slidesToMd(deckTitle: string, slides: Slide[]): string {
  let md = `# ${deckTitle}\n\n`
  slides.forEach((s, i) => {
    md += `## ${i + 1}. ${s.title}\n`
    s.bullets.forEach((b) => { md += `- ${b}\n` })
    if (s.notes) md += `\n> 備註：${s.notes}\n`
    md += '\n'
  })
  return md
}

export function downloadSlidesHtml(deckTitle: string, slides: Slide[]) {
  const body = slides.map((s, i) => `<section style="page-break-after:always;min-height:90vh;padding:40px;border-bottom:2px dashed #cbd5e1">
    <div style="font-size:12px;color:#94a3b8">第 ${i + 1} 頁 / 共 ${slides.length} 頁</div>
    <h1>${s.title.replace(/</g, '&lt;')}</h1>
    ${s.image ? `<img src="${s.image}" alt="" style="float:right;width:42%;border-radius:10px;margin:0 0 12px 16px"/>` : ''}
    <ul style="font-size:20px">${s.bullets.map((b) => `<li>${b.replace(/</g, '&lt;')}</li>`).join('')}</ul>
  </section>`).join('')
  downloadBlob(`${deckTitle}.html`, new Blob([wrapHtml(deckTitle, body)], { type: 'text/html;charset=utf-8' }))
}

export function printSlidesPdf(deckTitle: string, slides: Slide[]) {
  const body = slides.map((s, i) => `<section style="page-break-after:always;padding:24px">
    <div style="font-size:12px;color:#94a3b8">第 ${i + 1} 頁</div>
    <h1>${s.title.replace(/</g, '&lt;')}</h1>
    <ul style="font-size:20px">${s.bullets.map((b) => `<li>${b.replace(/</g, '&lt;')}</li>`).join('')}</ul></section>`).join('')
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(wrapHtml(deckTitle, body)); w.document.close(); w.focus()
  setTimeout(() => w.print(), 400)
}

export async function downloadPptx(deckTitle: string, slides: Slide[]) {
  const mod = await import('pptxgenjs')
  const PptxGenJS = mod.default
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'W', width: 10, height: 5.63 })
  pptx.layout = 'W'
  // 封面
  const cover = pptx.addSlide()
  cover.background = { color: '0B1633' }
  cover.addText(deckTitle, { x: 0.5, y: 2.1, w: 9, h: 1.2, fontSize: 36, bold: true, color: '7DD3FC', align: 'center', fontFace: 'Noto Sans TC' })
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]
    const sl = pptx.addSlide()
    sl.background = { color: 'FFFFFF' }
    sl.addText(`${i + 1}. ${s.title}`, { x: 0.5, y: 0.35, w: 9, h: 0.8, fontSize: 24, bold: true, color: '1E3A8A', fontFace: 'Noto Sans TC' })
    let hasImg = false
    if (s.image) {
      try { const data = await urlToDataUrl(s.image); sl.addImage({ data, x: 6.1, y: 1.3, w: 3.4, h: 1.9 }); hasImg = true } catch { /* 圖載入失敗則略過 */ }
    }
    sl.addText(s.bullets.map((b) => ({ text: b, options: { bullet: true, fontSize: 16, color: '334155', paraSpaceAfter: 8, fontFace: 'Noto Sans TC' } })),
      { x: 0.7, y: 1.3, w: hasImg ? 5.1 : 8.6, h: 3.8, valign: 'top' })
    if (s.notes) sl.addNotes(s.notes)
  }
  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  downloadBlob(`${deckTitle}.pptx`, blob)
}
