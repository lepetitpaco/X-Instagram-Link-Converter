// Background script pour Manifest V2
// Gère les menus contextuels et les actions du popup

// Configuration inline (pour compatibilité)
const CONFIG = {
  X_ALTERNATIVES: {
    fixvx: 'fixvx.com',
    fixupx: 'fixupx.com',
    vxtwitter: 'vxtwitter.com'
  },
  INSTAGRAM_ALTERNATIVES: {
    kkinstagram: 'kkinstagram.com'
  },
  X_DOMAINS: ['x.com', 'twitter.com'],
  INSTAGRAM_DOMAINS: ['www.instagram.com', 'instagram.com']
};

/**
 * Convertit une URL vers un domaine alternatif
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
 */
function isValidXUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return CONFIG.X_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return url.includes('x.com') || url.includes('twitter.com');
  }
}

/**
 * Vérifie si une URL est une URL Instagram valide
 */
function isValidInstagramUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return CONFIG.INSTAGRAM_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return url.includes('instagram.com');
  }
}
