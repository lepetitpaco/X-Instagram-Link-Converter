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

.xilc-chips { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; margin-left: 8px; }
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
