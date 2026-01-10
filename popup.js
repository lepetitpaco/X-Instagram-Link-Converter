// Popup script pour l'extension
// Unifie l'API chrome/browser pour compatibilité

// Configuration inline (même que config.js pour éviter les dépendances)
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
  INSTAGRAM_DOMAINS: ['www.instagram.com', 'instagram.com'],
  MESSAGES: {
    COPIED: '✅ Copied',
    ERROR: '❌ Error',
    INVALID_URL: '❌ Invalid URL',
    NOT_SUPPORTED: '❌ This page is not supported.',
    CLIPBOARD_ERROR: '❌ Clipboard error'
  }
};

// Unifier l'API chrome/browser
const browserAPI = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);

if (!browserAPI) {
  document.getElementById('status').textContent = CONFIG.MESSAGES.ERROR + ': Browser API not available';
  document.getElementById('status').className = 'status-error';
}

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

/**
 * Obtient le lien du post actuel et le convertit
 */
async function getPostLink(replacementHost, expectedType = 'x') {
  if (!browserAPI) {
    showStatus(CONFIG.MESSAGES.ERROR + ': Browser API not available', 'error');
    return;
  }

  const status = document.getElementById('status');
  status.textContent = '';
  status.className = '';

  try {
    // Utiliser l'API unifiée
    const tabs = await new Promise((resolve, reject) => {
      if (browserAPI.tabs && browserAPI.tabs.query) {
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve(tabs);
          }
        });
      } else {
        reject(new Error('Tabs API not available'));
      }
    });

    if (!tabs || tabs.length === 0) {
      showStatus(CONFIG.MESSAGES.ERROR + ': No active tab found', 'error');
      return;
    }

    const tab = tabs[0];
    const rawUrl = tab.url;

    if (!rawUrl) {
      showStatus(CONFIG.MESSAGES.ERROR + ': No URL available', 'error');
      return;
    }

    // Vérifier le type d'URL
    const isSupported = expectedType === 'x' 
      ? isValidXUrl(rawUrl)
      : isValidInstagramUrl(rawUrl);

    if (!isSupported) {
      const platform = expectedType === 'x' ? 'X.com/Twitter' : 'Instagram';
      showStatus(CONFIG.MESSAGES.NOT_SUPPORTED + ` (${platform})`, 'error');
      return;
    }

    const cleanUrl = rawUrl.split('?')[0];
    const finalUrl = convertUrl(cleanUrl, replacementHost);

    if (!finalUrl) {
      showStatus(CONFIG.MESSAGES.ERROR + ': URL conversion failed', 'error');
      return;
    }

    // Copier dans le presse-papiers
    try {
      await navigator.clipboard.writeText(finalUrl);
      
      // Sauvegarder dans l'historique et les stats
      const platform = expectedType === 'x' ? 'x' : 'instagram';
      const domain = replacementHost.replace('.com', '');
      if (window.Storage) {
        await window.Storage.saveToHistory(cleanUrl, finalUrl, domain, platform);
        await window.Storage.incrementStats(platform, domain);
      }
      
      // Recharger les stats et l'historique
      await loadStats();
      await loadHistory();
      
      showStatus(`${CONFIG.MESSAGES.COPIED}: ${finalUrl}`, 'success');
    } catch (e) {
      console.error('Clipboard write error:', e);
      showStatus(CONFIG.MESSAGES.CLIPBOARD_ERROR + ': ' + e.message, 'error');
    }
  } catch (e) {
    console.error('Error getting post link:', e);
    showStatus(CONFIG.MESSAGES.ERROR + ': ' + e.message, 'error');
  }
}

/**
 * Affiche un message de statut
 */
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type === 'success' ? 'status-success' : 'status-error';
  
  // Effacer après 3 secondes
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}

/**
 * Charge et affiche les statistiques
 */
async function loadStats() {
  if (!window.Storage) return;
  
  try {
    const stats = await window.Storage.getStats();
    document.getElementById('stats-total').textContent = stats.total || 0;
    document.getElementById('stats-today').textContent = stats.today || 0;
    document.getElementById('stats-x').textContent = stats.byPlatform?.x || 0;
    document.getElementById('stats-instagram').textContent = stats.byPlatform?.instagram || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Charge et affiche l'historique
 */
async function loadHistory() {
  if (!window.Storage) return;
  
  try {
    const history = await window.Storage.getHistory();
    const container = document.getElementById('history-container');
    
    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">Aucune conversion récente</div>';
      return;
    }
    
    container.innerHTML = '';
    
    history.slice(0, 10).forEach((item) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const domainDiv = document.createElement('div');
      domainDiv.className = 'history-item-domain';
      domainDiv.textContent = item.domain;
      
      const urlDiv = document.createElement('div');
      urlDiv.className = 'history-item-url';
      urlDiv.textContent = item.convertedUrl;
      urlDiv.title = item.convertedUrl;
      
      historyItem.appendChild(domainDiv);
      historyItem.appendChild(urlDiv);
      
      // Copier au clic
      historyItem.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(item.convertedUrl);
          showStatus(`${CONFIG.MESSAGES.COPIED}: ${item.convertedUrl}`, 'success');
        } catch (e) {
          showStatus(CONFIG.MESSAGES.CLIPBOARD_ERROR, 'error');
        }
      });
      
      container.appendChild(historyItem);
    });
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

/**
 * Charge et applique les paramètres
 */
async function loadSettings() {
  if (!window.Storage) return;
  
  try {
    const settings = await window.Storage.getSettings();
    const enabledDomains = settings.enabledDomains || {
      fixvx: true,
      fixupx: true,
      vxtwitter: true,
      kkinstagram: true
    };
    
    // Mettre à jour les checkboxes
    document.getElementById('setting-fixvx').checked = enabledDomains.fixvx !== false;
    document.getElementById('setting-fixupx').checked = enabledDomains.fixupx !== false;
    document.getElementById('setting-vxtwitter').checked = enabledDomains.vxtwitter !== false;
    document.getElementById('setting-kkinstagram').checked = enabledDomains.kkinstagram !== false;
    
    // Masquer/afficher les boutons
    updateButtonVisibility(enabledDomains);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Met à jour la visibilité des boutons selon les paramètres
 */
function updateButtonVisibility(enabledDomains) {
  document.getElementById('copy-fixvx').style.display = enabledDomains.fixvx !== false ? 'block' : 'none';
  document.getElementById('copy-fixupx').style.display = enabledDomains.fixupx !== false ? 'block' : 'none';
  document.getElementById('copy-vxtwitter').style.display = enabledDomains.vxtwitter !== false ? 'block' : 'none';
  document.getElementById('copy-kkinstagram').style.display = enabledDomains.kkinstagram !== false ? 'block' : 'none';
}

/**
 * Sauvegarde les paramètres
 */
async function saveSettings() {
  if (!window.Storage) return;
  
  const enabledDomains = {
    fixvx: document.getElementById('setting-fixvx').checked,
    fixupx: document.getElementById('setting-fixupx').checked,
    vxtwitter: document.getElementById('setting-vxtwitter').checked,
    kkinstagram: document.getElementById('setting-kkinstagram').checked
  };
  
  await window.Storage.saveSettings({ enabledDomains });
  updateButtonVisibility(enabledDomains);
  
  // Notifier les content scripts du changement
  if (browserAPI && browserAPI.tabs) {
    browserAPI.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com') || tab.url.includes('instagram.com'))) {
          browserAPI.tabs.reload(tab.id);
        }
      });
    });
  }
}

// Event listeners pour les boutons X/Twitter
document.getElementById('copy-fixvx').addEventListener('click', () => {
  getPostLink(CONFIG.X_ALTERNATIVES.fixvx, 'x');
});

document.getElementById('copy-fixupx').addEventListener('click', () => {
  getPostLink(CONFIG.X_ALTERNATIVES.fixupx, 'x');
});

document.getElementById('copy-vxtwitter').addEventListener('click', () => {
  getPostLink(CONFIG.X_ALTERNATIVES.vxtwitter, 'x');
});

// Event listener pour Instagram
document.getElementById('copy-kkinstagram').addEventListener('click', () => {
  getPostLink(CONFIG.INSTAGRAM_ALTERNATIVES.kkinstagram, 'instagram');
});

// Event listeners pour les paramètres
document.getElementById('setting-fixvx').addEventListener('change', saveSettings);
document.getElementById('setting-fixupx').addEventListener('change', saveSettings);
document.getElementById('setting-vxtwitter').addEventListener('change', saveSettings);
document.getElementById('setting-kkinstagram').addEventListener('change', saveSettings);

// Event listener pour effacer l'historique
document.getElementById('clear-history').addEventListener('click', async () => {
  if (!window.Storage) return;
  
  if (confirm('Voulez-vous vraiment effacer l\'historique ?')) {
    try {
      const storage = browserAPI?.storage?.local || (typeof chrome !== 'undefined' && chrome.storage?.local) || (typeof browser !== 'undefined' && browser.storage?.local);
      if (storage) {
        await new Promise((resolve) => {
          storage.set({ conversionHistory: [] }, resolve);
        });
        await loadHistory();
        showStatus('Historique effacé', 'success');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      showStatus('Erreur lors de l\'effacement', 'error');
    }
  }
});

// Charger les données au démarrage
window.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadHistory();
  await loadSettings();
});
