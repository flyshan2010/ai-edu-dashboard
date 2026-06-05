import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AppStoreContext,
  SUBJECTS,
  type ClassInfo,
  type Student,
  type Subject,
} from './useAppStore'

const LS_KEY = 'aiedu.store.v1'

interface Persisted {
  classes: ClassInfo[]
  students: Student[]
  selectedClassId: string | null
}

let idSeq = 0
function uid(prefix: string): string {
  idSeq += 1
  // 事件處理中呼叫（非 render），可安全使用時間戳避免碰撞
  return `${prefix}_${Date.now().toString(36)}_${idSeq}`
}

function mkSubjects(base: number, spread = 12): Record<Subject, number> {
  const out = {} as Record<Subject, number>
  SUBJECTS.forEach((s, i) => {
    // 以 base 為中心做確定性微調，避免每次 render 變動
    const delta = ((i * 7) % spread) - spread / 2
    out[s] = Math.max(40, Math.min(100, Math.round(base + delta)))
  })
  return out
}

function demoData(): Persisted {
  const classId = 'cls_demo_5a'
  const classes: ClassInfo[] = [{ id: classId, name: '五年甲班', grade: '五年級' }]
  const seed: Array<[number, string, number, number, number, number]> = [
    // 座號, 姓名, 學習時數, 完成率, 活躍度, 成績基準
    [1, '王小華', 168, 92, 95, 88],
    [2, '陳怡君', 152, 88, 90, 85],
    [3, '林宥廷', 140, 80, 78, 76],
    [4, '張雅婷', 175, 95, 96, 92],
    [5, '黃柏睿', 130, 72, 70, 70],
    [6, '吳采蓉', 160, 90, 88, 84],
    [7, '劉冠霖', 145, 84, 82, 79],
    [8, '蔡欣妤', 158, 89, 91, 86],
  ]
  const students: Student[] = seed.map(([seatNo, name, studyHours, completion, activity, base]) => ({
    id: `stu_demo_${seatNo}`,
    classId,
    seatNo,
    name,
    studyHours,
    completion,
    activity,
    subjects: mkSubjects(base),
  }))
  return { classes, students, selectedClassId: classId }
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted
      if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
        return parsed
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return demoData()
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // 以 lazy initializer 讀取一次（load 只在首次 render 執行）
  const [seed] = useState<Persisted>(load)
  const [classes, setClasses] = useState<ClassInfo[]>(seed.classes)
  const [students, setStudents] = useState<Student[]>(seed.students)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(seed.selectedClassId)

  // 持久化
  useEffect(() => {
    const data: Persisted = { classes, students, selectedClassId }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    } catch {
      /* storage 滿或被禁用，略過 */
    }
  }, [classes, students, selectedClassId])

  const addClass = useCallback((c: Omit<ClassInfo, 'id'>) => {
    const id = uid('cls')
    setClasses((prev) => [...prev, { ...c, id }])
    setSelectedClassId((cur) => cur ?? id)
    return id
  }, [])

  const updateClass = useCallback((id: string, patch: Partial<Omit<ClassInfo, 'id'>>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const removeClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.classId !== id))
    setSelectedClassId((cur) => (cur === id ? null : cur))
  }, [])

  const addStudent = useCallback((s: Omit<Student, 'id'>) => {
    setStudents((prev) => [...prev, { ...s, id: uid('stu') }])
  }, [])

  const updateStudent = useCallback(
    (id: string, patch: Partial<Omit<Student, 'id' | 'classId'>>) => {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },
    [],
  )

  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const resetDemo = useCallback(() => {
    const d = demoData()
    setClasses(d.classes)
    setStudents(d.students)
    setSelectedClassId(d.selectedClassId)
  }, [])

  const value = useMemo(
    () => ({
      classes,
      students,
      selectedClassId,
      setSelectedClassId,
      addClass,
      updateClass,
      removeClass,
      addStudent,
      updateStudent,
      removeStudent,
      resetDemo,
    }),
    [classes, students, selectedClassId, addClass, updateClass, removeClass, addStudent, updateStudent, removeStudent, resetDemo],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}
