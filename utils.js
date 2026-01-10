// Utilitaires partagés pour le plugin X-Instagram-Link-Converter

/**
 * Crée et affiche un toast de notification
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms (défaut: 2000)
 * @param {string} link - Lien copié (optionnel, affiché si fourni)
 */
function createToast(message, duration = 2000, link = null) {
  const toast = document.createElement('div');
  
  // Conteneur pour le message et le lien
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.marginBottom = link ? '6px' : '0';
  
  toast.appendChild(messageDiv);
  
  // Afficher le lien si fourni
  if (link) {
    const linkDiv = document.createElement('div');
    linkDiv.textContent = link;
    linkDiv.style.fontSize = '11px';
    linkDiv.style.opacity = '0.9';
    linkDiv.style.wordBreak = 'break-all';
    linkDiv.style.maxWidth = '400px';
    toast.appendChild(linkDiv);
  }
  
  // Styles du toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1d9bf0',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.3s ease, top 0.3s ease',
    pointerEvents: 'none',
    maxWidth: '90%',
    textAlign: 'center'
  });

  document.body.appendChild(toast);

  // Animation d'apparition
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.top = '30px';
  });

  // Disparition après la durée spécifiée
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.top = '20px';
    setTimeout(() => toast.remove(), 300);
  }, duration);
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
    convertUrl,
    isValidXUrl,
    isValidInstagramUrl,
    copyToClipboard,
    readFromClipboard
  };
} else {
  window.Utils = {
    createToast,
    convertUrl,
    isValidXUrl,
    isValidInstagramUrl,
    copyToClipboard,
    readFromClipboard
  };
}
