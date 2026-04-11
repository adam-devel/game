# Cahier des charges - Projet de jeu multijoueur

## 1. Presentation du projet

Le present projet consiste a concevoir et developper un **jeu multijoueur en temps reel en 2D**, inspire des mini-jeux de type *Spleef* du jeu Minecraft.

Le jeu met en competition plusieurs joueurs dans une arene ou l'objectif est d'etre le **dernier survivant**.

---

## 2. Objectifs

* Developper un jeu multijoueur en temps reel
* Assurer une experience fluide grace a des mecanismes de **prediction et de reconciliation**
* Permettre a **2 a 5 joueurs** de jouer simultanement par monde, le serveur etant capable d'heberger plusieurs mondes en parallele
* Concevoir une architecture **modulaire et reutilisable**

---

## 3. Public cible

* Joueurs occasionnels recherchant une experience competitive
* Developpeurs: projet open source favorisant l'apprentissage et l'hackabilite du code
* Utilisateurs sur appareils Android

---

## 4. Architecture du systeme

Le projet est structure en plusieurs modules :

* `@game/server` : gestion du serveur et des parties
* `@game/client` : client Android
* `@game/bot` : client automatise pour les tests
* `@game/game` : logique du jeu (simulation)
* `@game/protocol` : definition des messages reseau
* `@game/shell` : interface en ligne de commande pour les administrateurs

### Principe cle

La logique du jeu est **partagee entre le client et le serveur**, garantissant une coherence du comportement.

---

## 5. Description du jeu

### 5.1 Deroulement d'une partie

Une partie se deroule en trois phases :

1. **WAITING (attente)**

   * Les joueurs rejoignent la partie (2 a 5 joueurs)
   * Deplacements autorises uniquement

2. **PLAYING (jeu)**

   * Debut apres vote majoritaire ou nombre maximum atteint
   * Toutes les actions sont activees (attaquer, pousser, creuser le sol)

3. **OVER (fin de partie)**

   * Le dernier joueur survivant emporte la partie

---

### 5.2 Mecaniques de jeu

Le jeu se deroule dans un monde en **2D compose de tuiles** :

* Tuiles solides
* Tuiles fragiles (cassables)

#### Actions des joueurs :

* Se deplacer
* Casser des tuiles
* Pousser d'autres joueurs
* Lancer des projectiles

#### Regle principale :

Lorsqu'une tuile se brise sous un joueur, celui-ci tombe et est elimine.

---

## 6. Specifications techniques

### 6.1 Technologies

* Langage : TypeScript
* Environnement : Deno
* Client mobile : React Native
* Graphisme : Skia (react-native-skia)
* Serialisation : MessagePack (msgpack.org)

---

### 6.2 Transport et protocole reseau

Le jeu utilise des **WebSockets** pour la communication bidirectionnelle en temps reel. Les messages sont serialises avec **MessagePack** pour minimiser la taille des payloads tout en offrant un parsing rapide.

#### 6.2.1 Architecture des messages

Chaque message suit un format minimal :

```
[message_type: uint8][payload: msgpack_data]
```

* **message_type** : identifiant numerique (0-255) sur 1 octet
* **payload** : donnees msgpack correspondant au type de message

Les payloads sont des **tableaux plats** (pas d'objets imbriques). Cela minimise la latence en eliminant :
- Le surcout de parsing des structures JSON/msgpack avec clefs
- L'overhead memoire des chaines de caracteres utilisees comme clefs
- La redondance des clefs repetees dans chaque message

Exemple : `[0x04, 2, 1, false]` au lieu de `[0x04, {"seq": 2, "dir": 1, "atk": false}]`

Cette approche ne compromet pas la maintenabilite grace aux **tuples TypeScript** qui permettent d'attacher des labels descriptifs aux champs :

```typescript
type InputMessage = [0x04, seq: number, direction: Direction, action: Action];
```

Le code reste lisible et auto-documentant tout en profitant des performances du format binaire plat.

#### 6.2.2 Catalogue des types de messages

| ID  | Direction       | Nom              | Description                          |
|-----|-----------------|------------------|--------------------------------------|
| 0x01| C->S             | `join`           | Requete de rejoindre une partie      |
| 0x02| S->C             | `join_ack`       | Confirmation d'inscription           |
| 0x03| S->C             | `join_nack`      | Refus (monde plein, etc.)            |
| 0x04| C->S             | `input`          | Entree joueur (direction, action)     |
| 0x05| S->C             | `state_delta`    | Delta d'etat du monde                 |
| 0x06| S->C             | `player_join`    | Notification qu'un joueur rejoint    |
| 0x07| S->C             | `player_leave`   | Notification qu'un joueur quitte     |
| 0x08| S->C             | `vote_start`     | Notification de vote recu            |
| 0x09| C->S             | `vote`           | Action de voter pour demarrer        |
| 0x0A| S->C             | `countdown`      | Compte a rebours avant le jeu        |
| 0x0B| S->C             | `game_start`     | Debut officiel de la partie           |
| 0x0C| S->C             | `game_over`      | Fin de partie, annonce du gagnant    |
| 0x0D| S->C             | `ping`           | Keep-alive / latence                 |
| 0x0E| C->S             | `pong`           | Reponse au ping                      |
| 0xFF| S->C            | `snapshot`       | etat complet (reconciliation)         |

#### 6.2.3 Optimisation de la bande passante

* **Entity interpolation** : le client interpole les positions des autres joueurs entre deux mises a jour serveur
* **Snapshot periodic** : toutes les 1-2 secondes, un etat complet est envoye pour resynchroniser en cas de drift

#### 6.2.4 Exemples de payloads

```msgpack
# Input joueur (C->S)
[0x04, 2, 1, false]  # seq=2, direction=1 (droite), action=aucune

# State delta (S->C)
[0x05, 42, [[10, 20], [15, 25]], [[3, 4]]]
# tick=42, positions=[[x,y]...], tiles detruites=[[x,y]...]

# Snapshot complet (S->C)
[0xFF, 1000, 2, [
  [1, 10.5, 20.3, 1.2, 0],
  [2, 15.0, 25.0, 0, 0]
], [...], [1, 2]]
# tick, phase, players=[[id,x,y,vx,vy]...], tiles, votes
```

---

### 6.3 Modele reseau

Le systeme repose sur :

* La **prediction cote client**
* L'**autorite du serveur**
* Une **synchronisation periodique**

#### Fonctionnement :

1. Le client simule les actions localement des reception de l'input
2. Le serveur valide, simule a son tour, et diffuse les delta d'etat
3. Le client corrige les ecarts (reconciliation) lors de la reception du snapshot ou si deviation > seuil

---

### 6.4 Architecture serveur

Le serveur Deno :

* Gere plusieurs **mondes en parallele** via des fibres/taches concurrentes
* Chaque monde possede son propre **game loop** cadence a intervalle fixe (60 tick/s)
* Les connexions WebSocket sont **multiplexees** par monde via un router
* Le serveur est **sans etat** vis-a-vis des mondes : les mondes resident en memoire et ne sont pas persistes

#### Schema simplifie :

```
[Client] <--WebSocket--> [Server] <--router--> [WorldManager]
                                      +-- World A --> GameLoop (60 Hz)
                                      +-- World B --> GameLoop (60 Hz)
                                      +-- ...
```

---

### 6.5 Architecture client

Le client Android :

* Simulation **deterministe** partagee avec le serveur (module `@game/game`)
* Boucle de rendu separee de la boucle de simulation
* **Prediction locale** : affiche immediatement le resultat des inputs
* **Reconciliation** : compare l'etat simule avec le snapshot serveur, corrige si necessaire
* **Interpolation** : lisse le mouvement des autres joueurs entre deux `state_delta`

---

## 7. Exigences fonctionnelles

Le systeme doit permettre :

* A un joueur de :

  * Rejoindre une partie
  * Se deplacer en temps reel
  * Interagir avec l'environnement
  * Voter pour demarrer la partie

* Au systeme de :

  * Gerer les etats de jeu
  * Synchroniser les joueurs
  * Gerer les collisions et la physique

---

## 8. Exigences non fonctionnelles

* **Performance** : gameplay fluide
* **Fiabilite** : coherence entre clients
* **Maintenabilite** : code modulaire
* **Scalabilite** : support de plusieurs joueurs

---

## 9. Evolutions prevues

Fonctionnalites envisagees :

* Systeme de sprint et d'endurance
* Mode attaque (armes)
* Mecanique de dash
* Mode defense (augmentation de masse)
* Zoom dynamique de la camera

---

## 10. Livrables

* Jeu multijoueur fonctionnel
* Code source
* Documentation d'installation et d'utilisation

---

## 11. Tests

* Tests via clients automatises (bots)
* Tests manuels
* Verification de la synchronisation

---

## 12. Contraintes

* Nombre de joueurs limite
* Absence de moteur de jeu externe
