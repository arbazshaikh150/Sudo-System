
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
# Phase 1 Backend is Working Properly

![Phase 1 Backend Working Fine](/assest/image6.png)

---
# Phase 2 Backend is Working Properly
---
![Phase 2 Backend Working Fine](/assest/image8.png)
