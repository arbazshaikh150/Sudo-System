import {
  ArrowRight,
  CircleDot,
  Database,
  GitBranch,
  Layers3,
  Plus,
  Radio,
  Sparkles,
} from 'lucide-react'

const components = [
  {
    name: 'Redis',
    label: 'REDIS',
    Icon: Radio,
    icon: 'bg-rose-50 text-rose-500',
    tint: 'border-t-rose-400',
  },
  {
    name: 'Client',
    label: 'CLIENT',
    Icon: CircleDot,
    icon: 'bg-blue-50 text-blue-500',
    tint: 'border-t-blue-400',
  },
  {
    name: 'Database',
    label: 'DATABASE',
    Icon: Database,
    icon: 'bg-violet-50 text-violet-500',
    tint: 'border-t-violet-400',
  },
  {
    name: 'Queue',
    label: 'RABBITMQ',
    Icon: Layers3,
    icon: 'bg-amber-50 text-amber-500',
    tint: 'border-t-amber-400',
  },
]

export function ComponentPanel({ onAdd, onRelationship, relationshipFrom }) {
  const relationshipText =
    relationshipFrom === 'selecting'
      ? 'Choose first node'
      : relationshipFrom
        ? 'Choose second node'
        : 'Create relation'
  return (
    <aside className="border-b border-slate-200 bg-slate-50/70 p-5 lg:border-b-0 lg:border-r">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-extrabold">Components</h2>
        <span className="font-mono text-[10px] text-slate-400">CLICK TO ADD</span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {components.map((component) => {
          const Icon = component.Icon
          return (
            <button
              key={component.label}
              className="tool-button"
              onClick={() => onAdd(component)}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg ${component.icon}`}
              >
                <Icon size={18} />
              </span>
              <span>{component.name}</span>
              <Plus className="ml-auto text-slate-400" size={17} />
            </button>
          )
        })}
      </div>
      <button
        onClick={onRelationship}
        className={`mt-6 flex w-full items-center gap-2 border-t border-dashed border-slate-300 px-2 pt-5 text-sm font-bold transition ${relationshipFrom ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
      >
        <GitBranch size={19} />
        <span>{relationshipText}</span>
        <ArrowRight className="ml-auto" size={18} />
      </button>
      <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">
        <Sparkles className="mb-1" size={16} />
        <b>Auto-sync enabled.</b> Every component is saved to your graph API.
      </div>
    </aside>
  )
}
