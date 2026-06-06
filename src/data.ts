import type { IconName } from './components/Icons'

export interface NavItem {
  id: string
  label: string
  icon: IconName
  badge?: string
}

// 左側邊欄（EducationOS v3.3）
export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'AI 教學引擎', icon: 'sparkles' },
  { id: 'analytics', label: '數據儀表板', icon: 'chart' },
  { id: 'courses', label: '我的課程', icon: 'doc' },
  { id: 'students', label: '學生管理', icon: 'users' },
  { id: 'grades', label: '成績分析', icon: 'pulse' },
  { id: 'ai-assistant', label: 'AI 助教', icon: 'robot' },
  { id: 'library', label: '教學資源庫', icon: 'book' },
  { id: 'settings', label: '系統管理', icon: 'gear' },
]

// 頂部水平導覽
export interface TopNavItem {
  id: string
  label: string
  icon: IconName
  target: string
}
export const topNav: TopNavItem[] = [
  { id: 'overview', label: '總覽', icon: 'home', target: 'dashboard' },
  { id: 'teach', label: '教學', icon: 'doc', target: 'resource' },
  { id: 'learn', label: '學習', icon: 'chart', target: 'analytics' },
  { id: 'assess', label: '評量', icon: 'exam', target: 'exam' },
  { id: 'class', label: '班級', icon: 'board', target: 'classroom' },
  { id: 'resource', label: '資源', icon: 'layers', target: 'library' },
  { id: 'config', label: '設定', icon: 'gear', target: 'settings' },
]

// 中央 5 模組卡（每張含 4 個可點子項與一個統計）
export interface EngineSubItem {
  label: string
  icon: IconName
  target: string
}
export type LiveStat = 'students' | 'classes' | 'examQuestions' | 'essayReviews'
export interface EngineModule {
  id: string
  title: string
  badge?: string
  icon: IconName
  accent: string
  corner: 'tl' | 'tr' | 'bl' | 'br' | 'bc'
  statLabel: string
  statValue: string // 後援值（無 live 時顯示）
  statLive?: LiveStat
  items: EngineSubItem[]
}

export const engineModules: EngineModule[] = [
  {
    id: 'resource', title: '教學套件生成中心', badge: 'v3.3', icon: 'layers', accent: '#3b82f6', corner: 'tl',
    statLabel: '本月生成', statValue: '1,256 套',
    items: [
      { label: 'AI 簡報生成', icon: 'ppt', target: 'resource' },
      { label: 'AI 資訊圖卡生成', icon: 'grid', target: 'resource' },
      { label: 'AI 教學影片生成', icon: 'video', target: 'resource' },
      { label: 'AI Podcast 生成', icon: 'mic', target: 'resource' },
    ],
  },
  {
    id: 'essay', title: 'AI 作文批改中心', badge: 'v2.2', icon: 'pen', accent: '#ec4899', corner: 'tr',
    statLabel: '本月批改', statValue: '2,847 篇', statLive: 'essayReviews',
    items: [
      { label: '作文批改', icon: 'pen', target: 'essay' },
      { label: '錯字分析', icon: 'spell', target: 'essay' },
      { label: '修辭建議', icon: 'sparkles', target: 'essay' },
      { label: 'AI 潤稿', icon: 'wand', target: 'essay' },
    ],
  },
  {
    id: 'analytics', title: '學生學習分析中心', icon: 'chart', accent: '#22d3ee', corner: 'bl',
    statLabel: '分析中', statValue: '328 位學生', statLive: 'students',
    items: [
      { label: '個人能力雷達圖', icon: 'star', target: 'analytics' },
      { label: '各科優劣勢分析', icon: 'chart', target: 'analytics' },
      { label: '班級學習熱圖', icon: 'grid', target: 'analytics' },
      { label: '學習成長曲線', icon: 'pulse', target: 'analytics' },
    ],
  },
  {
    id: 'classroom', title: 'AI 班級經營中心', icon: 'crown', accent: '#f59e0b', corner: 'br',
    statLabel: '班級數', statValue: '24 個', statLive: 'classes',
    items: [
      { label: '點名管理', icon: 'users', target: 'classroom' },
      { label: '行為分析', icon: 'pulse', target: 'classroom' },
      { label: '家長溝通', icon: 'megaphone', target: 'classroom' },
      { label: '課堂儀表板', icon: 'board', target: 'classroom' },
    ],
  },
  {
    id: 'exam', title: 'AI 試題工廠', badge: 'v3.0', icon: 'exam', accent: '#a855f7', corner: 'bc',
    statLabel: '題庫量', statValue: '15,678 題', statLive: 'examQuestions',
    items: [
      { label: '自動命題', icon: 'exam', target: 'exam' },
      { label: '題庫管理', icon: 'layers', target: 'exam' },
      { label: 'Bloom 認知層級分析', icon: 'chart', target: 'exam' },
      { label: '素養題生成', icon: 'star', target: 'exam' },
    ],
  },
]

// 底部快速操作
export interface QuickAction {
  id: string
  label: string
  icon: IconName
  target: string
  accent: string
}
export const quickActions: QuickAction[] = [
  { id: 'q-course', label: '新建課程', icon: 'doc', target: 'courses', accent: '#3b82f6' },
  { id: 'q-upload', label: '上傳資源', icon: 'upload', target: 'library', accent: '#22d3ee' },
  { id: 'q-assign', label: '布置作業', icon: 'board', target: 'classroom', accent: '#34d399' },
  { id: 'q-rollcall', label: '開始點名', icon: 'users', target: 'classroom', accent: '#f59e0b' },
  { id: 'q-exam', label: '生成試卷', icon: 'exam', target: 'exam', accent: '#a855f7' },
  { id: 'q-report', label: '學習報告', icon: 'chart', target: 'analytics', accent: '#ec4899' },
]

// 系統狀態（左下面板）
export interface SystemStat {
  label: string
  value: string
  color: string
  pct?: number
}
export const systemStats: SystemStat[] = [
  { label: 'AI 引擎運行中', value: '98.6%', color: '#34d399', pct: 98.6 },
  { label: '數據處理中', value: '2.4TB', color: '#22d3ee' },
  { label: '今日活躍用戶', value: '12,847', color: '#a855f7' },
  { label: '系統負載', value: '42%', color: '#f59e0b', pct: 42 },
]

// AI 推薦卡
export const aiRecommend = {
  title: '建議使用 AI 圖卡生成器',
  desc: '根據本班學習狀況，建議使用圖卡生成加強視覺學習效果',
  cta: '立即使用',
  target: 'resource',
}

// 右側趨勢圖（4 線）
export interface TrendPoint4 {
  date: string
  overall: number
  knowledge: number
  attitude: number
  homework: number
}
export const trendSeries: TrendPoint4[] = [
  { date: '12/1', overall: 62, knowledge: 58, attitude: 70, homework: 55 },
  { date: '12/5', overall: 68, knowledge: 64, attitude: 66, homework: 72 },
  { date: '12/8', overall: 60, knowledge: 70, attitude: 58, homework: 64 },
  { date: '12/12', overall: 74, knowledge: 68, attitude: 78, homework: 70 },
  { date: '12/15', overall: 80, knowledge: 76, attitude: 72, homework: 82 },
  { date: '12/19', overall: 72, knowledge: 82, attitude: 80, homework: 68 },
  { date: '12/22', overall: 85, knowledge: 78, attitude: 88, homework: 84 },
  { date: '12/26', overall: 79, knowledge: 86, attitude: 76, homework: 90 },
  { date: '12/31', overall: 88, knowledge: 84, attitude: 90, homework: 86 },
]

export const trendLegend4 = [
  { key: 'overall', label: '整體', color: '#3b82f6' },
  { key: 'knowledge', label: '知識掌握', color: '#34d399' },
  { key: 'attitude', label: '學習態度', color: '#fbbf24' },
  { key: 'homework', label: '作業完成', color: '#ec4899' },
] as const

// 通知中心
export interface Notification {
  id: string
  title: string
  time: string
  icon: IconName
  unread: boolean
}
export const notifications: Notification[] = [
  { id: 'n1', title: '王小華 已提交「窗前的月光」作文待批改', time: '3 分鐘前', icon: 'pen', unread: true },
  { id: 'n2', title: '五年甲班 數學小數乘法測驗已完成', time: '18 分鐘前', icon: 'exam', unread: true },
  { id: 'n3', title: 'EducationOS AI 引擎 v3.3 已更新完成', time: '1 小時前', icon: 'sparkles', unread: true },
  { id: 'n4', title: '本週班級學習報告已生成，可供下載', time: '2 小時前', icon: 'chart', unread: false },
  { id: 'n5', title: '陳老師 在「班級經營」留言給你', time: '昨天', icon: 'megaphone', unread: false },
]

// ── 既有：AnalyticsPage 用的趨勢資料（保留） ──
export interface TrendPoint {
  date: string
  hours: number
  completion: number
}
export const trendData30: TrendPoint[] = [
  { date: '04/24', hours: 320, completion: 210 },
  { date: '04/29', hours: 410, completion: 280 },
  { date: '05/01', hours: 690, completion: 360 },
  { date: '05/06', hours: 520, completion: 420 },
  { date: '05/08', hours: 760, completion: 480 },
  { date: '05/13', hours: 640, completion: 540 },
  { date: '05/15', hours: 880, completion: 610 },
  { date: '05/20', hours: 720, completion: 680 },
  { date: '05/22', hours: 940, completion: 760 },
]
export const trendData7: TrendPoint[] = [
  { date: '05/16', hours: 120, completion: 88 },
  { date: '05/17', hours: 150, completion: 102 },
  { date: '05/18', hours: 98, completion: 76 },
  { date: '05/19', hours: 175, completion: 130 },
  { date: '05/20', hours: 160, completion: 121 },
  { date: '05/21', hours: 210, completion: 168 },
  { date: '05/22', hours: 188, completion: 152 },
]
export const trendData90: TrendPoint[] = [
  { date: '03 月', hours: 1820, completion: 1260 },
  { date: '03 中', hours: 2110, completion: 1480 },
  { date: '04 月', hours: 2480, completion: 1760 },
  { date: '04 中', hours: 2320, completion: 1690 },
  { date: '05 月', hours: 2860, completion: 2010 },
  { date: '05 中', hours: 3140, completion: 2380 },
  { date: '今週', hours: 3380, completion: 2760 },
]
