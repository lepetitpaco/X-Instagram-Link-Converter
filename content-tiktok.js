// Content script pour TikTok.com
// Ajoute sous le bouton Partager de chaque vidéo une pastille par service d'embed activé (les suivants dans un menu « ⋯ ») :
// un clic copie le lien

// Note: config.js, utils.js et storage.js doivent être chargés avant ce script dans le manifest

/**
 * Retourne l'URL TikTok (/@<auteur>/video/<id>) de la vidéo qui contient l'élément
 * Les vidéos du fil n'ont pas de lien vers leur page : l'id est lu sur le lecteur (id="xgwrapper-<n>-<id>")
 * et l'auteur sur le lien de son profil
 */
function getTikTokVideoUrl(element) {
  const article = element.closest('article');
  if (article) {
    const player = article.querySelector('[id^="xgwrapper-"]');
    const videoId = player && player.id.match(/-(\d+)$/)?.[1];
    const author = article.querySelector('a[href^="/@"]')?.getAttribute('href').match(/^\/(@[^/?#]+)/)?.[1];
    if (videoId && author) return `${window.location.origin}/${author}/video/${videoId}`;
  }

  // Page d'une vidéo : l'URL de la page désigne la vidéo affichée
  const match = window.location.pathname.match(/^\/(@[^/]+)\/video\/(\d+)/);
  return match ? `${window.location.origin}/${match[1]}/video/${match[2]}` : null;
}

/**
 * Retourne l'URL de la vidéo la plus visible dans la fenêtre (fil « Pour toi » : l'onglet n'a pas l'URL de la vidéo)
 * Seuls les articles avec un lecteur comptent : les vignettes « Tu pourrais aimer » sont aussi des article
 */
function getVisibleTikTokVideoUrl() {
  let best = null;
  let bestArea = 0;
  for (const article of document.querySelectorAll('article')) {
    if (!article.querySelector('[id^="xgwrapper-"]')) continue;
    const rect = article.getBoundingClientRect();
    const height = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    const width = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
    const area = Math.max(0, height) * Math.max(0, width);
    if (area > bestArea) {
      bestArea = area;
      best = article;
    }
  }
  return getTikTokVideoUrl(best || document.body);
}

// Services de la plateforme tiktok, modifiables dans le popup (mis à jour à chaud)
let tiktokServices = CONFIG.DEFAULT_SERVICES.tiktok;

/**
 * Ajoute les pastilles juste après chaque bouton Partager des barres d'actions,
 * repéré par son attribut data-e2e (indépendant de la langue et des classes générées)
 */
function addTikTokQuickButtons() {
  for (const shareIcon of document.querySelectorAll('[data-e2e="share-icon"]')) {
    // L'emplacement de la barre d'actions est le parent direct du bouton Partager
    const slot = shareIcon.parentElement;
    if (!slot || !slot.parentElement || slot.parentElement.children.length < 3) continue;
    if (slot.nextElementSibling?.classList.contains('xilc-tt-action')) continue;

    const buttons = renderServiceButtons(tiktokServices, {
      platform: 'tiktok',
      getUrl: getTikTokVideoUrl,
      chipClass: 'xilc-chip xilc-tt'
    });
    if (!buttons) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'xilc-tt-action';
    wrapper.appendChild(buttons);
    slot.insertAdjacentElement('afterend', wrapper);
  }
}

// Observer les changements de la page, une vérification par frame au plus
let tiktokCheckScheduled = false;
const tiktokObserver = new MutationObserver(() => {
  if (tiktokCheckScheduled) return;
  tiktokCheckScheduled = true;
  requestAnimationFrame(() => {
    tiktokCheckScheduled = false;
    addTikTokQuickButtons();
  });
});

injectStyles();

(async () => {
  try {
    if (window.Storage) {
      tiktokServices = (await window.Storage.getServices()).tiktok;
    }
  } catch (error) {
    console.error('[tiktok] Error loading services:', error);
  }

  tiktokObserver.observe(document.body, { childList: true, subtree: true });
  addTikTokQuickButtons();
})();

// Appliquer les services modifiés dans le popup sans recharger la page : les pastilles sont reconstruites
window.Storage.onServicesChanged('tiktok', (services) => {
  tiktokServices = services;
  closeServiceMenu();
  document.querySelectorAll('.xilc-tt-action').forEach(el => el.remove());
  addTikTokQuickButtons();
});

// Le popup demande la vidéo affichée pour copier son lien depuis le fil
const tiktokRuntime = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : browser.runtime;
tiktokRuntime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'xilc-current-url') return;
  sendResponse({ url: getVisibleTikTokVideoUrl() });
});
