// Lightweight bar chart built with plain divs.
// Keeps the bundle dependency-free. Renders a row of vertical bars with labels.
export default function BarChart({ data, max, label = '', height = 160 }) {
  const ceiling = Math.max(max || 0, 1, ...data.map((d) => d.value || 0))

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-300">{label}</span>
          <span className="text-xs text-zinc-500">max {ceiling}</span>
        </div>
      )}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
            No data yet
          </div>
        )}
        {data.map((d, i) => {
          const h = ((d.value || 0) / ceiling) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0">
              <div className="text-xs text-zinc-400 font-mono">{d.value ?? 0}</div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-accent-700 to-accent-500
                           transition-all duration-500 min-h-[2px]"
                style={{ height: `${h}%` }}
                title={`${d.label}: ${d.value ?? 0}`}
              />
              <div className="text-[10px] text-zinc-500 truncate w-full text-center">{d.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
