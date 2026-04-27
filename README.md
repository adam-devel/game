Creating a multiplayer game. The foundation is ready for implementing the game and removing the placeholder "TicTacToe" logic. 

# Packages

- `@game/server`: The game server
- `@game/client`: The Android client
- `@game/bot`: A headless client for testing purposes
- `@game/game`: The game logic
- `@game/protocol`: Defines the structure of valid messages
- `@game/shell`: A shell for interacting with the server and bot

# Game Flow

1. **WAITING**: 2-5 players join a world. Players can move but cannot dig, attack, or push
2. **PLAYING**: Majority votes to start. All actions enabled
3. **OVER**: Last survivor wins

# Prediction & Reconciliation

- Both server and client use the same `@game/game` simulation function
- Server processes actions then broadcasts the same EVENTs for the clients to process
- Server periodically sends SYNC to for clients to reconcile drift

# Quick Demo

1. clone the repository (`git clone --recurse-submodules https://github.com/adam-devel/game`)
2. install deno: `choco install deno` if you are using choclaty
3. run the server with `deno task server`
4. run a client: you can start the bot with `deno task bot`
