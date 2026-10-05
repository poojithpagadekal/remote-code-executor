# CodeRun — Sandboxed Remote Code Execution Engine

A secure, sandboxed remote code execution engine built with Docker, BullMQ, and Redis. Supports Python, C++, and Java with async job processing, test case validation, and shareable execution links.

---

## Demo

Write code in Python, C++, or Java from the browser. Code runs inside an isolated Docker container — no setup required.

```python
n = int(input())
print(n * 2)

# stdin: 5
# stdout: 10
```

---

## Screenshots

| Editor + Execution | Test Case Runner | Share Page |
|---|---|---|
| ![Editor](assets/editor.png) | ![Test cases](assets/testcases.png) | ![Share page](assets/share.png) |

---

## Architecture

```
React Frontend
        │  POST /api/execute
        ▼
Express API (rate limiting + validation)
        │
        ▼
BullMQ Queue  ◄──────────►  Redis (queue storage + execution history, 7-day TTL)
        │
        ▼
Worker (max 5 concurrent jobs)
        │
        ▼
Docker Container (Python / C++ / Java)
```

Redis isn't a separate pipeline stage — it's the storage layer BullMQ uses for the queue itself, and it's reused for execution history so no second data store is needed.

---

## Execution Pipeline

1. Frontend sends `POST /api/execute` (code, language, stdin)
2. API validates language, code length, rate limit
3. Job enqueued into BullMQ (persisted in Redis)
4. Worker picks up job — max 5 running at once
5. Code + stdin written to temp files on host
6. Docker container created with files bind-mounted read-only
7. Container runs, e.g. `python code.py < stdin.txt`
8. stdout/stderr captured via Docker stream demuxing
9. Container exits, auto-removed
10. Result saved to Redis (7-day TTL) and returned to frontend

---

## Key Design Decisions

**Docker for sandboxing** — each submission runs in an isolated container: read-only bind mount (no host writes), 128MB RAM cap, `NetworkMode: none`, 10s timeout with `SIGKILL`.

**Bull + Redis for the queue** — caps concurrency at 5 containers, persists jobs if the server crashes, and queues excess load instead of dropping it.

**File-based stdin**  — Docker's attach-stream API is unreliable on Windows, so stdin is written to a temp file, bind-mounted read-only, and redirected with <. This avoids shell interpolation and is a common approach in many online judge implementations.

**Redis for history** — already running for Bull, so it's reused for history too. 7-day TTL auto-expires old records; `LTRIM` caps the list at 20 entries.

---

## Performance

Measured on Docker Desktop (Windows), p95 ≈ **838ms** per execution. Docker container startup (~500–900ms) is the dominant contributor to total latency. Bare-metal Linux would likely be faster — see [Known Limitations](#known-limitations).

---

## Load Testing

Tested locally with [k6](https://k6.io) via `docker-compose up` (not production benchmarks):

| Test | Setup | Result |
|---|---|---|
| Sustained load | 5 VUs, 30s | Rate limiter correctly rejected ~77% of requests (429s); all requests under the 30 req/min cap succeeded, p95 ≈ 901ms |
| Burst | 20 VUs, 10s | Queue capped at 5 concurrent jobs; all completed executions succeeded (0 errors), high latency reflects queue wait, not execution |
| Timeout handling | 5 VUs, infinite loops, 15s | All containers killed at 10s via `SIGKILL`, API correctly returned `status: "timeout"`, no zombie containers |

```bash
k6 run load-test.js                          # sustained load
k6 run --vus 20 --duration 10s load-test.js  # burst
k6 run --vus 5 --duration 15s load-test.js   # timeout
```

---

## Features

- Multi-language execution — Python 3.11, C++ (GCC), Java 21
- Sandboxed containers — memory limits, no network, 10s timeout
- Stdin support (`input()` / `cin` / `Scanner`)
- Multiple test cases, run in parallel with pass/fail per case
- Execution history — last 20 runs, 7-day TTL
- Shareable links via `/s/:id`
- Rate limiting — 30 req/min per IP
- Structured logging (Pino)
- Real-time execution status indicator

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Editor | Monaco Editor |
| Backend | Node.js + Express + TypeScript |
| Queue | Bull + Redis |
| Sandboxing | Docker |
| Logging | Pino |
| Styling | Tailwind CSS |

---

## Project Structure

```
src/                # API, execution engine, Bull queue, history
client/              # React frontend
assets/              # Screenshots
docker-compose.yml
Dockerfile
```

---

## Getting Started

**Prerequisites:** Docker Desktop (running), Node.js 18+

```bash
git clone https://github.com/poojithpagadekal/remote-code-executor
cd remote-code-executor
cp .env.example .env
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |

**Manual run (frontend hot reload):**

```bash
npm install
cd client && npm install && cd ..

# Terminal 1
docker-compose up redis api

# Terminal 2
cd client && npm run dev
```

**Env vars:**

```env
PORT=3000
REDIS_URL=redis://redis:6379
HOST_TEMP_PATH=/absolute/path/to/remote-code-executor/temp
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **Windows:** `HOST_TEMP_PATH` must be an absolute Windows path (e.g. `C:/Users/username/remote-code-executor/temp`) — Docker on Windows can't resolve relative bind-mount paths.

---

## API Reference

### `POST /api/execute`

Accepts: `language`, `code`, `stdin`
Returns: `stdout`, `stderr`, `exitCode`, `status`, `executionTime`

| Status | Meaning |
|---|---|
| `success` | Exit code 0 |
| `compile_error` | Compilation failed (C++/Java) |
| `runtime_error` | Crashed at runtime |
| `timeout` | Exceeded 10s limit |

### `POST /api/execute/test`

Accepts: `language`, `code`, `testCases` (array of `input` / `expected` pairs)
Returns: per-case `results`, plus `passed`, `failed`, `total`

All test cases run in parallel — N cases take the same wall-clock time as 1.

### Execution History

```
GET /api/executions          # Last 20
GET /api/executions/:id      # Single execution
```

---

## Security Model

| Threat | Mitigation |
|---|---|
| Host filesystem writes | Read-only bind mount |
| Network exfiltration | `NetworkMode: none` |
| Memory exhaustion | 128MB RAM hard limit |
| Infinite loops / forkbombs | 10s timeout, `SIGKILL` |
| API abuse | 30 req/min per IP |
| Shell injection via stdin | File-based stdin, never interpolated |
| Container flooding | Bull queue caps at 5 concurrent |

---

## Known Limitations

- **~500–900ms cold start per execution** — a fresh container spins up per submission. Compatible with a future pre-warmed container pool, not implemented yet.
- **One file per submission** — no multi-file project support yet.
- **Single worker process** — Bull supports multi-process/multi-machine scaling with no code changes; not yet configured.
- **No user accounts** — all executions are anonymous.
- **No automated test suite** — validated manually and via k6 load tests; next priority before this is more than a portfolio project.

---

## Future Improvements

- Pre-warmed container pool
- CPU quotas alongside memory limits
- Multi-file project support
- WebSocket-based status updates
- Kubernetes deployment for horizontal scaling
- Automated test suite + CI pipeline
- Stronger isolation (gVisor/Firecracker) for untrusted multi-tenant use
