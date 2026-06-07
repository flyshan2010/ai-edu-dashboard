import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import {
  AppStoreContext,
  SUBJECTS,
  type AuthUser,
  type ClassInfo,
  type CloudStatus,
  type Course,
  type EssayReview,
  type ExamQuestion,
  type ResourceItem,
  type Student,
  type Subject,
  type TeacherProfile,
} from './useAppStore'

const DEFAULT_TEACHER: TeacherProfile = { name: '王老師', title: '教師', school: '崑山國小' }
const LS_TEACHER = 'aiedu.teacher.v1'
const LS_AUX = 'aiedu.aux.v1' // courses + resources（本機模式）
const LS_AIKEY = 'aiedu.anthropic.key'
const LS_AIMODEL = 'aiedu.anthropic.model'
const LS_AIPROVIDER = 'aiedu.ai.provider'
const DEFAULT_MODELS = { claude: 'claude-sonnet-4-5', gemini: 'gemini-flash-latest' } as const
const DEFAULT_AI_MODEL = DEFAULT_MODELS.gemini
// 已淘汰／易失敗的舊預設，載入時自動遷移到最新 alias
const STALE_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'claude-3-5-haiku-latest'])

const LS_KEY = 'aiedu.store.v1'
const LS_SELECTED = 'aiedu.selectedClass'
const LS_SEEDED = 'aiedu.cloud.seeded.v1'

interface Persisted {
  classes: ClassInfo[]
  students: Student[]
  selectedClassId: string | null
}

let idSeq = 0
function uid(prefix: string): string {
  idSeq += 1
  return `${prefix}_${Date.now().toString(36)}_${idSeq}`
}

function studentToDoc(s: Student): Omit<Student, 'id'> {
  return {
    classId: s.classId,
    seatNo: s.seatNo,
    name: s.name,
    studyHours: s.studyHours,
    completion: s.completion,
    activity: s.activity,
    subjects: s.subjects,
  }
}

function mkSubjects(base: number, spread = 12): Record<Subject, number> {
  const out = {} as Record<Subject, number>
  SUBJECTS.forEach((s, i) => {
    const delta = ((i * 7) % spread) - spread / 2
    out[s] = Math.max(40, Math.min(100, Math.round(base + delta)))
  })
  return out
}

function demoData(): Persisted {
  const classId = 'cls_demo_5a'
  const classes: ClassInfo[] = [{ id: classId, name: '五年甲班', grade: '五年級' }]
  const seed: Array<[number, string, number, number, number, number]> = [
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

function loadLocal(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted
      if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) return parsed
    }
  } catch {
    /* ignore */
  }
  return demoData()
}

function loadSelected(): string | null {
  try {
    return localStorage.getItem(LS_SELECTED)
  } catch {
    return null
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [seed] = useState<Persisted>(loadLocal)
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('connecting')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([])
  const [essayReviews, setEssayReviews] = useState<EssayReview[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    try {
      const raw = localStorage.getItem(LS_TEACHER)
      if (raw) return { ...DEFAULT_TEACHER, ...JSON.parse(raw) }
    } catch { /* ignore */ }
    return DEFAULT_TEACHER
  })
  const [selectedClassId, setSelectedClassIdState] = useState<string | null>(
    loadSelected() ?? seed.selectedClassId,
  )

  const [aiProvider, setAiProvider] = useState<'claude' | 'gemini'>(() => {
    try { return localStorage.getItem(LS_AIPROVIDER) === 'claude' ? 'claude' : 'gemini' } catch { return 'gemini' }
  })
  const [aiKey, setAiKey] = useState<string>(() => {
    try { return localStorage.getItem(LS_AIKEY) ?? '' } catch { return '' }
  })
  const [aiModel, setAiModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LS_AIMODEL)
      if (!saved || STALE_MODELS.has(saved)) return DEFAULT_AI_MODEL
      return saved
    } catch { return DEFAULT_AI_MODEL }
  })
  const setAIConfig = useCallback((provider: 'claude' | 'gemini', key: string, model: string) => {
    const m = model.trim() || DEFAULT_MODELS[provider]
    setAiProvider(provider)
    setAiKey(key.trim())
    setAiModel(m)
    try {
      localStorage.setItem(LS_AIPROVIDER, provider)
      if (key.trim()) localStorage.setItem(LS_AIKEY, key.trim()); else localStorage.removeItem(LS_AIKEY)
      localStorage.setItem(LS_AIMODEL, m)
    } catch { /* ignore */ }
  }, [])

  const uidRef = useRef<string | null>(null)
  const modeRef = useRef<CloudStatus>('connecting')
  useEffect(() => {
    modeRef.current = cloudStatus
  }, [cloudStatus])

  const subsRef = useRef<Array<() => void>>([])
  const clearSubs = () => {
    subsRef.current.forEach((u) => u())
    subsRef.current = []
  }

  const setSelectedClassId = useCallback((id: string | null) => {
    setSelectedClassIdState(id)
    try {
      if (id) localStorage.setItem(LS_SELECTED, id)
      else localStorage.removeItem(LS_SELECTED)
    } catch {
      /* ignore */
    }
  }, [])

  async function seedCloudIfEmpty() {
    try {
      if (localStorage.getItem(LS_SEEDED)) return
      const [cSnap, sSnap] = await Promise.all([
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'students')),
      ])
      if (cSnap.empty && sSnap.empty) {
        const d = demoData()
        const batch = writeBatch(db)
        d.classes.forEach((c) => batch.set(doc(db, 'classes', c.id), { name: c.name, grade: c.grade }))
        d.students.forEach((s) => batch.set(doc(db, 'students', s.id), studentToDoc(s)))
        await batch.commit()
      }
      localStorage.setItem(LS_SEEDED, '1')
    } catch {
      /* non-fatal */
    }
  }

  // ── 監聽登入狀態 ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email })
        uidRef.current = fbUser.uid
        await seedCloudIfEmpty()
        clearSubs()
        subsRef.current.push(
          onSnapshot(collection(db, 'classes'), (snap) => {
            setClasses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClassInfo, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(collection(db, 'students'), (snap) => {
            setStudents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Student, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(collection(db, 'examQuestions'), (snap) => {
            setExamQuestions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExamQuestion, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(collection(db, 'essayReviews'), (snap) => {
            setEssayReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EssayReview, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(collection(db, 'courses'), (snap) => {
            setCourses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(collection(db, 'resources'), (snap) => {
            setResources(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResourceItem, 'id'>) })))
          }),
        )
        subsRef.current.push(
          onSnapshot(doc(db, 'teachers', fbUser.uid), (snap) => {
            if (snap.exists()) setTeacher({ ...DEFAULT_TEACHER, ...(snap.data() as Partial<TeacherProfile>) })
          }),
        )
        setCloudStatus('cloud')
      } else {
        setUser(null)
        uidRef.current = null
        clearSubs()
        // 若使用者選了本機模式則維持，否則進入待登入
        setCloudStatus((prev) => (prev === 'local' ? 'local' : 'auth'))
      }
    })
    return () => {
      unsub()
      clearSubs()
    }
  }, [])

  // ── 教師資料持久化（任何模式皆存本機作快取）──
  useEffect(() => {
    try { localStorage.setItem(LS_TEACHER, JSON.stringify(teacher)) } catch { /* ignore */ }
  }, [teacher])

  // ── 本機模式持久化 ──
  useEffect(() => {
    if (cloudStatus !== 'local') return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ classes, students, selectedClassId }))
      localStorage.setItem(LS_AUX, JSON.stringify({ courses, resources }))
    } catch {
      /* ignore */
    }
  }, [cloudStatus, classes, students, selectedClassId, courses, resources])

  const isCloud = () => modeRef.current === 'cloud'

  // ── Auth 操作 ──
  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])
  const register = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])
  const signOutUser = useCallback(async () => {
    await signOut(auth)
  }, [])
  const useLocalMode = useCallback(() => {
    const local = loadLocal()
    setClasses(local.classes)
    setStudents(local.students)
    try {
      const aux = JSON.parse(localStorage.getItem(LS_AUX) ?? '{}')
      setCourses(Array.isArray(aux.courses) ? aux.courses : [])
      setResources(Array.isArray(aux.resources) ? aux.resources : [])
    } catch { /* ignore */ }
    setCloudStatus('local')
  }, [])

  // ── CRUD ──
  const addClass = useCallback((c: Omit<ClassInfo, 'id'>) => {
    if (isCloud()) {
      const ref = doc(collection(db, 'classes'))
      void setDoc(ref, c)
      setSelectedClassId(ref.id)
      return ref.id
    }
    const id = uid('cls')
    setClasses((prev) => [...prev, { ...c, id }])
    setSelectedClassId(id)
    return id
  }, [setSelectedClassId])

  const updateClass = useCallback((id: string, patch: Partial<Omit<ClassInfo, 'id'>>) => {
    if (isCloud()) {
      void updateDoc(doc(db, 'classes', id), patch)
      return
    }
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const removeClass = useCallback(
    (id: string) => {
      if (isCloud()) {
        void (async () => {
          const q = await getDocs(query(collection(db, 'students'), where('classId', '==', id)))
          const batch = writeBatch(db)
          q.forEach((d) => batch.delete(d.ref))
          batch.delete(doc(db, 'classes', id))
          await batch.commit()
        })()
        if (selectedClassId === id) setSelectedClassId(null)
        return
      }
      setClasses((prev) => prev.filter((c) => c.id !== id))
      setStudents((prev) => prev.filter((s) => s.classId !== id))
      if (selectedClassId === id) setSelectedClassId(null)
    },
    [selectedClassId, setSelectedClassId],
  )

  const addStudent = useCallback((s: Omit<Student, 'id'>) => {
    if (isCloud()) {
      const ref = doc(collection(db, 'students'))
      void setDoc(ref, s)
      return
    }
    setStudents((prev) => [...prev, { ...s, id: uid('stu') }])
  }, [])

  const updateStudent = useCallback((id: string, patch: Partial<Omit<Student, 'id' | 'classId'>>) => {
    if (isCloud()) {
      void updateDoc(doc(db, 'students', id), patch)
      return
    }
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const removeStudent = useCallback((id: string) => {
    if (isCloud()) {
      void deleteDoc(doc(db, 'students', id))
      return
    }
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addExamQuestion = useCallback((q: Omit<ExamQuestion, 'id'>) => {
    if (isCloud()) {
      void setDoc(doc(collection(db, 'examQuestions')), q)
      return
    }
    setExamQuestions((prev) => [{ ...q, id: uid('q') }, ...prev])
  }, [])
  const removeExamQuestion = useCallback((id: string) => {
    if (isCloud()) {
      void deleteDoc(doc(db, 'examQuestions', id))
      return
    }
    setExamQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])
  const addEssayReview = useCallback((r: Omit<EssayReview, 'id'>) => {
    if (isCloud()) {
      void setDoc(doc(collection(db, 'essayReviews')), r)
      return
    }
    setEssayReviews((prev) => [{ ...r, id: uid('e') }, ...prev])
  }, [])
  const removeEssayReview = useCallback((id: string) => {
    if (isCloud()) {
      void deleteDoc(doc(db, 'essayReviews', id))
      return
    }
    setEssayReviews((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const updateTeacher = useCallback((patch: Partial<TeacherProfile>) => {
    setTeacher((prev) => ({ ...prev, ...patch }))
    if (isCloud() && uidRef.current) {
      void setDoc(doc(db, 'teachers', uidRef.current), patch, { merge: true })
    }
  }, [])

  const addCourse = useCallback((c: Omit<Course, 'id'>) => {
    if (isCloud()) { void setDoc(doc(collection(db, 'courses')), c); return }
    setCourses((prev) => [{ ...c, id: uid('course') }, ...prev])
  }, [])
  const removeCourse = useCallback((id: string) => {
    if (isCloud()) { void deleteDoc(doc(db, 'courses', id)); return }
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addResource = useCallback((r: Omit<ResourceItem, 'id'>) => {
    if (isCloud()) { void setDoc(doc(collection(db, 'resources')), r); return }
    setResources((prev) => [{ ...r, id: uid('res') }, ...prev])
  }, [])
  const removeResource = useCallback((id: string) => {
    if (isCloud()) { void deleteDoc(doc(db, 'resources', id)); return }
    setResources((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const resetDemo = useCallback(() => {
    const d = demoData()
    if (isCloud()) {
      void (async () => {
        const [cSnap, sSnap] = await Promise.all([
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'students')),
        ])
        const clearBatch = writeBatch(db)
        cSnap.forEach((x) => clearBatch.delete(x.ref))
        sSnap.forEach((x) => clearBatch.delete(x.ref))
        await clearBatch.commit()
        const seedBatch = writeBatch(db)
        d.classes.forEach((c) => seedBatch.set(doc(db, 'classes', c.id), { name: c.name, grade: c.grade }))
        d.students.forEach((s) => seedBatch.set(doc(db, 'students', s.id), studentToDoc(s)))
        await seedBatch.commit()
      })()
      setSelectedClassId(d.selectedClassId)
      return
    }
    setClasses(d.classes)
    setStudents(d.students)
    setSelectedClassId(d.selectedClassId)
  }, [setSelectedClassId])

  const value = useMemo(
    () => ({
      cloudStatus,
      user,
      signIn,
      register,
      signOutUser,
      useLocalMode,
      aiProvider,
      aiKey,
      aiModel,
      setAIConfig,
      teacher,
      updateTeacher,
      classes,
      students,
      examQuestions,
      essayReviews,
      courses,
      resources,
      addExamQuestion,
      removeExamQuestion,
      addEssayReview,
      removeEssayReview,
      addCourse,
      removeCourse,
      addResource,
      removeResource,
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
    [cloudStatus, user, signIn, register, signOutUser, useLocalMode, aiProvider, aiKey, aiModel, setAIConfig, teacher, updateTeacher, classes, students, examQuestions, essayReviews, courses, resources, addExamQuestion, removeExamQuestion, addEssayReview, removeEssayReview, addCourse, removeCourse, addResource, removeResource, selectedClassId, setSelectedClassId, addClass, updateClass, removeClass, addStudent, updateStudent, removeStudent, resetDemo],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}
