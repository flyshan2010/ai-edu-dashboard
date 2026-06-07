import { createContext, useContext } from 'react'

export const SUBJECTS = ['國語文', '數學', '英語文', '自然科學', '社會', '藝術', '綜合活動'] as const
export type Subject = (typeof SUBJECTS)[number]

export interface ClassInfo {
  id: string
  name: string
  grade: string
}

export interface Student {
  id: string
  classId: string
  seatNo: number
  name: string
  studyHours: number // 學習時數（小時）
  completion: number // 完成作業率 0-100
  activity: number // 活躍度 0-100
  subjects: Record<Subject, number> // 各科成績 0-100
  points?: number // 班級經營：代幣／積分
}

// connecting：初始化中；auth：待 Email 登入；cloud：已登入並雲端同步；local：離線本機模式
export type CloudStatus = 'connecting' | 'auth' | 'cloud' | 'local'

export interface AuthUser {
  uid: string
  email: string | null
}

export interface ExamQuestion {
  id: string
  subject: string
  grade: string
  topic: string
  type: string // 選擇/填充/問答…
  bloom: string
  stem: string
  createdAt: number
}

export interface EssayReview {
  id: string
  title: string
  genre: string
  studentName: string
  gradeLevel: string // 等第 甲上/甲/乙…
  scoreSummary: string
  createdAt: number
}

export interface TeacherProfile {
  name: string
  title: string
  school: string
}

export interface Course {
  id: string
  name: string
  grade: string
  unit: string
  progress: number // 0-100
  createdAt: number
}

export interface ResourceItem {
  id: string
  title: string
  type: string // 簡報/影片/試卷/資訊圖卡/Podcast/批改報告
  subject: string
  grade: string
  createdAt: number
  content?: string // AI 生成的內容（Markdown），供前台預覽與下載
  format?: string // 'docx' | 'pptx' | 'html' | 'pdf' | 'six-in-one'
}

export interface AppStoreValue {
  cloudStatus: CloudStatus
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  useLocalMode: () => void
  aiProvider: 'claude' | 'gemini'
  aiKey: string
  aiModel: string
  setAIConfig: (provider: 'claude' | 'gemini', key: string, model: string) => void
  teacher: TeacherProfile
  updateTeacher: (patch: Partial<TeacherProfile>) => void
  classes: ClassInfo[]
  students: Student[]
  examQuestions: ExamQuestion[]
  essayReviews: EssayReview[]
  courses: Course[]
  resources: ResourceItem[]
  addExamQuestion: (q: Omit<ExamQuestion, 'id'>) => void
  removeExamQuestion: (id: string) => void
  addEssayReview: (r: Omit<EssayReview, 'id'>) => void
  removeEssayReview: (id: string) => void
  addCourse: (c: Omit<Course, 'id'>) => void
  removeCourse: (id: string) => void
  addResource: (r: Omit<ResourceItem, 'id'>) => void
  removeResource: (id: string) => void
  selectedClassId: string | null
  setSelectedClassId: (id: string | null) => void
  addClass: (c: Omit<ClassInfo, 'id'>) => string
  updateClass: (id: string, patch: Partial<Omit<ClassInfo, 'id'>>) => void
  removeClass: (id: string) => void
  addStudent: (s: Omit<Student, 'id'>) => void
  updateStudent: (id: string, patch: Partial<Omit<Student, 'id' | 'classId'>>) => void
  removeStudent: (id: string) => void
  resetDemo: () => void
}

export const AppStoreContext = createContext<AppStoreValue | null>(null)

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore 必須在 AppStoreProvider 內使用')
  return ctx
}

// ── 衍生計算：某學生陣列的平均成績 ──
export function avgScore(s: Student): number {
  const vals = SUBJECTS.map((sub) => s.subjects[sub] ?? 0)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export interface ClassSummary {
  count: number
  totalHours: number
  avgCompletion: number
  avgScore: number
  avgActivity: number
}

export function summarize(students: Student[]): ClassSummary {
  if (!students.length) {
    return { count: 0, totalHours: 0, avgCompletion: 0, avgScore: 0, avgActivity: 0 }
  }
  const n = students.length
  const totalHours = students.reduce((a, s) => a + s.studyHours, 0)
  const avgCompletion = students.reduce((a, s) => a + s.completion, 0) / n
  const avgAct = students.reduce((a, s) => a + s.activity, 0) / n
  const avgSc = students.reduce((a, s) => a + avgScore(s), 0) / n
  return {
    count: n,
    totalHours: Math.round(totalHours),
    avgCompletion: Math.round(avgCompletion * 10) / 10,
    avgScore: Math.round(avgSc * 10) / 10,
    avgActivity: Math.round(avgAct * 10) / 10,
  }
}

// 各科平均（給雷達圖用）
export function subjectAverages(students: Student[]): Record<Subject, number> {
  const out = {} as Record<Subject, number>
  for (const sub of SUBJECTS) {
    if (!students.length) {
      out[sub] = 0
    } else {
      out[sub] = Math.round(
        students.reduce((a, s) => a + (s.subjects[sub] ?? 0), 0) / students.length,
      )
    }
  }
  return out
}
