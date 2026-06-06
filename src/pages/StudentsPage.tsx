import { useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icons'
import { useToast } from '../components/toast-context'
import {
  useAppStore,
  avgScore,
  SUBJECTS,
  type Student,
  type Subject,
} from '../store/useAppStore'

type StudentForm = {
  seatNo: string
  name: string
  studyHours: string
  completion: string
  activity: string
  subjects: Record<Subject, string>
}

const emptySubjects = (): Record<Subject, string> =>
  SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: '80' }), {} as Record<Subject, string>)

const blankForm = (): StudentForm => ({
  seatNo: '',
  name: '',
  studyHours: '120',
  completion: '85',
  activity: '85',
  subjects: emptySubjects(),
})

export function StudentsPage() {
  const toast = useToast()
  const {
    classes, students, selectedClassId, setSelectedClassId,
    addClass, updateClass, removeClass,
    addStudent, updateStudent, removeStudent, resetDemo,
  } = useAppStore()

  const [classFormOpen, setClassFormOpen] = useState(false)
  const [classDraft, setClassDraft] = useState({ name: '', grade: '' })
  const [editingClassId, setEditingClassId] = useState<string | null>(null)

  const [studentFormOpen, setStudentFormOpen] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [form, setForm] = useState<StudentForm>(blankForm())

  const activeClass = classes.find((c) => c.id === selectedClassId) ?? null
  const roster = useMemo(
    () =>
      students
        .filter((s) => s.classId === selectedClassId)
        .sort((a, b) => a.seatNo - b.seatNo),
    [students, selectedClassId],
  )

  // ── 班級 ──
  function openAddClass() {
    setEditingClassId(null)
    setClassDraft({ name: '', grade: '' })
    setClassFormOpen(true)
  }
  function openEditClass() {
    if (!activeClass) return
    setEditingClassId(activeClass.id)
    setClassDraft({ name: activeClass.name, grade: activeClass.grade })
    setClassFormOpen(true)
  }
  function saveClass() {
    if (!classDraft.name.trim()) {
      toast('請輸入班級名稱')
      return
    }
    if (editingClassId) {
      updateClass(editingClassId, { name: classDraft.name.trim(), grade: classDraft.grade.trim() })
      toast('班級已更新')
    } else {
      const id = addClass({ name: classDraft.name.trim(), grade: classDraft.grade.trim() })
      setSelectedClassId(id)
      toast('班級已新增')
    }
    setClassFormOpen(false)
  }
  function deleteClass() {
    if (!activeClass) return
    removeClass(activeClass.id)
    toast(`已刪除「${activeClass.name}」`)
  }

  // ── 學生 ──
  function openAddStudent() {
    if (!selectedClassId) {
      toast('請先選擇或新增班級')
      return
    }
    setEditingStudentId(null)
    const nextSeat = roster.length ? Math.max(...roster.map((s) => s.seatNo)) + 1 : 1
    setForm({ ...blankForm(), seatNo: String(nextSeat) })
    setStudentFormOpen(true)
  }
  function openEditStudent(s: Student) {
    setEditingStudentId(s.id)
    setForm({
      seatNo: String(s.seatNo),
      name: s.name,
      studyHours: String(s.studyHours),
      completion: String(s.completion),
      activity: String(s.activity),
      subjects: SUBJECTS.reduce(
        (acc, sub) => ({ ...acc, [sub]: String(s.subjects[sub] ?? 0) }),
        {} as Record<Subject, string>,
      ),
    })
    setStudentFormOpen(true)
  }
  function saveStudent() {
    if (!selectedClassId) return
    if (!form.name.trim()) {
      toast('請輸入學生姓名')
      return
    }
    const num = (v: string, max = 100) => Math.max(0, Math.min(max, Number(v) || 0))
    const payload = {
      seatNo: num(form.seatNo, 999),
      name: form.name.trim(),
      studyHours: num(form.studyHours, 100000),
      completion: num(form.completion),
      activity: num(form.activity),
      subjects: SUBJECTS.reduce(
        (acc, sub) => ({ ...acc, [sub]: num(form.subjects[sub]) }),
        {} as Record<Subject, number>,
      ),
    }
    if (editingStudentId) {
      updateStudent(editingStudentId, payload)
      toast('學生資料已更新')
    } else {
      addStudent({ classId: selectedClassId, ...payload })
      toast('已新增學生')
    }
    setStudentFormOpen(false)
  }

  const setSub = (sub: Subject, v: string) =>
    setForm((f) => ({ ...f, subjects: { ...f.subjects, [sub]: v } }))

  // ── Excel 匯入 / 範本 ──
  const fileRef = useRef<HTMLInputElement>(null)
  const num = (v: unknown, max = 100) => Math.max(0, Math.min(max, Number(v) || 0))

  async function downloadTemplate() {
    const XLSX = await import('xlsx')
    const header = ['座號', '姓名', '學習時數', '完成率', '活躍度', ...SUBJECTS]
    const sample = [1, '範例學生', 120, 85, 85, ...SUBJECTS.map(() => 80)]
    const ws = XLSX.utils.aoa_to_sheet([header, sample])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '學生名單')
    XLSX.writeFile(wb, '學生名單匯入範本.xlsx')
    toast('已下載匯入範本')
  }

  async function handleImport(file: File) {
    if (!selectedClassId) { toast('請先選擇班級'); return }
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      let count = 0
      let nextSeat = roster.length ? Math.max(...roster.map((s) => s.seatNo)) + 1 : 1
      for (const row of rows) {
        const name = String(row['姓名'] ?? '').trim()
        if (!name) continue
        const subjects = SUBJECTS.reduce(
          (acc, sub) => ({ ...acc, [sub]: row[sub] !== '' && row[sub] != null ? num(row[sub]) : 80 }),
          {} as Record<Subject, number>,
        )
        addStudent({
          classId: selectedClassId,
          seatNo: row['座號'] !== '' && row['座號'] != null ? num(row['座號'], 999) : nextSeat++,
          name,
          studyHours: num(row['學習時數'], 100000),
          completion: num(row['完成率']),
          activity: num(row['活躍度']),
          subjects,
        })
        count++
      }
      toast(count ? `已匯入 ${count} 位學生` : '未找到有效資料列（需有「姓名」欄）')
    } catch {
      toast('匯入失敗：請確認為 .xlsx 檔且欄位正確')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputCls =
    'w-full rounded-lg border border-cyan-400/15 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50'

  return (
    <div className="space-y-5">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">學生管理</h2>
          <p className="text-xs text-slate-400">建立班級與學生名單，資料自動儲存於本機（localStorage）</p>
        </div>
        <button
          onClick={() => {
            resetDemo()
            toast('已載入示範資料')
          }}
          className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-glow"
        >
          載入示範資料
        </button>
      </div>

      {/* 班級列 */}
      <div className="panel bracket rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">班級</h3>
          <button
            onClick={openAddClass}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-3 py-1.5 text-xs font-bold text-white shadow-glow transition hover:brightness-110"
          >
            <Icon name="sparkles" width={14} height={14} /> 新增班級
          </button>
        </div>

        {classes.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">尚無班級，請先新增一個班級。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => {
              const count = students.filter((s) => s.classId === c.id).length
              const active = c.id === selectedClassId
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-white shadow-glow'
                      : 'border-cyan-400/15 bg-white/[0.02] text-slate-300 hover:border-cyan-400/30'
                  }`}
                >
                  <Icon name="users" width={15} height={15} className={active ? 'text-cyan-glow' : 'text-slate-400'} />
                  <span className="font-medium">{c.name}</span>
                  <span className="rounded-full bg-ink-800 px-1.5 text-[10px] text-slate-400">{count} 人</span>
                </button>
              )
            })}
          </div>
        )}

        {activeClass && (
          <div className="mt-3 flex items-center gap-2 border-t border-cyan-400/10 pt-3">
            <span className="text-xs text-slate-400">目前班級：{activeClass.grade} {activeClass.name}</span>
            <button onClick={openEditClass} className="ml-auto text-xs text-cyan-glow hover:underline">編輯</button>
            <button onClick={deleteClass} className="text-xs text-neon-pink hover:underline">刪除</button>
          </div>
        )}
      </div>

      {/* 學生名單 */}
      <div className="panel bracket rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            學生名單{activeClass ? `（${activeClass.name}）` : ''}
          </h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImport(f) }}
            />
            <button onClick={downloadTemplate} className="flex items-center gap-1 rounded-lg border border-cyan-400/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow">
              <Icon name="doc" width={14} height={14} /> 下載範本
            </button>
            <button
              onClick={() => { if (!selectedClassId) { toast('請先選擇班級'); return } fileRef.current?.click() }}
              disabled={!selectedClassId}
              className="flex items-center gap-1 rounded-lg border border-cyan-400/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="upload" width={14} height={14} /> 匯入 Excel
            </button>
            <button
              onClick={openAddStudent}
              disabled={!selectedClassId}
              className="flex items-center gap-1 rounded-lg border border-cyan-400/30 px-3 py-1.5 text-xs font-bold text-cyan-glow transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="sparkles" width={14} height={14} /> 新增學生
            </button>
          </div>
        </div>

        {!selectedClassId ? (
          <p className="py-6 text-center text-xs text-slate-400">請先選擇班級。</p>
        ) : roster.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">此班級尚無學生，點「新增學生」開始建立名單。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-400/15 text-left text-[11px] text-slate-400">
                  <th className="px-2 py-2">座號</th>
                  <th className="px-2 py-2">姓名</th>
                  <th className="px-2 py-2">學習時數</th>
                  <th className="px-2 py-2">完成率</th>
                  <th className="px-2 py-2">活躍度</th>
                  <th className="px-2 py-2">平均成績</th>
                  <th className="px-2 py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 text-slate-200 transition hover:bg-white/5">
                    <td className="px-2 py-2">{s.seatNo}</td>
                    <td className="px-2 py-2 font-medium">{s.name}</td>
                    <td className="px-2 py-2">{s.studyHours} hr</td>
                    <td className="px-2 py-2">{s.completion}%</td>
                    <td className="px-2 py-2">{s.activity}%</td>
                    <td className="px-2 py-2 font-semibold text-cyan-glow">{Math.round(avgScore(s) * 10) / 10}</td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={() => openEditStudent(s)} className="text-xs text-cyan-glow hover:underline">編輯</button>
                      <button
                        onClick={() => { removeStudent(s.id); toast(`已刪除 ${s.name}`) }}
                        className="ml-2 text-xs text-neon-pink hover:underline"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 班級表單 Modal */}
      {classFormOpen && (
        <Modal title={editingClassId ? '編輯班級' : '新增班級'} onClose={() => setClassFormOpen(false)}>
          <label className="block text-xs text-slate-400">班級名稱</label>
          <input className={inputCls} value={classDraft.name} placeholder="例：五年甲班"
            onChange={(e) => setClassDraft((d) => ({ ...d, name: e.target.value }))} />
          <label className="mt-3 block text-xs text-slate-400">年段</label>
          <input className={inputCls} value={classDraft.grade} placeholder="例：五年級"
            onChange={(e) => setClassDraft((d) => ({ ...d, grade: e.target.value }))} />
          <ModalActions onCancel={() => setClassFormOpen(false)} onSave={saveClass} />
        </Modal>
      )}

      {/* 學生表單 Modal */}
      {studentFormOpen && (
        <Modal title={editingStudentId ? '編輯學生' : '新增學生'} onClose={() => setStudentFormOpen(false)} wide>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Field label="座號"><input className={inputCls} value={form.seatNo} inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, seatNo: e.target.value }))} /></Field>
            <Field label="姓名" span2><input className={inputCls} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="學習時數"><input className={inputCls} value={form.studyHours} inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, studyHours: e.target.value }))} /></Field>
            <Field label="完成率%"><input className={inputCls} value={form.completion} inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, completion: e.target.value }))} /></Field>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="活躍度%"><input className={inputCls} value={form.activity} inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))} /></Field>
          </div>
          <p className="mb-2 mt-4 text-xs font-semibold text-slate-300">各科成績（0–100）</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUBJECTS.map((sub) => (
              <Field key={sub} label={sub}>
                <input className={inputCls} value={form.subjects[sub]} inputMode="numeric"
                  onChange={(e) => setSub(sub, e.target.value)} />
              </Field>
            ))}
          </div>
          <ModalActions onCancel={() => setStudentFormOpen(false)} onSave={saveStudent} />
        </Modal>
      )}
    </div>
  )
}

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="mb-1 block text-[11px] text-slate-400">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`panel bracket w-full ${wide ? 'max-w-2xl' : 'max-w-sm'} rounded-2xl border-cyan-400/30 p-5 shadow-glow`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><Icon name="close" width={18} height={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button onClick={onCancel} className="rounded-lg border border-cyan-400/20 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40">取消</button>
      <button onClick={onSave} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-5 py-2 text-sm font-bold text-white shadow-glow transition hover:brightness-110">儲存</button>
    </div>
  )
}
