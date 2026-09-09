# Générateur de topologie — Système d'information

Interface graphique locale (HTML + vis.js) pour dessiner la topologie d'un système
d'information. **Fonctionne entièrement hors-ligne** : la librairie vis.js et les
icônes SVG sont embarquées dans le projet, aucun accès internet n'est requis.

## Démarrage

Ouvrir simplement `index.html` dans un navigateur récent (Chrome, Firefox, Edge, Safari).
Aucun serveur ni installation nécessaire.

## Fonctionnalités

- **Clic droit** sur la zone de dessin : ajouter un élément
  - Switch, Firewall, Serveur, NAS, Machine virtuelle, Routeur, VM Linux, VM Windows,
    Cloud, Internet, Disque dur, Clé USB, Imprimante, Baie
- **Clic droit sur un élément** : créer un lien depuis cet élément, ajouter un élément,
  **renommer l'élément**, **renuméroter les éléments de ce type**, **grouper la
  sélection**, supprimer l'élément
- **Clic droit sur un lien** : changer son type, **renommer le lien**, le supprimer
- **Clic droit sur le fond** : créer un **groupe / sous-réseau** (rectangle nommable) ou
  ajouter un élément
- **Clic droit sur un groupe** : le **renommer**, le **supprimer** (les éléments restent)
- **Renommer** un élément ou un lien : un libellé personnalisé est demandé (boîte de
  dialogue). Il est conservé au changement de langue, à la sauvegarde et à l'import.
  Laisser le nom vide restaure le libellé par défaut (type + numéro / type de lien).
- **Types de liens** (choisis après sélection des deux éléments)
  - Lien 10 Gb/s fibre optique (bleu ciel)
  - Lien 1 Gb/s fibre optique (bleu foncé)
  - Lien 10 Gb/s RJ45 (vert clair)
  - Lien 1 Gb/s RJ45 (vert foncé)
  - Lien 1 Gb/s RJ45 (gris)
  - Lien en pointillé
- **Icônes** distinctes pour chaque type d'élément (SVG autonomes)
- **Sauvegarder** la topologie dans un fichier JSON (bouton « Sauvegarder JSON »)
- **Importer** une topologie depuis un fichier JSON (bouton « Importer JSON »)
- **Exporter** la topologie en JPEG (bouton « Exporter JPEG »)
- **Fond noir / blanc** (bouton « Fond : … »)
- **Langue française / anglaise** (bouton « English » / « Français ») : traduit toute
  l'interface (boutons, menus, messages, légende) ainsi que les libellés des éléments et
  des liens. La langue choisie est appliquée immédiatement.
- **Déplacer un élément** : glisser-déposer (drag & drop natif vis.js) — maintenir le
  bouton gauche de la souris sur l'élément et bouger la souris. La nouvelle position est
  conservée (sauvegarde JSON, export JPEG).
- **Confort d'édition**
  - **Annuler / Rétablir** : `Ctrl+Z` / `Ctrl+Y` (ou boutons) — historique des actions
    (ajout, suppression, déplacement, renommage, groupe, renumérotation, import…).
  - **Supprimer la sélection** : touche `Suppr` / `Backspace`.
  - **Ajuster la vue** : bouton « Ajuster » ou touche `F2` (recadre toute la topologie).
  - **Sélection multiple** : clic pour sélectionner, `Ctrl`/`Cmd`+clic pour ajouter/retirer,
    `Maj`+glisser pour une sélection rectangulaire. Glisser un élément sélectionné
    déplace **tous** les éléments sélectionnés.
  - **Lien par glisser-déposer** : `Alt`+glisser depuis un élément vers un autre, puis
    choix du type de lien.
  - **Grille / calage** : bouton « Grille » — affiche une grille et cale les positions
    des éléments sur ses pas (20 px) à la création et au dépôt d'un glisser-déposer.
  - **Recherche** : champ « Rechercher… » — filtre par libellé, `Entrée` passe au
    résultat suivant (sélection + recentrage de la vue), compteur `x/y`.
  - **Titre** : champ de titre personnalisable, conservé dans le JSON et utilisé comme
    nom de fichier à la sauvegarde / à l'export.
- **Groupes / sous-réseaux** : rectangles nommables (VLAN, étage, datacenter…) qui
  englobent visuellement des éléments. Créer au clic droit sur le fond ou « Grouper la
  sélection ». Déplacer un groupe déplace aussi les éléments qu'il contient ; poignée en
  bas à droite pour le redimensionner.
- **Renumérotation** : « Renuméroter les … » (clic droit sur un élément) réattribue les
  numéros 1..N aux éléments du même type, dans l'ordre de création. Les libellés
  personnalisés (renommés) sont conservés.
- **Animation du trafic réseau** :
  1. Activer « Mode animation »
  2. Cliquer (bouton gauche) sur les éléments par lesquels le trafic passe, **dans l'ordre**
     (un anneau numéroté matérialise l'ordre ; re-cliquer retire un élément)
  3. « Démarrer » : une pastille lumineuse parcourt les liens (plus court chemin entre
     deux éléments consécutifs), les liens du parcours sont mis en évidence

Navigation : glisser un élément pour le déplacer (plusieurs sélectionnés : déplacement
groupé), glisser le fond pour déplacer la vue, molette pour zoomer.

Raccourcis clavier :
- `Ctrl+Z` annuler · `Ctrl+Y` (ou `Ctrl+Shift+Z`) rétablir
- `Suppr` / `Backspace` supprimer la sélection
- `F2` ajuster la vue à la topologie
- `Maj` + glisser : sélection rectangulaire
- `Ctrl`/`Cmd` + clic : ajout / retrait à la sélection
- `Alt` + glisser (d'un élément à l'autre) : créer un lien
- `Échap` annuler la création de lien / le geste en cours, fermer le menu, vider la
  recherche

## Format du fichier JSON

```json
{
  "version": 1,
  "background": "light",
  "title": "Ma topologie",
  "nodes": [
    { "id": "n1", "type": "switch", "num": 1, "name": null, "label": "Switch 1", "x": 100, "y": 200 }
  ],
  "edges": [
    { "id": "e1", "from": "n1", "to": "n2", "linkType": "fiber10", "name": null }
  ],
  "groups": [
    { "id": "g1", "label": "VLAN 10", "x": 50, "y": 50, "w": 320, "h": 220, "color": 0 }
  ]
}
```

`type` ∈ `switch`, `firewall`, `server`, `nas`, `vm`, `router`, `vm_linux`, `vm_windows`,
`cloud`, `internet`, `hdd`, `usb`, `printer`, `bay`
`linkType` ∈ `fiber10`, `fiber1`, `rj45_10`, `rj45_1`, `rj45_g`, `dashed`
`num` : numéro d'instance (pour le libellé par défaut `type + numéro`)
`name` : libellé personnalisé (renommage) ; `null` si le libellé par défaut est utilisé
`title` : titre de la topologie (nom de fichier à la sauvegarde / à l'export)
`groups` : groupes / sous-réseaux ; `x`,`y` = coin haut-gauche (coordonnées monde),
`w`,`h` = dimensions, `color` = index de couleur (0..4)

## Structure

```
index.html            page principale
css/style.css         styles
js/app.js             application (menus, liens, JSON, JPEG, animation)
js/icons.js           icônes SVG en data URL
js/vis/vis-network.min.js   librairie vis.js (vis-network 9.1.9) embarquée
```
