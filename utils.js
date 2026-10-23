// Utilitaires partagés pour le plugin X-Instagram-Link-Converter

const STYLE_ID = 'xilc-styles';

const STYLES = `
.xilc-quick-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; padding: 0; margin: 0;
  border: none; border-radius: 9999px; background: transparent;
  color: inherit; cursor: pointer; flex: 0 0 auto;
  transition: background-color .15s ease, color .15s ease;
}
.xilc-quick-btn svg { width: 18px; height: 18px; display: block; pointer-events: none; }
.xilc-quick-btn:hover, .xilc-quick-btn:focus-visible { color: #1d9bf0; background-color: rgba(29,155,240,.1); outline: none; }
.xilc-quick-btn.xilc-ig { width: 40px; height: 40px; }
.xilc-quick-btn.xilc-ig svg { width: 24px; height: 24px; }
.xilc-quick-btn.xilc-ig:hover, .xilc-quick-btn.xilc-ig:focus-visible { color: inherit; background: transparent; opacity: .6; }

.xilc-chips, .xilc-services { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; margin-left: 8px; }
.xilc-chip {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 26px; height: 22px; padding: 0 7px; margin: 0;
  border: 1px solid currentColor; border-radius: 9999px; background: transparent;
  color: inherit; opacity: .75; cursor: pointer; white-space: nowrap;
  font: 700 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: background-color .15s ease, color .15s ease, opacity .15s ease;
}
.xilc-chip:hover, .xilc-chip:focus-visible { opacity: 1; color: #1d9bf0; background-color: rgba(29,155,240,.1); outline: none; }
.xilc-chip.xilc-copied { opacity: 1; color: #00ba7c; }
.xilc-tt-action { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 8px 0; }
.xilc-tt-action .xilc-services { flex-direction: column; gap: 6px; margin: 0; }
.xilc-chip.xilc-tt { width: 48px; height: 26px; padding: 0; border-color: transparent; background-color: rgba(128,128,128,.18); opacity: .9; }
.xilc-ig-action .xilc-services { gap: 0; margin: 0; }
.xilc-quick-btn.xilc-ig.xilc-more { font: 700 20px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

.xilc-menu {
  position: fixed; z-index: 2147483647; min-width: 190px; max-width: 280px; padding: 6px;
  border-radius: 12px; background: #fff; color: #0f1419;
  box-shadow: 0 0 1px rgba(0,0,0,.3), 0 6px 20px rgba(0,0,0,.2);
  font: 400 14px/18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.xilc-menu.xilc-menu-dark { background: #16181c; color: #e7e9ea; box-shadow: 0 0 1px rgba(255,255,255,.4), 0 6px 20px rgba(0,0,0,.6); }
.xilc-menu-item {
  display: flex; align-items: baseline; gap: 10px; width: 100%; padding: 8px 10px; margin: 0;
  border: none; border-radius: 8px; background: transparent; color: inherit; cursor: pointer; text-align: left; font: inherit;
}
.xilc-menu-item:hover, .xilc-menu-item:focus-visible { background-color: rgba(29,155,240,.12); outline: none; }
.xilc-menu-label { font-weight: 700; min-width: 32px; }
.xilc-menu-domain { opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.xilc-toast {
  position: fixed; left: 50%; bottom: 32px; z-index: 2147483647;
  transform: translate(-50%, 12px); opacity: 0; pointer-events: none;
  max-width: min(90vw, 460px); padding: 10px 16px; border-radius: 8px;
  background: #1d9bf0; color: #fff; text-align: center;
  font: 600 14px/18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  transition: opacity .2s ease, transform .2s ease;
}
.xilc-toast.xilc-show { opacity: 1; transform: translate(-50%, 0); }
.xilc-toast-link { margin-top: 4px; font-size: 12px; font-weight: 400; opacity: .9; word-break: break-all; }

`;

/**
 * Injecte la feuille de style de l'extension une seule fois
 */
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLES;
  (document.head || document.documentElement).appendChild(style);
}

const ICONS = {
  link: 'M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z',
  check: 'M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z'
};

/**
 * Crée un élément svg à partir du nom d'une icône de ICONS
 * (les autres scripts passent le nom : les const ne sont pas partagées entre content scripts sous Firefox)
 */
function createIcon(name) {
  const pathData = ICONS[name];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  return svg;
}

let toastHideTimeout;

/**
 * Affiche un toast de notification en bas de l'écran ; un nouvel appel remplace le toast affiché
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms (défaut: 2000)
 * @param {string} link - Lien copié (optionnel, affiché si fourni)
 */
function createToast(message, duration = 2000, link = null) {
  injectStyles();

  let toast = document.querySelector('.xilc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'xilc-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }

  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  toast.replaceChildren(messageDiv);

  if (link) {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'xilc-toast-link';
    linkDiv.textContent = link;
    toast.appendChild(linkDiv);
  }

  requestAnimationFrame(() => toast.classList.add('xilc-show'));

  clearTimeout(toastHideTimeout);
  toastHideTimeout = setTimeout(() => {
    toast.classList.remove('xilc-show');
    setTimeout(() => {
      if (!toast.classList.contains('xilc-show')) toast.remove();
    }, 250);
  }, duration);
}

/**
 * Marque brièvement un bouton comme validé (icône coche) après une copie réussie
 */
function flashCopied(button) {
  const svg = button.querySelector('svg');
  if (!svg || button.dataset.xilcFlashing) return;
  button.dataset.xilcFlashing = 'true';
  const check = createIcon('check');
  svg.replaceWith(check);
  setTimeout(() => {
    check.replaceWith(svg);
    delete button.dataset.xilcFlashing;
  }, 1200);
}

/**
 * Copie le lien converti vers un service, avec confirmation visuelle, toast et historique
 * @param {HTMLElement} button - Bouton cliqué (sert aussi à retrouver le post)
 * @param {Object} service - { label, domain }
 * @param {string} platform - 'x', 'instagram' ou 'tiktok'
 * @param {Function} getUrl - Renvoie l'URL d'origine du post qui contient l'élément donné
 */
async function copyServiceLink(button, service, platform, getUrl) {
  // L'URL est relue au clic : les sites recyclent les éléments de leurs fils
  const postUrl = getUrl(button);
  const newUrl = postUrl && convertUrl(postUrl, service.domain);
  if (!newUrl) {
    createToast(CONFIG.MESSAGES.INVALID_URL, 2000);
    return;
  }

  const success = await copyToClipboard(newUrl);
  if (!success) {
    createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000, newUrl);
    return;
  }

  if (button.querySelector('svg')) {
    flashCopied(button);
  } else if (!button.dataset.xilcFlashing) {
    const label = button.textContent;
    button.dataset.xilcFlashing = 'true';
    button.textContent = '✓';
    button.classList.add('xilc-copied');
    setTimeout(() => {
      button.textContent = label;
      button.classList.remove('xilc-copied');
      delete button.dataset.xilcFlashing;
    }, 1200);
  }
  createToast(CONFIG.MESSAGES.COPIED, 2500, newUrl);

  if (window.Storage) {
    await window.Storage.saveToHistory(postUrl, newUrl, service.domain, platform);
    await window.Storage.incrementStats(platform, service.domain);
  }
}

let openMenu = null;

/**
 * Ferme le menu « ⋯ » ouvert, s'il y en a un
 */
function closeServiceMenu() {
  if (!openMenu) return;
  openMenu.cleanup();
  openMenu.element.remove();
  openMenu = null;
}

/**
 * Indique si le fond visible derrière l'élément est sombre (premier ancêtre au fond opaque)
 */
function hasDarkBackground(element) {
  for (let node = element; node; node = node.parentElement) {
    const values = getComputedStyle(node).backgroundColor.match(/\d+(\.\d+)?/g);
    // Fonds transparents ou translucides (pastilles TikTok) ignorés : ils laissent voir le fond de la page
    if (!values || (values.length === 4 && Number(values[3]) < 0.5)) continue;
    const [r, g, b] = values.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Ouvre sous le bouton « ⋯ » un menu flottant listant les autres services
 * Le menu est posé en position fixe sur document.body : il ne modifie jamais la mise en page du site
 */
function openServiceMenu(anchor, services, platform, getUrl) {
  const wasOpenHere = openMenu?.anchor === anchor;
  closeServiceMenu();
  if (wasOpenHere) return;

  const menu = document.createElement('div');
  menu.className = 'xilc-menu';
  if (hasDarkBackground(anchor)) menu.classList.add('xilc-menu-dark');
  menu.setAttribute('role', 'menu');

  services.forEach(service => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'xilc-menu-item';
    item.setAttribute('role', 'menuitem');
    const label = document.createElement('span');
    label.className = 'xilc-menu-label';
    label.textContent = service.label;
    const domain = document.createElement('span');
    domain.className = 'xilc-menu-domain';
    domain.textContent = service.domain;
    item.append(label, domain);
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeServiceMenu();
      copyServiceLink(anchor, service, platform, getUrl);
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);

  // Sous le bouton, aligné sur son bord droit, gardé dans la fenêtre (au-dessus s'il manque de place en bas)
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const left = Math.min(Math.max(margin, rect.right - menu.offsetWidth), window.innerWidth - menu.offsetWidth - margin);
  let top = rect.bottom + 4;
  if (top + menu.offsetHeight > window.innerHeight - margin) top = Math.max(margin, rect.top - menu.offsetHeight - 4);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;

  const onPointerDown = (e) => {
    if (!menu.contains(e.target) && e.target !== anchor) closeServiceMenu();
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeServiceMenu();
  };
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('scroll', closeServiceMenu, true);
  window.addEventListener('resize', closeServiceMenu);
  openMenu = {
    anchor,
    element: menu,
    cleanup() {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', closeServiceMenu, true);
      window.removeEventListener('resize', closeServiceMenu);
    }
  };
  menu.querySelector('button')?.focus({ preventScroll: true });
}

/**
 * Crée les boutons des services actifs : les premiers en pastilles, les autres dans un menu « ⋯ »
 * @param {Array} services - Services de la plateforme ({ label, domain, enabled }), dans l'ordre d'affichage
 * @param {Object} options
 * @param {string} options.platform - 'x', 'instagram' ou 'tiktok'
 * @param {Function} options.getUrl - Renvoie l'URL d'origine du post qui contient l'élément donné
 * @param {string} options.chipClass - Classes des pastilles (ex. 'xilc-chip xilc-tt')
 * @param {string} options.iconClass - Si fourni, le premier service est un bouton icône lien avec ces classes (Instagram)
 * @returns {HTMLElement|null} Conteneur .xilc-services, ou null si aucun service n'est actif
 */
function renderServiceButtons(services, { platform, getUrl, chipClass = 'xilc-chip', iconClass = null }) {
  const enabled = services.filter(service => service.enabled);
  if (enabled.length === 0) return null;

  const max = CONFIG.MAX_VISIBLE[platform];
  const visible = enabled.slice(0, max);
  const hidden = enabled.slice(max);

  const container = document.createElement('div');
  container.className = 'xilc-services';

  visible.forEach((service, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = service.domain;
    button.setAttribute('aria-label', service.domain);
    if (iconClass && index === 0) {
      button.className = iconClass;
      button.appendChild(createIcon('link'));
    } else {
      button.className = chipClass;
      button.textContent = service.label;
    }
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      copyServiceLink(button, service, platform, getUrl);
    });
    container.appendChild(button);
  });

  if (hidden.length > 0) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = `${iconClass || chipClass} xilc-more`;
    more.textContent = '⋯';
    more.title = CONFIG.MESSAGES.MORE_SERVICES;
    more.setAttribute('aria-label', CONFIG.MESSAGES.MORE_SERVICES);
    more.setAttribute('aria-haspopup', 'menu');
    more.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openServiceMenu(more, hidden, platform, getUrl);
    });
    container.appendChild(more);
  }

  return container;
}

/**
 * Convertit une URL vers un domaine alternatif
 * @param {string} url - URL originale
 * @param {string} newDomain - Nouveau domaine (ex: 'fixvx.com')
 * @returns {string|null} URL convertie ou null si invalide
 */
function convertUrl(url, newDomain) {
  try {
    const cleanUrl = url.split('?')[0];
    const urlObj = new URL(cleanUrl);
    urlObj.hostname = newDomain;
    return urlObj.toString();
  } catch (e) {
    console.error('Error converting URL:', e);
    return null;
  }
}

/**
 * Vérifie si une URL est une URL X/Twitter valide
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
function isValidXUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return CONFIG.X_DOMAINS.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
  } catch {
    return url.includes('x.com') || url.includes('twitter.com');
  }
}

/**
 * Vérifie si une URL est une URL Instagram valide
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
function isValidInstagramUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return CONFIG.INSTAGRAM_DOMAINS.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
  } catch {
    return url.includes('instagram.com');
  }
}

/**
 * Copie du texte dans le presse-papiers avec gestion d'erreur
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} true si succès, false sinon
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Clipboard write error:', e);
    return false;
  }
}

/**
 * Lit le texte du presse-papiers avec gestion d'erreur
 * @returns {Promise<string|null>} Texte lu ou null si erreur
 */
async function readFromClipboard() {
  try {
    return await navigator.clipboard.readText();
  } catch (e) {
    console.error('Clipboard read error:', e);
    return null;
  }
}

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createToast,
    renderServiceButtons,
    closeServiceMenu,
    flashCopied,
    createIcon,
    injectStyles,
    convertUrl,
    isValidXUrl,
    isValidInstagramUrl,
    copyToClipboard,
    readFromClipboard
  };
} else {
  window.Utils = {
    createToast,
    renderServiceButtons,
    closeServiceMenu,
    flashCopied,
    createIcon,
    injectStyles,
    convertUrl,
    isValidXUrl,
    isValidInstagramUrl,
    copyToClipboard,
    readFromClipboard
  };
}
