import { useRef, useState } from 'react'
import { Icon } from './Icons'

interface Props {
  files: File[]
  onFiles: (files: File[]) => void
  accept?: string
  label?: string
  hint?: string
  multiple?: boolean
}

export function FileDrop({ files, onFiles, accept, label = '上傳檔案', hint, multiple = true }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const add = (list: FileList | null) => {
    if (!list || !list.length) return
    const incoming = Array.from(list)
    onFiles(multiple ? [...files, ...incoming] : incoming.slice(0, 1))
  }

  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files) }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${over ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-cyan-400/20 bg-white/[0.02] hover:border-cyan-400/40'}`}
      >
        <Icon name="upload" width={24} height={24} className="text-cyan-glow" />
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { add(e.target.files); if (ref.current) ref.current.value = '' }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="flex items-center gap-1.5 rounded-lg border border-cyan-400/15 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300">
              <Icon name="doc" width={12} height={12} className="text-cyan-glow" />
              {f.name}
              <button onClick={(e) => { e.stopPropagation(); onFiles(files.filter((_, j) => j !== i)) }} className="text-slate-500 hover:text-neon-pink"><Icon name="close" width={12} height={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
