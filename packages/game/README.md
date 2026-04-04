# The game

A 2d game inspired by "spleef" minigames in minecraft.

* Punch/Push: any player may punch a player, which would knock the player and reduce their health
* Dig: any player can dig a hole
* Fall: if a player falls into a hole they die

# The code

This module defines the game. The purpose of the module to simulate the game.
This module is used by the server to advance the game, and by the client to
predict outcomes for smoother gameplay. This module isn't aware of the server or
the client

> [!WARN]
> The code here must not rely on any APIs outside besides ECMAScript. It must be portable.
