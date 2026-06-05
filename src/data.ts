import type { IconName } from './components/Icons'

export interface NavItem {
  id: string
  label: string
  icon: IconName
  badge?: string
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: '總覽儀表板', icon: 'home' },
  { id: 'content', label: '教學內容生成', icon: 'doc' },
  { id: 'analytics', label: '學習數據中心', icon: 'chart' },
  { id: 'exam', label: 'AI 考試系統 v3.0', icon: 'exam' },
  { id: 'essay', label: '作文批改系統 v2.2', icon: 'pen' },
  { id: 'resource', label: '教學資源生成 v3.3', icon: 'layers' },
  { id: 'classroom', label: '課堂管理系統', icon: 'board' },
  { id: 'students', label: '學生管理', icon: 'users' },
  { id: 'teacher', label: '教師專區', icon: 'teacher' },
  { id: 'library', label: '資源庫', icon: 'book' },
  { id: 'settings', label: '系統設定', icon: 'gear' },
]

export interface SubjectScore {
  subject: string
  classAvg: number
  myClass: number
}

export const radarData: SubjectScore[] = [
  { subject: '國語文', classAvg: 79, myClass: 85 },
  { subject: '數學', classAvg: 74, myClass: 78 },
  { subject: '英語文', classAvg: 88, myClass: 92 },
  { subject: '自然科學', classAvg: 83, myClass: 88 },
  { subject: '社會', classAvg: 70, myClass: 76 },
  { subject: '藝術', classAvg: 72, myClass: 75 },
  { subject: '綜合活動', classAvg: 78, myClass: 82 },
]

export interface TrendPoint {
  date: string
  hours: number
  completion: number
}

// 30-day trend (sampled weekly labels)
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

export interface StatCard {
  id: string
  label: string
  value: string
  unit: string
  delta: string
  trend: 'up' | 'down'
  icon: IconName
  color: string
}

export const statCards: StatCard[] = [
  { id: 'hours', label: '學習總時數', value: '1,234', unit: '小時', delta: '12.5%', trend: 'up', icon: 'clock', color: '#22d3ee' },
  { id: 'completion', label: '完成作業率', value: '89.3', unit: '%', delta: '5.2%', trend: 'up', icon: 'check', color: '#34d399' },
  { id: 'score', label: '平均成績', value: '85.7', unit: '分', delta: '3.1%', trend: 'up', icon: 'star', color: '#a855f7' },
  { id: 'active', label: '學生活躍度', value: '92.1', unit: '%', delta: '7.3%', trend: 'up', icon: 'pulse', color: '#fbbf24' },
]

export interface EngineModule {
  id: string
  title: string
  badge?: string
  desc: string
  cta: string
  icon: IconName
  accent: string
}

// 中央引擎周圍 4 張卡（2+2）。已合併重複的「教學資源生成」為單一張。
export const engineModules: EngineModule[] = [
  { id: 'resource', title: '教學資源生成', badge: 'v3.3', desc: 'PPT · 資訊圖表 · 影片 · Podcast', cta: '開始生成', icon: 'sparkles', accent: '#3b82f6' },
  { id: 'exam', title: 'AI 考試生成器', badge: 'v3.0', desc: '六合一試卷包 · 素養命題', cta: '創建考試', icon: 'exam', accent: '#a855f7' },
  { id: 'analytics', title: '學習數據分析中心', desc: '即時學習分析與洞察', cta: '查看分析', icon: 'chart', accent: '#22d3ee' },
  { id: 'essay', title: '作文批改系統', badge: 'v2.2', desc: 'AI 智能批改與評分', cta: '開始批改', icon: 'pen', accent: '#ec4899' },
]

export interface QuickAction {
  id: string
  target: string // 點擊後導向的 nav/page id
  title: string
  badge?: string
  desc: string
  icon: IconName
  accent: string
}

// 每個 quick action 帶 target = 對應的頁面/nav id，點擊即導向真實頁面
export const quickActions: QuickAction[] = [
  { id: 'q-resource', target: 'resource', title: '教學資源生成 v3.3', desc: '一鍵生成 PPT、資訊圖表、影片、Podcast 等教學內容', icon: 'sparkles', accent: '#3b82f6' },
  { id: 'q-exam', target: 'exam', title: 'AI 考試系統 v3.0', desc: '六合一試卷包：素養命題、自動評分與雙向細目表', icon: 'exam', accent: '#a855f7' },
  { id: 'q-essay', target: 'essay', title: '作文批改系統 v2.2', desc: 'AI 智能批改作文，提供細緻評語與建議', icon: 'pen', accent: '#ec4899' },
  { id: 'q-students', target: 'students', title: '學生管理', desc: '建立班級與學生名單，維護學習數據', icon: 'users', accent: '#22d3ee' },
  { id: 'q-classroom', target: 'classroom', title: '課堂管理系統', desc: '班級管理、作業布置、成績管理一站式服務', icon: 'board', accent: '#34d399' },
]

export interface Notification {
  id: string
  title: string
  time: string
  icon: IconName
  unread: boolean
}

export const notifications: Notification[] = [
  { id: 'n1', title: '王小華 已提交「窗前的月光」作文批改', time: '3 分鐘前', icon: 'pen', unread: true },
  { id: 'n2', title: '五年甲班 數學小數乘法測驗已完成', time: '18 分鐘前', icon: 'exam', unread: true },
  { id: 'n3', title: 'AI 教學引擎 v4.5 模型已更新完成', time: '1 小時前', icon: 'sparkles', unread: true },
  { id: 'n4', title: '本週班級學習報告已生成，可供下載', time: '2 小時前', icon: 'chart', unread: false },
  { id: 'n5', title: '陳老師 在「課堂管理」留言給你', time: '昨天', icon: 'users', unread: false },
]
