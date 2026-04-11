# Cahier des charges - Projet de jeu multijoueur

## 1. Presentation du projet

Le present projet consiste a concevoir et developper un **jeu multijoueur en temps reel en 2D**, inspire des mini-jeux de type *Spleef* du jeu Minecraft.

Le jeu met en competition plusieurs joueurs dans une arene ou l'objectif est d'etre le **dernier survivant**.

---

## 2. Objectifs

* Developper un jeu multijoueur en temps reel
* Assurer une experience fluide grace a des mecanismes de **prediction et de reconciliation**
* Permettre a **2 a 5 joueurs** de jouer simultanement par monde, le serveur etant capable d'hberger plusieurs mondes en parallele
* Concevoir une architecture **modulaire et reutilisable**

---

## 3. Public cible

* Joueurs occasionnels recherchant une expérience compétitive
* Développeurs: projet open source favorisant l'apprentissage et l'hackabilité du code
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
   * Toutes les actions sont activées (attaquer, pousser, creuser le sol)

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
* Plateforme cible : Android

---

### 6.2 Modele reseau

Le systeme repose sur :

* La **prediction cote client**
* L'**autorite du serveur**
* Une **synchronisation periodique**

#### Fonctionnement :

1. Le client simule les actions localement
2. Le serveur valide et diffuse les evenements
3. Le client corrige les ecarts (reconciliation)

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
