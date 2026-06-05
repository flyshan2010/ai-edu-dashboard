import { useCallback, useState, type ReactNode } from 'react'
import { Icon } from './Icons'
import { ToastContext } from './toast-context'

interface ToastItem {
  id: number
  message: string
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((message: string) => {
    const id = ++counter
    setItems((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="panel bracket flex items-center gap-3 rounded-xl border-cyan-400/40 px-4 py-3 text-sm text-cyan-50 shadow-glow animate-[float_0.4s_ease]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/20 text-cyan-glow">
              <Icon name="sparkles" width={16} height={16} />
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
