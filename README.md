A monorepo for a multiplayer game.

# Packages

| Package | Description |
|---------|-------------|
| `client`  | React Native (Expo) Android client with Skia rendering |
| `server`  | Deno WebSocket server with game logic authority |
| `bot`     | Deno headless client for testing |
| `game`    | Shared game logic for client-side prediction (planned) |
| `protocol`| Shared TypeScript types & msgpack utilities |
| `shell`   | REPL/command shell for server and bot |

## Server

```bash
cd packages/server
deno task start
```

## Client (Android)

```bash
cd packages/client
npx expo prebuild  # Generate android directory
npm run android
```

## Bot

```bash
# Start server first
cd packages/server && deno task start &

# Run bot
cd packages/bot
deno task start
```

## Tech Stack

- **Client**: React Native
- **Server**: Deno + msgpack
- **Protocol**: TypeScript + @msgpack/msgpack
