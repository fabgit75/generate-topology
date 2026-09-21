'use strict';

/* ============================================================
 * Générateur de topologie de système d'information
 * - vis.js (vis-network) embarqué, 100 % hors-ligne
 * - clic droit : ajout d'éléments (switch, firewall, serveur, NAS, VM, …)
 *   et de liens entre éléments
 * - déplacement des éléments par glisser-déposer (drag & drop natif vis.js)
 * - sélection (clic, Maj+clic, rectangle Maj+glisser) et Suppr au clavier
 * - lien par Alt+glisser d'un élément vers un autre
 * - annuler / rétablir (Ctrl+Z / Ctrl+Y), copier / coller (Ctrl+C / Ctrl+V),
 *   ajuster la vue (F2), grille de calage
 * - recherche d'élément, titre personnalisable
 * - groupes / sous-réseaux (rectangles), renumérotation des éléments d'un type
 * - sauvegarde / import JSON, export JPEG, fond noir / blanc, FR / EN
 * - visualisation 3D (three.js) : rotation à la souris, zoom molette
 * - animation du trafic réseau sur les éléments sélectionnés
 * ============================================================ */

/* ===== Types de liens (attributs techniques ; libellés en I18N) ===== */
const LINK_TYPES = {
  fiber10: { color: '#38bdf8', dashes: false, width: 5 },
  fiber1:  { color: '#1d4ed8', dashes: false, width: 4 },
  rj45_10: { color: '#86efac', dashes: false, width: 5 },
  rj45_1:  { color: '#15803d', dashes: false, width: 4 },
  rj45_g:  { color: '#9ca3af', dashes: false, width: 3 },
  dashed:  { color: '#a855f7', dashes: true,  width: 3 },
};

/* ===== Types d'éléments (icônes ; libellés en I18N) ===== */
const DEVICE_TYPES = {
  switch:     { icon: window.TopoIcons.switch },
  firewall:   { icon: window.TopoIcons.firewall },
  server:     { icon: window.TopoIcons.server },
  nas:        { icon: window.TopoIcons.nas },
  vm:         { icon: window.TopoIcons.vm },
  router:     { icon: window.TopoIcons.router },
  vm_linux:   { icon: window.TopoIcons.vm_linux },
  vm_windows: { icon: window.TopoIcons.vm_windows },
  cloud:      { icon: window.TopoIcons.cloud },
  internet:   { icon: window.TopoIcons.internet },
  hdd:        { icon: window.TopoIcons.hdd },
  usb:        { icon: window.TopoIcons.usb },
  printer:    { icon: window.TopoIcons.printer },
  bay:        { icon: window.TopoIcons.bay },
  text:       { icon: window.TopoIcons.text, textOnly: true },
};

/* ===== Internationalisation (FR / EN) ===== */
const I18N = {
  fr: {
    docTitle: "Générateur de topologie — Système d'information",
    brand: "Générateur de topologie SI",
    langName: "français",
    bg: { light: "blanc", dark: "noir" },
    device: { switch: "Switch", firewall: "Firewall", server: "Serveur", nas: "NAS", vm: "Machine virtuelle", router: "Routeur", vm_linux: "VM Linux", vm_windows: "VM Windows", cloud: "Cloud", internet: "Internet", hdd: "Disque dur", usb: "Clé USB", printer: "Imprimante", bay: "Baie", text: "Texte" },
    link: {
      fiber10: { label: "Lien 10 Gb/s fibre optique", short: "10G fibre" },
      fiber1:  { label: "Lien 1 Gb/s fibre optique",  short: "1G fibre" },
      rj45_10: { label: "Lien 10 Gb/s RJ45",          short: "10G RJ45" },
      rj45_1:  { label: "Lien 1 Gb/s RJ45",           short: "1G RJ45" },
      rj45_g:  { label: "Lien 1 Gb/s RJ45 (gris)",    short: "1G RJ45 gris" },
      dashed:  { label: "Lien en pointillé",          short: "pointillé" },
    },
    btn: {
      undo: "Annuler", undoTitle: "Annuler la dernière action (Ctrl+Z)",
      redo: "Rétablir", redoTitle: "Rétablir l'action annulée (Ctrl+Y)",
      fit: "Ajuster", fitTitle: "Ajuster la vue à toute la topologie (F2)",
      grid: "Grille", gridTitle: "Calage des éléments sur une grille (pas de 20 px)",
      save: "Sauvegarder JSON", saveTitle: "Sauvegarder la topologie dans un fichier JSON",
      import: "Importer JSON", importTitle: "Importer une topologie depuis un fichier JSON",
      export: "Exporter JPEG", exportTitle: "Exporter la topologie en fichier JPEG",
      themeTitle: "Changer la couleur de fond", themeLight: "Fond : blanc", themeDark: "Fond : noir",
      lang: "English", langTitle: "Passer en anglais",
      view3d: "3D", view3dTitle: "Basculer la visualisation 3D (Échap : retour en 2D)",
      animMode: "Mode animation", animModeTitle: "Activer le mode animation du trafic",
      animStart: "Démarrer", animStartTitle: "Démarrer l'animation du trafic",
      animStop: "Arrêter", animStopTitle: "Arrêter l'animation du trafic",
      clear: "Tout effacer", clearTitle: "Effacer toute la topologie",
    },
    menu: {
      newLinkFrom: "Nouveau lien depuis « {label} »",
      add: "Ajouter : {label}",
      renameNode: "Renommer cet élément",
      renumberType: "Renuméroter les {label}",
      groupSelection: "Grouper la sélection",
      removeNode: "Supprimer cet élément",
      changeLink: "Changer le type de lien",
      renameEdge: "Renommer ce lien",
      removeEdge: "Supprimer ce lien",
      newGroup: "Nouveau groupe",
      renameGroup: "Renommer ce groupe",
      removeGroup: "Supprimer ce groupe",
      copyNode: "Copier cet élément",
      paste: "Coller ici",
    },
    status: {
      initial: "Clic droit : ajouter un élément ou un lien · Glisser : déplacer · Maj+glisser : sélection rectangulaire · Alt+glisser d'un élément à l'autre : lien · Suppr : supprimer la sélection · Ctrl+C / Ctrl+V : copier / coller la sélection · Ctrl+Z / Ctrl+Y : annuler / rétablir · F2 : ajuster la vue.",
      added: "Élément ajouté : {label}",
      linkCreated: "Lien créé : {label}",
      linkChanged: "Lien modifié : {label}",
      renamed: "Élément renommé.",
      edgeRenamed: "Lien renommé.",
      removed: "Élément supprimé",
      edgeRemoved: "Lien supprimé",
      cleared: "Topologie effacée",
      theme: "Couleur de fond : {color}",
      saved: "Topologie sauvegardée (JSON).",
      exported: "Topologie exportée (JPEG).",
      imported: "Topologie importée : {n} éléments, {e} liens.",
      linkCancel: "Création de lien annulée.",
      linkPrompt: "Choisissez le type de lien :",
      linkTarget: "Lien : cliquez (bouton gauche) sur l’élément cible. Échap pour annuler.",
      animModeOn: "Mode animation : cliquez (bouton gauche) les éléments PAR LESQUELS LE TRAFIC PASSE, dans l’ordre. Re-cliquer un élément sélectionné le retire.",
      animModeOff: "Mode animation désactivé.",
      animRunning: "Animation du trafic en cours. Bouton « Arrêter » pour stopper.",
      langChanged: "Langue : {lang}",
      view3dOn: "Vue 3D : glisser pour pivoter · molette pour zoomer · Échap pour revenir en 2D.",
      view3dOff: "Retour à la vue 2D.",
      undone: "Action annulée.",
      redone: "Action rétablie.",
      gridOn: "Grille : calage actif (pas de 20 px).",
      gridOff: "Grille : calage désactivé.",
      groupAdded: "Groupe ajouté : « {label} ».",
      groupRemoved: "Groupe supprimé.",
      groupRenamed: "Groupe renommé.",
      groupMoved: "Groupe déplacé.",
      groupResized: "Groupe redimensionné.",
      renumbered: "Renumérotation appliquée : {label}.",
      searchNone: "Aucun élément trouvé.",
      copied: "{n} élément(s) copié(s).",
      pasted: "{n} élément(s) collé(s).",
      pasteEmpty: "Rien à coller.",
    },
    dlg: {
      clearConfirm: "Effacer toute la topologie ?",
      renameNode: "Nouveau nom de l'élément :",
      textContent: "Texte à afficher :",
      ok: "OK",
      cancel: "Annuler",
      textHint: "Entrée : nouvelle ligne · Ctrl+Entrée : valider",
      renameEdge: "Nouveau nom du lien :",
      groupName: "Nom du groupe :",
      noPath: "Aucun chemin réseau entre « {a} » et « {b} ».",
      invalidJson: "Fichier JSON invalide : {msg}",
      exportImpossible: "Export impossible.",
      no3D: "Bibliothèque 3D absente : js/three/three.min.js.",
    },
    search: { ph: "Rechercher un élément…" },
    title: { ph: "Titre de la topologie" },
    group: { default: "Groupe {n}" },
    file: { defaultName: "topologie" },
  },
  en: {
    docTitle: "Topology generator — IT system",
    brand: "IT topology generator",
    langName: "English",
    bg: { light: "white", dark: "black" },
    device: { switch: "Switch", firewall: "Firewall", server: "Server", nas: "NAS", vm: "Virtual machine", router: "Router", vm_linux: "Linux VM", vm_windows: "Windows VM", cloud: "Cloud", internet: "Internet", hdd: "Hard drive", usb: "USB drive", printer: "Printer", bay: "Enclosure", text: "Text" },
    link: {
      fiber10: { label: "10 Gb/s fiber optic link", short: "10G fiber" },
      fiber1:  { label: "1 Gb/s fiber optic link",  short: "1G fiber" },
      rj45_10: { label: "10 Gb/s RJ45 link",        short: "10G RJ45" },
      rj45_1:  { label: "1 Gb/s RJ45 link",         short: "1G RJ45" },
      rj45_g:  { label: "1 Gb/s RJ45 link (gray)",  short: "1G RJ45 gray" },
      dashed:  { label: "Dashed link",              short: "dashed" },
    },
    btn: {
      undo: "Undo", undoTitle: "Undo the last action (Ctrl+Z)",
      redo: "Redo", redoTitle: "Redo the undone action (Ctrl+Y)",
      fit: "Fit", fitTitle: "Fit the view to the whole topology (F2)",
      grid: "Grid", gridTitle: "Snap elements to a grid (20 px step)",
      save: "Save JSON", saveTitle: "Save the topology to a JSON file",
      import: "Import JSON", importTitle: "Import a topology from a JSON file",
      export: "Export JPEG", exportTitle: "Export the topology to a JPEG file",
      themeTitle: "Change the background color", themeLight: "Background: white", themeDark: "Background: black",
      lang: "Français", langTitle: "Switch to French",
      view3d: "3D", view3dTitle: "Toggle the 3D view (Escape: back to 2D)",
      animMode: "Animation mode", animModeTitle: "Enable traffic animation mode",
      animStart: "Start", animStartTitle: "Start the traffic animation",
      animStop: "Stop", animStopTitle: "Stop the traffic animation",
      clear: "Clear all", clearTitle: "Clear the entire topology",
    },
    menu: {
      newLinkFrom: "New link from “{label}”",
      add: "Add: {label}",
      renameNode: "Rename this element",
      renumberType: "Renumber the {label}",
      groupSelection: "Group the selection",
      removeNode: "Remove this element",
      changeLink: "Change link type",
      renameEdge: "Rename this link",
      removeEdge: "Remove this link",
      newGroup: "New group",
      renameGroup: "Rename this group",
      removeGroup: "Remove this group",
      copyNode: "Copy this element",
      paste: "Paste here",
    },
    status: {
      initial: "Right-click: add an element or a link · Drag: move · Shift+drag: box selection · Alt+drag from one element to another: link · Del: delete selection · Ctrl+C / Ctrl+V: copy / paste selection · Ctrl+Z / Ctrl+Y: undo / redo · F2: fit view.",
      added: "Element added: {label}",
      linkCreated: "Link created: {label}",
      linkChanged: "Link changed: {label}",
      renamed: "Element renamed.",
      edgeRenamed: "Link renamed.",
      removed: "Element removed",
      edgeRemoved: "Link removed",
      cleared: "Topology cleared",
      theme: "Background color: {color}",
      saved: "Topology saved (JSON).",
      exported: "Topology exported (JPEG).",
      imported: "Topology imported: {n} elements, {e} links.",
      linkCancel: "Link creation cancelled.",
      linkPrompt: "Choose the link type:",
      linkTarget: "Link: left-click the target element. Escape to cancel.",
      animModeOn: "Animation mode: left-click the elements THROUGH WHICH TRAFFIC PASSES, in order. Clicking a selected element again removes it.",
      animModeOff: "Animation mode disabled.",
      animRunning: "Traffic animation running. Use the “Stop” button to stop.",
      langChanged: "Language: {lang}",
      view3dOn: "3D view: drag to orbit · wheel to zoom · Escape to go back to 2D.",
      view3dOff: "Back to the 2D view.",
      undone: "Action undone.",
      redone: "Action redone.",
      gridOn: "Grid: snapping on (20 px step).",
      gridOff: "Grid: snapping off.",
      groupAdded: "Group added: “{label}”.",
      groupRemoved: "Group removed.",
      groupRenamed: "Group renamed.",
      groupMoved: "Group moved.",
      groupResized: "Group resized.",
      renumbered: "Renumbering applied: {label}.",
      searchNone: "No element found.",
      copied: "{n} element(s) copied.",
      pasted: "{n} element(s) pasted.",
      pasteEmpty: "Nothing to paste.",
    },
    dlg: {
      clearConfirm: "Clear the entire topology?",
      renameNode: "New name for the element:",
      textContent: "Text to display:",
      ok: "OK",
      cancel: "Cancel",
      textHint: "Enter: new line · Ctrl+Enter: validate",
      renameEdge: "New name for the link:",
      groupName: "Name of the group:",
      noPath: "No network path between “{a}” and “{b}”.",
      invalidJson: "Invalid JSON file: {msg}",
      exportImpossible: "Export impossible.",
      no3D: "3D library missing: js/three/three.min.js.",
    },
    search: { ph: "Search an element…" },
    title: { ph: "Topology title" },
    group: { default: "Group {n}" },
    file: { defaultName: "topology" },
  },
};

let lang = 'fr';

/* Traduit une clé I18N (chemin "a.b.c") avec interpolation des {param} */
function t(path, params) {
  const parts = path.split('.');
  let cur = I18N[lang];
  for (const p of parts) {
    if (cur === undefined || cur === null) return path;
    cur = cur[p];
  }
  if (typeof cur !== 'string') return path;
  if (params) for (const k in params) cur = cur.split('{' + k + '}').join(params[k]);
  return cur;
}

/* Libellé d'un élément = type traduit + numéro */
function nodeLabel(type, num) {
  return t('device.' + type) + ' ' + num;
}

/* ===== État global ===== */
let network = null;
let nodesDS = null;
let edgesDS = null;
let nextId = 1;
const counters = { switch: 0, firewall: 0, server: 0, nas: 0, vm: 0, router: 0, vm_linux: 0, vm_windows: 0, cloud: 0, internet: 0, hdd: 0, usb: 0, printer: 0, bay: 0, text: 0 };
let theme = 'light';
let linking = { active: false, source: null };
const anim = { mode: false, selected: [], running: false, startTime: 0, segments: [], highlighted: [] };
let lastStatus = null;

/* Historique (annuler / rétablir) */
const history = { undo: [], redo: [] };
const HISTORY_CAP = 100;
let dragSnapshot = null;

/* Groupes / sous-réseaux (rectangles en coordonnées monde, x,y = coin haut-gauche) */
let groups = [];
let groupSeq = 0;
const GROUP_COLORS = [
  { fill: 'rgba(56,189,248,0.10)', line: 'rgba(56,189,248,0.85)', text: '#0284c7' },
  { fill: 'rgba(134,239,173,0.12)', line: 'rgba(34,197,94,0.85)', text: '#15803d' },
  { fill: 'rgba(251,191,36,0.12)', line: 'rgba(245,158,11,0.85)', text: '#b45309' },
  { fill: 'rgba(244,114,182,0.12)', line: 'rgba(236,72,153,0.85)', text: '#be185d' },
  { fill: 'rgba(167,139,250,0.12)', line: 'rgba(139,92,246,0.85)', text: '#6d28d9' },
];

/* Grille / calage */
const GRID = 20;
let gridOn = false;

/* Titre de la topologie */
let topoTitle = '';

/* Geste en cours (drag-link Alt+glisser, déplacement/redimensionnement de groupe) */
let gesture = null;

/* Recherche */
let searchIdx = -1;
let searchMatches = [];

/* ===== Références DOM ===== */
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const fxCanvas = $('fx');
const fctx = fxCanvas.getContext('2d');
const menuEl = $('menu');
const statusEl = $('status');
const btnTheme = $('btn-theme');
const btnAnimMode = $('btn-anim-mode');
const btnAnimStart = $('btn-anim-start');
const btnAnimStop = $('btn-anim-stop');
const btnUndo = $('btn-undo');
const btnRedo = $('btn-redo');
const btnFit = $('btn-fit');
const btnGrid = $('btn-grid');
const btn3d = $('btn-3d');
const fileInput = $('file-import');
const searchInput = $('search');
const searchCount = $('search-count');
const titleInput = $('topo-title');
const dlgEl = $('dlg');
const dlgTitle = $('dlg-title');
const dlgInput = $('dlg-input');
const dlgOk = $('dlg-ok');
const dlgCancel = $('dlg-cancel');

const RING_COLOR = '#22d3ee';
const RING_RADIUS = 44;
const SEL_COLOR = '#22d3ee';
const SEL_RADIUS = 40;

/* ===== Petits utilitaires ===== */
function setStatus(key, params) {
  lastStatus = { key, params };
  statusEl.textContent = t(key, params);
}

function stageRect() {
  return stage.getBoundingClientRect();
}

/* Coordonnées d'un événement (MouseEvent vis ou événement Hammer) en pixels viewport */
function eventXY(ev) {
  if (!ev) return null;
  if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
    return { x: ev.clientX, y: ev.clientY };
  }
  if (ev.center && typeof ev.center.x === 'number' && typeof ev.center.y === 'number') {
    return { x: ev.center.x, y: ev.center.y };
  }
  if (ev.srcEvent && typeof ev.srcEvent.clientX === 'number') {
    return { x: ev.srcEvent.clientX, y: ev.srcEvent.clientY };
  }
  return null;
}

/* Position DOM (pixels CSS depuis le coin haut-gauche du canvas vis) */
function domPos(ev) {
  const xy = eventXY(ev);
  const r = stageRect();
  return { x: xy.x - r.left, y: xy.y - r.top };
}

function edgeProps(key) {
  const lt = LINK_TYPES[key];
  return {
    color: { color: lt.color },
    width: lt.width,
    dashes: lt.dashes,
    label: t('link.' + key + '.short'),
    linkType: key,
  };
}

/* Calage sur la grille si elle est active */
function snapPos(p) {
  if (!gridOn) return { x: p.x, y: p.y };
  return { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID };
}

/* Synchronise les positions du DataSet avec les positions réelles des nœuds
 * (vis.js ne met pas à jour le DataSet lors d'un glisser-déposer).
 * Renvoie true si au moins une position a changé. */
function syncPositions() {
  let changed = false;
  nodesDS.get().forEach((n) => {
    const p = network.getPosition(n.id);
    if (!p) return;
    const sp = snapPos(p);
    if (Math.abs(sp.x - n.x) > 1e-6 || Math.abs(sp.y - n.y) > 1e-6) {
      nodesDS.update({ id: n.id, x: sp.x, y: sp.y });
      changed = true;
    }
  });
  return changed;
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ===== Options vis-network ===== */
function buildOptions() {
  const label = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const halo = theme === 'dark' ? '#000000' : '#ffffff';
  return {
    autoResize: true,
    physics: false,
    interaction: {
      hover: true,
      dragView: true,
      dragNodes: true,
      zoomView: true,
      keyboard: false,
      multiselect: true,
      selectable: true,
    },
    layout: { improvedLayout: false },
    nodes: {
      shape: 'image',
      imagePadding: 4,
      font: {
        color: label,
        size: 14,
        face: 'system-ui, sans-serif',
        multi: false,
        strokeWidth: 4,
        strokeColor: halo,
      },
    },
    edges: {
      selectionWidth: 3,
      color: { highlight: SEL_COLOR },
      smooth: { enabled: true, type: 'continuous' },
      font: {
        color: label,
        size: 11,
        face: 'system-ui, sans-serif',
        align: 'middle',
        strokeWidth: 3,
        strokeColor: halo,
      },
    },
  };
}

/* ===== Initialisation ===== */
function init() {
  nodesDS = new vis.DataSet();
  edgesDS = new vis.DataSet();
  network = new vis.Network($('vis'), { nodes: nodesDS, edges: edgesDS }, buildOptions());

  network.on('oncontext', onRightClick);
  network.on('click', onLeftClick);
  network.on('dragStart', () => {
    dragSnapshot = snapshot();
  });
  network.on('dragEnd', () => {
    const changed = syncPositions();
    if (dragSnapshot !== null && changed) {
      pushHistoryRaw(dragSnapshot);
    }
    dragSnapshot = null;
  });

  /* Gestes pointeur : lien par Alt+glisser, déplacement/redimensionnement de groupe */
  stage.addEventListener('pointerdown', onStagePointerDown, true);
  stage.addEventListener('pointermove', onStageHover);
  window.addEventListener('pointermove', onWindowPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerCancel);

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  /* Fermer le menu au pointerdown (phase capture) : cet événement précède le
   * "click" DOM et l'événement "click" vis.js (tap) du MÊME clic, le menu
   * ouvert par vis.js lors de ce clic n'est donc jamais fermé aussitôt. */
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (!menuEl.contains(e.target)) closeMenu();
    },
    true
  );
  window.addEventListener('scroll', closeMenu, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!dlgEl.classList.contains('hidden')) {
        closeDlg(null);
        return;
      }
      if (view3d) {
        exit3D();
        return;
      }
      if (e.target === searchInput) {
        searchInput.value = '';
        onSearchInput();
        searchInput.blur();
      }
      closeMenu();
      cancelLinking();
      cancelGesture();
      return;
    }
    /* Les champs texte gardent leur clavier (édition, Ctrl+Z texte, etc.) */
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      e.preventDefault();
      redo();
    } else if (e.key === 'F2') {
      e.preventDefault();
      fitToScreen();
    } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'c' || e.key === 'C')) {
      copyNodes(network.getSelectedNodes());
    } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      pasteAt(network.getViewPosition());
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelection();
    }
  });
  window.addEventListener('resize', resizeFx);

  $('btn-save').onclick = saveJSON;
  $('btn-import').onclick = () => fileInput.click();
  $('btn-export').onclick = exportJPEG;
  btnTheme.onclick = toggleTheme;
  $('btn-lang').onclick = toggleLang;
  btnAnimMode.onclick = toggleAnimMode;
  btnAnimStart.onclick = startAnim;
  btnAnimStop.onclick = stopAnim;
  $('btn-clear').onclick = clearAll;
  btnUndo.onclick = undo;
  btnRedo.onclick = redo;
  btnFit.onclick = fitToScreen;
  btnGrid.onclick = toggleGrid;
  btn3d.onclick = toggle3D;
  fileInput.onchange = onImportFile;
  searchInput.addEventListener('input', onSearchInput);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchNext();
    }
  });
  titleInput.addEventListener('focus', () => {
    titleInput.dataset.before = titleInput.value;
  });
  titleInput.addEventListener('input', () => {
    topoTitle = titleInput.value.trim();
    updateDocTitle();
  });
  titleInput.addEventListener('change', () => {
    const v = titleInput.value.trim();
    if (v !== (titleInput.dataset.before || '')) {
      pushHistory();
      topoTitle = v;
      updateDocTitle();
    }
  });

  /* Fenêtre de saisie texte multiligne */
  dlgOk.onclick = () => closeDlg(dlgInput.value);
  dlgCancel.onclick = () => closeDlg(null);
  dlgEl.onclick = (e) => {
    if (e.target === dlgEl) closeDlg(null); // clic hors du panneau : annuler
  };
  dlgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      closeDlg(dlgInput.value);
    }
  });

  applyTheme();
  applyLang();
  resizeFx();
  updateUndoRedo();
  setStatus('status.initial');
  requestAnimationFrame(fxLoop);
}

/* ===== Thème (fond noir / blanc) ===== */
function applyTheme() {
  stage.style.background = theme === 'dark' ? '#000000' : '#ffffff';
  const label = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const halo = theme === 'dark' ? '#000000' : '#ffffff';
  if (network) {
    network.setOptions({
      nodes: { font: { color: label, strokeWidth: 4, strokeColor: halo } },
      edges: { font: { color: label, strokeWidth: 3, strokeColor: halo } },
    });
  }
    btnTheme.textContent = theme === 'dark' ? t('btn.themeDark') : t('btn.themeLight');
    btnTheme.title = t('btn.themeTitle');
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  refresh3D();
  setStatus('status.theme', { color: t('bg.' + theme) });
}

/* ===== Langue (FR / EN) ===== */
/* Re-rend toutes les chaînes de l'interface dans la langue courante */
function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('docTitle');
  const brand = document.querySelector('#toolbar .brand');
  if (brand) brand.textContent = t('brand');
  setBtnText('btn-undo', 'btn.undo', 'btn.undoTitle');
  setBtnText('btn-redo', 'btn.redo', 'btn.redoTitle');
  setBtnText('btn-fit', 'btn.fit', 'btn.fitTitle');
  setBtnText('btn-grid', 'btn.grid', 'btn.gridTitle');
  setBtnText('btn-save', 'btn.save', 'btn.saveTitle');
  setBtnText('btn-import', 'btn.import', 'btn.importTitle');
  setBtnText('btn-export', 'btn.export', 'btn.exportTitle');
  setBtnText('btn-anim-mode', 'btn.animMode', 'btn.animModeTitle');
  setBtnText('btn-anim-start', 'btn.animStart', 'btn.animStartTitle');
  setBtnText('btn-anim-stop', 'btn.animStop', 'btn.animStopTitle');
  setBtnText('btn-clear', 'btn.clear', 'btn.clearTitle');
  setBtnText('btn-lang', 'btn.lang', 'btn.langTitle');
  setBtnText('btn-3d', 'btn.view3d', 'btn.view3dTitle');
  setBtnText('dlg-ok', 'dlg.ok');
  setBtnText('dlg-cancel', 'dlg.cancel');
  dlgInput.title = t('dlg.textHint');
  searchInput.placeholder = t('search.ph');
  titleInput.placeholder = t('title.ph');
  const btnTheme = document.getElementById('btn-theme');
  if (btnTheme) {
    btnTheme.textContent = theme === 'dark' ? t('btn.themeDark') : t('btn.themeLight');
    btnTheme.title = t('btn.themeTitle');
  }
  document.querySelectorAll('#legend .llabel').forEach((s) => {
    s.textContent = t(s.dataset.key);
  });
  /* Libellés des nœuds (type + numéro) et des liens (type de lien).
   * Les libellés personnalisés (renommés) sont conservés tels quels. */
  if (nodesDS) {
    nodesDS.get().forEach((n) => {
      if (n.name != null) return;
      if (typeof n.num === 'number') nodesDS.update({ id: n.id, label: nodeLabel(n.type, n.num) });
    });
    edgesDS.get().forEach((e) => {
      if (e.name != null) return;
      if (LINK_TYPES[e.linkType]) edgesDS.update({ id: e.id, label: t('link.' + e.linkType + '.short') });
    });
  }
  /* Statut courant */
  if (lastStatus) statusEl.textContent = t(lastStatus.key, lastStatus.params);
}

function setBtnText(id, textKey, titleKey) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = t(textKey);
  if (titleKey) el.title = t(titleKey);
}

function toggleLang() {
  lang = lang === 'fr' ? 'en' : 'fr';
  applyLang();
  setStatus('status.langChanged', { lang: t('langName') });
}

/* ===== Dialogue texte multiligne (éléments « Texte ») ===== */
/* prompt() ne permet pas les retours à la ligne : une modale avec <textarea>
 * sert à la saisie et au renommage des éléments de type « texte ». */
let dlgCb = null;

function askText(title, initial, cb) {
  closeDlg(null); /* annule une saisie précédente éventuellement ouverte */
  dlgTitle.textContent = title;
  dlgInput.value = initial || '';
  dlgCb = cb;
  dlgEl.classList.remove('hidden');
  dlgInput.focus();
  dlgInput.select();
}

function closeDlg(value) {
  dlgEl.classList.add('hidden');
  const cb = dlgCb;
  dlgCb = null;
  if (cb) cb(value);
}

/* ===== Ajout / suppression d'éléments et de liens ===== */
/* Rendu d'un nœud : icône pour les appareils, pur texte pour l'annotation */
function nodeVisual(type) {
  const d = DEVICE_TYPES[type];
  return d && d.textOnly ? { shape: 'text' } : { image: d ? d.icon : DEVICE_TYPES.server.icon };
}

function addDevice(type, worldPos) {
  if (DEVICE_TYPES[type].textOnly) {
    askText(t('dlg.textContent'), '', (txt) => {
      if (txt === null) return; // annulé : rien n'est ajouté
      addDeviceCore(type, worldPos, String(txt).trim() || null);
    });
    return null; // l'ajout est différé jusqu'à la validation de la fenêtre
  }
  return addDeviceCore(type, worldPos, null);
}

function addDeviceCore(type, worldPos, name) {
  pushHistory();
  const d = DEVICE_TYPES[type];
  counters[type] += 1;
  const num = counters[type];
  const id = 'n' + nextId++;
  const sp = snapPos(worldPos);
  const label = name != null ? name : nodeLabel(type, num);
  nodesDS.add({
    id,
    type,
    num,
    name,
    label,
    ...nodeVisual(type),
    x: sp.x,
    y: sp.y,
  });
  setStatus('status.added', { label });
  return id;
}

function addEdge(from, to, key) {
  pushHistory();
  const id = 'e' + nextId++;
  edgesDS.add({ id, from, to, name: null, ...edgeProps(key) });
  setStatus('status.linkCreated', { label: t('link.' + key + '.label') });
}

/* ===== Renommage (libellé personnalisé, conservé au changement de langue) ===== */
function renameNode(id) {
  const n = nodesDS.get(id);
  if (!n) return;
  const current = n.name != null ? n.name : n.label;
  if (n.type && DEVICE_TYPES[n.type] && DEVICE_TYPES[n.type].textOnly) {
    /* éléments « texte » : saisie multiligne */
    askText(t('dlg.renameNode'), current, (newName) => applyRenameNode(id, newName));
    return;
  }
  applyRenameNode(id, prompt(t('dlg.renameNode'), current));
}

function applyRenameNode(id, newName) {
  if (newName === null) return; // annulé
  const n = nodesDS.get(id);
  if (!n) return;
  const current = n.name != null ? n.name : n.label;
  const trimmed = String(newName).trim();
  if (trimmed === '') {
    /* nom vide : retour au libellé par défaut */
    pushHistory();
    nodesDS.update({ id, name: null, label: nodeLabel(n.type, n.num) });
  } else if (trimmed !== current) {
    pushHistory();
    nodesDS.update({ id, name: trimmed, label: trimmed });
  } else {
    return;
  }
  setStatus('status.renamed');
}

function renameEdge(id) {
  const e = edgesDS.get(id);
  if (!e) return;
  const current = e.name != null ? e.name : e.label;
  const newName = prompt(t('dlg.renameEdge'), current);
  if (newName === null) return; // annulé
  const trimmed = String(newName).trim();
  if (trimmed === '') {
    /* nom vide : retour au libellé par défaut du type de lien */
    pushHistory();
    edgesDS.update({ id, name: null, label: t('link.' + e.linkType + '.short') });
  } else if (trimmed !== current) {
    pushHistory();
    edgesDS.update({ id, name: trimmed, label: trimmed });
  } else {
    return;
  }
  setStatus('status.edgeRenamed');
}

/* Suppression « cœur » (sans historique ni statut) : les appelants poussent
 * l'historique et affichent le statut, afin de regrouper les suppressions
 * multiples (touche Suppr) en une seule action annulable. */
function removeNodeCore(id) {
  edgesDS
    .get()
    .filter((e) => e.from === id || e.to === id)
    .forEach((e) => edgesDS.remove(e.id));
  nodesDS.remove(id);
  anim.selected = anim.selected.filter((x) => x !== id);
  if (linking.source === id) cancelLinking();
  btnAnimStart.disabled = anim.selected.length < 2;
}

function removeEdgeCore(id) {
  edgesDS.remove(id);
}

function removeNode(id) {
  pushHistory();
  removeNodeCore(id);
  setStatus('status.removed');
}

function removeEdge(id) {
  pushHistory();
  removeEdgeCore(id);
  setStatus('status.edgeRemoved');
}

/* Supprime la sélection courante (touche Suppr / Backspace).
 * La sélection est lue directement dans vis.js (valide aussi pour une
 * sélection faite par programme). NB : getSelectedNodes() renvoie des ids. */
function deleteSelection() {
  const nIds = network.getSelectedNodes();
  const eIds = network.getSelectedEdges();
  if (!nIds.length && !eIds.length) return;
  pushHistory();
  eIds.forEach(removeEdgeCore);
  nIds.forEach(removeNodeCore);
  setStatus(nIds.length ? 'status.removed' : 'status.edgeRemoved');
}

/* ===== Copier / coller d'éléments ===== */
/* Le presse-papiers interne mémorise les éléments copiés (type, libellé
 * personnalisé, positions relatives) ; la collée recrée de nouveaux éléments
 * (numéros incrémentés pour les libellés par défaut). */
let clipboard = [];

function copyNodes(ids) {
  const nodes = ids.map((id) => nodesDS.get(id)).filter(Boolean);
  if (!nodes.length) return;
  clipboard = nodes.map((n) => {
    const p = network.getPosition(n.id) || n;
    return { type: n.type, name: n.name, x: p.x, y: p.y };
  });
  setStatus('status.copied', { n: clipboard.length });
}

function pasteAt(worldPos) {
  if (!clipboard.length) {
    setStatus('status.pasteEmpty');
    return;
  }
  pushHistory();
  const xs = clipboard.map((c) => c.x);
  const ys = clipboard.map((c) => c.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const ids = clipboard.map((c) => {
    counters[c.type] += 1;
    const num = counters[c.type];
    const id = 'n' + nextId++;
    const label = c.name != null ? c.name : nodeLabel(c.type, num);
    const sp = snapPos({ x: worldPos.x + c.x - cx, y: worldPos.y + c.y - cy });
    nodesDS.add({ id, type: c.type, num, name: c.name, label, ...nodeVisual(c.type), x: sp.x, y: sp.y });
    return id;
  });
  network.selectNodes(ids);
  setStatus('status.pasted', { n: ids.length });
}

/* Renumérotation : réattribue les numéros 1..N aux éléments d'un type
 * (ordre de création) ; les libellés personnalisés sont conservés. */
function renumberType(type) {
  const list = nodesDS
    .get()
    .filter((n) => n.type === type)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (!list.length) return;
  pushHistory();
  list.forEach((n, i) => {
    const patch = { num: i + 1 };
    if (n.name == null) patch.label = nodeLabel(type, i + 1);
    nodesDS.update({ id: n.id, ...patch });
  });
  counters[type] = list.length;
  setStatus('status.renumbered', { label: t('device.' + type) });
}

function clearAll() {
  if (!confirm(t('dlg.clearConfirm'))) return;
  pushHistory();
  stopAnim();
  cancelLinking();
  network.unselectAll();
  nodesDS.clear();
  edgesDS.clear();
  groups = [];
  Object.keys(counters).forEach((k) => (counters[k] = 0));
  nextId = 1;
  anim.selected = [];
  btnAnimStart.disabled = true;
  refresh3D();
  setStatus('status.cleared');
}

/* ===== Menu contextuel ===== */
function openMenu(x, y, items) {
  closeMenu();
  menuEl.innerHTML = '';
  items.forEach((it) => {
    if (it.separator) {
      menuEl.appendChild(document.createElement('hr'));
      return;
    }
    const b = document.createElement('button');
    if (it.icon) {
      const img = document.createElement('img');
      img.src = it.icon;
      img.alt = '';
      b.appendChild(img);
    }
    const span = document.createElement('span');
    span.textContent = it.label;
    b.appendChild(span);
    if (it.dot) {
      const dot = document.createElement('i');
      dot.className = 'dot';
      dot.style.background = it.color;
      b.appendChild(dot);
    }
    if (it.danger) b.classList.add('danger');
    b.onclick = (e) => {
      e.stopPropagation();
      closeMenu();
      it.action();
    };
    menuEl.appendChild(b);
  });
  menuEl.classList.remove('hidden');
  const mw = menuEl.offsetWidth;
  const mh = menuEl.offsetHeight;
  menuEl.style.left = Math.max(4, Math.min(x, window.innerWidth - mw - 4)) + 'px';
  menuEl.style.top = Math.max(4, Math.min(y, window.innerHeight - mh - 4)) + 'px';
}

function closeMenu() {
  menuEl.classList.add('hidden');
  menuEl.innerHTML = '';
}

function deviceMenuItems(worldFn) {
  return Object.entries(DEVICE_TYPES).map(([key, d]) => ({
    label: t('menu.add', { label: t('device.' + key) }),
    icon: d.icon,
    action: () => addDevice(key, worldFn()),
  }));
}

function linkTypeItems(callback) {
  return Object.entries(LINK_TYPES).map(([key, lt]) => ({
    label: t('link.' + key + '.label'),
    dot: true,
    color: lt.color,
    action: () => callback(key),
  }));
}

function onRightClick(p) {
  const ev = p.event;
  const xy = eventXY(ev);
  if (!xy) return;
  const dom = { x: xy.x - stageRect().left, y: xy.y - stageRect().top };
  const nodeId = network.getNodeAt(dom);
  const edgeId = network.getEdgeAt(dom);
  const world = () => network.DOMtoCanvas(dom);

  const items = [];
  if (nodeId !== undefined) {
    const n = nodesDS.get(nodeId);
    items.push({
      label: t('menu.newLinkFrom', { label: n.label }),
      action: () => startLinking(nodeId),
    });
    items.push({ separator: true });
    items.push(...deviceMenuItems(world));
    items.push({ separator: true });
    items.push({
      label: t('menu.renameNode'),
      action: () => renameNode(nodeId),
    });
    items.push({
      label: t('menu.renumberType', { label: t('device.' + n.type) }),
      action: () => renumberType(n.type),
    });
    items.push({
      label: t('menu.groupSelection'),
      action: () => groupFromSelection(nodeId),
    });
    items.push({
      label: t('menu.copyNode'),
      action: () => copyNodes([nodeId]),
    });
    items.push({ separator: true });
    items.push({
      label: t('menu.removeNode'),
      danger: true,
      action: () => removeNode(nodeId),
    });
  } else if (edgeId !== undefined) {
    const e = edgesDS.get(edgeId);
    items.push({
      label: t('menu.changeLink'),
      action: () =>
        openMenu(
          xy.x,
          xy.y,
          linkTypeItems((key) => {
            const cur = edgesDS.get(edgeId);
            if (!cur) return;
            if (cur.linkType !== key) pushHistory();
            const props = edgeProps(key);
            /* un lien renommé garde son libellé personnalisé */
            if (cur.name != null) {
              edgesDS.update({ id: edgeId, color: props.color, width: props.width, dashes: props.dashes, linkType: key });
            } else {
              edgesDS.update({ id: edgeId, ...props });
            }
            setStatus('status.linkChanged', { label: t('link.' + key + '.label') });
          })
        ),
    });
    items.push({
      label: t('menu.renameEdge'),
      action: () => renameEdge(edgeId),
    });
    items.push({
      label: t('menu.removeEdge'),
      danger: true,
      action: () => removeEdge(edgeId),
    });
  } else {
    const wp = network.DOMtoCanvas(dom);
    const g = groupAtWorld(wp.x, wp.y);
    if (g) {
      items.push({
        label: t('menu.renameGroup'),
        action: () => renameGroup(g.id),
      });
      items.push({
        label: t('menu.removeGroup'),
        danger: true,
        action: () => removeGroup(g.id),
      });
    } else {
      items.push({
        label: t('menu.newGroup'),
        action: () => createGroupAt(wp),
      });
      if (clipboard.length) {
        items.push({
          label: t('menu.paste'),
          action: () => pasteAt(wp),
        });
      }
      items.push({ separator: true });
      items.push(...deviceMenuItems(world));
    }
  }
  openMenu(xy.x, xy.y, items);
}

/* ===== Création de lien en deux étapes ===== */
function startLinking(source) {
  linking.active = true;
  linking.source = source;
  stage.style.cursor = 'crosshair';
  setStatus('status.linkTarget');
}

function cancelLinking() {
  if (!linking.active) return;
  linking.active = false;
  linking.source = null;
  stage.style.cursor = '';
  setStatus('status.linkCancel');
}

function onLeftClick(p) {
  const ev = p.event;
  const xy = eventXY(ev);
  if (!xy) return;
  const dom = { x: xy.x - stageRect().left, y: xy.y - stageRect().top };
  const nodeId = network.getNodeAt(dom);

  if (linking.active) {
    if (nodeId !== undefined && nodeId !== linking.source) {
      const src = linking.source;
      linking.active = false;
      linking.source = null;
      stage.style.cursor = '';
      setStatus('status.linkPrompt');
      openMenu(
        xy.x,
        xy.y,
        linkTypeItems((key) => {
          addEdge(src, nodeId, key);
          network.unselectAll();
        })
      );
    } else {
      cancelLinking();
    }
    return;
  }

  if (anim.mode && nodeId !== undefined) {
    toggleAnimNode(nodeId);
  }
}

/* ===== Historique (annuler / rétablir) ===== */
function snapshot() {
  return {
    nodes: nodesDS.get().map((n) => ({ ...n })),
    edges: edgesDS.get().map((e) => ({ ...e })),
    counters: { ...counters },
    nextId,
    title: topoTitle,
    groups: groups.map((g) => ({ ...g })),
  };
}

function pushHistoryRaw(snap) {
  history.undo.push(snap);
  if (history.undo.length > HISTORY_CAP) history.undo.shift();
  history.redo.length = 0;
  updateUndoRedo();
}

function pushHistory() {
  pushHistoryRaw(snapshot());
}

function restoreState(s) {
  stopAnim();
  cancelLinking();
  cancelGesture();
  network.unselectAll();
  nodesDS.clear();
  edgesDS.clear();
  s.nodes.forEach((n) => nodesDS.add({ ...n }));
  s.edges.forEach((e) => edgesDS.add({ ...e }));
  Object.keys(counters).forEach((k) => (counters[k] = (s.counters && s.counters[k]) || 0));
  nextId = s.nextId || 1;
  groups = (s.groups || []).map((g) => ({ ...g }));
  applyTitleState(s.title);
  anim.selected = anim.selected.filter((id) => nodesDS.get(id));
  btnAnimStart.disabled = !anim.mode || anim.selected.length < 2;
  refresh3D();
}

function undo() {
  if (!history.undo.length) return;
  history.redo.push(snapshot());
  restoreState(history.undo.pop());
  setStatus('status.undone');
}

function redo() {
  if (!history.redo.length) return;
  history.undo.push(snapshot());
  restoreState(history.redo.pop());
  setStatus('status.redone');
}

function updateUndoRedo() {
  btnUndo.disabled = !history.undo.length;
  btnRedo.disabled = !history.redo.length;
}

/* ===== Ajuster la vue à la topologie ===== */
function fitToScreen() {
  if (!nodesDS.length && !edgesDS.length) return;
  network.fit({ animation: false });
}

/* ===== Grille / calage ===== */
function toggleGrid() {
  gridOn = !gridOn;
  btnGrid.classList.toggle('active', gridOn);
  setStatus(gridOn ? 'status.gridOn' : 'status.gridOff');
}

/* ===== Recherche d'élément ===== */
function onSearchInput() {
  const q = searchInput.value.trim().toLowerCase();
  if (q === '') {
    searchMatches = [];
  } else {
    searchMatches = nodesDS.get().filter((n) => typeof n.label === 'string' && n.label.toLowerCase().includes(q));
  }
  searchIdx = -1;
  updateSearchCount();
}

function updateSearchCount() {
  if (!searchInput.value.trim()) {
    searchCount.textContent = '';
    return;
  }
  if (!searchMatches.length) {
    searchCount.textContent = t('status.searchNone');
    return;
  }
  searchCount.textContent = searchIdx < 0 ? '0/' + searchMatches.length : searchIdx + 1 + '/' + searchMatches.length;
}

function searchNext() {
  if (!searchMatches.length) return;
  searchIdx = (searchIdx + 1) % searchMatches.length;
  const n = searchMatches[searchIdx];
  network.selectNodes([n.id]);
  network.focus(n.id, {
    scale: Math.max(network.getScale(), 0.9),
    animation: { duration: 250, easingFunction: 'easeInOutQuad' },
  });
  updateSearchCount();
}

/* ===== Titre de la topologie ===== */
function updateDocTitle() {
  document.title = t('docTitle') + (topoTitle ? ' — ' + topoTitle : '');
}

function applyTitleState(title) {
  topoTitle = typeof title === 'string' ? title.trim() : '';
  titleInput.value = topoTitle;
  delete titleInput.dataset.before;
  updateDocTitle();
}

function safeFileName() {
  const base = topoTitle || t('file.defaultName');
  return base.replace(/[\\/:*?"<>|]+/g, '_').trim() || t('file.defaultName');
}

/* ===== Groupes / sous-réseaux ===== */
function groupAtWorld(wx, wy) {
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (wx >= g.x && wx <= g.x + g.w && wy >= g.y && wy <= g.y + g.h) return g;
  }
  return null;
}

function groupIndex(id) {
  return groups.findIndex((g) => g.id === id);
}

/* Poignée de redimensionnement : coin bas-droit du groupe, détectée en espace
 * écran (rayon fixe en px) pour rester facile à saisir quel que soit le zoom. */
const HANDLE_R = 13; /* rayon de saisie de la poignée, en px écran */
function handleAtDom(dom) {
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    const c = network.canvasToDOM({ x: g.x + g.w, y: g.y + g.h });
    if (Math.abs(dom.x - c.x) <= HANDLE_R && Math.abs(dom.y - c.y) <= HANDLE_R) return g;
  }
  return null;
}

function addGroup(x, y, w, h, label) {
  pushHistory();
  groupSeq += 1;
  const g = {
    id: 'g' + groupSeq,
    label,
    x,
    y,
    w,
    h,
    color: (groupSeq - 1) % GROUP_COLORS.length,
  };
  groups.push(g);
  setStatus('status.groupAdded', { label });
  return g;
}

/* Nouveau groupe (clic droit sur le fond) : rectangle centré sur le point */
function createGroupAt(worldPos) {
  const def = t('group.default', { n: groupSeq + 1 });
  const name = prompt(t('dlg.groupName'), def);
  if (name === null) return;
  const label = String(name).trim() || def;
  const W = 320;
  const H = 220;
  addGroup(snapPos(worldPos).x - W / 2, snapPos(worldPos).y - H / 2, W, H, label);
}

/* Grouper la sélection (ou l'élément sous le clic) dans un rectangle */
function groupFromSelection(fallbackId) {
  const selectedIds = network ? network.getSelectedNodes() : [];
  const ids = selectedIds.length ? selectedIds : fallbackId ? [fallbackId] : [];
  const pts = ids
    .map((id) => network.getPosition(id))
    .filter(Boolean);
  if (!pts.length) return;
  const PAD = 44;
  const minX = Math.min(...pts.map((p) => p.x)) - PAD;
  const maxX = Math.max(...pts.map((p) => p.x)) + PAD;
  const minY = Math.min(...pts.map((p) => p.y)) - PAD;
  const maxY = Math.max(...pts.map((p) => p.y)) + PAD;
  const def = t('group.default', { n: groupSeq + 1 });
  const name = prompt(t('dlg.groupName'), def);
  if (name === null) return;
  const label = String(name).trim() || def;
  addGroup(minX, minY, maxX - minX, maxY - minY, label);
}

function renameGroup(id) {
  const i = groupIndex(id);
  if (i < 0) return;
  const name = prompt(t('dlg.groupName'), groups[i].label);
  if (name === null) return;
  const label = String(name).trim();
  if (!label || label === groups[i].label) return;
  pushHistory();
  groups[i] = { ...groups[i], label };
  setStatus('status.groupRenamed');
}

function removeGroup(id) {
  const i = groupIndex(id);
  if (i < 0) return;
  pushHistory();
  groups.splice(i, 1);
  setStatus('status.groupRemoved');
}

/* ===== Gestes pointeur (lien Alt+glisser, groupes) ===== */
/* Feedback de curseur au survol (hors geste) : poignée de redimensionnement
 * (nwse-resize) et corps de groupe (move). Un nœud/lien au pointeur garde la
 * priorité : on ne force alors aucun curseur. */
function onStageHover(e) {
  if (view3d || gesture || !groups.length) return;
  const dom = domPos(e);
  if (network.getNodeAt(dom) !== undefined || network.getEdgeAt(dom) !== undefined) {
    if (stage.style.cursor === 'nwse-resize' || stage.style.cursor === 'move') stage.style.cursor = '';
    return;
  }
  if (handleAtDom(dom)) {
    stage.style.cursor = 'nwse-resize';
    return;
  }
  const wp = network.DOMtoCanvas(dom);
  stage.style.cursor = groupAtWorld(wp.x, wp.y) ? 'move' : '';
}

function onStagePointerDown(e) {
  if (view3d) return;
  if (e.button !== 0 || e.shiftKey) return;
  const dom = domPos(e);

  /* Alt + nœud : création de lien par glisser-déposer */
  if (e.altKey) {
    const nodeId = network.getNodeAt(dom);
    if (nodeId !== undefined) {
      gesture = { kind: 'dragLink', source: nodeId, start: dom, cur: dom, moved: false };
      network.setOptions({ interaction: { dragNodes: false, dragView: false } });
      stage.style.cursor = 'crosshair';
      e.stopPropagation();
      return;
    }
  }

  /* Groupe : redimensionnement (poignée coin bas-droit) puis déplacement.
   * Un nœud/lien au pointeur garde la priorité (pas de geste groupe). */
  if (network.getNodeAt(dom) === undefined && network.getEdgeAt(dom) === undefined) {
    const wp = network.DOMtoCanvas(dom);
    const gResize = handleAtDom(dom);
    if (gResize) {
      gesture = {
        kind: 'groupResize',
        g: gResize,
        orig: { ...gResize },
        startWorld: wp,
        moved: false,
        snap0: null,
      };
      network.setOptions({ interaction: { dragView: false } });
      stage.style.cursor = 'nwse-resize';
      e.stopPropagation();
      return;
    }
    const g = groupAtWorld(wp.x, wp.y);
    if (g) {
      const inside = nodesDS
        .get()
        .filter((n) => {
          const p = network.getPosition(n.id);
          return p && p.x >= g.x && p.x <= g.x + g.w && p.y >= g.y && p.y <= g.y + g.h;
        })
        .map((n) => ({ id: n.id, x: n.x, y: n.y }));
      gesture = {
        kind: 'groupDrag',
        g,
        startWorld: wp,
        origXY: { x: g.x, y: g.y },
        inside,
        moved: false,
        snap0: null,
      };
      network.setOptions({ interaction: { dragView: false } });
      stage.style.cursor = 'move';
      e.stopPropagation();
    }
  }
}

function onWindowPointerMove(e) {
  if (!gesture) return;
  const dom = domPos(e);

  if (gesture.kind === 'dragLink') {
    gesture.cur = dom;
    if (!gesture.moved && Math.hypot(dom.x - gesture.start.x, dom.y - gesture.start.y) > 5) {
      gesture.moved = true;
    }
    return;
  }

  const wp = network.DOMtoCanvas(dom);
  if (gesture.kind === 'groupDrag') {
    const dx = wp.x - gesture.startWorld.x;
    const dy = wp.y - gesture.startWorld.y;
    if (!gesture.moved && Math.hypot(dx, dy) > 1) gesture.moved = true;
    if (!gesture.moved) return;
    if (!gesture.snap0) gesture.snap0 = snapshot();
    gesture.g.x = gesture.origXY.x + dx;
    gesture.g.y = gesture.origXY.y + dy;
    gesture.inside.forEach((s) => {
      nodesDS.update({ id: s.id, x: snapPos({ x: s.x + dx, y: s.y + dy }).x, y: snapPos({ x: s.x + dx, y: s.y + dy }).y });
    });
    return;
  }

  if (gesture.kind === 'groupResize') {
    const dx = wp.x - gesture.startWorld.x;
    const dy = wp.y - gesture.startWorld.y;
    if (!gesture.moved && Math.hypot(dx, dy) > 1) gesture.moved = true;
    if (!gesture.moved) return;
    if (!gesture.snap0) gesture.snap0 = snapshot();
    gesture.g.w = Math.max(80, wp.x - gesture.g.x);
    gesture.g.h = Math.max(60, wp.y - gesture.g.y);
  }
}

function endGesture(commitMenu) {
  const g = gesture;
  gesture = null;
  network.setOptions({ interaction: { dragNodes: true, dragView: true } });
  stage.style.cursor = '';
  if (!g) return;

  if (g.kind === 'dragLink') {
    if (commitMenu && g.moved) {
      const target = network.getNodeAt(g.cur);
      if (target !== undefined && target !== g.source) {
        setStatus('status.linkPrompt');
        openMenu(
          g.cur.x + stageRect().left,
          g.cur.y + stageRect().top,
          linkTypeItems((key) => {
            addEdge(g.source, target, key);
            network.unselectAll();
          })
        );
      }
    }
    return;
  }

  if (!g.moved) {
    /* simple clic sur un groupe : désélectionne comme un fond vide */
    if (g.kind === 'groupDrag') network.unselectAll();
    return;
  }
  pushHistoryRaw(g.snap0 || snapshot());
  setStatus(g.kind === 'groupDrag' ? 'status.groupMoved' : 'status.groupResized');
}

function onWindowPointerUp(e) {
  if (!gesture) return;
  endGesture(true);
}

function onWindowPointerCancel() {
  if (!gesture) return;
  endGesture(false);
}

/* Annule le geste en cours (Échap) sans créer de lien */
function cancelGesture() {
  if (!gesture) return;
  gesture = null;
  network.setOptions({ interaction: { dragNodes: true, dragView: true } });
  stage.style.cursor = '';
}

/* ===== Sauvegarde / import JSON ===== */
function saveJSON() {
  syncPositions();
  const obj = {
    version: 1,
    background: theme,
    title: topoTitle,
    nodes: nodesDS
      .get()
      .map((n) => ({ id: n.id, type: n.type, num: n.num, name: n.name, label: n.label, x: n.x, y: n.y })),
    edges: edgesDS
      .get()
      .map((e) => ({ id: e.id, from: e.from, to: e.to, linkType: e.linkType, name: e.name })),
    groups: groups.map((g) => ({ id: g.id, label: g.label, x: g.x, y: g.y, w: g.w, h: g.h, color: g.color })),
  };
  downloadBlob(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }), safeFileName() + '.json');
  setStatus('status.saved');
}

function onImportFile(e) {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importTopology(JSON.parse(String(reader.result)));
    } catch (err) {
      alert(t('dlg.invalidJson', { msg: err.message }));
    }
  };
  reader.readAsText(f, 'utf-8');
}

function importTopology(obj) {
  pushHistory();
  stopAnim();
  cancelLinking();
  network.unselectAll();
  nodesDS.clear();
  edgesDS.clear();
  groups = [];
  groupSeq = 0;
  Object.keys(counters).forEach((k) => (counters[k] = 0));
  nextId = 1;

  (obj.nodes || []).forEach((n) => {
    const type = DEVICE_TYPES[n.type] ? n.type : 'server';
    let num = typeof n.num === 'number' && n.num >= 1 ? n.num : null;
    if (num === null) {
      const m = String(n.label || '').match(/(\d+)\s*$/);
      num = m ? parseInt(m[1], 10) : counters[type] + 1;
    }
    counters[type] = Math.max(counters[type], num);
    const name = typeof n.name === 'string' && n.name !== '' ? n.name : null;
    nodesDS.add({
      id: n.id !== undefined && n.id !== null ? n.id : 'n' + nextId++,
      type,
      num,
      name,
      label: name != null ? name : nodeLabel(type, num),
      ...nodeVisual(type),
      x: typeof n.x === 'number' ? n.x : 0,
      y: typeof n.y === 'number' ? n.y : 0,
    });
  });

  (obj.edges || []).forEach((e) => {
    if (!nodesDS.get(e.from) || !nodesDS.get(e.to)) return;
    const key = LINK_TYPES[e.linkType] ? e.linkType : 'dashed';
    const name = typeof e.name === 'string' && e.name !== '' ? e.name : null;
    const props = edgeProps(key);
    edgesDS.add({
      id: e.id !== undefined && e.id !== null ? e.id : 'e' + nextId++,
      from: e.from,
      to: e.to,
      name,
      ...props,
      label: name != null ? name : props.label,
    });
  });

  /* Groupes / sous-réseaux */
  (Array.isArray(obj.groups) ? obj.groups : []).forEach((g) => {
    if (!g || typeof g !== 'object') return;
    groupSeq += 1;
    groups.push({
      id: 'g' + groupSeq,
      label: typeof g.label === 'string' && g.label.trim() ? g.label.trim() : t('group.default', { n: groupSeq }),
      x: typeof g.x === 'number' ? g.x : 0,
      y: typeof g.y === 'number' ? g.y : 0,
      w: typeof g.w === 'number' && g.w >= 80 ? g.w : 320,
      h: typeof g.h === 'number' && g.h >= 60 ? g.h : 220,
      color: typeof g.color === 'number' && g.color >= 0 ? Math.abs(g.color) % GROUP_COLORS.length : groupSeq - 1,
    });
  });

  if (obj.background === 'dark' || obj.background === 'light') {
    theme = obj.background;
    applyTheme();
  }
  applyTitleState(typeof obj.title === 'string' ? obj.title : '');
  btnAnimStart.disabled = !anim.mode || anim.selected.length < 2;
  refresh3D();
  setStatus('status.imported', { n: nodesDS.length, e: edgesDS.length });
}

/* ===== Export JPEG ===== */
function exportJPEG() {
  const src = network.canvas.frame.canvas;
  if (!src) {
    alert(t('dlg.exportImpossible'));
    return;
  }
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, 0, 0);
  /* Superpose la couche d'effets (grille, groupes, sélection) à la même échelle */
  if (fxCanvas.width > 0 && fxCanvas.height > 0) {
    ctx.drawImage(fxCanvas, 0, 0, c.width, c.height);
  }
  const a = document.createElement('a');
  a.href = c.toDataURL('image/jpeg', 0.92);
  a.download = safeFileName() + '.jpg';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setStatus('status.exported');
}

/* ===== Animation du trafic ===== */
function toggleAnimMode() {
  anim.mode = !anim.mode;
  btnAnimMode.classList.toggle('active', anim.mode);
  if (!anim.mode) {
    anim.selected = [];
    stopAnim();
  }
  btnAnimStart.disabled = !anim.mode || anim.selected.length < 2;
  setStatus(anim.mode ? 'status.animModeOn' : 'status.animModeOff');
}

function toggleAnimNode(id) {
  const i = anim.selected.indexOf(id);
  if (i >= 0) anim.selected.splice(i, 1);
  else anim.selected.push(id);
  btnAnimStart.disabled = anim.selected.length < 2;
}

/* Plus court chemin (BFS) entre deux nœuds, renvoie la liste des nœuds ou null */
function shortestPath(a, b) {
  if (a === b) return [a];
  const adj = {};
  edgesDS.get().forEach((e) => {
    (adj[e.from] = adj[e.from] || []).push(e.to);
    (adj[e.to] = adj[e.to] || []).push(e.from);
  });
  const prev = {};
  prev[a] = null;
  const queue = [a];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === b) break;
    (adj[cur] || []).forEach((nb) => {
      if (!(nb in prev)) {
        prev[nb] = cur;
        queue.push(nb);
      }
    });
  }
  if (!(b in prev)) return null;
  const path = [];
  let cur = b;
  while (cur !== null) {
    path.push(cur);
    cur = prev[cur];
  }
  return path.reverse();
}

function findEdgeBetween(a, b) {
  return edgesDS.get().find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a)) || null;
}

function startAnim() {
  if (anim.selected.length < 2) return;
  const segments = [];
  for (let i = 0; i < anim.selected.length - 1; i++) {
    const a = anim.selected[i];
    const b = anim.selected[i + 1];
    const path = shortestPath(a, b);
    if (!path) {
      alert(t('dlg.noPath', { a: nodesDS.get(a).label, b: nodesDS.get(b).label }));
      return;
    }
    for (let j = 0; j < path.length - 1; j++) {
      const e = findEdgeBetween(path[j], path[j + 1]);
      if (e) segments.push({ edge: e.id, from: path[j], to: path[j + 1] });
    }
  }
  if (!segments.length) return;

  stopAnim();
  anim.segments = segments;
  anim.running = true;
  anim.startTime = performance.now();
  anim.highlighted = segments.map((s) => s.edge);
  anim.highlighted.forEach((id) => {
    const e = edgesDS.get(id);
    if (e) edgesDS.update({ id, width: Math.max(LINK_TYPES[e.linkType].width + 3, 6) });
  });
  btnAnimStop.disabled = false;
  setStatus('status.animRunning');
}

function stopAnim() {
  anim.highlighted.forEach((id) => {
    const e = edgesDS.get(id);
    if (e) edgesDS.update({ id, width: LINK_TYPES[e.linkType].width });
  });
  anim.highlighted = [];
  anim.running = false;
  anim.segments = [];
  btnAnimStop.disabled = true;
}

/* ===== Visualisation 3D (three.js) ===== */
/* Vue 3D en lecture seule : icônes en sprites, libellés et liens colorés ;
 * caméra orbitale (glisser pour pivoter, molette pour zoomer, Échap pour sortir).
 * La scène est reconstruite à chaque entrée en 3D (positions de l'instant). */
let view3d = false;
let threeState = null;

function toggle3D() {
  if (view3d) exit3D();
  else enter3D();
}

function enter3D() {
  if (!window.THREE) {
    alert(t('dlg.no3D'));
    return;
  }
  closeMenu();
  cancelLinking();
  cancelGesture();
  view3d = true;
  btn3d.classList.add('active');
  build3D();
  setStatus('status.view3dOn');
}

function exit3D() {
  view3d = false;
  btn3d.classList.remove('active');
  dispose3D();
  setStatus('status.view3dOff');
}

function refresh3D() {
  if (!view3d) return;
  dispose3D();
  build3D();
}

/* Libellé (mono ou multiligne) rendu dans un canvas puis en sprite */
function makeLabelSprite(text) {
  const lines = String(text || '').split('\n');
  const fs = 40;
  const pad = 10;
  const lineH = fs * 1.25;
  const cnv = document.createElement('canvas');
  const ctx = cnv.getContext('2d');
  ctx.font = '600 ' + fs + 'px system-ui, sans-serif';
  const w = Math.max(1, Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width)))) + pad * 2;
  const h = Math.ceil(lines.length * lineH) + pad * 2;
  cnv.width = w;
  cnv.height = h;
  ctx.font = '600 ' + fs + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 8;
  ctx.strokeStyle = theme === 'dark' ? '#000000' : '#ffffff';
  ctx.fillStyle = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  lines.forEach((l, i) => {
    const y = pad + lineH * (i + 0.5);
    ctx.strokeText(l, w / 2, y);
    ctx.fillText(l, w / 2, y);
  });
  const tex = new THREE.CanvasTexture(cnv);
  tex.encoding = THREE.sRGBEncoding;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const k = 0.6; /* pixels gravés -> unités monde */
  sp.scale.set(w * k, h * k, 1);
  return sp;
}

function build3D() {
  const r = stageRect();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(r.width, r.height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.domElement.id = 'gl';
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme === 'dark' ? '#000000' : '#ffffff');
  const camera = new THREE.PerspectiveCamera(50, r.width / Math.max(1, r.height), 1, 50000);

  const nodes = nodesDS.get();
  let cx = 0;
  let cy = 0;
  let span = 600;
  if (nodes.length) {
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    span = Math.max(300, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)));
  }

  /* Nœuds : icône (sprite) + libellé en dessous ; « texte » = libellé seul */
  const texCache = {};
  nodes.forEach((n) => {
    const d = DEVICE_TYPES[n.type];
    let iconH = 0;
    if (d && !d.textOnly) {
      let tex = texCache[d.icon];
      if (!tex) {
        const img = new Image();
        tex = new THREE.Texture(img);
        tex.encoding = THREE.sRGBEncoding;
        img.onload = () => {
          tex.needsUpdate = true;
        };
        img.src = d.icon;
        texCache[d.icon] = tex;
      }
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      icon.scale.set(72, 72, 1);
      icon.position.set(n.x - cx, -(n.y - cy), 2);
      scene.add(icon);
      iconH = 72;
    }
    const label = makeLabelSprite(n.label);
    label.position.set(n.x - cx, -(n.y - cy) - iconH / 2 - label.scale.y / 2 - 6, 3);
    scene.add(label);
  });

  /* Liens : bandes colorées (quads) ; pointillés via texture à répéter */
  let dashTex = null;
  const dashTexture = () => {
    if (dashTex) return dashTex;
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 4;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    for (let x = 0; x < c.width; x += 8) g.fillRect(x, 0, 5, c.height);
    dashTex = new THREE.CanvasTexture(c);
    dashTex.wrapS = THREE.RepeatWrapping;
    return dashTex;
  };
  edgesDS.get().forEach((e) => {
    const a = nodesDS.get(e.from);
    const b = nodesDS.get(e.to);
    if (!a || !b) return;
    const lt = LINK_TYPES[e.linkType] || LINK_TYPES.dashed;
    const dx = b.x - a.x;
    const dy = -(b.y - a.y);
    const len = Math.hypot(dx, dy);
    if (!len) return;
    const mat = new THREE.MeshBasicMaterial({ color: lt.color, side: THREE.DoubleSide, transparent: true });
    if (lt.dashes) {
      const t = dashTexture().clone();
      t.needsUpdate = true;
      t.repeat.set(Math.max(1, Math.round(len / 32)), 1);
      mat.map = t;
    }
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, Math.max(2, lt.width * 1.6)), mat);
    mesh.position.set((a.x + b.x) / 2 - cx, -((a.y + b.y) / 2 - cy), 0);
    mesh.rotation.z = Math.atan2(dy, dx);
    scene.add(mesh);
  });

  /* Orbite : angles sphériques autour du centre de la topologie */
  const orbit = { theta: 0, phi: 0.9, dist: (span / 2) / Math.tan(0.435) * 1.25 + 150 };
  const applyCam = () => {
    const sp = Math.sin(orbit.phi);
    camera.position.set(orbit.dist * sp * Math.sin(orbit.theta), orbit.dist * Math.cos(orbit.phi), orbit.dist * sp * Math.cos(orbit.theta));
    camera.lookAt(0, 0, 0);
  };
  applyCam();

  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const move = (ev) => {
      orbit.theta -= (ev.clientX - x0) * 0.005;
      orbit.phi = Math.min(Math.PI - 0.15, Math.max(0.15, orbit.phi - (ev.clientY - y0) * 0.005));
      applyCam();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbit.dist = Math.min(60000, Math.max(120, orbit.dist * (e.deltaY > 0 ? 1.12 : 0.9)));
    applyCam();
  });

  threeState = { renderer, scene, texCache, stats: { nodes: nodes.length, edges: edgesDS.length }, stop: false };
  const loop = () => {
    if (!threeState || threeState.stop) return;
    const rr = stageRect();
    if (renderer.domElement.clientWidth !== rr.width || renderer.domElement.clientHeight !== rr.height) {
      renderer.setSize(rr.width, rr.height);
      camera.aspect = rr.width / Math.max(1, rr.height);
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function dispose3D() {
  if (!threeState) return;
  const s = threeState;
  threeState = null;
  s.stop = true;
  s.scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (o.material.map) o.material.map.dispose();
      o.material.dispose();
    }
  });
  Object.values(s.texCache).forEach((t) => t.dispose());
  s.renderer.dispose();
  s.renderer.domElement.remove();
}

/* ===== Couche d'effets (canvas superposé, au-dessus de vis) ===== */
function resizeFx() {
  const r = stageRect();
  const dpr = window.devicePixelRatio || 1;
  fxCanvas.width = Math.max(1, Math.round(r.width * dpr));
  fxCanvas.height = Math.max(1, Math.round(r.height * dpr));
  fxCanvas.style.width = r.width + 'px';
  fxCanvas.style.height = r.height + 'px';
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function fxLoop(ts) {
  requestAnimationFrame(fxLoop);
  if (!network) return;

  fctx.save();
  fctx.setTransform(1, 0, 0, 1, 0, 0);
  fctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fctx.restore();
  if (view3d) return; /* la scène 3D recouvre la zone de dessin */

  /* Grille de calage */
  if (gridOn) drawGrid();

  /* Groupes / sous-réseaux */
  if (groups.length) drawGroups();

  /* Sélection courante (nœuds : anneau ; liens : mise en évidence vis.js).
   * Garde-fou : la sélection vis.js peut brièvement référencer un nœud
   * déjà retiré du DataSet (suppression / restauration d'état). */
  network.getSelectedNodes().forEach((id) => {
    if (!nodesDS.get(id)) return;
    const p = network.getPosition(id);
    if (!p) return;
    const screen = network.canvasToDOM(p);
    drawSelectionRing(screen.x, screen.y);
  });

  /* Ligne du lien en cours (Alt + glisser) */
  if (gesture && gesture.kind === 'dragLink' && gesture.moved && nodesDS.get(gesture.source)) {
    const s = network.canvasToDOM(network.getPosition(gesture.source));
    fctx.save();
    fctx.strokeStyle = '#fb923c';
    fctx.lineWidth = 2.5;
    fctx.setLineDash([6, 5]);
    fctx.beginPath();
    fctx.moveTo(s.x, s.y);
    fctx.lineTo(gesture.cur.x, gesture.cur.y);
    fctx.stroke();
    fctx.restore();
  }

  /* Anneaux numérotés des éléments sélectionnés pour l'animation */
  if (anim.mode && anim.selected.length) {
    anim.selected.forEach((id, i) => {
      if (!nodesDS.get(id)) return;
      const screen = network.canvasToDOM(network.getPosition(id));
      drawOrderRing(screen.x, screen.y, i + 1);
    });
  }

  /* Source en cours de lien */
  if (linking.active && nodesDS.get(linking.source)) {
    const screen = network.canvasToDOM(network.getPosition(linking.source));
    drawSourceRing(screen.x, screen.y);
  }

  /* Pastille de trafic animée */
  if (anim.running && anim.segments.length) {
    const SPEED = 160; /* px / s en coordonnées réseau */
    const lens = anim.segments.map((s) => {
      const p1 = network.getPosition(s.from);
      const p2 = network.getPosition(s.to);
      return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    });
    const total = lens.reduce((a, b) => a + b, 0);
    if (total > 0) {
      let d = (((ts - anim.startTime) / 1000) * SPEED) % total;
      for (let i = 0; i < anim.segments.length; i++) {
        const L = lens[i];
        if (d <= L || i === anim.segments.length - 1) {
          const seg = anim.segments[i];
          const p1 = network.getPosition(seg.from);
          const p2 = network.getPosition(seg.to);
          const t = L === 0 ? 0 : Math.min(1, d / L);
          const world = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
          const screen = network.canvasToDOM(world);
          drawTrafficDot(screen.x, screen.y);
          break;
        }
        d -= L;
      }
    }
  }
}

function drawGrid() {
  const r = stageRect();
  const tl = network.DOMtoCanvas({ x: 0, y: 0 });
  const br = network.DOMtoCanvas({ x: r.width, y: r.height });
  if ((br.x - tl.x) / GRID > 500 || (br.y - tl.y) / GRID > 500) return;
  fctx.save();
  fctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.09)';
  fctx.lineWidth = 1;
  for (let x = Math.floor(tl.x / GRID) * GRID; x <= br.x; x += GRID) {
    const sx = network.canvasToDOM({ x, y: tl.y }).x;
    fctx.beginPath();
    fctx.moveTo(sx, 0);
    fctx.lineTo(sx, r.height);
    fctx.stroke();
  }
  for (let y = Math.floor(tl.y / GRID) * GRID; y <= br.y; y += GRID) {
    const sy = network.canvasToDOM({ x: tl.x, y }).y;
    fctx.beginPath();
    fctx.moveTo(0, sy);
    fctx.lineTo(r.width, sy);
    fctx.stroke();
  }
  fctx.restore();
}

function drawGroups() {
  groups.forEach((g) => {
    const c = GROUP_COLORS[g.color % GROUP_COLORS.length] || GROUP_COLORS[0];
    const tl = network.canvasToDOM({ x: g.x, y: g.y });
    const br = network.canvasToDOM({ x: g.x + g.w, y: g.y + g.h });
    const w = br.x - tl.x;
    const h = br.y - tl.y;
    if (w <= 1 || h <= 1) return;
    fctx.save();
    fctx.fillStyle = c.fill;
    fctx.strokeStyle = c.line;
    fctx.lineWidth = 1.5;
    fctx.beginPath();
    const rad = 10;
    fctx.moveTo(tl.x + rad, tl.y);
    fctx.lineTo(tl.x + w - rad, tl.y);
    fctx.arcTo(tl.x + w, tl.y, tl.x + w, tl.y + rad, rad);
    fctx.lineTo(tl.x + w, tl.y + h - rad);
    fctx.arcTo(tl.x + w, tl.y + h, tl.x + w - rad, tl.y + h, rad);
    fctx.lineTo(tl.x + rad, tl.y + h);
    fctx.arcTo(tl.x, tl.y + h, tl.x, tl.y + h - rad, rad);
    fctx.lineTo(tl.x, tl.y + rad);
    fctx.arcTo(tl.x, tl.y, tl.x + rad, tl.y, rad);
    fctx.closePath();
    fctx.fill();
    fctx.stroke();
    /* Libellé du groupe */
    fctx.fillStyle = theme === 'dark' ? c.line : c.text;
    fctx.font = '600 13px system-ui, sans-serif';
    fctx.textAlign = 'left';
    fctx.textBaseline = 'top';
    fctx.fillText(g.label || '', tl.x + 10, tl.y + 8);
    /* Poignée de redimensionnement : triangle au coin bas-droit (zone de
     * saisie = HANDLE_R px autour du coin, cf. handleAtDom). */
    const hz = 12;
    fctx.fillStyle = c.line;
    fctx.beginPath();
    fctx.moveTo(br.x - hz, br.y);
    fctx.lineTo(br.x, br.y - hz);
    fctx.lineTo(br.x, br.y);
    fctx.closePath();
    fctx.fill();
    fctx.restore();
  });
}

function drawSelectionRing(x, y) {
  fctx.save();
  fctx.strokeStyle = SEL_COLOR;
  fctx.lineWidth = 2.5;
  fctx.beginPath();
  fctx.arc(x, y, SEL_RADIUS, 0, Math.PI * 2);
  fctx.stroke();
  fctx.restore();
}

function drawOrderRing(x, y, order) {
  fctx.save();
  fctx.strokeStyle = RING_COLOR;
  fctx.lineWidth = 2.5;
  fctx.setLineDash([7, 5]);
  fctx.beginPath();
  fctx.arc(x, y, RING_RADIUS, 0, Math.PI * 2);
  fctx.stroke();
  fctx.setLineDash([]);
  fctx.fillStyle = RING_COLOR;
  fctx.beginPath();
  fctx.arc(x, y - RING_RADIUS, 12, 0, Math.PI * 2);
  fctx.fill();
  fctx.fillStyle = '#06202a';
  fctx.font = 'bold 13px system-ui, sans-serif';
  fctx.textAlign = 'center';
  fctx.textBaseline = 'middle';
  fctx.fillText(String(order), x, y - RING_RADIUS - 0.5);
  fctx.restore();
}

function drawSourceRing(x, y) {
  fctx.save();
  fctx.strokeStyle = '#fb923c';
  fctx.lineWidth = 3;
  fctx.setLineDash([4, 4]);
  fctx.beginPath();
  fctx.arc(x, y, RING_RADIUS, 0, Math.PI * 2);
  fctx.stroke();
  fctx.restore();
}

function drawTrafficDot(x, y) {
  fctx.save();
  fctx.shadowColor = RING_COLOR;
  fctx.shadowBlur = 18;
  fctx.fillStyle = RING_COLOR;
  fctx.beginPath();
  fctx.arc(x, y, 8, 0, Math.PI * 2);
  fctx.fill();
  fctx.shadowBlur = 0;
  fctx.fillStyle = '#ffffff';
  fctx.beginPath();
  fctx.arc(x, y, 3.5, 0, Math.PI * 2);
  fctx.fill();
  fctx.restore();
}

/* ===== Pont de débogage / tests (lecture seule) ===== */
window.topoDebug = {
  selNodes: () => (network ? network.getSelectedNodes() : []),
  selEdges: () => (network ? network.getSelectedEdges() : []),
  groups: () => groups.map((g) => ({ ...g })),
  history: () => ({ undo: history.undo.length, redo: history.redo.length }),
  grid: () => gridOn,
  title: () => topoTitle,
  view3d: () => ({ active: view3d, nodes: threeState ? threeState.stats.nodes : 0, edges: threeState ? threeState.stats.edges : 0 }),
};

/* ===== Démarrage ===== */
init();
