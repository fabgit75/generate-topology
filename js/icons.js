'use strict';

/*
 * Icones SVG (autonomes, en data URL) pour les éléments de la topologie :
 * switch, firewall, serveur, NAS, machine virtuelle, routeur, VM Linux,
 * VM Windows, cloud, Internet, disque dur, clé USB, imprimante, baie.
 */
(function () {
  function badge(accent, inner) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
      '<rect x="2" y="2" width="60" height="60" rx="14" fill="#f8fafc" stroke="' + accent + '" stroke-width="3"/>' +
      inner +
      '</svg>'
    );
  }

  function toUrl(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* Switch : deux flèches de commutation */
  var icons = {};

  icons.switch = toUrl(
    badge(
      '#2563eb',
      '<g stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      '<path d="M14 24 H36"/>' +
      '<path d="M30 17 L38 24 L30 31"/>' +
      '<path d="M50 40 H28"/>' +
      '<path d="M34 33 L26 40 L34 47"/>' +
      '</g>'
    )
  );

  /* Firewall : mur de briques */
  icons.firewall = toUrl(
    badge(
      '#dc2626',
      '<g fill="#dc2626">' +
      '<rect x="14" y="14" width="16" height="9" rx="2"/>' +
      '<rect x="34" y="14" width="16" height="9" rx="2"/>' +
      '<rect x="8" y="27" width="14" height="9" rx="2"/>' +
      '<rect x="25" y="27" width="14" height="9" rx="2"/>' +
      '<rect x="42" y="27" width="14" height="9" rx="2"/>' +
      '<rect x="14" y="40" width="16" height="9" rx="2"/>' +
      '<rect x="34" y="40" width="16" height="9" rx="2"/>' +
      '</g>'
    )
  );

  /* Serveur : baies avec voyants */
  icons.server = toUrl(
    badge(
      '#7c3aed',
      '<rect x="12" y="13" width="40" height="14" rx="3" fill="#7c3aed"/>' +
      '<circle cx="20" cy="20" r="2.5" fill="#ffffff"/>' +
      '<rect x="27" y="18.5" width="18" height="3" rx="1.5" fill="#ffffff"/>' +
      '<rect x="12" y="37" width="40" height="14" rx="3" fill="#7c3aed"/>' +
      '<circle cx="20" cy="44" r="2.5" fill="#ffffff"/>' +
      '<rect x="27" y="42.5" width="18" height="3" rx="1.5" fill="#ffffff"/>'
    )
  );

  /* NAS : boîtier avec deux disques */
  icons.nas = toUrl(
    badge(
      '#d97706',
      '<rect x="10" y="16" width="44" height="32" rx="6" fill="none" stroke="#d97706" stroke-width="3"/>' +
      '<circle cx="23" cy="32" r="8" fill="none" stroke="#d97706" stroke-width="3"/>' +
      '<circle cx="23" cy="32" r="2.5" fill="#d97706"/>' +
      '<circle cx="41" cy="32" r="8" fill="none" stroke="#d97706" stroke-width="3"/>' +
      '<circle cx="41" cy="32" r="2.5" fill="#d97706"/>'
    )
  );

  /* Machine virtuelle : écran avec nuage */
  icons.vm = toUrl(
    badge(
      '#0891b2',
      '<rect x="12" y="13" width="40" height="27" rx="4" fill="none" stroke="#0891b2" stroke-width="3"/>' +
      '<path d="M32 40 v5" stroke="#0891b2" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M23 49 h18" stroke="#0891b2" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="#0891b2">' +
      '<circle cx="25" cy="30" r="5"/>' +
      '<circle cx="33" cy="26" r="7"/>' +
      '<circle cx="40" cy="30" r="5"/>' +
      '<rect x="25" y="29" width="15" height="6"/>' +
      '</g>'
    )
  );

  /* Routeur : boîtier avec trafic bidirectionnel */
  icons.router = toUrl(
    badge(
      '#16a34a',
      '<rect x="9" y="22" width="46" height="20" rx="6" fill="#16a34a"/>' +
      '<g stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      '<path d="M30 32 H18 M23 27 L18 32 L23 37"/>' +
      '<path d="M34 32 H46 M41 27 L46 32 L41 37"/>' +
      '</g>'
    )
  );

  /* Machine virtuelle Linux : moniteur avec Tux (pingouin) */
  icons.vm_linux = toUrl(
    badge(
      '#334155',
      '<rect x="12" y="11" width="40" height="28" rx="4" fill="none" stroke="#334155" stroke-width="3"/>' +
      '<path d="M32 39 v6" stroke="#334155" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M23 50 h18" stroke="#334155" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32 15 C 27.5 15 25.5 19.5 25.5 24.5 C 25.5 31 28.5 35 32 35 C 35.5 35 38.5 31 38.5 24.5 C 38.5 19.5 36.5 15 32 15 Z" fill="#334155"/>' +
      '<ellipse cx="32" cy="27.5" rx="5.2" ry="6.2" fill="#f8fafc"/>' +
      '<circle cx="29.7" cy="21" r="1.4" fill="#f8fafc"/>' +
      '<circle cx="34.3" cy="21" r="1.4" fill="#f8fafc"/>' +
      '<path d="M32 23.5 l-2.2 2.4 h4.4 z" fill="#f59e0b"/>'
    )
  );

  /* Machine virtuelle Windows : moniteur avec logo 4 volets */
  icons.vm_windows = toUrl(
    badge(
      '#0078d4',
      '<rect x="12" y="11" width="40" height="28" rx="4" fill="none" stroke="#0078d4" stroke-width="3"/>' +
      '<path d="M32 39 v6" stroke="#0078d4" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M23 50 h18" stroke="#0078d4" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="#0078d4">' +
      '<rect x="21" y="17" width="9.5" height="8.5" rx="1"/>' +
      '<rect x="33.5" y="17" width="9.5" height="8.5" rx="1"/>' +
      '<rect x="21" y="28.5" width="9.5" height="8.5" rx="1"/>' +
      '<rect x="33.5" y="28.5" width="9.5" height="8.5" rx="1"/>' +
      '</g>'
    )
  );

  /* Cloud : nuage */
  icons.cloud = toUrl(
    badge(
      '#38bdf8',
      '<g fill="#38bdf8">' +
      '<circle cx="23" cy="35" r="8.5"/>' +
      '<circle cx="33" cy="28" r="11"/>' +
      '<circle cx="43" cy="35" r="8.5"/>' +
      '<rect x="23" y="33" width="20" height="10"/>' +
      '</g>'
    )
  );

  /* Internet : globe */
  icons.internet = toUrl(
    badge(
      '#0d9488',
      '<circle cx="32" cy="32" r="17" fill="none" stroke="#0d9488" stroke-width="3"/>' +
      '<ellipse cx="32" cy="32" rx="7.5" ry="17" fill="none" stroke="#0d9488" stroke-width="3"/>' +
      '<path d="M15 32 H49" stroke="#0d9488" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M17 23 Q32 29 47 23" stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M17 41 Q32 35 47 41" stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round"/>'
    )
  );

  /* Disque dur : plateau + bras lecteur */
  icons.hdd = toUrl(
    badge(
      '#475569',
      '<rect x="12" y="14" width="40" height="36" rx="5" fill="none" stroke="#475569" stroke-width="3"/>' +
      '<circle cx="28" cy="33" r="10" fill="none" stroke="#475569" stroke-width="3"/>' +
      '<circle cx="28" cy="33" r="3" fill="#475569"/>' +
      '<path d="M44 19 L33 36" stroke="#475569" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="44" cy="19" r="2.6" fill="#475569"/>'
    )
  );

  /* Clé USB : corps + connecteur avec contacts */
  icons.usb = toUrl(
    badge(
      '#a855f7',
      '<rect x="24" y="10" width="18" height="30" rx="3" fill="none" stroke="#a855f7" stroke-width="3"/>' +
      '<rect x="27" y="40" width="12" height="12" fill="none" stroke="#a855f7" stroke-width="3"/>' +
      '<circle cx="31" cy="44" r="1.6" fill="#a855f7"/>' +
      '<circle cx="35" cy="48" r="1.6" fill="#a855f7"/>'
    )
  );

  /* Imprimante : corps + papier sortant */
  icons.printer = toUrl(
    badge(
      '#64748b',
      '<rect x="22" y="10" width="20" height="12" rx="2" fill="none" stroke="#64748b" stroke-width="3"/>' +
      '<rect x="11" y="20" width="42" height="18" rx="3" fill="none" stroke="#64748b" stroke-width="3"/>' +
      '<circle cx="44" cy="26" r="2" fill="#64748b"/>' +
      '<rect x="21" y="34" width="22" height="16" rx="2" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>' +
      '<path d="M25 41 h14 M25 45 h9" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>'
    )
  );

  /* Baie : boîtier de stockage à plusieurs baies de disques */
  icons.bay = toUrl(
    badge(
      '#b45309',
      '<rect x="14" y="10" width="36" height="44" rx="4" fill="none" stroke="#b45309" stroke-width="3"/>' +
      '<g fill="none" stroke="#b45309" stroke-width="2.5">' +
      '<rect x="19" y="15" width="22" height="7" rx="2"/>' +
      '<rect x="19" y="25" width="22" height="7" rx="2"/>' +
      '<rect x="19" y="35" width="22" height="7" rx="2"/>' +
      '<rect x="19" y="45" width="22" height="7" rx="2"/>' +
      '</g>' +
      '<g fill="#b45309">' +
      '<circle cx="44" cy="18.5" r="1.6"/>' +
      '<circle cx="44" cy="28.5" r="1.6"/>' +
      '<circle cx="44" cy="38.5" r="1.6"/>' +
      '<circle cx="44" cy="48.5" r="1.6"/>' +
      '</g>'
    )
  );

  window.TopoIcons = icons;
})();
