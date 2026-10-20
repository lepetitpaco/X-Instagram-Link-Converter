// Content script pour X.com et Twitter.com
// Ajoute dans la barre d'actions de chaque post une pastille par type de lien activé
// (lien x.com d'origine ou domaines alternatifs) : un clic copie le lien

// Note: config.js, utils.js et storage.js doivent être chargés avant ce script dans le manifest

/**
 * Extrait l'URL du post principal d'un article, en ignorant les posts cités
 */
function getPostUrl(articleElement) {
  // Le lien de l'heure du post principal, hors citation (les citations sont dans un div[role="link"])
  for (const time of articleElement.querySelectorAll('time')) {
    if (time.closest('div[role="link"]')) continue;
    const href = time.closest('a')?.getAttribute('href');
    const url = cleanXUrl(href);
    if (url) return url;
  }

  // Repli (posts sponsorisés sans heure) : premier lien /status/ hors citation
  for (const link of articleElement.querySelectorAll('a[href*="/status/"]')) {
    if (link.closest('div[role="link"]')) continue;
    const url = cleanXUrl(link.getAttribute('href'));
    if (url) return url;
  }

  return null;
}

/**
 * Nettoie une URL X/Twitter pour ne garder que /<utilisateur>/status/<id>
 * Enlève les chemins supplémentaires comme /photo/1, /analytics et les query params
 */
function cleanXUrl(href) {
  if (!href) return null;

  try {
    const url = new URL(href, window.location.origin);
    // /<utilisateur>/status/<id>, ou /i/web/status/<id> sans nom d'utilisateur (gardé sous /i/status/<id>)
    const match = url.pathname.match(/^\/(?:i\/web|([^/]+))\/status\/(\d+)/);
    if (!match) return null;
    return `${window.location.origin}/${match[1] || 'i'}/status/${match[2]}`;
  } catch (e) {
    console.error('Error cleaning X URL:', e);
    return null;
  }
}

// Pastilles affichées, dans l'ordre : lien x.com d'origine puis domaines alternatifs
const QUICK_LINKS = [
  { key: 'xcom', label: 'x', title: CONFIG.MESSAGES.COPY_ORIGINAL_X, domain: null },
  { key: 'fixvx', label: 'vx', title: 'fixvx.com', domain: CONFIG.X_ALTERNATIVES.fixvx },
  { key: 'fixupx', label: 'upx', title: 'fixupx.com', domain: CONFIG.X_ALTERNATIVES.fixupx },
  { key: 'vxtwitter', label: 'vxt', title: 'vxtwitter.com', domain: CONFIG.X_ALTERNATIVES.vxtwitter }
];

// Types de liens activés dans le popup (mis à jour à chaud)
let enabledDomains = {};

/**
 * Copie le lien d'une pastille, enregistre l'historique et affiche la confirmation
 */
async function copyQuickLink(chip, articleElement, link) {
  // L'URL est relue au clic : X recycle les éléments du fil
  const postUrl = getPostUrl(articleElement);
  const newUrl = postUrl && (link.domain ? convertUrl(postUrl, link.domain) : postUrl);
  if (!newUrl) {
    createToast(CONFIG.MESSAGES.INVALID_URL);
    return;
  }

  const success = await copyToClipboard(newUrl);
  if (!success) {
    createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000, newUrl);
    return;
  }

  chip.textContent = '✓';
  chip.classList.add('xilc-copied');
  setTimeout(() => {
    chip.textContent = link.label;
    chip.classList.remove('xilc-copied');
  }, 1200);
  createToast(CONFIG.MESSAGES.COPIED, 2500, newUrl);

  if (window.Storage) {
    const domainKey = link.domain ? link.key : 'x.com';
    await window.Storage.saveToHistory(postUrl, newUrl, domainKey, 'x');
    await window.Storage.incrementStats('x', domainKey);
  }
}

/**
 * Ajoute les pastilles de copie dans la barre d'actions d'un post
 */
function addButtonToPost(articleElement) {
  // La barre d'actions du post principal (celle des citations n'existe pas)
  const actionGroup = Array.from(articleElement.querySelectorAll('div[role="group"]'))
    .find(group => !group.closest('div[role="link"]'));
  // Présence vérifiée dans la barre elle-même : X recycle les articles et peut re-rendre la barre
  if (!actionGroup || actionGroup.querySelector('.xilc-chips') || !getPostUrl(articleElement)) return;

  const links = QUICK_LINKS.filter(link => enabledDomains[link.key] !== false);
  if (links.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'xilc-chips';

  links.forEach(link => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'xilc-chip';
    chip.textContent = link.label;
    chip.title = link.title;
    chip.setAttribute('aria-label', link.title);
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      copyQuickLink(chip, articleElement, link);
    });
    wrapper.appendChild(chip);
  });

  actionGroup.appendChild(wrapper);
}

/**
 * Parcourt les posts affichés et ajoute les pastilles à ceux qui ne les ont pas
 */
function addButtonsToAllPosts() {
  document.querySelectorAll('article[data-testid="tweet"]').forEach(article => {
    try {
      addButtonToPost(article);
    } catch (error) {
      console.error('Error processing article:', error);
    }
  });
}

injectStyles();

// Observer les posts chargés dynamiquement, une vérification par frame au plus
let xCheckScheduled = false;
const observer = new MutationObserver(() => {
  if (xCheckScheduled) return;
  xCheckScheduled = true;
  requestAnimationFrame(() => {
    xCheckScheduled = false;
    addButtonsToAllPosts();
  });
});

(async () => {
  try {
    if (window.Storage) {
      enabledDomains = (await window.Storage.getSettings()).enabledDomains || {};
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  observer.observe(document.body, { childList: true, subtree: true });
  addButtonsToAllPosts();
})();

// Appliquer les réglages du popup sans recharger la page : les pastilles sont reconstruites
const storageApi = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : browser.storage;
storageApi.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[window.Storage.SETTINGS_KEY]) return;
  enabledDomains = changes[window.Storage.SETTINGS_KEY].newValue?.enabledDomains || {};
  document.querySelectorAll('.xilc-chips').forEach(el => el.remove());
  addButtonsToAllPosts();
});
