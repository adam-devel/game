# Test Cases

## Game States

| ID | State | Description |
|----|-------|-------------|
| TC001 | WAITING | 2-5 players join a world, can move but cannot dig/attack/push |
| TC002 | PLAYING | Majority votes to start, all actions enabled |
| TC003 | OVER | Last survivor wins |

## Core Level (Pure, Stateless Functions)

| ID | Function | Description |
|----|----------|-------------|
| TC010 | Tile types | Distinguish solid vs cracked tiles |
| TC011 | Tile break | Player on broken tile falls into void and dies |
| TC012 | Collision | Detect player-to-player collision |
| TC013 | Ball physics | Ball trajectory and knockback calculation |
| TC014 | Movement validation | Validate movement within world bounds |

## Operations Level

### Player Management

| ID | Description |
|----|-------------|
| TC020 | Player joins new world |
| TC021 | Player joins existing world |
| TC022 | Player leaves world |
| TC023 | Player disconnects |

### Voting System

| ID | Description |
|----|-------------|
| TC030 | Majority votes to start game |
| TC031 | Timer countdown begins |
| TC032 | Vote removed cancels timer |
| TC033 | Player leaving cancels timer |
| TC034 | Max players reached starts game |

### Game Actions (PLAYING state only)

| ID | Description |
|----|-------------|
| TC040 | Break tile |
| TC041 | Bump into other player |
| TC042 | Shoot ball at player |
| TC043 | Receive ball knockback |

### Game Flow

| ID | Description |
|----|-------------|
| TC050 | Game starts from majority vote |
| TC051 | Game starts from max players |
| TC052 | Player dies (fall into void) |
| TC053 | Last survivor wins → OVER state |

## Prediction & Reconciliation

| ID | Description |
|----|-------------|
| TC060 | Client predicts outcome using same simulation |
| TC061 | Server broadcasts EVENTs for client processing |
| TC062 | Server sends SYNC for drift reconciliation |

## Future Features (Out of Scope for v1)

| ID | Feature | Description |
|----|---------|-------------|
| TC070 | Sprint | Use stamina to dash in straight line |
| TC071 | Attack mode | Enter attack mode with spear |
| TC072 | Dash | Smaller hitbox, faster movement, harder knock |
| TC073 | Defend (Rock mode) | Larger hitbox, heavier, tiles break beneath |
| TC074 | Camera zoom | Auto-zoom on player proximity |