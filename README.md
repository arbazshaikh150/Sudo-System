
## Whiteboard frontend

The React whiteboard lives in [`frontend`](./frontend). Clicking Redis, Client,
Database, or Queue creates a labelled card with a generated key and sends it to
`POST /create/node`. Queue uses the backend's `RABBITMQ` label.

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8080` by default. Copy
`.env.example` to `.env` to use a different URL.

---

# Component Flow

1. The user clicks a component, and it is shown in the UI.
2. The user can add a relation , then user click on Source Node and Target Node ( relationship is going to be created ).
3. The user sends a message using the shortest path ( selection is similar to the relationship).
4. Each node in the path caches, queues, or stores the message before it is delivered.
5. Implementing the functionality of the system inside the node ( background goroutine is doing the work for me)

---
![alt text](/assest/image9.png)

---
# Phase 1 Backend is Working Properly

![Phase 1 Backend Working Fine](/assest/image6.png)

---
# Phase 2 Backend is Working Properly
---
![Phase 2 Backend Working Fine](/assest/image8.png)
