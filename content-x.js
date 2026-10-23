// Content script pour X.com et Twitter.com
// Ajoute dans la barre d'actions de chaque post une pastille par service activé dans le popup
// (lien x.com d'origine ou domaines alternatifs, les suivants dans un menu « ⋯ ») : un clic copie le lien

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

// Services de la plateforme x, modifiables dans le popup (mis à jour à chaud)
let xServices = CONFIG.DEFAULT_SERVICES.x;

/**
 * Renvoie l'URL du post qui contient l'élément
 */
function getPostUrlFor(element) {
  const article = element.closest('article');
  return article && getPostUrl(article);
}

/**
 * Ajoute les pastilles de copie dans la barre d'actions d'un post
 */
function addButtonToPost(articleElement) {
  // La barre d'actions du post principal (celle des citations n'existe pas)
  const actionGroup = Array.from(articleElement.querySelectorAll('div[role="group"]'))
    .find(group => !group.closest('div[role="link"]'));
  // Présence vérifiée dans la barre elle-même : X recycle les articles et peut re-rendre la barre
  if (!actionGroup || actionGroup.querySelector('.xilc-services') || !getPostUrl(articleElement)) return;

  const buttons = renderServiceButtons(xServices, { platform: 'x', getUrl: getPostUrlFor });
  if (buttons) actionGroup.appendChild(buttons);
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
      xServices = (await window.Storage.getServices()).x;
    }
  } catch (error) {
    console.error('Error loading services:', error);
  }

  observer.observe(document.body, { childList: true, subtree: true });
  addButtonsToAllPosts();
})();

// Appliquer les services modifiés dans le popup sans recharger la page : les pastilles sont reconstruites
window.Storage.onServicesChanged('x', (services) => {
  xServices = services;
  closeServiceMenu();
  document.querySelectorAll('.xilc-services').forEach(el => el.remove());
  addButtonsToAllPosts();
});
