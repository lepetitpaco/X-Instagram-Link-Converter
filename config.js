// Configuration centralisée pour le plugin X-Instagram-Link-Converter

const CONFIG = {
  // Plateformes gérées : un content script par plateforme sait où placer les boutons et lire l'URL d'un post
  PLATFORMS: ['x', 'instagram', 'tiktok'],
  PLATFORM_NAMES: { x: 'X / Twitter', instagram: 'Instagram', tiktok: 'TikTok' },

  // Services livrés par défaut, dans l'ordre d'affichage (modifiables dans le popup).
  // Un service remplace seulement le domaine du lien : https://x.com/a/status/1 -> https://fixvx.com/a/status/1
  DEFAULT_SERVICES: {
    x: [
      { label: 'x', domain: 'x.com', enabled: true },
      { label: 'vx', domain: 'fixvx.com', enabled: true },
      { label: 'upx', domain: 'fixupx.com', enabled: true },
      { label: 'vxt', domain: 'vxtwitter.com', enabled: true }
    ],
    instagram: [
      { label: 'kk', domain: 'kkinstagram.com', enabled: true }
    ],
    tiktok: [
      { label: 'tnk', domain: 'tnktok.com', enabled: true },
      { label: 'txk', domain: 'tiktxk.com', enabled: true },
      { label: 'kk', domain: 'kktiktok.com', enabled: true }
    ]
  },

  // Nombre de boutons affichés dans la barre d'actions avant de regrouper les autres dans le menu « ⋯ »
  MAX_VISIBLE: { x: 3, instagram: 1, tiktok: 2 },
  MAX_SERVICES: 10,
  LABEL_MAX: 4,

  // Domaines originaux supportés
  X_DOMAINS: ['x.com', 'twitter.com'],
  INSTAGRAM_DOMAINS: ['www.instagram.com', 'instagram.com'],
  TIKTOK_DOMAINS: ['www.tiktok.com', 'tiktok.com'],

  // Libellés du bouton Partager d'Instagram selon la langue de l'interface
  INSTAGRAM_SHARE_LABELS: ['Share', 'Partager', 'Compartir', 'Compartilhar', 'Teilen', 'Condividi', 'Delen', 'Udostępnij', 'Paylaş', 'Поделиться', 'Bagikan'],

  // Nouveautés affichées dans le popup (la plus récente en premier)
  CHANGELOG: [
    {
      version: '1.2.1',
      changes: [
        'New icon',
        'Fewer permissions: the extension no longer asks to read your clipboard',
        'Popup texts in English, and this What\'s new section',
        'Credits to the embed services that make the previews (vxTwitter, FxEmbed, fxTikTok, tiktxk…)'
      ]
    },
    {
      version: '1.2.0',
      changes: [
        'TikTok support: tnktok, tiktxk and kktiktok links below Share, and from this popup for the video on screen',
        'Link services are configurable per site below (label, domain, order, shown or hidden), synced with your browser account',
        'Extra services are grouped in a ⋯ menu so action bars stay compact'
      ]
    },
    {
      version: '1.1.0',
      changes: [
        'One-click chips in the X action bar (x, vx, upx, vxt)',
        'Quick link button next to Share on Instagram, in any language'
      ]
    }
  ],

  // Messages
  MESSAGES: {
    COPIED: '✅ Copied',
    ERROR: '❌ Error',
    INVALID_URL: '❌ Invalid URL',
    NOT_SUPPORTED: '❌ This page is not supported.',
    CLIPBOARD_ERROR: '❌ Clipboard error',
    MORE_SERVICES: 'More link types'
  }
};

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
