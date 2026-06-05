import { useMemo } from 'react'
import { Icon } from '../components/Icons'
import { TrendPanel } from '../components/TrendPanel'
import { useAppStore, summarize } from '../store/useAppStore'

export function AnalyticsPage({ onManage }: { onManage: () => void }) {
  const { classes, students } = useAppStore()

  const rows = useMemo(
    () =>
      classes.map((c) => {
        const cs = students.filter((s) => s.classId === c.id)
        return { cls: c, sum: summarize(cs) }
      }),
    [classes, students],
  )

  const overall = useMemo(() => summarize(students), [students])

  return (
    <div className="space-y-5">
      <div className="panel bracket flex items-center gap-4 rounded-2xl p-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-neon-cyan/20 text-neon-cyan">
          <Icon name="chart" width={28} height={28} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">學習數據中心</h2>
          <p className="text-sm text-slate-400">即時彙整各班學習數據與洞察（資料來源：學生管理）</p>
        </div>
      </div>

      {/* 全校彙總 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '班級數', value: classes.length, unit: '班', color: '#22d3ee' },
          { label: '學生總數', value: overall.count, unit: '人', color: '#34d399' },
          { label: '全校平均成績', value: overall.avgScore, unit: '分', color: '#a855f7' },
          { label: '平均完成率', value: overall.avgCompletion, unit: '%', color: '#fbbf24' },
        ].map((s) => (
          <div key={s.label} className="panel rounded-2xl p-4">
            <p className="text-[11px] text-slate-400">{s.label}</p>
            <p className="orbitron mt-1 text-2xl font-extrabold text-white">
              {s.value}
              <span className="ml-1 text-xs text-slate-400">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        {/* 各班比較表 */}
        <div className="panel bracket rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">各班學習數據比較</h3>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-xs text-slate-400">尚無班級資料。</p>
              <button onClick={onManage} className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-1.5 text-xs font-bold text-white shadow-glow">前往學生管理</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-400/15 text-left text-[11px] text-slate-400">
                    <th className="px-2 py-2">班級</th>
                    <th className="px-2 py-2">人數</th>
                    <th className="px-2 py-2">總時數</th>
                    <th className="px-2 py-2">完成率</th>
                    <th className="px-2 py-2">平均成績</th>
                    <th className="px-2 py-2">活躍度</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ cls, sum }) => (
                    <tr key={cls.id} className="border-b border-white/5 text-slate-200 hover:bg-white/5">
                      <td className="px-2 py-2 font-medium">{cls.name}</td>
                      <td className="px-2 py-2">{sum.count}</td>
                      <td className="px-2 py-2">{sum.totalHours} hr</td>
                      <td className="px-2 py-2">{sum.avgCompletion}%</td>
                      <td className="px-2 py-2 font-semibold text-cyan-glow">{sum.avgScore}</td>
                      <td className="px-2 py-2">{sum.avgActivity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <TrendPanel />
      </div>
    </div>
  )
}
