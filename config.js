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

  // Libellés du bouton Partager d'Instagram selon la langue de l'interface
  INSTAGRAM_SHARE_LABELS: ['Share', 'Partager', 'Compartir', 'Compartilhar', 'Teilen', 'Condividi', 'Delen', 'Udostępnij', 'Paylaş', 'Поделиться', 'Bagikan'],

  // Messages
  MESSAGES: {
    COPIED: '✅ Copied',
    ERROR: '❌ Error',
    INVALID_URL: '❌ Invalid URL',
    NOT_SUPPORTED: '❌ This page is not supported.',
    CLIPBOARD_ERROR: '❌ Clipboard error',
    COPY_ORIGINAL_X: 'Copy x.com link',
    COPY_KKINSTAGRAM: 'Copy kkinstagram link'
  }
};

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
