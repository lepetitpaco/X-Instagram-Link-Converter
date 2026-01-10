// Système de stockage local pour l'historique et les statistiques

const STORAGE_KEYS = {
  HISTORY: 'conversionHistory',
  STATS: 'conversionStats',
  SETTINGS: 'extensionSettings'
};

const MAX_HISTORY_ITEMS = 20;

/**
 * Obtient l'API de stockage (chrome.storage.local ou browser.storage.local)
 */
function getStorageAPI() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.local;
  }
  if (typeof browser !== 'undefined' && browser.storage) {
    return browser.storage.local;
  }
  return null;
}

/**
 * Sauvegarde un élément dans l'historique
 * @param {string} originalUrl - URL originale
 * @param {string} convertedUrl - URL convertie
 * @param {string} domain - Domaine alternatif utilisé
 * @param {string} platform - 'x' ou 'instagram'
 */
async function saveToHistory(originalUrl, convertedUrl, domain, platform) {
  const storage = getStorageAPI();
  if (!storage) {
    console.warn('Storage API not available');
    return;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.HISTORY], (items) => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve(items);
        }
      });
    });

    let history = result[STORAGE_KEYS.HISTORY] || [];
    
    // Ajouter le nouvel élément au début
    const newItem = {
      originalUrl,
      convertedUrl,
      domain,
      platform,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    
    // Limiter à MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    // Sauvegarder
    await new Promise((resolve, reject) => {
      storage.set({ [STORAGE_KEYS.HISTORY]: history }, () => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

/**
 * Récupère l'historique
 * @returns {Promise<Array>} Historique des conversions
 */
async function getHistory() {
  const storage = getStorageAPI();
  if (!storage) {
    return [];
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.HISTORY], (items) => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve(items);
        }
      });
    });
    
    return result[STORAGE_KEYS.HISTORY] || [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Incrémente les statistiques
 * @param {string} platform - 'x' ou 'instagram'
 * @param {string} domain - Domaine alternatif utilisé
 */
async function incrementStats(platform, domain) {
  const storage = getStorageAPI();
  if (!storage) {
    return;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.STATS], (items) => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve(items);
        }
      });
    });

    let stats = result[STORAGE_KEYS.STATS] || {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0 },
      byDomain: {}
    };
    
    // Incrémenter les compteurs
    stats.total++;
    
    // Compter pour aujourd'hui (basé sur la date)
    const today = new Date().toDateString();
    if (!stats.lastDate || stats.lastDate !== today) {
      stats.today = 0;
      stats.lastDate = today;
    }
    stats.today++;
    
    // Par plateforme
    if (platform === 'x') {
      stats.byPlatform.x++;
    } else if (platform === 'instagram') {
      stats.byPlatform.instagram++;
    }
    
    // Par domaine
    if (!stats.byDomain[domain]) {
      stats.byDomain[domain] = 0;
    }
    stats.byDomain[domain]++;
    
    // Sauvegarder
    await new Promise((resolve, reject) => {
      storage.set({ [STORAGE_KEYS.STATS]: stats }, () => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error incrementing stats:', error);
  }
}

/**
 * Récupère les statistiques
 * @returns {Promise<Object>} Statistiques
 */
async function getStats() {
  const storage = getStorageAPI();
  if (!storage) {
    return {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0 },
      byDomain: {}
    };
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.STATS], (items) => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve(items);
        }
      });
    });
    
    const stats = result[STORAGE_KEYS.STATS] || {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0 },
      byDomain: {}
    };
    
    // Réinitialiser le compteur du jour si ce n'est pas aujourd'hui
    const today = new Date().toDateString();
    if (stats.lastDate !== today) {
      stats.today = 0;
      stats.lastDate = today;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0 },
      byDomain: {}
    };
  }
}

/**
 * Récupère les paramètres
 * @returns {Promise<Object>} Paramètres
 */
async function getSettings() {
  const storage = getStorageAPI();
  if (!storage) {
    return {
      enabledDomains: {
        fixvx: true,
        fixupx: true,
        vxtwitter: true,
        kkinstagram: true
      }
    };
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.SETTINGS], (items) => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve(items);
        }
      });
    });
    
    const defaultSettings = {
      enabledDomains: {
        fixvx: true,
        fixupx: true,
        vxtwitter: true,
        kkinstagram: true
      }
    };
    
    return result[STORAGE_KEYS.SETTINGS] || defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      enabledDomains: {
        fixvx: true,
        fixupx: true,
        vxtwitter: true,
        kkinstagram: true
      }
    };
  }
}

/**
 * Sauvegarde les paramètres
 * @param {Object} settings - Paramètres à sauvegarder
 */
async function saveSettings(settings) {
  const storage = getStorageAPI();
  if (!storage) {
    return;
  }

  try {
    await new Promise((resolve, reject) => {
      storage.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
        if (chrome?.runtime?.lastError || browser?.runtime?.lastError) {
          reject(new Error(chrome?.runtime?.lastError?.message || browser?.runtime?.lastError?.message));
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToHistory,
    getHistory,
    incrementStats,
    getStats,
    getSettings,
    saveSettings
  };
} else {
  window.Storage = {
    saveToHistory,
    getHistory,
    incrementStats,
    getStats,
    getSettings,
    saveSettings
  };
}
