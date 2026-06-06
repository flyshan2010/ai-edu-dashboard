import { useEffect, useState } from 'react'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

export function Clock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const t0 = setTimeout(() => setNow(new Date()), 0)
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearTimeout(t0)
      clearInterval(t)
    }
  }, [])

  if (!now) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const date = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 星期${WEEK[now.getDay()]}`

  return (
    <div className="px-1">
      <div className="orbitron text-2xl font-extrabold tracking-wider text-cyan-glow neon-text">{time}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{date}</div>
    </div>
  )
}
