// Configuration centralisée pour le plugin X-Instagram-Link-Converter

const CONFIG = {
  // Domaines alternatifs pour X/Twitter
  X_ALTERNATIVES: {
    fixvx: 'fixvx.com',
    fixupx: 'fixupx.com',
    vxtwitter: 'vxtwitter.com'
  },

  // Domaines alternatifs pour Instagram
  INSTAGRAM_ALTERNATIVES: {
    kkinstagram: 'kkinstagram.com'
  },

  // Domaines originaux supportés
  X_DOMAINS: ['x.com', 'twitter.com'],
  INSTAGRAM_DOMAINS: ['www.instagram.com', 'instagram.com'],

  // Messages
  MESSAGES: {
    COPIED: '✅ Copied',
    ERROR: '❌ Error',
    INVALID_URL: '❌ Invalid URL',
    NOT_SUPPORTED: '❌ This page is not supported.',
    CLIPBOARD_ERROR: '❌ Clipboard error'
  }
};

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
