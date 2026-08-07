import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  closeNodeDetails,
  createNode,
  createRelationship,
  fetchNodeDetails,
  updateNodeLayout,
} from './store'
import { Canvas } from './components/Canvas'
import { ComponentPanel } from './components/ComponentPanel'
import { WhiteboardHeader } from './components/WhiteboardHeader'
import { NodeInspector } from './components/NodeInspector'

function randomKey(label) {
  const values = new Uint32Array(2)
  crypto.getRandomValues(values)
  return `${label.toLowerCase()}-${Array.from(values, (value) => value.toString(36))
    .join('')
    .slice(0, 10)}`
}

export default function App() {
  const dispatch = useDispatch()
  const nodes = useSelector((state) => state.nodes.items)
  const relationships = useSelector((state) => state.relationships.items)
  const nodeDetails = useSelector((state) => state.nodeDetails)
  const canvasRef = useRef(null)
  const interactionRef = useRef(null)
  const ignoreNextCardClickRef = useRef(false)
  const [relationshipFrom, setRelationshipFrom] = useState(null)

  const addComponent = async (component) => {
    const count = nodes.length
    const node = {
      id: crypto.randomUUID(),
      label: component.label,
      key: randomKey(component.label),
      name: component.name,
      tint: component.tint,
      x: 42 + (count % 3) * 54,
      y: 86 + (count % 4) * 38,
      width: 310,
      height: 202,
    }
    const result = await dispatch(createNode(node))
    if (createNode.fulfilled.match(result))
      toast.success(`${node.label} created and synced to the graph`)
    else
      toast.error(
        `Unable to create ${node.label}: ${result.payload?.message || 'API unavailable'}`,
      )
  }

  const startInteraction = (event, node, mode) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    interactionRef.current = {
      id: node.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      hasMoved: false,
    }
  }
  const updateInteraction = (event) => {
    const active = interactionRef.current
    const canvas = canvasRef.current
    if (!active || !canvas) return
    const bounds = canvas.getBoundingClientRect()
    const dx = event.clientX - active.startX
    const dy = event.clientY - active.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) active.hasMoved = true
    const layout =
      active.mode === 'drag'
        ? {
            x: Math.max(16, Math.min(active.x + dx, bounds.width - active.width - 16)),
            y: Math.max(48, Math.min(active.y + dy, bounds.height - active.height - 16)),
          }
        : {
            width: Math.max(
              210,
              Math.min(active.width + dx, bounds.width - active.x - 16),
            ),
            height: Math.max(
              145,
              Math.min(active.height + dy, bounds.height - active.y - 16),
            ),
          }
    dispatch(updateNodeLayout({ id: active.id, layout }))
  }
  const stopInteraction = (event) => {
    if (
      interactionRef.current &&
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    )
      event.currentTarget.releasePointerCapture(event.pointerId)
    ignoreNextCardClickRef.current = interactionRef.current?.hasMoved || false
    interactionRef.current = null
  }
  const beginRelationship = () => {
    if (nodes.length < 2)
      return toast.info('Add at least two nodes before creating a relationship.')
    dispatch(closeNodeDetails())
    setRelationshipFrom('selecting')
    toast.info('Select the first node for this relationship.')
  }
  const selectNode = async (node) => {
    if (ignoreNextCardClickRef.current) {
      ignoreNextCardClickRef.current = false
      return
    }
    if (!relationshipFrom) {
      dispatch(fetchNodeDetails(node))
      return
    }
    if (relationshipFrom === 'selecting') {
      setRelationshipFrom(node.id)
      toast.info(`First node: ${node.label}. Now select the destination node.`)
      return
    }
    if (relationshipFrom === node.id)
      return toast.info('Choose a different node as the destination.')
    const from = nodes.find((item) => item.id === relationshipFrom)
    if (!from) return setRelationshipFrom(null)
    const relationship = {
      id: crypto.randomUUID(),
      key: `rel-${crypto.randomUUID().slice(0, 8)}`,
      from,
      to: node,
      fromId: from.id,
      toId: node.id,
    }
    setRelationshipFrom(null)
    const result = await dispatch(createRelationship(relationship))
    if (createRelationship.fulfilled.match(result))
      toast.success(`${from.label} → ${node.label} relationship created`)
    else
      toast.error(
        `Could not create relationship: ${result.payload?.message || 'API unavailable'}`,
      )
  }

  const selectedNode = nodes.find((node) => node.id === nodeDetails.selectedId)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0e7ff_0,_transparent_31%),linear-gradient(135deg,_#f8fafc,_#eef2ff)] p-4 sm:p-8">
      <section className="mx-auto min-h-[720px] w-full max-w-7xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-board">
        <WhiteboardHeader />
        <div className="grid min-h-[624px] grid-cols-1 lg:grid-cols-[280px_1fr]">
          <ComponentPanel
            onAdd={addComponent}
            onRelationship={beginRelationship}
            relationshipFrom={relationshipFrom}
          />
          <Canvas
            canvasRef={canvasRef}
            nodes={nodes}
            relationships={relationships}
            relationshipFrom={relationshipFrom}
            activeNodeId={nodeDetails.selectedId}
            onCancelRelationship={() => setRelationshipFrom(null)}
            onSelectNode={selectNode}
            onStartInteraction={startInteraction}
            onUpdateInteraction={updateInteraction}
            onStopInteraction={stopInteraction}
            inspector={
              <NodeInspector
                node={selectedNode}
                details={selectedNode ? nodeDetails.data[selectedNode.id] : null}
                status={nodeDetails.status}
                error={nodeDetails.error}
                onClose={() => dispatch(closeNodeDetails())}
                onRefresh={() => selectedNode && dispatch(fetchNodeDetails(selectedNode))}
              />
            }
          />
        </div>
      </section>
    </main>
  )
}
