# Module Architecture

This module defines the game. The purpose of the module to simulate the game. This module is used by the server to advance the game state and is used by the client to predict outcomes for smoother gameplay. so the same simulation function is used by both server and client. This module shouldn't make assumptions about the platform it's running on, therefore the code must not rely on any APIs besides ECMAScript

The module's API are separated into separate levels:
- core: pure, stateless functions.
- operations: high-level game management: players, worlds, votes, etc..

the operational API provides a client API and a Server API, both APIs make no assumptions about available server/client APIs, rather the API is driven by the consumer.

# The game

A 2d game inspired by "spleef" minigames in minecraft.

Players join a new world where they wait for players, or they join an existing world of other players waiting for them. players are allowed to move around and see the other players move around. The game start when the majority votes for it to start or the maximum number of players is reached.

When the majority of the players vote, a timer begins to countdown until the game officially starts. if a game take a away their vote the counter is cancelled.

The world is made of tiles. Most tiles are solid, some tiles are half broken. When the game starts, players are allowed to attack each other and break tiles.

A player can be in default mode, attack mode, knock mode, or rock mode. in attack mode, the player is rendered as having a spear by their side. in attack mode the player deals damage. when the player is in knock mode it's body gets smaller, it gets a smaller hitbox, and is faster so it knocks players harder, however the higher velocity makes it harder for the player to control their motion, so it's high risk high reward. in knock mode the player body puffs up and gets a bigger hitbox, however they become heavier: slower movement but harder to kock. also if you get hit by someone coming at you with high velocity they get dealt some damage. however because you are heavier, the tiles under you start breaking, even if a tile is solid (solidness = 1) it starts breaking up. default mode is a middleground.

A player may sprint and use up their stamina, or they can fill up their stamina to "dash" in a straight line and run away from a coming player. stamina automatically refills.

When a player is in attack mode or rock mode, the camera automatically zooms in when they get closer to a player to make it easier to aim.

When a tile is broken, a player standing on it falls into the void and dies
