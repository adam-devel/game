export const WORLD_SIZE = 512;
export const MAX_PLAYERS = 5;
export const MAX_VELOCITY = 6;
export const MAX_HEALTH = 20;
export const MAX_STAMINA = 100;
export const FRICTION = 0.9;
export const MAX_MOVE_SPEED = 2;
export const ERSION_RATE = 0.01;
export const STAMINA_DRAIN = 0.5;
export const STAMINA_REGEN = 0.2;

// tile damage, from 0 to 1
export type TileDamage = number;
export type Tiles = TileDamage[][];

// body for simulation
export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type GameEvent =
  | { type: "INPUT_JOYSTICK"; player: Player; joystick: {vx: number, vy:number} }
  | { type: "DEATH"; player: Player; }

export function makeTiles(size: number = WORLD_SIZE): Tiles {
  const world: Tiles = [];
  for (let y = 0; y < size; y++) {
    world[y] = [];
    for (let x = 0; x < size; x++) {
      // tiles = number between 0.6 and 1 with a bias towards 1
      const tile = 0.6 + 0.4 * Math.pow(Math.random(), 0.3);
      // Round to one decimal place
      world[y][x] = Math.round(tile * 10) / 10;
    }
  }
  return world;
}

export function tick(players: Player[], tiles: Tiles, events:GameEvent[], dt: number): GameEvent[] {

  const newEvents: GameEvent[] = []

  // process events
  for (const evt of events){
    switch(evt.type) {
      case "INPUT_JOYSTICK":
        evt.player.vx = evt.joystick.vx * MAX_MOVE_SPEED
        evt.player.vy = evt.joystick.vy * MAX_MOVE_SPEED
    }
  }
  
  // compute player motion
  for (const player of players) {

    // reduce velocity by friction
    player.vx *= FRICTION;
    player.vy *= FRICTION;

    // compute updated location
    let newX = player.x + player.vx;
    let newY = player.y + player.vy;

    // bounce back against walls
    if (newX < 0) {
      newX = 0;
      player.vx = -player.vx * 0.5;
    }
    if (newX >= WORLD_SIZE) {
      newX = WORLD_SIZE - 1;
      player.vx = -player.vx * 0.5;
    }
    if (newY < 0) {
      newY = 0;
      player.vy = -player.vy * 0.5;
    }
    if (newY >= WORLD_SIZE) {
      newY = WORLD_SIZE - 1;
      player.vy = -player.vy * 0.5;
    }

    // set player location
    player.x = newX;
    player.y = newY;

    // weak tiles erode with players on them
    const standingX = Math.floor(player.x);
    const standingY = Math.floor(player.y);
    const tile = tiles[standingY][standingX];
    if (tile < 0.3 && tile > 0) {
      tiles[standingY][standingX] = Math.max(0, tile - ERSION_RATE);
    }

    // death if standing on a broken tile
    if (tile <= 0) {
      events.push({ type: "DEATH", player: player });
    }
  }

  // collision detection
  for (const us of players) {
    for (const them of players) {
      if (us === them) continue;
      const dx = us.x - them.x;
      const dy = us.y - them.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let hitboxRadius = 0.5;
      let otherHitbox = 0.5;
      let ourMass = 1;
      let theirMass = 1;
      let damage = 0;
      let theirResistance = 0;

      // if (us.mode === "K") {
      //   hitboxRadius = 0.3;
      //   ourMass = 0.5;
      // } else if (us.mode === "R") {
      //   hitboxRadius = 0.8;
      //   ourMass = 2;
      // } else if (us.mode === "A") {
      //   damage = 10;
      // }

      // if (them.mode === "K") {
      //   otherHitbox = 0.3;
      //   theirMass = 0.5;
      // } else if (them.mode === "R") {
      //   otherHitbox = 0.8;
      //   theirMass = 2;
      //   theirResistance = 0.1;
      // }


      if (distance < hitboxRadius + otherHitbox) {
        // if (damage > 0) {
        //   events.push({ type: "HIT", playerId: us.id, targetId: them.id, damage });
        // }

        const ourStrength = Math.sqrt(us.vx * us.vx + us.vy * us.vy);
        const theirStrength = Math.sqrt(them.vx * them.vx + them.vy * them.vy);

        if (ourStrength > theirStrength) {
          const push = (ourStrength * ourMass) / theirMass;
          const angle = Math.atan2(dy, dx);
          them.vx += Math.cos(angle) * push;
          them.vy += Math.sin(angle) * push;
        }
      }
    }
  }

  return newEvents;
}
