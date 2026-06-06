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
  type Student,
  type Subject,
} from './useAppStore'

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
  const [selectedClassId, setSelectedClassIdState] = useState<string | null>(
    loadSelected() ?? seed.selectedClassId,
  )

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
        setCloudStatus('cloud')
      } else {
        setUser(null)
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

  // ── 本機模式持久化 ──
  useEffect(() => {
    if (cloudStatus !== 'local') return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ classes, students, selectedClassId }))
    } catch {
      /* ignore */
    }
  }, [cloudStatus, classes, students, selectedClassId])

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
    [cloudStatus, user, signIn, register, signOutUser, useLocalMode, classes, students, selectedClassId, setSelectedClassId, addClass, updateClass, removeClass, addStudent, updateStudent, removeStudent, resetDemo],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}
