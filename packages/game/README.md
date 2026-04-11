# Module Architecture

This module defines the game. The purpose of the module to simulate the game. This module is used by the server to advance the game state and is used by the client to predict outcomes for smoother gameplay. so the same simulation function is used by both server and client. This module shouldn't make assumptions about the platform it's running on, therefore the code must not rely on any APIs besides ECMAScript

The module's API are separated into separate levels:
- core: pure, stateless functions.
- operations: high-level game management: players, worlds, votes, etc..

the operational API provides a client API and a Server API, both APIs make no assumptions about available server/client APIs, rather the API is driven by the consumer.

# Game Mechanics

A 2D game inspired by "Spleef" minigames in Minecraft.

Players join a new world where they wait for players, or they join an existing world of other players waiting for them. Players are allowed to move around and see other players move around. The game starts when the majority votes to start or the maximum number of players is reached.

When the majority of players vote, a timer begins counting down for the game to officially start. The counter is canceled if a player takes away their vote or leaves.

The world is made of tiles. Most tiles are solid, some tiles are cracked. When the game starts, players are allowed to break tiles, bump into other players, or shoot balls at them to knock them off a solid tile into a cracked one.

When a tile breaks, a player standing on it falls into the void and dies.

# Future Development

- **Sprint**: A player may sprint to use stamina, or fill it to dash in a straight line and run away from a pursuer. Stamina automatically refills.
- **Attack**: A player can enter "attack mode" where they appear holding a spear. In attack mode, the player deals damage when bumping into another player.
- **Dash**: When dashing, the player's body becomes smaller, reducing their hitbox. They move faster and knock other players harder, but the higher velocity makes it harder to control movement, risking a fall.
- **Defend**: In rock mode, the player puffs up with a larger hitbox. They become heavier—slower movement but harder to knock. If hit by a high-velocity player, that player takes damage (like hitting a wall). However, the added weight causes tiles beneath the player to break, even solid ones.
- The camera automatically zooms in when a player gets close to another player to make aiming or dodging easier in modes like "attack".

