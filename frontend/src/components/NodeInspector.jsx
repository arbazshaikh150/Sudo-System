import { CheckCircle2, Copy, Database, LoaderCircle, RefreshCw, X } from 'lucide-react'
import { toast } from 'react-toastify'

function displayValue(value) {
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value)
}

export function NodeInspector({ node, details, status, error, onClose, onRefresh }) {
  if (!node) return null

  const properties = Object.entries(details || {})
  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(node.key)
      toast.success('Node key copied')
    } catch {
      toast.error('Could not copy the node key.')
    }
  }

  return (
    <aside className="node-inspector absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:top-16 sm:w-[330px] sm:self-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.18em] text-indigo-500">
            NODE INSPECTOR
          </p>
          <h2 className="mt-1 font-mono text-lg font-semibold tracking-wide text-slate-800">
            {node.label}
          </h2>
        </div>
        <button
          aria-label="Close node details"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
          <CheckCircle2 size={15} /> Graph node
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 font-mono text-[10px] text-slate-600">
          <span className="min-w-0 flex-1 truncate">{node.key}</span>
          <button
            aria-label="Copy node key"
            onClick={copyKey}
            className="shrink-0 rounded p-1 text-indigo-500 hover:bg-indigo-50"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
          Live properties
        </h3>
        <button
          onClick={onRefresh}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw className={status === 'loading' ? 'animate-spin' : ''} size={13} />
          Refresh
        </button>
      </div>

      {status === 'loading' ? (
        <div className="mt-4 grid min-h-28 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <LoaderCircle className="animate-spin text-indigo-500" size={17} /> Loading
            graph data
          </span>
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
          {error}
        </div>
      ) : (
        <dl className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
          {properties.length > 0 ? (
            properties.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[104px_1fr] gap-2 px-3 py-2.5 text-xs"
              >
                <dt className="truncate font-medium text-slate-500">{key}</dt>
                <dd className="break-all font-mono text-[11px] text-slate-700">
                  {displayValue(value)}
                </dd>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 px-3 py-5 text-xs text-slate-500">
              <Database size={15} /> No custom properties stored yet.
            </div>
          )}
        </dl>
      )}
    </aside>
  )
}
