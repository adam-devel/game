# Bot

Deno bot client for testing the game server.

## Run

```bash
deno task start
```

Requires server running on `ws://localhost:3000/ws`.

## What it does

1. Connects to server via WebSocket
3. Sends test inputs
4. Logs game state updates
5. Disconnects
