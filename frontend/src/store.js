import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export const createNode = createAsyncThunk('nodes/createNode', async (node, { rejectWithValue }) => {
  try {
    const response = await fetch(`${apiUrl}/create/node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeLabel: node.label, nodeKey: node.key }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`)
    return node
  } catch (error) {
    return rejectWithValue({ id: node.id, label: node.label, message: error.message })
  }
})

export const createRelationship = createAsyncThunk('graph/createRelationship', async (relationship, { rejectWithValue }) => {
  try {
    const response = await fetch(`${apiUrl}/create/relationship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromLabel: relationship.from.label,
        fromIdentifier: relationship.from.key,
        toLabel: relationship.to.label,
        toIdentifier: relationship.to.key,
        // The current backend validates edge labels against NodeLabel values.
        relationshipLabel: 'SERVER',
        relationshipKey: relationship.key,
        relationship: 'CONNECTS_TO',
        attribute: {},
      }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`)
    return relationship
  } catch (error) {
    return rejectWithValue({ id: relationship.id, message: error.message })
  }
})

const nodesSlice = createSlice({
  name: 'nodes',
  initialState: { items: [] },
  reducers: {
    updateNodeLayout: (state, action) => {
      const node = state.items.find(item => item.id === action.payload.id)
      if (node) Object.assign(node, action.payload.layout)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createNode.pending, (state, action) => { state.items.push({ ...action.meta.arg, status: 'saving' }) })
      .addCase(createNode.fulfilled, (state, action) => {
        const node = state.items.find(item => item.id === action.payload.id)
        if (node) node.status = 'saved'
      })
      .addCase(createNode.rejected, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload?.id)
      })
  },
})

export const { updateNodeLayout } = nodesSlice.actions

const relationshipsSlice = createSlice({
  name: 'relationships',
  initialState: { items: [] },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(createRelationship.pending, (state, action) => { state.items.push({ ...action.meta.arg, status: 'saving' }) })
      .addCase(createRelationship.fulfilled, (state, action) => {
        const relationship = state.items.find(item => item.id === action.payload.id)
        if (relationship) relationship.status = 'saved'
      })
      .addCase(createRelationship.rejected, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload?.id)
      })
  },
})

export const store = configureStore({ reducer: { nodes: nodesSlice.reducer, relationships: relationshipsSlice.reducer } })
