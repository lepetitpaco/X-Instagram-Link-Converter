// Content script pour X.com et Twitter.com
// Injecte des boutons pour copier les liens vers des domaines alternatifs sur chaque post

// Charger les utilitaires (injectés via manifest)
// Note: config.js et utils.js doivent être chargés avant ce script dans le manifest

/**
 * Extrait l'URL spécifique d'un post depuis son élément article
 * Nettoie l'URL pour ne garder que /status/[ID] sans chemins supplémentaires
 */
function getPostUrl(articleElement) {
  // Méthode 1: Chercher un lien avec href contenant /status/
  const statusLink = articleElement.querySelector('a[href*="/status/"]');
  if (statusLink) {
    const href = statusLink.getAttribute('href');
    if (href) {
      return cleanXUrl(href);
    }
  }

  // Méthode 2: Chercher dans les attributs data
  const timeElement = articleElement.querySelector('time');
  if (timeElement && timeElement.parentElement) {
    const timeLink = timeElement.parentElement.closest('a');
    if (timeLink) {
      const href = timeLink.getAttribute('href');
      if (href && href.includes('/status/')) {
        return cleanXUrl(href);
      }
    }
  }

  // Méthode 3: Chercher dans tous les liens de l'article
  const allLinks = articleElement.querySelectorAll('a[href*="/status/"]');
  for (const link of allLinks) {
    const href = link.getAttribute('href');
    if (href && href.includes('/status/')) {
      return cleanXUrl(href);
    }
  }

  return null;
}

/**
 * Nettoie une URL X/Twitter pour ne garder que /status/[ID]
 * Enlève les chemins supplémentaires comme /likes, /retweets, etc.
 */
function cleanXUrl(href) {
  if (!href) return null;
  
  try {
    // Enlever les query params
    let cleanHref = href.split('?')[0];
    
    // Extraire seulement /status/[ID] en enlevant les chemins supplémentaires
    const statusMatch = cleanHref.match(/\/(status)\/([^\/]+)/);
    if (statusMatch) {
      const statusType = statusMatch[1]; // 'status'
      const statusId = statusMatch[2]; // ID du post
      cleanHref = `/${statusType}/${statusId}`;
    }
    
    // Si c'est un lien relatif, le convertir en absolu
    if (cleanHref.startsWith('/')) {
      return window.location.origin + cleanHref;
    }
    return cleanHref;
  } catch (e) {
    console.error('Error cleaning X URL:', e);
    return null;
  }
}

/**
 * Ajoute les boutons de conversion à un post spécifique
 */
function addButtonsToPost(articleElement) {
  try {
    // Créer un ID unique basé sur l'URL du post
    const postUrl = getPostUrl(articleElement);
    if (!postUrl) return; // Pas d'URL trouvée, on ne peut pas ajouter les boutons

    // Valider l'URL avant de continuer
    if (!postUrl.match(/\/status\/[^\/]+$/)) {
      return; // URL invalide
    }

    const uniqueId = 'custom-share-buttons-' + btoa(postUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    
    // Vérifier si les boutons existent déjà
    if (articleElement.querySelector(`#${uniqueId}`)) return;

    // Trouver le conteneur d'actions du post
    const actionGroup = articleElement.querySelector('div[role="group"][aria-label*="likes"]') ||
                        articleElement.querySelector('div[role="group"]') ||
                        articleElement.querySelector('[role="group"]');

    if (!actionGroup) return;

  const wrapper = document.createElement('div');
  wrapper.id = uniqueId;
  Object.assign(wrapper.style, {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  });

  const createButton = (label, domain) => {
    const btn = document.createElement('button');
    btn.textContent = label;

    // Style Twitter Blue
    Object.assign(btn.style, {
      padding: '8px 12px',
      borderRadius: '9999px',
      border: 'none',
      backgroundColor: '#1d9bf0',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out'
    });

    btn.onmouseover = () => btn.style.backgroundColor = '#1a8cd8';
    btn.onmouseout = () => btn.style.backgroundColor = '#1d9bf0';

    btn.onclick = async () => {
      try {
        // Utiliser l'URL spécifique du post
        const postUrl = getPostUrl(articleElement);
        
        if (!postUrl) {
          createToast(CONFIG.MESSAGES.INVALID_URL + ' (Post URL not found)');
          return;
        }

        // Vérifier que c'est une URL X/Twitter valide
        if (!isValidXUrl(postUrl)) {
          createToast(CONFIG.MESSAGES.INVALID_URL + ' (X.com/Twitter)', 2000, postUrl);
          return;
        }

        // Valider que l'URL contient bien un ID de post
        if (!postUrl.match(/\/status\/[^\/]+$/)) {
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
            const domainKey = Object.keys(CONFIG.X_ALTERNATIVES).find(key => CONFIG.X_ALTERNATIVES[key] === domain);
            await window.Storage.saveToHistory(postUrl, newUrl, domainKey || domain, 'x');
            await window.Storage.incrementStats('x', domainKey || domain);
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

  // Créer les boutons pour chaque alternative X (selon les paramètres)
  // Note: createButtonsWithSettings est async, on l'appelle mais on insère le wrapper quand même
  createButtonsWithSettings(wrapper, createButton).catch(err => {
    console.error('Error creating buttons with settings:', err);
    // Fallback : créer tous les boutons en cas d'erreur
    Object.entries(CONFIG.X_ALTERNATIVES).forEach(([key, domain]) => {
      wrapper.appendChild(createButton(`📋 ${key}`, domain));
    });
  });

  // Insérer les boutons après le groupe d'actions
  if (actionGroup.parentNode) {
    actionGroup.parentNode.insertBefore(wrapper, actionGroup.nextSibling);
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
      Object.entries(CONFIG.X_ALTERNATIVES).forEach(([key, domain]) => {
        wrapper.appendChild(createButtonFn(`📋 ${key}`, domain));
      });
      return;
    }
    
    const settings = await window.Storage.getSettings();
    const enabledDomains = settings.enabledDomains || {
      fixvx: true,
      fixupx: true,
      vxtwitter: true
    };
    
    Object.entries(CONFIG.X_ALTERNATIVES).forEach(([key, domain]) => {
      if (enabledDomains[key] !== false) {
        wrapper.appendChild(createButtonFn(`📋 ${key}`, domain));
      }
    });
  } catch (error) {
    console.error('Error loading settings for buttons:', error);
    // Fallback : créer tous les boutons en cas d'erreur
    Object.entries(CONFIG.X_ALTERNATIVES).forEach(([key, domain]) => {
      wrapper.appendChild(createButtonFn(`📋 ${key}`, domain));
    });
  }
}

/**
 * Convertit un lien X/Twitter dans les commentaires
 */
function convertLinkInText(element) {
  // Chercher tous les liens dans l'élément
  const links = element.querySelectorAll('a[href*="/status/"]');
  
  links.forEach(link => {
    // Vérifier si le lien n'a pas déjà été converti
    if (link.hasAttribute('data-converted')) return;
    
    const href = link.getAttribute('href');
    if (!href || !href.includes('/status/')) return;
    
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
        background-color: #1d9bf0;
        color: #fff;
        font-size: 11px;
        cursor: pointer;
        z-index: 1000;
      `;
      
      convertButton.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          const cleanHref = cleanXUrl(href);
          if (!cleanHref) return;
          
          const fullUrl = cleanHref.startsWith('/') 
            ? window.location.origin + cleanHref 
            : cleanHref;
          
          // Convertir vers fixvx par défaut
          const newUrl = convertUrl(fullUrl, CONFIG.X_ALTERNATIVES.fixvx);
          if (newUrl) {
            const success = await copyToClipboard(newUrl);
            if (success) {
              if (window.Storage) {
                await window.Storage.saveToHistory(fullUrl, newUrl, 'fixvx', 'x');
                await window.Storage.incrementStats('x', 'fixvx');
              }
              createToast(`${CONFIG.MESSAGES.COPIED}: fixvx`, 3000, newUrl);
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
function addXButtonsToAllPosts() {
  try {
    // Trouver tous les articles/posts dans le feed
    // X utilise <article> pour les posts
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    
    // Fallback si le sélecteur ne fonctionne pas
    const articlesFallback = articles.length === 0 
      ? document.querySelectorAll('article')
      : articles;

    articlesFallback.forEach((article) => {
      try {
        // Vérifier que c'est bien un post (contient des éléments de post)
        const hasPostContent = article.querySelector('div[role="group"]') || 
                              article.querySelector('[data-testid="tweet"]') ||
                              article.querySelector('a[href*="/status/"]');
        
        // Vérifier aussi qu'on a bien une URL de post valide
        const postUrl = getPostUrl(article);
        const hasValidPostUrl = postUrl && postUrl.match(/\/status\/[^\/]+$/);
        
        if (hasPostContent && hasValidPostUrl) {
          addButtonsToPost(article);
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    });
  } catch (error) {
    console.error('Error in addXButtonsToAllPosts:', error);
  }
}

// Observer pour détecter les nouveaux posts chargés dynamiquement
const observer = new MutationObserver((mutations) => {
  // Délai pour éviter trop d'exécutions
  clearTimeout(window.addXButtonsTimeout);
  window.addXButtonsTimeout = setTimeout(() => {
    addXButtonsToAllPosts();
    
    // Détecter et convertir les liens dans les commentaires
    try {
      const commentSections = document.querySelectorAll('[data-testid="tweetText"], [role="article"]');
      commentSections.forEach(section => {
        convertLinkInText(section);
      });
    } catch (error) {
      console.error('Error converting links in comments:', error);
    }
  }, 300);
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// Exécuter immédiatement au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addXButtonsToAllPosts, 500);
  });
} else {
  setTimeout(addXButtonsToAllPosts, 500);
}

// Réexécuter après un délai pour les chargements tardifs
setTimeout(addXButtonsToAllPosts, 1000);
setTimeout(addXButtonsToAllPosts, 2000);
