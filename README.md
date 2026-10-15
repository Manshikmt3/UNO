# UNO Arena — Multiplayer & AI Card Game

**UNO Arena** is a polished, modern, web-based card game featuring real-time online multiplayer and single-player play against intelligent AI opponents. Built with an authoritative TypeScript Node.js backend, a standalone deterministic game engine, and a React + Vite + Tailwind CSS frontend.

---

## 🌟 Key Features

### 1. Online Multiplayer
- **Private Rooms & Codes:** Create private rooms with a unique 6-character room code (e.g. `ARENA4`).
- **Shareable Invite Links:** Share direct invite links using the browser's native Web Share API with an automatic copy-to-clipboard fallback (`/join/:code`).
- **Real-Time Synchronization:** Authoritative server state keeps card plays, turns, active colors, draw pile counts, and winner declarations synchronized across 2–4 players.
- **Private Hand Isolation:** The server never broadcasts hidden hands. Each client receives only their own private cards (`Card[]`), while other clients only see public card counts.
- **Graceful Reconnection:** Reconnection tokens restore the player's session and hand after network hiccups without leaking secrets.
- **AI Bots in Multiplayer:** Host can fill vacant room slots with Easy, Medium, or Hard AI bots.
- **Rematch & Leave Options:** Vote for a rematch after a game finishes, or safely leave with automatic host re-election.

### 2. Single Player (Play vs Computer)
- **1 to 3 AI Opponents:** Play 1v1 heads-up or 3–4 player games against computerized opponents.
- **Three AI Difficulty Levels:**
  - **Easy:** Picks random legal cards.
  - **Medium:** Heuristically prioritizes dominant colors, saves Wilds for tight spots, and attacks low-card opponents.
  - **Hard:** Evaluates risk, tracks color distribution, calculates Wild Draw 4 challenge odds without cheating, and aggressively protects against opponent UNO calls.
- **Realistic Thinking Delays:** Human-like pace so plays can be followed naturally.

### 3. Official Tournament Game Engine & Deck Rules
- **Standard 108 Cards:**
  - 4 Colors: Red, Blue, Green, Yellow
  - 1x Zero card per color (4 total)
  - 2x Numbers 1–9 per color (72 total)
  - 2x Skip, Reverse, and Draw Two (+2) per color (24 total)
  - 4x Wild cards & 4x Wild Draw Four (+4) cards (8 total)
- **2-Player Reverse Rule:** In 2-player games, Reverse behaves as a Skip.
- **Wild Draw Four Challenge Rule:** Official rule enforced! WD4 is only legal if the player holds no cards matching the active color. Opponents can Accept (+4) or Challenge (guilty player draws 4; innocent player causes challenger to draw 6).
- **Draw-and-Play Rule:** If a drawn card is playable, the player can choose to immediately play it or keep it and pass.
- **Calling UNO & Catch Penalties:** Players must call UNO when reaching 1 card. Opponents can click "Catch UNO" before the next turn to inflict a 2-card penalty!
- **Empty Draw Pile Recycling:** Top discard card is preserved; remainder is shuffled back into the draw pile.

### 4. Gaming UI/UX & Aesthetics
- **Dark Aesthetic:** Charcoal/navy canvas (`#0b0f19`) with deep slate felt table and ambient radial glows.
- **3D Card Elevation:** Glossy gradient surfaces, high-contrast symbols, and hover lifts.
- **Web Audio Sound Effects:** Instant, zero-dependency procedural audio synthesis for card deals, snaps, special swooshes, wild chimes, UNO horns, and victory fanfares.
- **Confetti Celebrations:** Visual victory confetti on game finish.
- **Accessibility:** Full keyboard navigability, semantic tags, and responsive layouts for mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack & Monorepo Architecture

```
uno-arena/
├── package.json                 # Root npm workspace definition
├── tsconfig.base.json           # Shared TypeScript compiler options
├── playwright.config.ts         # End-to-end browser test configuration
├── packages/
│   ├── shared/                  # Common types, Zod schemas, socket events
│   │   ├── src/types/           # Cards, Player, Game, Room, Events
│   │   └── src/schemas/         # Zod schemas for runtime socket payload validation
│   └── game-engine/             # Deterministic UNO engine & AI
│       ├── src/deck/            # 108-card deck generator, Fisher-Yates shuffle
│       ├── src/rules/           # Move validator, WD4 challenge legality
│       ├── src/actions/         # Pure transition reducers (play, draw, challenge)
│       ├── src/scoring/         # Official tournament scoring
│       └── src/ai/              # Easy, Medium, Hard AI decision algorithms
├── apps/
│   ├── server/                  # Authoritative Node.js + Express + Socket.IO server
│   │   ├── src/rooms/           # RoomManager, session storage, reconnect tokens
│   │   ├── src/security/        # Sliding window rate limiter & action mutex
│   │   ├── src/socket/          # Typed event listeners & state projection
│   │   └── src/api/             # Health and room info REST endpoints
│   └── client/                  # React 18 + Vite + Tailwind CSS frontend
│       ├── src/components/      # UnoCard, Hand, DrawPile, DiscardPile, Modals
│       ├── src/stores/          # Zustand stores (AI game, multiplayer, settings)
│       ├── src/hooks/           # Web Audio SFX hook
│       └── src/pages/           # LandingPage, AIGamePage, MultiplayerPage, RulesPage
└── tests/
    └── e2e/                     # Playwright tests
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. Clone the repository and navigate into the project root:
   ```bash
   cd UNO
   ```

2. Install all monorepo dependencies:
   ```bash
   npm install
   ```

3. Build the shared packages:
   ```bash
   npm run build --workspace=@uno-arena/shared
   npm run build --workspace=@uno-arena/game-engine
   ```

---

## 💻 Running the Application

### Start Both Client & Server (Development Mode)
```bash
# Starts Express/Socket.IO backend on :4000 and Vite React client on :5173
npm run dev
```

Or start them individually in separate terminal sessions:
```bash
# Start backend server
npm run dev:server

# Start Vite client
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🧪 Automated Testing

### Run All Unit and Integration Tests
```bash
npm run test
```

### Run Package-Specific Tests
```bash
# Game Engine unit tests (Deck, Rules, Scoring, AI, Reducer)
npm run test:engine

# Backend Server tests (REST API, RoomManager, Socket.IO integration)
npm run test:server

# Frontend Client tests (React Testing Library, Component specs)
npm run test:client
```

### Run End-to-End Playwright Tests
```bash
npm run test:e2e
```

### Run TypeScript Typechecking
```bash
npm run typecheck
```

---

## 🌐 Multiplayer Socket Event Specification

### Client to Server
| Event | Payload | Description |
|---|---|---|
| `createRoom` | `{ playerName, avatar, settings? }` | Creates a private room and returns a reconnect token |
| `joinRoom` | `{ roomCode, playerName, avatar }` | Joins a room by 6-character code |
| `reconnectRoom` | `{ roomId, playerId, reconnectToken }` | Restores private view after network drop |
| `setReady` | `{ isReady }` | Toggles player readiness in lobby |
| `startGame` | `(none)` | Host starts game when 2+ players are ready |
| `playCard` | `{ cardId, chosenColor? }` | Plays card from hand with optional Wild color |
| `drawCard` | `(none)` | Draws from draw pile |
| `playDrawnCard` | `{ play, chosenColor? }` | Decides whether to play drawn card immediately |
| `chooseColor` | `{ color }` | Selects active color after playing Wild card |
| `callUno` | `(none)` | Declares UNO when holding 1-2 cards |
| `catchUno` | `{ targetPlayerId }` | Penalizes an opponent with 1 card who forgot to call UNO |
| `challengeWd4` | `{ challenge }` | Accepts or challenges a Wild Draw Four play |
| `requestRematch` | `(none)` | Votes for another round |
| `addAiPlayer` | `{ difficulty }` | Host adds an AI bot to room |
| `removeAiPlayer` | `{ playerId }` | Host removes an AI bot |
| `leaveRoom` | `(none)` | Leaves current room |

### Server to Client
| Event | Payload | Description |
|---|---|---|
| `roomCreated` / `roomJoined` | `{ room, reconnectToken, playerId }` | Room details and private credentials |
| `roomUpdated` | `{ room }` | Emitted when players join, leave, or ready status changes |
| `gameStateUpdated` | `{ gameState }` | Authoritative public game state |
| `yourHandUpdated` | `{ hand }` | Isolated private cards emitted only to recipient |
| `actionRejected` | `{ reason }` | Emitted when an illegal move is attempted |
| `rematchRequested` | `{ playerId, playerName }` | Notifies room of a rematch vote |

---

## 🔒 Security & Authority Highlights
- **No Client Cheating:** The server strictly checks whose turn it is, whether the card is in the player's authoritative hand, and whether the card is legally playable.
- **Hands are Kept Private:** `gameStateUpdated` contains only card counts (`cardCount: number`). Hands are dispatched individually over secure direct socket rooms.
- **Action Serialization:** Each room maintains an internal action queue mutex to guarantee atomic processing and eliminate concurrency race conditions.
- **Rate Limiting:** Sliding-window rate limiter prevents socket spam.

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel, Netlify, Cloudflare Pages)
1. Set the root directory or client directory to `apps/client`.
2. Build command:
   ```bash
   npm run build
   ```
3. Output directory: `apps/client/dist`.
4. Environment variable:
   - `VITE_SERVER_URL`: URL of your deployed backend (e.g. `https://uno-arena-server.onrender.com`).

### Backend Deployment (Render, Fly.io, Railway, DigitalOcean)
1. Environment variables:
   - `PORT`: `4000` (or host provided `$PORT`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: URL of your deployed frontend (e.g. `https://uno-arena.vercel.app`)
2. Build command:
   ```bash
   npm run build --workspace=@uno-arena/shared && npm run build --workspace=@uno-arena/game-engine && npm run build --workspace=@uno-arena/server
   ```
3. Start command:
   ```bash
   node apps/server/dist/index.js
   ```

*Note on In-Memory State:* Active game rooms are stored in server memory. To support horizontal scaling across multiple server instances in the future, connect Socket.IO via `@socket.io/redis-adapter` and store rooms in Redis.
