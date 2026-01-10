// Content script pour Instagram.com
// Ajoute des boutons visibles sous chaque post pour convertir les liens vers kkinstagram.com

// Charger les utilitaires (injectés via manifest)
// Note: config.js et utils.js doivent être chargés avant ce script dans le manifest

/**
 * Extrait l'URL spécifique d'un post Instagram depuis son élément article
 */
function getPostUrl(articleElement) {
  // Méthode 1: Chercher un lien avec href contenant /p/, /reel/ ou /reels/
  const postLink = articleElement.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
  if (postLink) {
    const href = postLink.getAttribute('href');
    if (href) {
      return cleanInstagramUrl(href);
    }
  }

  // Méthode 2: Chercher dans les liens time (timestamp du post)
  const timeElement = articleElement.querySelector('time');
  if (timeElement && timeElement.parentElement) {
    const timeLink = timeElement.parentElement.closest('a');
    if (timeLink) {
      const href = timeLink.getAttribute('href');
      if (href && (href.includes('/p/') || href.includes('/reel/') || href.includes('/reels/'))) {
        return cleanInstagramUrl(href);
      }
    }
  }

  // Méthode 3: Chercher dans tous les liens de l'article
  const allLinks = articleElement.querySelectorAll('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
  for (const link of allLinks) {
    const href = link.getAttribute('href');
    if (href && (href.includes('/p/') || href.includes('/reel/') || href.includes('/reels/'))) {
      return cleanInstagramUrl(href);
    }
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

/**
 * Trouve le conteneur des boutons d'engagement (like, comment, share, etc.)
 */
function findEngagementContainer(articleElement) {
  // Méthode 1: Chercher la section avec les boutons d'action
  const actionSection = articleElement.querySelector('section[role="button"]') ||
                       articleElement.querySelector('div[role="button"]') ||
                       articleElement.querySelector('section > div');

  // Méthode 2: Chercher après les boutons like/comment/share
  const likeButton = articleElement.querySelector('svg[aria-label*="Like"], svg[aria-label*="like"]');
  if (likeButton) {
    const buttonContainer = likeButton.closest('section, div[role="button"], div');
    if (buttonContainer && buttonContainer.parentElement) {
      return buttonContainer.parentElement;
    }
  }

  // Méthode 3: Chercher la section qui contient les métriques (likes, comments)
  const metricsSection = articleElement.querySelector('section');
  if (metricsSection) {
    // Chercher après la section des métriques
    return metricsSection;
  }

  // Méthode 4: Fallback - chercher n'importe quelle section dans l'article
  return articleElement.querySelector('section') || articleElement;
}

/**
 * Ajoute les boutons de conversion à un post Instagram spécifique
 */
function addButtonsToPost(articleElement) {
  try {
    // Créer un ID unique basé sur l'URL du post
    const postUrl = getPostUrl(articleElement);
    if (!postUrl) return; // Pas d'URL trouvée, on ne peut pas ajouter les boutons

    // Valider l'URL avant de continuer
    if (!postUrl.match(/\/(p|reel)\/[^\/]+\/$/)) {
      return; // URL invalide
    }

    const uniqueId = 'custom-instagram-buttons-' + btoa(postUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    
    // Vérifier si les boutons existent déjà
    if (articleElement.querySelector(`#${uniqueId}`)) return;

  // Trouver le conteneur avec les boutons d'interaction (Like, Comment, Share, Save)
  // On veut ajouter le bouton kkinstagram SUR la ligne des boutons, pas en dessous
  let actionButtonsContainer = null;
  
  // Chercher le conteneur qui contient les boutons Like/Comment/Share/Save
  const likeButton = articleElement.querySelector('svg[aria-label*="Like"], svg[aria-label*="like"], div[role="button"][aria-label*="Like"]');
  if (likeButton) {
    // Remonter pour trouver le conteneur parent qui contient tous les boutons d'action
    let parent = likeButton.closest('section, div[role="group"], div');
    let depth = 0;
    while (parent && parent !== articleElement && depth < 8) {
      // Vérifier si ce parent contient plusieurs boutons d'action
      const actionButtons = parent.querySelectorAll('div[role="button"][aria-label*="Like"], div[role="button"][aria-label*="Comment"], div[role="button"][aria-label*="Share"], div[role="button"][aria-label*="Save"], svg[aria-label*="Like"], svg[aria-label*="Comment"], svg[aria-label*="Share"], svg[aria-label*="Save"]');
      if (actionButtons.length >= 2) {
        actionButtonsContainer = parent;
        break;
      }
      parent = parent.parentElement;
      depth++;
    }
  }
  
  // Fallback : utiliser findEngagementContainer si on n'a pas trouvé
  if (!actionButtonsContainer) {
    actionButtonsContainer = findEngagementContainer(articleElement);
  }
  if (!actionButtonsContainer) return;

  const wrapper = document.createElement('div');
  wrapper.id = uniqueId;
  Object.assign(wrapper.style, {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '8px', // Espacement après les boutons d'action
    verticalAlign: 'middle'
  });

  const createButton = (domain) => {
    const btn = document.createElement('button');
    
    // Créer une icône SVG stylée (camera/photo icon) - utilisation sécurisée
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('width', '18');
    iconSvg.setAttribute('height', '18');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('fill', 'none');
    Object.assign(iconSvg.style, {
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: '6px'
    });
    
    // Path 1
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z');
    path1.setAttribute('stroke', 'currentColor');
    path1.setAttribute('stroke-width', '2');
    path1.setAttribute('stroke-linecap', 'round');
    path1.setAttribute('stroke-linejoin', 'round');
    iconSvg.appendChild(path1);
    
    // Path 2
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M20.5 7H19L17 5H7L5 7H3.5C2.67 7 2 7.67 2 8.5V19.5C2 20.33 2.67 21 3.5 21H20.5C21.33 21 22 20.33 22 19.5V8.5C22 7.67 21.33 7 20.5 7Z');
    path2.setAttribute('stroke', 'currentColor');
    path2.setAttribute('stroke-width', '2');
    path2.setAttribute('stroke-linecap', 'round');
    path2.setAttribute('stroke-linejoin', 'round');
    iconSvg.appendChild(path2);
    
    // Path 3
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z');
    path3.setAttribute('stroke', 'currentColor');
    path3.setAttribute('stroke-width', '1.5');
    path3.setAttribute('stroke-linecap', 'round');
    path3.setAttribute('stroke-linejoin', 'round');
    iconSvg.appendChild(path3);
    
    // Pas de texte, juste l'icône pour un bouton discret et rond
    btn.appendChild(iconSvg);

    // Style rond avec gradient Instagram coloré (même que les pages de reels)
    Object.assign(btn.style, {
      width: '32px',
      height: '32px',
      padding: '0',
      borderRadius: '50%', // Bouton rond
      border: 'none',
      background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', // Gradient Instagram coloré
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: '0',
      boxShadow: '0 2px 8px rgba(131, 58, 180, 0.3)'
    });
    
    // Style de l'icône SVG
    Object.assign(iconSvg.style, {
      width: '20px',
      height: '20px',
      color: '#ffffff',
      marginRight: '0' // Pas de marge car pas de texte
    });

    // Effet hover avec gradient Instagram
    btn.onmouseover = () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 4px 12px rgba(131, 58, 180, 0.5)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 2px 8px rgba(131, 58, 180, 0.3)';
    };
    
    // Effet de clic
    btn.onmousedown = () => {
      btn.style.transform = 'scale(0.95)';
    };
    btn.onmouseup = () => {
      btn.style.transform = 'scale(1.1)';
    };

    btn.onclick = async () => {
      try {
        // Utiliser l'URL spécifique du post
        const postUrl = getPostUrl(articleElement);
        
        if (!postUrl) {
          createToast(CONFIG.MESSAGES.INVALID_URL + ' (Post URL not found)');
          return;
        }

        // Vérifier que c'est une URL Instagram valide
        if (!isValidInstagramUrl(postUrl)) {
          createToast(CONFIG.MESSAGES.INVALID_URL + ' (Instagram)', 2000, postUrl);
          return;
        }

        // Valider que l'URL contient bien un ID de post
        if (!postUrl.match(/\/(p|reel)\/[^\/]+\/$/)) {
          createToast(CONFIG.MESSAGES.INVALID_URL + ' (Invalid post ID)', 2000, postUrl);
          return;
        }

        const newUrl = convertUrl(postUrl, domain);
        if (!newUrl) {
          createToast(CONFIG.MESSAGES.ERROR + ': Invalid URL conversion', 2000, postUrl);
          return;
        }

        const success = await copyToClipboard(newUrl);
        if (success) {
          // Sauvegarder dans l'historique et les stats
          if (window.Storage) {
            const domainKey = Object.keys(CONFIG.INSTAGRAM_ALTERNATIVES).find(key => CONFIG.INSTAGRAM_ALTERNATIVES[key] === domain);
            await window.Storage.saveToHistory(postUrl, newUrl, domainKey || domain, 'instagram');
            await window.Storage.incrementStats('instagram', domainKey || domain);
          }
          createToast(`${CONFIG.MESSAGES.COPIED}: ${domain}`, 3000, newUrl);
        } else {
          createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000, newUrl);
        }
      } catch (error) {
        console.error('Error in button click handler:', error);
        createToast(CONFIG.MESSAGES.ERROR + ': ' + error.message);
      }
    };

    return btn;
  };

  // Créer le bouton pour kkinstagram avec style amélioré (selon les paramètres)
  // Note: createButtonsWithSettings est async, on l'appelle mais on insère le wrapper quand même
  createButtonsWithSettings(wrapper, createButton).catch(err => {
    console.error('Error creating buttons with settings:', err);
    // Fallback : créer tous les boutons en cas d'erreur
    Object.entries(CONFIG.INSTAGRAM_ALTERNATIVES).forEach(([key, domain]) => {
      wrapper.appendChild(createButton(domain));
    });
  });

  // Insérer le bouton DANS le conteneur des boutons d'action (sur la même ligne)
  // Chercher le dernier bouton d'action (Save/Bookmark) pour insérer après
  const lastActionButton = actionButtonsContainer.querySelector('div[role="button"][aria-label*="Save"], div[role="button"][aria-label*="Bookmark"], svg[aria-label*="Save"], svg[aria-label*="Bookmark"]');
  if (lastActionButton) {
    // Insérer après le dernier bouton d'action
    const lastButtonParent = lastActionButton.closest('div, section') || lastActionButton.parentElement;
    if (lastButtonParent && lastButtonParent.parentElement) {
      lastButtonParent.parentElement.insertBefore(wrapper, lastButtonParent.nextSibling);
    } else {
      actionButtonsContainer.appendChild(wrapper);
    }
  } else {
    // Fallback : ajouter à la fin du conteneur des boutons d'action
    actionButtonsContainer.appendChild(wrapper);
  }
  } catch (error) {
    console.error('Error in addButtonsToPost:', error);
  }
}

/**
 * Crée les boutons selon les paramètres utilisateur
 */
async function createButtonsWithSettings(wrapper, createButtonFn) {
  try {
    if (!window.Storage) {
      // Fallback : créer tous les boutons si Storage n'est pas disponible
      Object.entries(CONFIG.INSTAGRAM_ALTERNATIVES).forEach(([key, domain]) => {
        wrapper.appendChild(createButtonFn(domain));
      });
      return;
    }
    
    const settings = await window.Storage.getSettings();
    const enabledDomains = settings.enabledDomains || {
      kkinstagram: true
    };
    
    Object.entries(CONFIG.INSTAGRAM_ALTERNATIVES).forEach(([key, domain]) => {
      if (enabledDomains[key] !== false) {
        wrapper.appendChild(createButtonFn(domain));
      }
    });
  } catch (error) {
    console.error('Error loading settings for buttons:', error);
    // Fallback : créer tous les boutons en cas d'erreur
    Object.entries(CONFIG.INSTAGRAM_ALTERNATIVES).forEach(([key, domain]) => {
      wrapper.appendChild(createButtonFn(domain));
    });
  }
}

/**
 * Convertit un lien Instagram dans les commentaires
 */
function convertLinkInText(element) {
  // Chercher tous les liens dans l'élément
  const links = element.querySelectorAll('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
  
  links.forEach(link => {
    // Vérifier si le lien n'a pas déjà été converti
    if (link.hasAttribute('data-converted')) return;
    
    const href = link.getAttribute('href');
    if (!href || (!href.includes('/p/') && !href.includes('/reel/') && !href.includes('/reels/'))) return;
    
    // Créer un bouton de conversion au survol
    let convertButton = null;
    
    link.addEventListener('mouseenter', () => {
      if (convertButton) return;
      
      convertButton = document.createElement('button');
      convertButton.textContent = '🔗 Convert';
      convertButton.style.cssText = `
        position: absolute;
        margin-left: 8px;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
        color: #fff;
        font-size: 11px;
        cursor: pointer;
        z-index: 1000;
      `;
      
      convertButton.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          const fullUrl = cleanInstagramUrl(href);
          if (!fullUrl) return;
          
          // Convertir vers kkinstagram
          const newUrl = convertUrl(fullUrl, CONFIG.INSTAGRAM_ALTERNATIVES.kkinstagram);
          if (newUrl) {
            const success = await copyToClipboard(newUrl);
            if (success) {
              if (window.Storage) {
                await window.Storage.saveToHistory(fullUrl, newUrl, 'kkinstagram', 'instagram');
                await window.Storage.incrementStats('instagram', 'kkinstagram');
              }
              createToast(`${CONFIG.MESSAGES.COPIED}: kkinstagram`, 3000, newUrl);
            }
          }
        } catch (error) {
          console.error('Error converting link:', error);
        }
        
        if (convertButton) {
          convertButton.remove();
          convertButton = null;
        }
      };
      
      // Positionner le bouton à côté du lien
      const rect = link.getBoundingClientRect();
      convertButton.style.position = 'fixed';
      convertButton.style.left = (rect.right + 8) + 'px';
      convertButton.style.top = rect.top + 'px';
      
      document.body.appendChild(convertButton);
    });
    
    link.addEventListener('mouseleave', () => {
    setTimeout(() => {
        if (convertButton && !convertButton.matches(':hover')) {
          convertButton.remove();
          convertButton = null;
        }
      }, 200);
    });
    
    link.setAttribute('data-converted', 'true');
  });
}

/**
 * Parcourt tous les posts du feed et ajoute les boutons
 */
function addButtonsToAllPosts() {
  try {
    // NE PAS ajouter de boutons sur les pages de reels avec 's' (/reels/ID)
    // Mais ajouter des boutons pour /reel/ID (sans 's') et /p/ID
    const currentPath = window.location.pathname;
    if (currentPath.match(/^\/reels\/[^\/]+/)) {
      return; // Sur une page /reels/ID (avec 's'), ne pas ajouter de boutons
    }
    // Pour /reel/ID (sans 's') et /p/ID, on ajoute les boutons via handleReelsPage() ou ici
    
    // Trouver tous les articles/posts dans le feed Instagram
    // Instagram utilise <article> pour les posts
    const articles = document.querySelectorAll('article');
    
    articles.forEach((article) => {
      try {
        // Vérifier que c'est bien un post (contient des éléments de post)
        const hasPostContent = article.querySelector('a[href*="/p/"]') || 
                              article.querySelector('a[href*="/reel/"]') ||
                              article.querySelector('a[href*="/reels/"]') ||
                              article.querySelector('section');
        
        // Vérifier aussi qu'on a bien une URL de post valide
        const postUrl = getPostUrl(article);
        const hasValidPostUrl = postUrl && postUrl.match(/\/(p|reel)\/[^\/]+\/$/);
        
        if (hasPostContent && hasValidPostUrl) {
          addButtonsToPost(article);
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    });
  } catch (error) {
    console.error('Error in addButtonsToAllPosts:', error);
  }
}

// Observer pour détecter les nouveaux posts chargés dynamiquement
const observer = new MutationObserver((mutations) => {
  // Délai pour éviter trop d'exécutions
  clearTimeout(window.addInstagramButtonsTimeout);
  window.addInstagramButtonsTimeout = setTimeout(() => {
    addButtonsToAllPosts();
    
    // Détecter et convertir les liens dans les commentaires
    try {
      const commentSections = document.querySelectorAll('article, [role="article"]');
      commentSections.forEach(section => {
        convertLinkInText(section);
      });
    } catch (error) {
      console.error('Error converting links in comments:', error);
    }
    
    // Gérer les pages de reels individuelles (/reel/ID sans 's') et posts individuels (/p/ID)
    handleReelsPage();
    // Pour les posts individuels, addButtonsToAllPosts() devrait aussi fonctionner
  }, 300);
});

/**
 * Gère l'injection de boutons sur les pages de reels
 * S'adapte aux changements d'URL lors du scroll
 */
function handleReelsPage() {
  try {
    const currentUrl = window.location.pathname;
    
    // Exclure explicitement /reels/ (avec 's') - ne pas gérer ces pages
    if (currentUrl.match(/^\/reels\/[^\/]+/)) {
      return; // Ne pas gérer /reels/ (avec 's')
    }
    
    // Accepter /reel/ (sans 's') et /p/ (posts individuels)
    // Supporte aussi /username/reel/ID et /username/p/ID
    let currentPostId = null;
    let postType = null;
    
    // Pattern 1: /reel/ID ou /p/ID (sans username)
    const simpleMatch = currentUrl.match(/^\/(reel|p)\/([^\/]+)/);
    if (simpleMatch) {
      postType = simpleMatch[1];
      currentPostId = simpleMatch[2];
    } else {
      // Pattern 2: /username/reel/ID ou /username/p/ID (avec username)
      const withUsernameMatch = currentUrl.match(/^\/[^\/]+\/(reel|p)\/([^\/]+)/);
      if (withUsernameMatch) {
        postType = withUsernameMatch[1];
        currentPostId = withUsernameMatch[2];
      }
    }
    
    // Si aucun pattern ne correspond, ne pas continuer
    if (!currentPostId || !postType) {
      return;
    }
    
    // Vérifier si on a déjà des boutons pour ce post/reel
    const existingWrapper = document.querySelector(`.custom-instagram-buttons-reels-page[data-post-id="${currentPostId}"]`);
    if (existingWrapper) {
      return; // Boutons déjà présents
    }
    
    // Supprimer les anciens boutons (d'autres posts/reels)
    const oldButtons = document.querySelectorAll('.custom-instagram-buttons-reels-page');
    oldButtons.forEach(btn => btn.remove());
    
    // Chercher la section spécifique avec les boutons d'interaction (Like, Comment, Share, Save)
    // Structure: <section class="x6s0dn4 xrvj5dj x1o61qjw"> qui contient tous les boutons
    let insertPoint = null;
    let shareButtonContainer = null;
    
    // Stratégie 1: Chercher la section avec les classes spécifiques
    const actionSection = document.querySelector('section.x6s0dn4.xrvj5dj.x1o61qjw');
    if (actionSection) {
      // Chercher le bouton Share (SVG avec aria-label="Share")
      const shareButton = actionSection.querySelector('svg[aria-label="Share"], svg[aria-label="share"]');
      if (shareButton) {
        // Trouver le conteneur parent du bouton Share
        shareButtonContainer = shareButton.closest('div[role="button"]') || shareButton.closest('div');
        if (shareButtonContainer) {
          insertPoint = actionSection;
        }
      }
    }
    
    // Stratégie 2: Chercher le bouton Share directement
    if (!insertPoint || !shareButtonContainer) {
      const shareButton = document.querySelector('svg[aria-label="Share"], svg[aria-label="share"]');
      if (shareButton) {
        shareButtonContainer = shareButton.closest('div[role="button"]') || shareButton.closest('div');
        if (shareButtonContainer) {
          // Remonter pour trouver la section parente
          let parent = shareButtonContainer.parentElement;
          let depth = 0;
          while (parent && parent !== document.body && depth < 10) {
            if (parent.tagName === 'SECTION' || (parent.classList && parent.classList.contains('xrvj5dj'))) {
              insertPoint = parent;
              break;
            }
            parent = parent.parentElement;
            depth++;
          }
        }
      }
    }
    
    // Stratégie 3: Chercher la section qui contient les boutons Like/Comment/Share/Save
    if (!insertPoint) {
      const likeButton = document.querySelector('svg[aria-label="Like"], svg[aria-label="like"]');
      if (likeButton) {
        let parent = likeButton.closest('section');
        if (parent) {
          // Vérifier que cette section contient aussi le bouton Share
          const shareButton = parent.querySelector('svg[aria-label="Share"], svg[aria-label="share"]');
          if (shareButton) {
            insertPoint = parent;
            shareButtonContainer = shareButton.closest('div[role="button"]') || shareButton.closest('div');
          }
        }
      }
    }
    
    if (!insertPoint || !shareButtonContainer) return;
    
    // Créer un wrapper pour les boutons (inline pour être sur la ligne)
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-instagram-buttons-reels-page';
    wrapper.setAttribute('data-post-id', currentPostId);
    wrapper.setAttribute('data-post-type', postType);
    Object.assign(wrapper.style, {
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '8px', // Espacement après les boutons d'action
      verticalAlign: 'middle',
      position: 'relative',
      zIndex: '1000'
    });
          
    // Créer les boutons selon les paramètres
    createButtonsWithSettings(wrapper, (domain) => {
            const btn = document.createElement('button');
            const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('width', '20');
            iconSvg.setAttribute('height', '20');
            iconSvg.setAttribute('viewBox', '0 0 24 24');
            iconSvg.setAttribute('fill', 'none');
            Object.assign(iconSvg.style, {
              display: 'inline-block',
              verticalAlign: 'middle',
              marginRight: '0' // Pas de marge car pas de texte
            });
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z');
            path1.setAttribute('stroke', 'currentColor');
            path1.setAttribute('stroke-width', '2');
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');
            iconSvg.appendChild(path1);
            
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M20.5 7H19L17 5H7L5 7H3.5C2.67 7 2 7.67 2 8.5V19.5C2 20.33 2.67 21 3.5 21H20.5C21.33 21 22 20.33 22 19.5V8.5C22 7.67 21.33 7 20.5 7Z');
            path2.setAttribute('stroke', 'currentColor');
            path2.setAttribute('stroke-width', '2');
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');
            iconSvg.appendChild(path2);
            
            // Pas de texte, juste l'icône pour un bouton discret et rond
            btn.appendChild(iconSvg);
            
            // Style rond et discret avec gradient Instagram coloré
            Object.assign(btn.style, {
              width: '32px',
              height: '32px',
              padding: '0',
              borderRadius: '50%', // Bouton rond
              border: 'none',
              background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', // Gradient Instagram coloré
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: '0',
              boxShadow: '0 2px 8px rgba(131, 58, 180, 0.3)'
            });
            
            btn.onmouseover = () => {
              btn.style.transform = 'scale(1.1)';
              btn.style.boxShadow = '0 4px 12px rgba(131, 58, 180, 0.5)';
            };
            btn.onmouseout = () => {
              btn.style.transform = 'scale(1)';
              btn.style.boxShadow = '0 2px 8px rgba(131, 58, 180, 0.3)';
            };
            
            // Effet de clic
            btn.onmousedown = () => {
              btn.style.transform = 'scale(0.95)';
            };
            btn.onmouseup = () => {
              btn.style.transform = 'scale(1.1)';
            };
            
            btn.onclick = async () => {
              try {
                // TOUJOURS utiliser l'URL de la page actuelle (pas en cache)
                const currentUrl = window.location.href.split('?')[0];
                let cleanUrl = cleanInstagramUrl(currentUrl);
                
                // Si on est sur /reel/ ou /p/, extraire l'ID directement depuis l'URL
                if (currentUrl.includes('/reel/')) {
                  const reelMatch = currentUrl.match(/\/reel\/([^\/\?]+)/);
                  if (reelMatch) {
                    const reelId = reelMatch[1];
                    cleanUrl = window.location.origin + `/reel/${reelId}/`;
                  }
                } else if (currentUrl.includes('/p/')) {
                  const postMatch = currentUrl.match(/\/p\/([^\/\?]+)/);
                  if (postMatch) {
                    const postId = postMatch[1];
                    cleanUrl = window.location.origin + `/p/${postId}/`;
                  }
                }
                
                if (!cleanUrl) {
                  createToast(CONFIG.MESSAGES.INVALID_URL + ' (Post URL not found)');
                  return;
                }
                
                if (!isValidInstagramUrl(cleanUrl)) {
                  createToast(CONFIG.MESSAGES.INVALID_URL + ' (Instagram)', 2000, cleanUrl);
                  return;
                }
                
                const newUrl = convertUrl(cleanUrl, domain);
                if (!newUrl) {
                  createToast(CONFIG.MESSAGES.ERROR + ': Invalid URL conversion', 2000, cleanUrl);
                  return;
                }
                
                const success = await copyToClipboard(newUrl);
                if (success) {
                  if (window.Storage) {
                    const domainKey = Object.keys(CONFIG.INSTAGRAM_ALTERNATIVES).find(key => CONFIG.INSTAGRAM_ALTERNATIVES[key] === domain);
                    await window.Storage.saveToHistory(cleanUrl, newUrl, domainKey || domain, 'instagram');
                    await window.Storage.incrementStats('instagram', domainKey || domain);
                  }
                  createToast(`${CONFIG.MESSAGES.COPIED}: ${domain}`, 3000, newUrl);
                } else {
                  createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000, newUrl);
                }
              } catch (error) {
                console.error('Error in button click handler:', error);
                createToast(CONFIG.MESSAGES.ERROR + ': ' + error.message);
              }
            };
            
      return btn;
    }).catch(err => {
      console.error('Error creating buttons for reels page:', err);
    });
    
    // Insérer le bouton DANS la section des boutons d'action, après le conteneur du bouton Share
    let inserted = false;
    
    if (insertPoint && shareButtonContainer) {
      // Insérer directement après le conteneur du bouton Share
      try {
        if (shareButtonContainer.parentElement) {
          shareButtonContainer.parentElement.insertBefore(wrapper, shareButtonContainer.nextSibling);
          inserted = true;
        } else {
          // Fallback : ajouter à la fin de la section
          insertPoint.appendChild(wrapper);
          inserted = true;
        }
      } catch (e) {
        console.error('Error inserting after Share button container:', e);
      }
    } else if (insertPoint) {
      // Si on a la section mais pas le conteneur Share, chercher le bouton Share
      const shareButton = insertPoint.querySelector('svg[aria-label="Share"], svg[aria-label="share"]');
      if (shareButton) {
        const shareButtonParent = shareButton.closest('div[role="button"]') || shareButton.closest('div');
        if (shareButtonParent && shareButtonParent.parentElement) {
          try {
            shareButtonParent.parentElement.insertBefore(wrapper, shareButtonParent.nextSibling);
            inserted = true;
          } catch (e) {
            console.error('Error inserting after Share button:', e);
          }
        } else {
          // Fallback : ajouter à la fin de la section
          try {
            insertPoint.appendChild(wrapper);
            inserted = true;
          } catch (e) {
            console.error('Error appending to section:', e);
          }
        }
      } else {
        // Dernier recours : ajouter à la fin de la section
        try {
          insertPoint.appendChild(wrapper);
          inserted = true;
        } catch (e) {
          console.error('Error appending to section:', e);
        }
      }
    }
    
    // Fallback : ajouter au body si rien n'a fonctionné
    if (!inserted) {
      try {
        document.body.appendChild(wrapper);
        inserted = true;
      } catch (e) {
        console.error('Error appending to body:', e);
      }
    }
    
    // Forcer la visibilité avec des styles importants
    if (inserted) {
      wrapper.style.cssText += `
        display: inline-flex !important;
        align-items: center !important;
        margin-left: 8px !important;
        vertical-align: middle !important;
        position: relative !important;
        z-index: 10000 !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      // S'assurer que les boutons sont visibles
      setTimeout(() => {
        const buttons = wrapper.querySelectorAll('button');
        buttons.forEach(btn => {
          btn.style.cssText += 'display: inline-flex !important; visibility: visible !important; opacity: 1 !important;';
        });
      }, 100);
    }
  } catch (error) {
    console.error('Error handling reels page:', error);
  }
}

// Détecter les changements d'URL sur les pages de reels (sans 's') et posts individuels
// Stocker l'ID au lieu du pathname complet pour mieux détecter les changements
let lastPostUrl = null;
let reelsUrlCheckInterval = null;

// Initialiser lastPostUrl avec l'ID actuel si on est sur une page de reel (sans 's') ou post
// Supporte /reel/ID, /p/ID, /username/reel/ID, /username/p/ID
// Exclut /reels/ (avec 's')
if (!window.location.pathname.match(/^\/reels\/[^\/]+/)) {
  let postId = null;
  
  // Pattern 1: /reel/ID ou /p/ID (sans username)
  const simpleMatch = window.location.pathname.match(/^\/(reel|p)\/([^\/]+)/);
  if (simpleMatch) {
    postId = simpleMatch[2];
  } else {
    // Pattern 2: /username/reel/ID ou /username/p/ID (avec username)
    const withUsernameMatch = window.location.pathname.match(/^\/[^\/]+\/(reel|p)\/([^\/]+)/);
    if (withUsernameMatch) {
      postId = withUsernameMatch[2];
    }
  }
  
  if (postId) {
    lastPostUrl = postId;
  }
}

/**
 * Vérifie si l'URL a changé (pour les pages de reels sans 's' et posts individuels)
 */
function checkReelsUrlChange() {
  const currentUrl = window.location.pathname;
  
  // Exclure /reels/ (avec 's')
  if (currentUrl.match(/^\/reels\/[^\/]+/)) {
    return; // Ne pas gérer /reels/ (avec 's')
  }
  
  // Si on est sur une page de reel (sans 's') ou post individuel et que l'URL a changé
  // Supporte /reel/ID, /p/ID, /username/reel/ID, /username/p/ID
  let currentPostId = null;
  
  // Pattern 1: /reel/ID ou /p/ID (sans username)
  const simpleMatch = currentUrl.match(/^\/(reel|p)\/([^\/]+)/);
  if (simpleMatch) {
    currentPostId = simpleMatch[2];
  } else {
    // Pattern 2: /username/reel/ID ou /username/p/ID (avec username)
    const withUsernameMatch = currentUrl.match(/^\/[^\/]+\/(reel|p)\/([^\/]+)/);
    if (withUsernameMatch) {
      currentPostId = withUsernameMatch[2];
    }
  }
  
  if (currentPostId) {
    // Vérifier si c'est un nouveau post/reel (ID différent)
    if (currentPostId !== lastPostUrl) {
      lastPostUrl = currentPostId;
      
      // Supprimer TOUS les anciens boutons
      const oldButtons = document.querySelectorAll('.custom-instagram-buttons-reels-page');
      oldButtons.forEach(btn => {
        try {
          btn.remove();
        } catch (e) {
          console.error('Error removing old button:', e);
        }
      });
      
      // Réinjecter les boutons pour le nouveau post/reel
      setTimeout(() => {
        handleReelsPage();
      }, 300);
    }
  } else {
    // Plus sur une page de reel/post, nettoyer
    lastPostUrl = null;
    if (reelsUrlCheckInterval) {
      clearInterval(reelsUrlCheckInterval);
      reelsUrlCheckInterval = null;
    }
  }
}

// Démarrer la surveillance des changements d'URL pour les reels (sans 's') et posts individuels
function initReelsMonitoring() {
  // Exclure /reels/ (avec 's')
  if (window.location.pathname.match(/^\/reels\/[^\/]+/)) {
    return; // Ne pas surveiller /reels/ (avec 's')
  }
  
  // Gérer /reel/ (sans 's') et /p/ (posts individuels)
  // Supporte /reel/ID, /p/ID, /username/reel/ID, /username/p/ID
  let postId = null;
  
  // Pattern 1: /reel/ID ou /p/ID (sans username)
  const simpleMatch = window.location.pathname.match(/^\/(reel|p)\/([^\/]+)/);
  if (simpleMatch) {
    postId = simpleMatch[2];
  } else {
    // Pattern 2: /username/reel/ID ou /username/p/ID (avec username)
    const withUsernameMatch = window.location.pathname.match(/^\/[^\/]+\/(reel|p)\/([^\/]+)/);
    if (withUsernameMatch) {
      postId = withUsernameMatch[2];
    }
  }
  
  if (postId) {
    // Initialiser lastPostUrl
    lastPostUrl = postId;
    
    // Vérifier toutes les 200ms si l'URL a changé (plus fréquent pour détecter rapidement)
    if (reelsUrlCheckInterval) {
      clearInterval(reelsUrlCheckInterval);
    }
    reelsUrlCheckInterval = setInterval(checkReelsUrlChange, 200);
    
    // Intercepter pushState pour détecter les changements d'URL immédiatement
    if (!window._originalPushState) {
      window._originalPushState = history.pushState;
      history.pushState = function(...args) {
        window._originalPushState.apply(history, args);
        // Vérifier immédiatement après le changement
        setTimeout(checkReelsUrlChange, 50);
      };
    }
    
    // Intercepter aussi replaceState (Instagram peut l'utiliser)
    if (!window._originalReplaceState) {
      window._originalReplaceState = history.replaceState;
      history.replaceState = function(...args) {
        window._originalReplaceState.apply(history, args);
        setTimeout(checkReelsUrlChange, 50);
      };
    }
    
    // Écouter aussi les événements popstate (navigation arrière/avant)
    if (!window._reelsPopstateListener) {
      window._reelsPopstateListener = () => {
        setTimeout(checkReelsUrlChange, 50);
      };
      window.addEventListener('popstate', window._reelsPopstateListener);
    }
    
    // Ne pas injecter de boutons sur les pages de reels
    // setTimeout(handleReelsPage, 500);
  }
}

// Surveiller les pages de reels (sans 's') et posts individuels
initReelsMonitoring();

// Observer pour détecter l'arrivée sur une page de reel (sans 's') ou post individuel
const reelsObserver = new MutationObserver(() => {
  const currentPath = window.location.pathname;
  
  // Exclure /reels/ (avec 's')
  if (currentPath.match(/^\/reels\/[^\/]+/)) {
    return;
  }
  
  // Gérer /reel/ (sans 's') et /p/ (posts individuels)
  // Supporte /reel/ID, /p/ID, /username/reel/ID, /username/p/ID
  let postId = null;
  
  // Pattern 1: /reel/ID ou /p/ID (sans username)
  const simpleMatch = currentPath.match(/^\/(reel|p)\/([^\/]+)/);
  if (simpleMatch) {
    postId = simpleMatch[2];
  } else {
    // Pattern 2: /username/reel/ID ou /username/p/ID (avec username)
    const withUsernameMatch = currentPath.match(/^\/[^\/]+\/(reel|p)\/([^\/]+)/);
    if (withUsernameMatch) {
      postId = withUsernameMatch[2];
    }
  }
  
  if (postId && postId !== lastPostUrl) {
    initReelsMonitoring();
  }
});

reelsObserver.observe(document.body, {
  childList: true,
  subtree: true
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// Exécuter immédiatement au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addButtonsToAllPosts, 500);
  });
} else {
  setTimeout(addButtonsToAllPosts, 500);
}

// Réexécuter après un délai pour les chargements tardifs
setTimeout(addButtonsToAllPosts, 1000);
setTimeout(addButtonsToAllPosts, 2000);

// Injecter les boutons sur les pages de reels (sans 's') et posts individuels au chargement
// Supporte /reel/ID, /p/ID, /username/reel/ID, /username/p/ID
// Exclut /reels/ (avec 's')
if (!window.location.pathname.match(/^\/reels\/[^\/]+/)) {
  const pathname = window.location.pathname;
  const isReelOrPost = pathname.match(/^\/(reel|p)\/[^\/]+/) || pathname.match(/^\/[^\/]+\/(reel|p)\/[^\/]+/);
  if (isReelOrPost) {
    setTimeout(handleReelsPage, 500);
    setTimeout(handleReelsPage, 1000);
    setTimeout(handleReelsPage, 2000);
  }
}

// Flag pour éviter les exécutions multiples simultanées
let isAddingKkinstagramButton = false;

/**
 * Ajoute un bouton kkinstagram dans le menu de partage Instagram
 */
function addKkinstagramToShareMenu() {
  // Éviter les exécutions multiples simultanées
  if (isAddingKkinstagramButton) {
    return;
  }
  
  try {
    console.log('[kkinstagram] Checking for share menu on page:', window.location.pathname);
    
    // Chercher le menu de partage avec plusieurs stratégies
    // Stratégie 1: Dialog avec aria-label="Share"
    let shareDialog = document.querySelector('div[role="dialog"][aria-label="Share"]');
    
    // Stratégie 2: Dialog avec aria-label contenant "Share" (insensible à la casse)
    if (!shareDialog) {
      const allDialogs = document.querySelectorAll('div[role="dialog"]');
      for (const dialog of allDialogs) {
        const ariaLabel = dialog.getAttribute('aria-label');
        // Exclure le menu "More" même s'il contient "share" dans l'aria-label (peu probable mais par sécurité)
        if (ariaLabel && ariaLabel.toLowerCase().includes('share') && !ariaLabel.toLowerCase().includes('more')) {
          shareDialog = dialog;
          break;
        }
      }
    }
    
    // Stratégie 3: Chercher un dialog qui contient "Copy link" ou des boutons de partage
    if (!shareDialog) {
      const allDialogs = document.querySelectorAll('div[role="dialog"]');
      console.log('[kkinstagram] Found', allDialogs.length, 'dialog(s) on page');
      for (const dialog of allDialogs) {
        const ariaLabel = dialog.getAttribute('aria-label');
        const dialogText = dialog.textContent || '';
        
        // Exclure le menu "More" (trois points) - détection renforcée
        const hasMoreMenuContent = dialogText.includes('Report') || 
                                   dialogText.includes('Unfollow') || 
                                   dialogText.includes('Not interested') ||
                                   dialogText.includes('About this account') ||
                                   dialogText.includes('Embed');
        const hasShareButtons = dialog.querySelector('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
        
        // Si c'est le menu "More" (a du contenu caractéristique mais pas de boutons de partage)
        if (hasMoreMenuContent && !hasShareButtons) {
          console.log('[kkinstagram] Skipping "More" menu (has Report/Unfollow/Embed but no share buttons)');
          continue;
        }
        
        // Vérification supplémentaire par aria-label
        if (ariaLabel && (ariaLabel.toLowerCase().includes('more') || ariaLabel.toLowerCase().includes('options'))) {
          if (!hasShareButtons) {
            console.log('[kkinstagram] Skipping "More" menu (aria-label contains "more" but no share buttons)');
            continue;
          }
        }
        
        const hasShareContent = dialogText.includes('Copy link') || hasShareButtons;
        console.log('[kkinstagram] Dialog aria-label:', ariaLabel, 'hasShareContent:', hasShareContent);
        if (hasShareContent) {
          shareDialog = dialog;
          console.log('[kkinstagram] Found share dialog via strategy 3');
          break;
        }
      }
    }
    
    // Stratégie 4: Chercher n'importe quel dialog visible (dernier recours)
    if (!shareDialog) {
      const allDialogs = document.querySelectorAll('div[role="dialog"]');
      for (const dialog of allDialogs) {
        const ariaLabel = dialog.getAttribute('aria-label');
        
        // Exclure le menu "More" (trois points) - détection renforcée
        const dialogText = dialog.textContent || '';
        const hasMoreMenuContent = dialogText.includes('Report') || 
                                   dialogText.includes('Unfollow') || 
                                   dialogText.includes('Not interested') ||
                                   dialogText.includes('About this account') ||
                                   dialogText.includes('Embed');
        const hasShareButtons = dialog.querySelector('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
        
        // Si c'est le menu "More" (a du contenu caractéristique mais pas de boutons de partage)
        if (hasMoreMenuContent && !hasShareButtons) {
          console.log('[kkinstagram] Skipping "More" menu in strategy 4 (has Report/Unfollow/Embed but no share buttons)');
          continue;
        }
        
        // Vérification supplémentaire par aria-label
        if (ariaLabel && (ariaLabel.toLowerCase().includes('more') || ariaLabel.toLowerCase().includes('options'))) {
          if (!hasShareButtons) {
            console.log('[kkinstagram] Skipping "More" menu in strategy 4 (aria-label contains "more" but no share buttons)');
            continue;
          }
        }
        
        // Vérifier si le dialog est visible
        const style = window.getComputedStyle(dialog);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          // Vérifier s'il contient des éléments de partage (pas juste n'importe quel bouton)
          const hasShareLinks = dialog.querySelector('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
          const hasCopyLink = dialog.textContent && dialog.textContent.includes('Copy link');
          if (hasShareLinks || hasCopyLink) {
            shareDialog = dialog;
            console.log('[kkinstagram] Found share dialog via strategy 4 (visible dialog with share buttons)');
            break;
          }
        }
      }
    }
    
    // Stratégie 5: Chercher directement des éléments contenant "Copy link" (plus efficace)
    // Cette stratégie fonctionne même si le menu n'utilise pas role="dialog"
    if (!shareDialog) {
      // Utiliser TreeWalker pour une recherche plus efficace
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.textContent && node.textContent.includes('Copy link')) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      const copyLinkTextNodes = [];
      let node;
      while (node = walker.nextNode()) {
        copyLinkTextNodes.push(node);
      }
      
      console.log('[kkinstagram] Found', copyLinkTextNodes.length, 'text node(s) containing "Copy link"');
      
      for (const textNode of copyLinkTextNodes) {
        // Remonter jusqu'à trouver un élément parent
        let element = textNode.parentElement;
        let depth = 0;
        const maxDepth = 15;
        
        while (element && depth < maxDepth) {
          const hasShareButtons = element.querySelector('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
          const isVisible = window.getComputedStyle(element).display !== 'none';
          const rect = element.getBoundingClientRect();
          
          // Vérifier que c'est un conteneur raisonnable (pas la page entière)
          if (hasShareButtons && isVisible && rect.width > 0 && rect.height > 0 && 
              rect.width < window.innerWidth * 0.95 && rect.height < window.innerHeight * 0.95 &&
              rect.width > 100 && rect.height > 50) { // Minimum raisonnable pour un menu
            shareDialog = element;
            console.log('[kkinstagram] Found share menu via strategy 5 (element with Copy link and share buttons)', element);
            break;
          }
          
          element = element.parentElement;
          depth++;
        }
        
        if (shareDialog) break;
      }
    }
    
    // Si on a trouvé un dialog via la stratégie 5, chercher le conteneur des boutons à l'intérieur
    // (les autres stratégies le font déjà dans le code suivant)
    
    if (!shareDialog) {
      // Log pour débogage : vérifier s'il y a des dialogs mais qu'ils ne correspondent pas
      const allDialogs = document.querySelectorAll('div[role="dialog"]');
      if (allDialogs.length > 0) {
        console.log('[kkinstagram] Found', allDialogs.length, 'dialog(s) but none match share menu criteria');
        allDialogs.forEach((dialog, index) => {
          const ariaLabel = dialog.getAttribute('aria-label');
          const hasCopyLink = dialog.textContent && dialog.textContent.includes('Copy link');
          const hasShareLinks = dialog.querySelector('a[href*="facebook.com"], a[href*="wa.me"]');
          console.log(`[kkinstagram] Dialog ${index}: aria-label="${ariaLabel}", hasCopyLink=${hasCopyLink}, hasShareLinks=${!!hasShareLinks}`);
        });
      } else {
        console.log('[kkinstagram] No dialogs found on page - share menu may not be open');
      }
      return; // Menu de partage pas encore ouvert
    }

    console.log('[kkinstagram] Share dialog found on page:', window.location.pathname);

    // Vérification finale : s'assurer que ce n'est pas le menu "More" (trois points) dans les reels
    const ariaLabel = shareDialog.getAttribute('aria-label');
    const dialogText = shareDialog.textContent || '';
    
    // Détecter le menu "More" par son contenu caractéristique
    const hasMoreMenuContent = dialogText.includes('Report') || 
                               dialogText.includes('Unfollow') || 
                               dialogText.includes('Not interested') ||
                               dialogText.includes('About this account') ||
                               dialogText.includes('Embed');
    
    // Le menu "More" n'a PAS de boutons de partage (Facebook, WhatsApp, etc.)
    const hasShareButtons = shareDialog.querySelector('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
    const hasCopyLink = dialogText.includes('Copy link');
    
    // Si c'est le menu "More" (a du contenu "More" caractéristique)
    // Même s'il contient "Copy link", s'il contient "Report", "Unfollow", "Embed", "About this account" 
    // et pas de boutons Facebook/WhatsApp, c'est le menu "More"
    if (hasMoreMenuContent && !hasShareButtons) {
      console.log('[kkinstagram] Dialog is "More" menu (has Report/Unfollow/Embed but no share buttons) - skipping');
      return;
    }
    
    // Vérification supplémentaire : si l'aria-label contient "more" ou "options" et qu'il n'y a pas de contenu de partage
    if (ariaLabel && (ariaLabel.toLowerCase().includes('more') || ariaLabel.toLowerCase().includes('options'))) {
      if (!hasShareButtons) {
        console.log('[kkinstagram] Dialog is "More" menu (aria-label contains "more" but no share buttons) - skipping');
        return;
      }
    }

    // Vérifier si le bouton kkinstagram existe déjà dans tout le dialog
    // Chercher TOUS les boutons kkinstagram (au cas où il y en aurait plusieurs)
    const existingButtons = shareDialog.querySelectorAll('[data-kkinstagram-button]');
    if (existingButtons.length > 0) {
      // Supprimer tous les boutons existants pour éviter les doublons
      existingButtons.forEach(btn => {
        try {
          btn.remove();
        } catch (e) {
          console.warn('[kkinstagram] Error removing existing button:', e);
        }
      });
      console.log('[kkinstagram] Removed', existingButtons.length, 'existing button(s) to avoid duplicates');
    }
    
    // Marquer qu'on est en train d'ajouter le bouton
    isAddingKkinstagramButton = true;

    // Stratégie 1: Chercher le conteneur avec classe _add0 ou _adc_
    let shareButtonsContainer = shareDialog.querySelector('div._add0, div._adc_');
    
    // Stratégie 2: Chercher un conteneur qui contient "Copy link"
    if (!shareButtonsContainer) {
      const allDivs = shareDialog.querySelectorAll('div');
      for (const div of allDivs) {
        if (div.textContent && div.textContent.includes('Copy link')) {
          // Remonter pour trouver le conteneur parent qui contient tous les boutons
          let parent = div.closest('div[class*="_ad"]');
          if (!parent) {
            parent = div.parentElement;
            // Chercher un parent qui contient plusieurs boutons de partage
            while (parent && parent !== shareDialog) {
              const buttons = parent.querySelectorAll('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], div[role="button"]');
              if (buttons.length >= 2) {
                shareButtonsContainer = parent;
                break;
              }
              parent = parent.parentElement;
            }
          } else {
            shareButtonsContainer = parent;
          }
          break;
        }
      }
    }

    // Stratégie 3: Chercher un conteneur avec plusieurs liens de partage
    if (!shareButtonsContainer) {
      const containers = shareDialog.querySelectorAll('div');
      for (const container of containers) {
        const shareLinks = container.querySelectorAll('a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"], a[href*="threads.com"], a[href*="twitter.com"]');
        if (shareLinks.length >= 3) {
          shareButtonsContainer = container;
          console.log('[kkinstagram] Found container with share links:', shareLinks.length);
          break;
        }
      }
    }

    // Stratégie 4: Chercher le conteneur horizontal avec les boutons (après le hr)
    if (!shareButtonsContainer) {
      const hr = shareDialog.querySelector('hr');
      if (hr && hr.nextElementSibling) {
        const afterHr = hr.nextElementSibling;
        const buttonsContainer = afterHr.querySelector('div[class*="_ad"]') || afterHr;
        if (buttonsContainer.querySelectorAll('a, div[role="button"]').length > 0) {
          shareButtonsContainer = buttonsContainer;
          console.log('[kkinstagram] Found container after HR');
        }
      }
    }

    // Stratégie 5: Chercher un conteneur avec des divs qui ont des classes typiques de boutons Instagram
    if (!shareButtonsContainer) {
      const possibleContainers = shareDialog.querySelectorAll('div[class*="x1i10hfl"], div[class*="x1qjc9v5"]');
      for (const container of possibleContainers) {
        // Vérifier si ce conteneur ou ses parents contiennent plusieurs boutons
        const parent = container.parentElement;
        if (parent) {
          const buttons = parent.querySelectorAll('div[role="button"], a[href*="facebook.com"], a[href*="wa.me"]');
          if (buttons.length >= 2) {
            shareButtonsContainer = parent;
            console.log('[kkinstagram] Found container with Instagram button classes');
            break;
          }
        }
      }
    }

    // Stratégie 6: Chercher directement un conteneur qui a plusieurs enfants avec role="button"
    if (!shareButtonsContainer) {
      const allContainers = shareDialog.querySelectorAll('div');
      for (const container of allContainers) {
        const buttons = container.querySelectorAll('div[role="button"], a[href*="facebook.com"], a[href*="wa.me"], a[href*="mailto:"]');
        if (buttons.length >= 3) {
          // Vérifier que ce n'est pas le dialog lui-même
          if (container !== shareDialog) {
            shareButtonsContainer = container;
            console.log('[kkinstagram] Found container with multiple share buttons:', buttons.length);
            break;
          }
        }
      }
    }

    if (!shareButtonsContainer) {
      console.warn('[kkinstagram] Could not find share buttons container on page:', window.location.pathname);
      // Debug: afficher la structure du dialog
      console.log('[kkinstagram] Dialog structure (first 1000 chars):', shareDialog.innerHTML.substring(0, 1000));
      // Essayer quand même d'ajouter le bouton directement dans le dialog
      shareButtonsContainer = shareDialog;
      console.log('[kkinstagram] Using dialog as fallback container');
    }

    console.log('[kkinstagram] Found share buttons container:', shareButtonsContainer);

    // Créer le bouton kkinstagram
    createKkinstagramShareButton(shareButtonsContainer);
    
    // Réinitialiser le flag après un court délai pour laisser le temps au bouton d'être inséré
    setTimeout(() => {
      isAddingKkinstagramButton = false;
    }, 500);
  } catch (error) {
    console.error('[kkinstagram] Error adding kkinstagram to share menu:', error);
    // Réinitialiser le flag en cas d'erreur
    isAddingKkinstagramButton = false;
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
        console.log('[kkinstagram] Using current page URL:', cleanedUrl);
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
              console.log('[kkinstagram] Extracted URL from share link (Facebook):', cleanedUrl);
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
              console.log('[kkinstagram] Extracted URL from share link (WhatsApp):', cleanedUrl);
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
                console.log('[kkinstagram] Extracted URL from share link (Mailto):', cleanedUrl);
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
        console.log('[kkinstagram] Using current page URL as fallback:', cleanedUrl);
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

/**
 * Crée et ajoute le bouton kkinstagram dans le menu de partage
 */
function createKkinstagramShareButton(container) {
  try {
    // Trouver le dialog parent pour extraire l'URL du post
    // Essayer plusieurs stratégies pour trouver le dialog
    let shareDialog = container.closest('div[role="dialog"][aria-label="Share"]');
    
    // Si pas trouvé, chercher n'importe quel dialog parent
    if (!shareDialog) {
      shareDialog = container.closest('div[role="dialog"]');
    }
    
    // Si toujours pas trouvé, utiliser le conteneur lui-même s'il contient "Copy link"
    if (!shareDialog && container.textContent && container.textContent.includes('Copy link')) {
      shareDialog = container;
      console.log('[kkinstagram] Using container as share dialog');
    }
    
    if (!shareDialog) {
      console.warn('[kkinstagram] Could not find share dialog, using container');
      // Utiliser le conteneur comme fallback
      shareDialog = container;
    }
    
    // Extraire l'URL du post depuis le menu de partage
    let cleanUrl = extractPostUrlFromShareMenu(shareDialog);
    
    if (!cleanUrl) {
      console.warn('[kkinstagram] Could not extract Instagram URL from share menu, trying fallback');
      // Fallback: essayer avec l'URL de la page (pour les pages de reels individuelles)
      const currentUrl = window.location.href;
      cleanUrl = cleanInstagramUrl(currentUrl);
      if (!cleanUrl) {
        console.warn('[kkinstagram] Could not extract Instagram URL from current page either');
        return;
      }
      console.log('[kkinstagram] Using fallback URL from page:', cleanUrl);
    } else {
      console.log('[kkinstagram] Extracted post URL from share menu:', cleanUrl);
    }

    // Convertir en URL kkinstagram
    const kkinstagramUrl = convertUrl(cleanUrl, CONFIG.INSTAGRAM_ALTERNATIVES.kkinstagram);
    if (!kkinstagramUrl) {
      console.warn('[kkinstagram] Could not convert to kkinstagram URL');
      return;
    }
    
    console.log('[kkinstagram] Converted to kkinstagram URL:', kkinstagramUrl);
    
    // Stocker l'URL pour l'historique
    const postUrlForHistory = cleanUrl;

    // Créer le bouton avec la même structure que les autres boutons de partage
    const buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('data-kkinstagram-button', 'true');
    buttonDiv.className = 'html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 xjbqb8w x78zum5 xjwep3j x1t39747 x1wcsgtt x1pczhz8 x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x6s0dn4 x1oa3qoh x1nhvcw1';
    
    const buttonLink = document.createElement('div');
    buttonLink.className = 'x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz';
    buttonLink.setAttribute('role', 'button');
    buttonLink.setAttribute('tabindex', '0');
    
    const innerDiv = document.createElement('div');
    innerDiv.className = 'html-div xdj266r x14z9mp xat24cr x1lziwak x9f619 x16ye13r x5lhr3w xjbqb8w x78zum5 x15mokao x1ga7v0g x16uus16 xbiv7yw xwib8y2 x1y1aw1k x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x6s0dn4 x1oa3qoh x1nhvcw1 x11lfxj5 x135b78x';
    innerDiv.style.cssText = '--x-height: 104px; --x-width: 76px;';
    
    // Icône SVG (camera icon similaire à celui utilisé pour les boutons sous les posts)
    const iconDiv = document.createElement('div');
    iconDiv.className = 'html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 x16ye13r x5lhr3w xnz67gz x78zum5 x1c9tyrk xeusxvb x1pahc9y x1ertn4p x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x6s0dn4 x1oa3qoh xl56j7k';
    iconDiv.style.cssText = '--x-height: 52px; --x-width: 52px;';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-label', 'kkinstagram');
    svg.setAttribute('class', 'x1lliihq x1n2onr6 x5n08af');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('height', '20');
    svg.setAttribute('width', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = 'kkinstagram';
    svg.appendChild(title);
    
    // Path pour l'icône caméra (similaire à Instagram)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.14 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z');
    svg.appendChild(path);
    
    iconDiv.appendChild(svg);
    innerDiv.appendChild(iconDiv);
    
    // Texte "kkinstagram"
    const textDiv = document.createElement('div');
    textDiv.className = 'html-div x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 xjbqb8w x78zum5 x15mokao x1ga7v0g x16uus16 xbiv7yw x1xmf6yo x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'x1lliihq x1plvlek xryxfnj x1n2onr6 xyejjpt x15dsfln x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1i0vuye x1fhwpqd xo1l8bm x5n08af x2b8uid x1s3etm8 x676frb x10wh9bi xpm28yp x8viiok x1o7cslx';
    textSpan.style.cssText = '--x---base-line-clamp-line-height: 16px; --x-lineHeight: 16px;';
    textSpan.setAttribute('dir', 'auto');
    
    const innerTextSpan = document.createElement('span');
    innerTextSpan.className = 'x1lliihq x193iq5w x6ikm8r x10wlt62';
    innerTextSpan.style.cssText = '-moz-box-orient: vertical; -webkit-line-clamp: 2; display: -webkit-box;';
    innerTextSpan.textContent = 'kkinstagram';
    
    textSpan.appendChild(innerTextSpan);
    textDiv.appendChild(textSpan);
    innerDiv.appendChild(textDiv);
    
    buttonLink.appendChild(innerDiv);
    buttonDiv.appendChild(buttonLink);
    
    // Gestionnaire de clic
    buttonLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        console.log('[kkinstagram] Button clicked, copying:', kkinstagramUrl);
        
        // Copier l'URL kkinstagram
        const success = await copyToClipboard(kkinstagramUrl);
        if (success) {
          createToast(CONFIG.MESSAGES.COPIED, 3000, kkinstagramUrl);
          
          // Enregistrer dans l'historique et les stats
          if (window.Storage && window.Storage.saveToHistory) {
            await window.Storage.saveToHistory(postUrlForHistory, kkinstagramUrl, 'kkinstagram', 'instagram');
          }
          if (window.Storage && window.Storage.incrementStats) {
            await window.Storage.incrementStats('instagram', 'kkinstagram');
          }
        } else {
          createToast(CONFIG.MESSAGES.CLIPBOARD_ERROR, 2000);
        }
      } catch (error) {
        console.error('[kkinstagram] Error copying kkinstagram link:', error);
        createToast(CONFIG.MESSAGES.ERROR, 2000);
      }
    });
    
    // Ajouter le bouton au conteneur
    // Stratégie 1: Chercher "Copy link" pour insérer juste après
    let inserted = false;
    const allButtons = container.querySelectorAll('div[role="button"], a[href*="facebook.com"], a[href*="wa.me"]');
    
    // Chercher le bouton "Copy link" par son texte
    let copyLinkButton = null;
    for (const btn of allButtons) {
      if (btn.textContent && btn.textContent.toLowerCase().includes('copy link')) {
        copyLinkButton = btn;
        break;
      }
    }
    
    if (copyLinkButton) {
      // Chercher le parent div qui contient le bouton "Copy link"
      const copyLinkParent = copyLinkButton.closest('div.html-div') || copyLinkButton.parentElement;
      if (copyLinkParent && copyLinkParent.parentElement) {
        copyLinkParent.parentElement.insertBefore(buttonDiv, copyLinkParent.nextSibling);
        inserted = true;
        console.log('[kkinstagram] Button inserted after Copy link');
      } else if (copyLinkParent) {
        // Si pas de parent, insérer après le bouton lui-même
        try {
          if (copyLinkParent.insertAdjacentElement) {
            copyLinkParent.insertAdjacentElement('afterend', buttonDiv);
          } else if (copyLinkParent.nextSibling) {
            copyLinkParent.parentElement.insertBefore(buttonDiv, copyLinkParent.nextSibling);
          } else {
            copyLinkParent.parentElement.appendChild(buttonDiv);
          }
          inserted = true;
          console.log('[kkinstagram] Button inserted after Copy link (no parent)');
        } catch (e) {
          console.warn('[kkinstagram] Error inserting after Copy link:', e);
        }
      }
    }
    
    // Stratégie 2: Si pas inséré, chercher le premier conteneur de bouton de partage
    if (!inserted) {
      const firstButtonContainer = container.querySelector('div.html-div, div[role="button"], a[href*="facebook.com"]');
      if (firstButtonContainer) {
        const parent = firstButtonContainer.closest('div.html-div') || firstButtonContainer.parentElement;
        if (parent && parent.parentElement) {
          parent.parentElement.insertBefore(buttonDiv, parent.nextSibling);
          inserted = true;
          console.log('[kkinstagram] Button inserted after first button');
        } else if (parent) {
          try {
            if (parent.insertAdjacentElement) {
              parent.insertAdjacentElement('afterend', buttonDiv);
            } else if (parent.nextSibling) {
              parent.parentElement.insertBefore(buttonDiv, parent.nextSibling);
            } else {
              parent.parentElement.appendChild(buttonDiv);
            }
            inserted = true;
            console.log('[kkinstagram] Button inserted after first button (no parent)');
          } catch (e) {
            console.warn('[kkinstagram] Error inserting after first button:', e);
          }
        }
      }
    }
    
    // Stratégie 3: Chercher un conteneur avec plusieurs boutons et insérer à la fin
    if (!inserted) {
      // Chercher manuellement un conteneur qui a des boutons comme enfants directs
      const allDivs = container.querySelectorAll('div');
      for (const div of allDivs) {
        const directButtons = Array.from(div.children).filter(child => 
          child.matches('div[role="button"], a[href*="facebook.com"], a[href*="wa.me"]')
        );
        if (directButtons.length >= 2) {
          div.appendChild(buttonDiv);
          inserted = true;
          console.log('[kkinstagram] Button appended to buttons container');
          break;
        }
      }
    }
    
    // Stratégie 4: Dernière option: ajouter à la fin du conteneur
    if (!inserted) {
      container.appendChild(buttonDiv);
      console.log('[kkinstagram] Button appended to container (fallback)');
    }
    
    // Vérifier que le bouton est bien visible
    if (inserted) {
      // Forcer la visibilité
      buttonDiv.style.display = 'block';
      buttonDiv.style.visibility = 'visible';
      buttonDiv.style.opacity = '1';
      console.log('[kkinstagram] Button should be visible now');
    }
  } catch (error) {
    console.error('Error creating kkinstagram share button:', error);
  }
}

// Observer pour détecter l'ouverture du menu de partage
let shareMenuCheckTimeout;
const shareMenuObserver = new MutationObserver((mutations) => {
  // Ignorer si on est en train d'ajouter le bouton
  if (isAddingKkinstagramButton) {
    return;
  }
  
  // Vérifier si les mutations contiennent notre bouton (à ignorer)
  let hasOurButton = false;
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Vérifier si c'est notre bouton ou un parent de notre bouton
          if (node.hasAttribute && node.hasAttribute('data-kkinstagram-button')) {
            hasOurButton = true;
            break;
          }
          // Vérifier si un enfant est notre bouton
          if (node.querySelector && node.querySelector('[data-kkinstagram-button]')) {
            hasOurButton = true;
            break;
          }
        }
      }
    }
  }
  
  // Ignorer les mutations causées par l'ajout de notre bouton
  if (hasOurButton) {
    return;
  }
  
  // Vérifier si "Copy link" apparaît dans les mutations
  let hasCopyLink = false;
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.textContent && node.textContent.includes('Copy link')) {
            hasCopyLink = true;
            break;
          }
        }
      }
    } else if (mutation.type === 'characterData' || mutation.type === 'attributes') {
      if (mutation.target.textContent && mutation.target.textContent.includes('Copy link')) {
        hasCopyLink = true;
        break;
      }
    }
  }
  
  // Si "Copy link" est détecté, déclencher immédiatement la recherche
  if (hasCopyLink) {
    console.log('[kkinstagram] "Copy link" detected in DOM changes, checking for share menu');
    clearTimeout(shareMenuCheckTimeout);
    shareMenuCheckTimeout = setTimeout(() => {
      addKkinstagramToShareMenu();
    }, 100); // Petit délai pour laisser le DOM se stabiliser
  } else {
    // Debounce normal pour les autres changements (seulement si pas déjà en cours)
    if (!isAddingKkinstagramButton) {
      clearTimeout(shareMenuCheckTimeout);
      shareMenuCheckTimeout = setTimeout(() => {
        addKkinstagramToShareMenu();
      }, 200);
    }
  }
});

// Démarrer l'observation du menu de partage
shareMenuObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true, // Observer les changements de texte
  attributes: true, // Observer aussi les changements d'attributs
  attributeFilter: ['aria-label', 'role', 'style', 'class'] // Observer spécifiquement ces attributs
});

// Écouter les clics sur les boutons de partage pour déclencher immédiatement la recherche
document.addEventListener('click', (e) => {
  const target = e.target;
  // Chercher le bouton de partage (peut être un SVG, un div avec aria-label, etc.)
  const shareButton = target.closest('[aria-label*="Share"], [aria-label*="share"], svg[aria-label*="Share"], svg[aria-label*="share"]');
  if (shareButton) {
    console.log('[kkinstagram] Share button clicked, checking for share menu');
    // Attendre un peu que le menu s'ouvre
    setTimeout(() => {
      addKkinstagramToShareMenu();
    }, 200);
    setTimeout(() => {
      addKkinstagramToShareMenu();
    }, 500);
    setTimeout(() => {
      addKkinstagramToShareMenu();
    }, 1000);
  }
}, true); // Utiliser capture pour intercepter tôt

// Vérifier immédiatement au cas où le menu serait déjà ouvert
setTimeout(addKkinstagramToShareMenu, 100);
setTimeout(addKkinstagramToShareMenu, 300);
setTimeout(addKkinstagramToShareMenu, 500);
setTimeout(addKkinstagramToShareMenu, 1000);
setTimeout(addKkinstagramToShareMenu, 2000);

// Vérifier périodiquement (toutes les 2 secondes) si le menu de partage est ouvert
// Cela aide particulièrement sur les pages de reels où le DOM peut changer rapidement
// L'intervalle est plus long pour éviter les boucles infinies
let shareMenuInterval = setInterval(() => {
  // Ne pas vérifier si on est déjà en train d'ajouter le bouton
  if (isAddingKkinstagramButton) {
    return;
  }
  
  // Vérifier si un bouton existe déjà et est visible
  const existingButton = document.querySelector('[data-kkinstagram-button]');
  if (existingButton && existingButton.offsetParent !== null) {
    // Le bouton existe et est visible, ne pas vérifier
    return;
  }
  
  addKkinstagramToShareMenu();
}, 2000); // Augmenté à 2 secondes pour réduire la fréquence

// Nettoyer l'intervalle si la page est déchargée
window.addEventListener('beforeunload', () => {
  if (shareMenuInterval) {
    clearInterval(shareMenuInterval);
  }
});