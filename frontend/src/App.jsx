import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Activity, ArrowRight, Check, CircleDot, Database, GitBranch, GripHorizontal, Layers3, LoaderCircle, Maximize2, Plus, Radio, Server, Sparkles, X } from 'lucide-react'
import { createNode, createRelationship, updateNodeLayout } from './store'

const components = [
  { name: 'Redis', label: 'REDIS', Icon: Radio, icon: 'bg-rose-50 text-rose-500', tint: 'border-t-rose-400' },
  { name: 'Client', label: 'CLIENT', Icon: CircleDot, icon: 'bg-blue-50 text-blue-500', tint: 'border-t-blue-400' },
  { name: 'Database', label: 'DATABASE', Icon: Database, icon: 'bg-violet-50 text-violet-500', tint: 'border-t-violet-400' },
  { name: 'Queue', label: 'RABBITMQ', Icon: Layers3, icon: 'bg-amber-50 text-amber-500', tint: 'border-t-amber-400' },
]

function randomKey(label) {
  const values = new Uint32Array(2)
  crypto.getRandomValues(values)
  return `${label.toLowerCase()}-${Array.from(values, value => value.toString(36)).join('').slice(0, 10)}`
}

export default function App() {
  const dispatch = useDispatch()
  const nodes = useSelector(state => state.nodes.items)
  const relationships = useSelector(state => state.relationships.items)
  const canvasRef = useRef(null)
  const interactionRef = useRef(null)
  const [relationshipFrom, setRelationshipFrom] = useState(null)

  const addComponent = async component => {
    const count = nodes.length
    const node = {
      id: crypto.randomUUID(), label: component.label, key: randomKey(component.label), name: component.name, tint: component.tint,
      x: 42 + (count % 3) * 54, y: 86 + (count % 4) * 38, width: 310, height: 202,
    }
    const result = await dispatch(createNode(node))
    if (createNode.fulfilled.match(result)) toast.success(`${node.label} created and synced to the graph`)
    else toast.error(`Unable to create ${node.label}: ${result.payload?.message || 'API unavailable'}`)
  }

  const startInteraction = (event, node, mode) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    interactionRef.current = { id: node.id, mode, startX: event.clientX, startY: event.clientY, x: node.x, y: node.y, width: node.width, height: node.height }
  }

  const updateInteraction = event => {
    const active = interactionRef.current
    const canvas = canvasRef.current
    if (!active || !canvas) return
    const bounds = canvas.getBoundingClientRect()
    const dx = event.clientX - active.startX
    const dy = event.clientY - active.startY
    const layout = active.mode === 'drag'
      ? { x: Math.max(16, Math.min(active.x + dx, bounds.width - active.width - 16)), y: Math.max(48, Math.min(active.y + dy, bounds.height - active.height - 16)) }
      : { width: Math.max(210, Math.min(active.width + dx, bounds.width - active.x - 16)), height: Math.max(145, Math.min(active.height + dy, bounds.height - active.y - 16)) }
    dispatch(updateNodeLayout({ id: active.id, layout }))
  }

  const stopInteraction = event => {
    if (interactionRef.current && event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    interactionRef.current = null
  }

  const beginRelationship = () => {
    if (nodes.length < 2) return toast.info('Add at least two nodes before creating a relationship.')
    setRelationshipFrom('selecting')
    toast.info('Select the first node for this relationship.')
  }

  const selectRelationshipNode = async node => {
    if (!relationshipFrom) return
    if (relationshipFrom === 'selecting') {
      setRelationshipFrom(node.id)
      toast.info(`First node: ${node.label}. Now select the destination node.`)
      return
    }
    if (relationshipFrom === node.id) return toast.info('Choose a different node as the destination.')
    const from = nodes.find(item => item.id === relationshipFrom)
    if (!from) return setRelationshipFrom(null)
    const relationship = { id: crypto.randomUUID(), key: `rel-${crypto.randomUUID().slice(0, 8)}`, from, to: node, fromId: from.id, toId: node.id }
    setRelationshipFrom(null)
    const result = await dispatch(createRelationship(relationship))
    if (createRelationship.fulfilled.match(result)) toast.success(`${from.label} → ${node.label} relationship created`)
    else toast.error(`Could not create relationship: ${result.payload?.message || 'API unavailable'}`)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0e7ff_0,_transparent_31%),linear-gradient(135deg,_#f8fafc,_#eef2ff)] p-4 sm:p-8">
      <section className="mx-auto min-h-[720px] w-full max-w-7xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-board">
        <header className="flex h-24 items-center gap-3 border-b border-slate-200 px-5 sm:px-8">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-200"><Server size={22} /></div>
          <div><p className="text-[10px] font-extrabold tracking-[0.2em] text-indigo-500">SUDO SYSTEM</p><h1 className="text-base font-extrabold tracking-tight text-slate-800 sm:text-xl">Whiteboard for System Design</h1></div>
          <div className="ml-auto hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 font-mono text-[10px] text-emerald-700 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> API connected</div>
        </header>
        <div className="grid min-h-[624px] grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50/70 p-5 lg:border-r lg:border-b-0">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-extrabold">Components</h2><span className="font-mono text-[10px] text-slate-400">CLICK TO ADD</span></div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {components.map(component => { const Icon = component.Icon; return <button key={component.label} className="tool-button" onClick={() => addComponent(component)}><span className={`grid h-9 w-9 place-items-center rounded-lg ${component.icon}`}><Icon size={18} /></span><span>{component.name}</span><Plus className="ml-auto text-slate-400" size={17} /></button> })}
            </div>
            <button onClick={beginRelationship} className={`mt-6 flex w-full items-center gap-2 border-t border-dashed border-slate-300 px-2 pt-5 text-sm font-bold transition ${relationshipFrom ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}><GitBranch size={19} /><span>{relationshipFrom === 'selecting' ? 'Choose first node' : relationshipFrom ? 'Choose second node' : 'Relation'}</span><ArrowRight className="ml-auto" size={18} /></button>
            <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-700"><Sparkles className="mb-1" size={16} /><b>Auto-sync enabled.</b> Every component is saved to your graph API.</div>
          </aside>
          <section ref={canvasRef} className="canvas-grid relative min-h-[610px] touch-none overflow-hidden">
            <div className="pointer-events-none absolute inset-x-8 top-7 flex items-center justify-between font-mono text-[10px] text-slate-400"><span>{nodes.length} {nodes.length === 1 ? 'NODE' : 'NODES'}</span><span className="hidden sm:inline">SYSTEM ARCHITECTURE CANVAS</span></div>
            {relationshipFrom && <div className="absolute left-1/2 top-12 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-card"><GitBranch size={15} />{relationshipFrom === 'selecting' ? 'Select the first node' : 'Select the destination node'}<button onClick={() => setRelationshipFrom(null)} className="ml-1 rounded-full p-0.5 hover:bg-slate-100"><X size={14} /></button></div>}
            {relationships.length > 0 && <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true"><defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#6366f1" /></marker></defs>{relationships.map(relationship => { const from = nodes.find(node => node.id === relationship.fromId); const to = nodes.find(node => node.id === relationship.toId); return from && to ? <line key={relationship.id} x1={from.x + from.width} y1={from.y + from.height / 2} x2={to.x} y2={to.y + to.height / 2} stroke="#6366f1" strokeWidth="2" strokeDasharray={relationship.status === 'saving' ? '5 5' : undefined} markerEnd="url(#arrowhead)" /> : null })}</svg>}
            {nodes.length === 0 ? <div className="mx-auto max-w-sm translate-y-36 rounded-2xl bg-white/75 p-7 text-center backdrop-blur-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 text-indigo-600"><Plus size={25} /></div><h2 className="mt-4 text-lg font-extrabold">Start designing your system</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose a component from the panel. It gets a unique key and is stored in Sudo System automatically.</p></div> : nodes.map(node => <article onClick={() => selectRelationshipNode(node)} key={node.id} style={{ left: node.x, top: node.y, width: node.width, height: node.height }} className={`node-card absolute z-10 border-t-4 ${node.tint} ${relationshipFrom ? 'cursor-crosshair' : ''} ${relationshipFrom === node.id ? 'ring-4 ring-indigo-300 ring-offset-2' : relationshipFrom === 'selecting' ? 'hover:ring-4 hover:ring-indigo-200' : ''}`}>
              <div onPointerDown={event => startInteraction(event, node, 'drag')} onPointerMove={updateInteraction} onPointerUp={stopInteraction} className="-mx-1 -mt-1 flex cursor-grab touch-none items-center justify-between rounded-lg px-1 pb-2 active:cursor-grabbing"><span className="flex items-center gap-1 font-mono text-[9px] text-slate-400"><GripHorizontal size={15} /> DRAG</span><span className={`flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[9px] ${node.status === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{node.status === 'saved' ? <Check size={11} /> : <LoaderCircle className="animate-spin" size={11} />}{node.status === 'saved' ? 'SYNCED' : 'SAVING'}</span></div>
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Activity size={18} /></span><h3 className="font-mono text-sm font-medium tracking-wider">{node.label}</h3></div><code className="mt-5 block truncate rounded-md bg-slate-50 px-2 py-1.5 font-mono text-[10px] text-slate-500">{node.key}</code>
              <button aria-label={`Resize ${node.label}`} onPointerDown={event => startInteraction(event, node, 'resize')} onPointerMove={updateInteraction} onPointerUp={stopInteraction} className="absolute bottom-1 right-1 grid h-6 w-6 cursor-se-resize place-items-center rounded text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Maximize2 size={13} /></button>
            </article>)}
          </section>
        </div>
      </section>
    </main>
  )
}
