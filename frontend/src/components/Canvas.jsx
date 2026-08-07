import {
  Activity,
  Check,
  GitBranch,
  GripHorizontal,
  LoaderCircle,
  Maximize2,
  Plus,
  X,
} from 'lucide-react'

function NodeCard({
  node,
  relationshipFrom,
  activeNodeId,
  onSelect,
  onStartInteraction,
  onUpdateInteraction,
  onStopInteraction,
}) {
  const selected = relationshipFrom === node.id
  const isInspecting = activeNodeId === node.id
  return (
    <article
      onClick={() => onSelect(node)}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      className={`node-card absolute z-10 border-t-4 ${node.tint} ${relationshipFrom ? 'cursor-crosshair' : ''} ${selected || isInspecting ? 'ring-4 ring-indigo-300 ring-offset-2' : relationshipFrom === 'selecting' ? 'hover:ring-4 hover:ring-indigo-200' : ''}`}
    >
      <div
        onPointerDown={(event) => onStartInteraction(event, node, 'drag')}
        onPointerMove={onUpdateInteraction}
        onPointerUp={onStopInteraction}
        className="-mx-1 -mt-1 flex cursor-grab touch-none items-center justify-between rounded-lg px-1 pb-2 active:cursor-grabbing"
      >
        <span className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
          <GripHorizontal size={15} /> DRAG
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[9px] ${node.status === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
        >
          {node.status === 'saved' ? (
            <Check size={11} />
          ) : (
            <LoaderCircle className="animate-spin" size={11} />
          )}
          {node.status === 'saved' ? 'SYNCED' : 'SAVING'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <Activity size={18} />
        </span>
        <h3 className="font-mono text-sm font-medium tracking-wider">{node.label}</h3>
      </div>
      <code className="mt-5 block truncate rounded-md bg-slate-50 px-2 py-1.5 font-mono text-[10px] text-slate-500">
        {node.key}
      </code>
      <button
        aria-label={`Resize ${node.label}`}
        onPointerDown={(event) => onStartInteraction(event, node, 'resize')}
        onPointerMove={onUpdateInteraction}
        onPointerUp={onStopInteraction}
        className="absolute bottom-1 right-1 grid h-6 w-6 cursor-se-resize place-items-center rounded text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
      >
        <Maximize2 size={13} />
      </button>
    </article>
  )
}

export function Canvas({
  canvasRef,
  nodes,
  relationships,
  relationshipFrom,
  activeNodeId,
  onCancelRelationship,
  onSelectNode,
  onStartInteraction,
  onUpdateInteraction,
  onStopInteraction,
  inspector,
}) {
  const instruction =
    relationshipFrom === 'selecting'
      ? 'Select the first node'
      : 'Select the destination node'
  return (
    <section
      ref={canvasRef}
      className="canvas-grid relative min-h-[610px] touch-none overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-8 top-7 flex items-center justify-between font-mono text-[10px] text-slate-400">
        <span>
          {nodes.length} {nodes.length === 1 ? 'NODE' : 'NODES'}
        </span>
        <span className="hidden sm:inline">SYSTEM ARCHITECTURE CANVAS</span>
      </div>
      {relationshipFrom && (
        <div className="absolute left-1/2 top-12 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-card">
          <GitBranch size={15} />
          {instruction}
          <button
            aria-label="Cancel relationship"
            onClick={onCancelRelationship}
            className="ml-1 rounded-full p-0.5 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {inspector}
      {relationships.length > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 z" fill="#6366f1" />
            </marker>
          </defs>
          {relationships.map((relationship) => {
            const from = nodes.find((node) => node.id === relationship.fromId)
            const to = nodes.find((node) => node.id === relationship.toId)
            return from && to ? (
              <line
                key={relationship.id}
                x1={from.x + from.width}
                y1={from.y + from.height / 2}
                x2={to.x}
                y2={to.y + to.height / 2}
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray={relationship.status === 'saving' ? '5 5' : undefined}
                markerEnd="url(#arrowhead)"
              />
            ) : null
          })}
        </svg>
      )}
      {nodes.length === 0 ? (
        <div className="mx-auto max-w-sm translate-y-36 rounded-2xl bg-white/75 p-7 text-center backdrop-blur-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 text-indigo-600">
            <Plus size={25} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold">Start designing your system</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose a component from the panel. It gets a unique key and is stored in Sudo
            System automatically.
          </p>
        </div>
      ) : (
        nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            relationshipFrom={relationshipFrom}
            activeNodeId={activeNodeId}
            onSelect={onSelectNode}
            onStartInteraction={onStartInteraction}
            onUpdateInteraction={onUpdateInteraction}
            onStopInteraction={onStopInteraction}
          />
        ))
      )}
    </section>
  )
}
