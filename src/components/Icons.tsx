import type { SVGProps, ReactElement } from 'react'

export type IconName =
  | 'home' | 'doc' | 'chart' | 'exam' | 'pen' | 'layers' | 'board'
  | 'users' | 'teacher' | 'book' | 'gear' | 'sparkles' | 'clock'
  | 'check' | 'star' | 'pulse' | 'bell' | 'help' | 'search'
  | 'diamond' | 'arrow' | 'ppt' | 'video' | 'mic' | 'close'

type P = SVGProps<SVGSVGElement>

const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

const paths: Record<IconName, ReactElement> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  doc: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  exam: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  pen: <><path d="M4 20l4-1L20 7l-3-3L5 16z" /><path d="M14 6l3 3" /></>,
  layers: <><path d="M12 3 3 8l9 5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  board: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></>,
  teacher: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /><path d="M12 11v3" /></>,
  book: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z" /><path d="M5 4v16" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  sparkles: <><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9" /></>,
  star: <><path d="M12 3l2.6 5.6L21 9.4l-4.5 4.3L17.6 21 12 17.8 6.4 21l1.1-7.3L3 9.4l6.4-.8z" /></>,
  pulse: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" /><path d="M12 17h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  diamond: <><path d="M6 3h12l3 5-9 13L3 8z" /><path d="M3 8h18M9 3 6 8l6 13 6-13-3-5" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  ppt: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M8 8h5a2 2 0 0 1 0 4H8zM8 8v5" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
}

export function Icon({ name, ...props }: { name: IconName } & P) {
  return <svg {...base(props)}>{paths[name]}</svg>
}
