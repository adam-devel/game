Creating the 2D multiplayer game "Spleef"

# Prerequisites

Install deno. If you have choclaty run:
```
choco install deno
```

# Usage

Clone the repository:

```
git clone --recurse-submodules https://github.com/adam-devel/game
```

Run the server:

```
deno task server
```

Run the mobile client

# Modules

- `@spleef/server`: The game server
- `@spleef/client`: The Android client
- `@spleef/bot`: A headless client for testing purposes
- `@spleef/game`: The game logic
- `@spleef/protocol`: Defines the structure of valid messages
- `@spleef/shell`: A shell for interacting with the server and bot

Both server and client use the same `@spleef/game` module for game simulation.
The server and client use the same `@spleef/protocol` to agree on valid protocol message structure
