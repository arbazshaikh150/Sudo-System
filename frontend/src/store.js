import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const apiUrl = (import.meta.env.VITE_API_URL || 'https://sudo-system.arbazshaikh1507.workers.dev').replace(
  /\/$/,
  '',
)

function getApiError(error) {
  if (error.message === 'Failed to fetch') {
    return 'Cannot reach the API. Start the Sudo System server and check VITE_API_URL.'
  }

  if (/connectivityerror|\beof\b/i.test(error.message)) {
    return 'The graph database connection was interrupted. Check NEO4J_URI and try again.'
  }

  return error.message
}

export const createNode = createAsyncThunk(
  'nodes/createNode',
  async (node, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/create/node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeLabel: node.label, nodeKey: node.key }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(body?.error || `Request failed (${response.status})`)
      return node
    } catch (error) {
      return rejectWithValue({
        id: node.id,
        label: node.label,
        message: error.message,
      })
    }
  },
)

export const createRelationship = createAsyncThunk(
  'graph/createRelationship',
  async (relationship, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/create/relationship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLabel: relationship.from.label,
          fromIdentifier: relationship.from.key,
          toLabel: relationship.to.label,
          toIdentifier: relationship.to.key,
          relationshipLabel: 'REQUEST',
          relationshipKey: relationship.key,
          relationship: 'REQUEST',
          attribute: {},
        }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(body?.error || `Request failed (${response.status})`)
      return relationship
    } catch (error) {
      return rejectWithValue({ id: relationship.id, message: getApiError(error) })
    }
  },
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ messageId, source, destination }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          clientLabel: source.label,
          clientKey: source.key,
          destinationLabel: destination.label,
          destinationKey: destination.key,
        }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(body?.error || `Request failed (${response.status})`)
      return { messageId, source, destination, data: body?.data }
    } catch (error) {
      return rejectWithValue({ messageId, message: getApiError(error) })
    }
  },
)

export const fetchNodeDetails = createAsyncThunk(
  'nodeDetails/fetch',
  async (node, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${apiUrl}/fetch/node/${encodeURIComponent(node.label)}/${encodeURIComponent(node.key)}`,
      )
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error || `Request failed (${response.status})`)
      }
      return { id: node.id, data: body?.data || {} }
    } catch (error) {
      return rejectWithValue({ id: node.id, message: getApiError(error) })
    }
  },
)

const nodesSlice = createSlice({
  name: 'nodes',
  initialState: { items: [] },
  reducers: {
    updateNodeLayout: (state, action) => {
      const node = state.items.find((item) => item.id === action.payload.id)
      if (node) Object.assign(node, action.payload.layout)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNode.pending, (state, action) => {
        state.items.push({ ...action.meta.arg, status: 'saving' })
      })
      .addCase(createNode.fulfilled, (state, action) => {
        const node = state.items.find((item) => item.id === action.payload.id)
        if (node) node.status = 'saved'
      })
      .addCase(createNode.rejected, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload?.id)
      })
  },
})

export const { updateNodeLayout } = nodesSlice.actions

const nodeDetailsSlice = createSlice({
  name: 'nodeDetails',
  initialState: { selectedId: null, data: {}, status: 'idle', error: null },
  reducers: {
    closeNodeDetails: (state) => {
      state.selectedId = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodeDetails.pending, (state, action) => {
        state.selectedId = action.meta.arg.id
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNodeDetails.fulfilled, (state, action) => {
        state.selectedId = action.payload.id
        state.data[action.payload.id] = action.payload.data
        state.status = 'succeeded'
      })
      .addCase(fetchNodeDetails.rejected, (state, action) => {
        state.selectedId = action.payload?.id || null
        state.status = 'failed'
        state.error = action.payload?.message || 'Unable to load node details.'
      })
  },
})

export const { closeNodeDetails } = nodeDetailsSlice.actions

const relationshipsSlice = createSlice({
  name: 'relationships',
  initialState: { items: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createRelationship.pending, (state, action) => {
        state.items.push({ ...action.meta.arg, status: 'saving' })
      })
      .addCase(createRelationship.fulfilled, (state, action) => {
        const relationship = state.items.find((item) => item.id === action.payload.id)
        if (relationship) relationship.status = 'saved'
      })
      .addCase(createRelationship.rejected, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload?.id)
      })
  },
})

export const store = configureStore({
  reducer: {
    nodes: nodesSlice.reducer,
    nodeDetails: nodeDetailsSlice.reducer,
    relationships: relationshipsSlice.reducer,
  },
})
