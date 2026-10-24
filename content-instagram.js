// Content script pour Instagram.com
// Ajoute après Partager un bouton qui copie le lien du premier service activé (les autres dans un menu « ⋯ »),
// et ce même service dans le menu Partager

// Charger les utilitaires (injectés via manifest)
// Note: config.js et utils.js doivent être chargés avant ce script dans le manifest

/**
 * Extrait l'URL d'un post Instagram depuis son élément article
 * (premier lien /p/ ou /reel/ valide : les liens /reels/audio/... sont ignorés)
 */
function getPostUrl(articleElement) {
  for (const link of articleElement.querySelectorAll('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]')) {
    const url = cleanInstagramUrl(link.getAttribute('href'));
    if (url) return url;
  }
  return null;
}

/**
 * Nettoie une URL Instagram pour ne garder que /p/[ID] ou /reel/[ID]
 * Normalise /reels/ vers /reel/ pour la compatibilité
 * Gère aussi les URLs avec nom d'utilisateur : /username/reel/ID
 * Priorise /p/ sur /reel/ et ignore les chemins non valides comme /audio/
 */
function cleanInstagramUrl(href) {
  if (!href) return null;
  
  try {
    // Enlever les query params
    let cleanHref = href.split('?')[0];
    
    // Liste des chemins non valides à ignorer (ne sont pas des IDs de posts)
    const invalidPaths = ['audio', 'liked_by', 'saved', 'tagged', 'followers', 'following'];
    
    // Chercher tous les matches de /p/ID, /reel/ID, /reels/ID
    // Pattern global pour trouver tous les matches
    const allMatches = [];
    
    // Pattern 1: /p/ID ou /reel/ID ou /reels/ID (sans username)
    const pattern1 = /\/(p|reel|reels)\/([^\/]+)/g;
    let match;
    while ((match = pattern1.exec(cleanHref)) !== null) {
      allMatches.push({
        type: match[1],
        id: match[2],
        index: match.index,
        fullMatch: match[0]
      });
    }
    
    // Pattern 2: /username/p/ID ou /username/reel/ID (avec username)
    const pattern2 = /\/[^\/]+\/(p|reel|reels)\/([^\/]+)/g;
    pattern2.lastIndex = 0; // Reset
    while ((match = pattern2.exec(cleanHref)) !== null) {
      allMatches.push({
        type: match[1],
        id: match[2],
        index: match.index,
        fullMatch: match[0]
      });
    }
    
    // Prioriser /p/ sur /reel/, et ignorer les IDs invalides
    // Trier: d'abord /p/, puis /reel/, et filtrer les IDs invalides
    const validMatches = allMatches.filter(m => !invalidPaths.includes(m.id.toLowerCase()));
    const postMatches = validMatches.filter(m => m.type === 'p');
    const reelMatches = validMatches.filter(m => m.type === 'reel' || m.type === 'reels');
    
    // Prendre le premier match valide, en priorisant /p/
    let selectedMatch = postMatches[0] || reelMatches[0];
    
    if (!selectedMatch) {
      console.warn('[kkinstagram] No valid post/reel pattern found in URL:', cleanHref);
      return null;
    }
    
    // Normaliser le type (reels -> reel)
    let normalizedType = selectedMatch.type;
    if (normalizedType === 'reels') {
      normalizedType = 'reel';
    }
    
    cleanHref = `/${normalizedType}/${selectedMatch.id}/`;
    
    // Si c'est un lien relatif, le convertir en absolu
    if (cleanHref.startsWith('/')) {
      return window.location.origin + cleanHref;
    }
    return cleanHref;
  } catch (e) {
    console.error('[kkinstagram] Error cleaning Instagram URL:', e);
    return null;
  }
}

// Le menu de partage est repéré par ses liens d'intention (wa.me, threads...),
// qui ne dépendent pas de la langue de l'interface, contrairement à "Copy link"
const SHARE_LINK_SELECTOR = 'a[href*="wa.me/"], a[href*="threads.com/intent"], a[href*="threads.net/intent"], a[href*="facebook.com/"], a[href^="mailto:"]';

const KKINSTAGRAM_ICON_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.14 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';

/**
 * Retourne la rangée des boutons de partage d'un dialog, ou null si ce n'est pas le menu de partage.
 * Chaque bouton (Copier le lien, Facebook, WhatsApp...) est un enfant direct de cette rangée.
 */
function findShareRow(dialog) {
  const shareLink = dialog.querySelector(SHARE_LINK_SELECTOR);
  if (!shareLink) return null;

  let item = shareLink;
  while (item.parentElement && item.parentElement !== dialog && item.parentElement.children.length < 3) {
    item = item.parentElement;
  }
  return item.parentElement !== dialog ? item.parentElement : null;
}

/**
 * Construit le bouton du premier service en clonant "Copier le lien" pour reprendre son style exact
 */
function buildKkinstagramButton(template, shareDialog, service) {
  // Nom affiché : le domaine sans son extension (kkinstagram.com -> kkinstagram)
  const name = service.domain.replace(/\.[^.]+$/, '');
  const buttonDiv = template.cloneNode(true);
  buttonDiv.setAttribute('data-kkinstagram-button', 'true');

  // Remplacer l'icône
  const svg = buttonDiv.querySelector('svg');
  if (svg) {
    svg.setAttribute('aria-label', name);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.replaceChildren();
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', KKINSTAGRAM_ICON_PATH);
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
  }

  // Remplacer le libellé : le premier nœud texte reçoit le nom du service, les autres sont vidés
  const walker = document.createTreeWalker(buttonDiv, NodeFilter.SHOW_TEXT);
  let labelSet = false;
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    if (!labelSet) {
      // Le libellé natif est limité à deux lignes : "kkinstagram" serait coupé en "kkinstagra / m"
      node.parentElement.style.whiteSpace = 'nowrap';
      node.parentElement.style.letterSpacing = '-0.2px';
    }
    node.textContent = labelSet ? '' : name;
    labelSet = true;
  }

  buttonDiv.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // L'URL est lue au moment du clic, depuis les liens du menu affiché
      const cleanUrl = extractPostUrlFromShareMenu(shareDialog);
      const newUrl = cleanUrl && convertUrl(cleanUrl, service.domain);
      if (!newUrl) {
        createToast(CONFIG.MESSAGES.INVALID_URL, 2000);
        return;
      }

      const success = await copyToClipboard(newUrl);
      if (!success) {
        createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000);
        return;
      }
      createToast(CONFIG.MESSAGES.COPIED, 2500, newUrl);

      if (window.Storage) {
        await window.Storage.saveToHistory(cleanUrl, newUrl, service.domain, 'instagram');
        await window.Storage.incrementStats('instagram', service.domain);
      }
    } catch (error) {
      console.error('[kkinstagram] Error copying share menu link:', error);
      createToast(CONFIG.MESSAGES.ERROR, 2000);
    }
  }, true);

  return buttonDiv;
}

/**
 * Ajoute le bouton du premier service actif dans chaque menu de partage ouvert qui ne l'a pas encore
 */
function addKkinstagramToShareMenu() {
  const service = instagramServices.find(s => s.enabled);
  if (!service) return;

  for (const dialog of document.querySelectorAll('div[role="dialog"]')) {
    if (dialog.querySelector('[data-kkinstagram-button]')) continue;

    const row = findShareRow(dialog);
    if (!row) continue;

    // "Copier le lien" est le premier bouton de la rangée, sans lien <a>
    const copyLinkItem = Array.from(row.children).find(child => !child.matches('a') && !child.querySelector('a'));
    const template = copyLinkItem || row.firstElementChild;
    if (!template) continue;

    template.insertAdjacentElement('afterend', buildKkinstagramButton(template, dialog, service));
  }
}

/**
 * Extrait l'URL du post depuis le menu de partage
 * Priorise l'URL de la page actuelle sur les pages de posts individuelles
 */
function extractPostUrlFromShareMenu(shareDialog) {
  try {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    
    // Méthode 1: Si on est sur une page de post/reel individuelle, utiliser l'URL de la page
    // C'est plus fiable car l'URL de la page est toujours correcte
    if (currentPath.match(/^\/(p|reel|reels)\/[^\/]+/) || currentPath.match(/^\/[^\/]+\/(p|reel|reels)\/[^\/]+/)) {
      const cleanedUrl = cleanInstagramUrl(currentUrl);
      if (cleanedUrl) {
        return cleanedUrl;
      }
    }
    
    // Méthode 2: Sur la timeline, chercher dans les liens de partage (Facebook, WhatsApp, etc.)
    // Ces liens contiennent l'URL du post dans leurs paramètres
    const shareLinks = shareDialog.querySelectorAll('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
    
    for (const link of shareLinks) {
      const href = link.getAttribute('href');
      if (!href) continue;
      
      try {
        // Extraire l'URL Instagram depuis les paramètres URL
        const url = new URL(href);
        
        // Facebook: u= ou link=
        let instagramUrl = url.searchParams.get('u') || url.searchParams.get('link');
        if (instagramUrl) {
          instagramUrl = decodeURIComponent(instagramUrl);
          if (instagramUrl.includes('instagram.com')) {
            const cleanedUrl = cleanInstagramUrl(instagramUrl);
            if (cleanedUrl) {
              return cleanedUrl;
            }
          }
        }
        
        // WhatsApp: text= contient l'URL
        const text = url.searchParams.get('text');
        if (text) {
          const decodedText = decodeURIComponent(text);
          const urlMatch = decodedText.match(/https?:\/\/[^\s]+instagram\.com[^\s]+/);
          if (urlMatch) {
            const cleanedUrl = cleanInstagramUrl(urlMatch[0]);
            if (cleanedUrl) {
              return cleanedUrl;
            }
          }
        }
        
        // Mailto: body= contient l'URL
        if (href.startsWith('mailto:')) {
          const bodyMatch = href.match(/body=([^&]+)/);
          if (bodyMatch) {
            const decodedBody = decodeURIComponent(bodyMatch[1]);
            const urlMatch = decodedBody.match(/https?:\/\/[^\s]+instagram\.com[^\s]+/);
            if (urlMatch) {
              const cleanedUrl = cleanInstagramUrl(urlMatch[0]);
              if (cleanedUrl) {
                return cleanedUrl;
              }
            }
          }
        }
      } catch (e) {
        // Continuer avec le prochain lien
        continue;
      }
    }
    
    // Fallback: Essayer quand même avec l'URL de la page si disponible
    if (currentUrl.includes('instagram.com')) {
      const cleanedUrl = cleanInstagramUrl(currentUrl);
      if (cleanedUrl) {
        return cleanedUrl;
      }
    }
    
    console.warn('[kkinstagram] Could not extract post URL from share menu');
    return null;
  } catch (error) {
    console.error('[kkinstagram] Error extracting post URL from share menu:', error);
    return null;
  }
}

// Services de la plateforme instagram, modifiables dans le popup (mis à jour à chaud)
let instagramServices = CONFIG.DEFAULT_SERVICES.instagram;

/**
 * Retourne l'URL Instagram (/p/<id>/ ou /reel/<id>/) du post qui contient l'élément
 */
function getPostUrlFor(element) {
  const article = element.closest('article');
  const articleUrl = article && getPostUrl(article);
  if (articleUrl) return articleUrl;
  // Page d'un post, fenêtre d'un post ou fil des reels : l'URL de la page désigne le post affiché
  return cleanInstagramUrl(window.location.pathname);
}

/**
 * Ajoute le bouton rapide juste après chaque bouton Partager des barres d'actions
 * (fil, page d'un post, reels), repéré par son libellé dans la langue de l'interface
 */
function addQuickButtons() {
  const selector = CONFIG.INSTAGRAM_SHARE_LABELS.map(label => `svg[aria-label="${label}"]`).join(', ');

  for (const svg of document.querySelectorAll(selector)) {
    const shareButton = svg.closest('[role="button"], button');
    if (!shareButton || shareButton.closest('.xilc-ig-action')) continue;

    // Remonter jusqu'à l'élément qui est un emplacement de la barre d'actions (3 niveaux au plus,
    // pour ne jamais insérer le bouton dans un grand conteneur de la page)
    let slot = shareButton;
    let depth = 0;
    while (slot.parentElement && slot.parentElement.children.length < 3 && depth < 3) {
      slot = slot.parentElement;
      depth++;
    }
    if (!slot.parentElement || slot.parentElement.children.length < 3) continue;
    if (slot.nextElementSibling?.classList.contains('xilc-ig-action')) continue;

    const buttons = renderServiceButtons(instagramServices, {
      platform: 'instagram',
      getUrl: getPostUrlFor,
      chipClass: 'xilc-quick-btn xilc-ig',
      iconClass: 'xilc-quick-btn xilc-ig'
    });
    if (!buttons) return;

    const slotStyle = getComputedStyle(slot);
    const wrapper = document.createElement('div');
    wrapper.className = 'xilc-ig-action';
    wrapper.style.cssText = `display:flex;align-items:center;justify-content:center;flex:0 0 auto;margin:${slotStyle.marginTop} ${slotStyle.marginRight} ${slotStyle.marginBottom} ${slotStyle.marginLeft};`;
    wrapper.appendChild(buttons);
    slot.insertAdjacentElement('afterend', wrapper);
  }
}

/**
 * Retire tous les boutons injectés (services modifiés dans le popup)
 */
function removeInjectedButtons() {
  document.querySelectorAll('.xilc-ig-action, [data-kkinstagram-button]').forEach(el => el.remove());
}

function refresh() {
  addQuickButtons();
  addKkinstagramToShareMenu();
}

// Observer les changements de la page, une vérification par frame au plus
let checkScheduled = false;
const pageObserver = new MutationObserver(() => {
  if (checkScheduled) return;
  checkScheduled = true;
  requestAnimationFrame(() => {
    checkScheduled = false;
    refresh();
  });
});

injectStyles();

(async () => {
  try {
    if (window.Storage) {
      instagramServices = (await window.Storage.getServices()).instagram;
    }
  } catch (error) {
    console.error('[kkinstagram] Error loading services:', error);
  }

  pageObserver.observe(document.body, { childList: true, subtree: true });
  refresh();
})();

// Appliquer les services modifiés dans le popup sans recharger la page : les boutons sont reconstruits
window.Storage.onServicesChanged('instagram', (services) => {
  instagramServices = services;
  closeServiceMenu();
  removeInjectedButtons();
  refresh();
});
