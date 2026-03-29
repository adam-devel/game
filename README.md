Building the foundation for a multiplayer game.
Currently tictactoe will serve as a placeholder,
once the foundation is solid, a different game will be implemented.

# Packages

- `@game/server`: The game server
- `@game/client`: The Android client
- `@game/bot`: A headless client for testing purposes
- `@game/game`: The game logic
- `@game/protocol`: Defines the structure of valid messages
- `@game/shell`: A shell for interacting with the server and bot

# Overview

A sequence of events is best suited to overview the project.   

- @game/server listens for WebSocket connections
- @game/client connects via WebSocket and sends a join message
    - @game/client receives a "wait" message: waiting for an opponent
    - or @game/client receives a "start" message: the game starts
- @game/client initializes the game based on the received state
- @game/server refuses further join messages, until the match ends
- @game/client updates the game state and send a "move" the user played
- @game/server processes the "move" and broadcasts a "sync" message with the new state
- @game/server sends an "over" message when the game is over, then closes the connection

# Demo

1. clone the repository (`git clone https://github.com/...`)
2. install deno
3. run the server with `deno task server`
4. run a client: you can start the bot with `deno task bot`