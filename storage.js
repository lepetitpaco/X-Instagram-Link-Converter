// Système de stockage local pour l'historique et les statistiques

const STORAGE_KEYS = {
  HISTORY: 'conversionHistory',
  STATS: 'conversionStats',
  // Ancien réglage (1.1.x), lu seulement pour la migration vers SERVICES
  SETTINGS: 'extensionSettings',
  SERVICES: 'services'
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
 * @param {string} platform - 'x', 'instagram' ou 'tiktok'
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
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
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
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
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
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
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
 * @param {string} platform - 'x', 'instagram' ou 'tiktok'
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
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(items);
        }
      });
    });

    let stats = result[STORAGE_KEYS.STATS] || {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0, tiktok: 0 },
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
    stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
    
    // Par domaine
    if (!stats.byDomain[domain]) {
      stats.byDomain[domain] = 0;
    }
    stats.byDomain[domain]++;
    
    // Sauvegarder
    await new Promise((resolve, reject) => {
      storage.set({ [STORAGE_KEYS.STATS]: stats }, () => {
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
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
      byPlatform: { x: 0, instagram: 0, tiktok: 0 },
      byDomain: {}
    };
  }

  try {
    const result = await new Promise((resolve, reject) => {
      storage.get([STORAGE_KEYS.STATS], (items) => {
        const error = getLastError();
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(items);
        }
      });
    });
    
    const stats = result[STORAGE_KEYS.STATS] || {
      total: 0,
      today: 0,
      byPlatform: { x: 0, instagram: 0, tiktok: 0 },
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
      byPlatform: { x: 0, instagram: 0, tiktok: 0 },
      byDomain: {}
    };
  }
}

/**
 * Obtient le stockage synchronisé avec le compte du navigateur (repli sur le stockage local)
 */
function getSyncStorageAPI() {
  const api = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : (typeof browser !== 'undefined' ? browser.storage : null);
  if (!api) return null;
  return api.sync ? { area: 'sync', storage: api.sync } : { area: 'local', storage: api.local };
}

function getLastError() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.lastError) return chrome.runtime.lastError;
  if (typeof browser !== 'undefined' && browser.runtime?.lastError) return browser.runtime.lastError;
  return null;
}

function storageGet(storage, keys) {
  return new Promise((resolve, reject) => {
    storage.get(keys, (items) => {
      const error = getLastError();
      error ? reject(new Error(error.message)) : resolve(items || {});
    });
  });
}

function storageSet(storage, items) {
  return new Promise((resolve, reject) => {
    storage.set(items, () => {
      const error = getLastError();
      error ? reject(new Error(error.message)) : resolve();
    });
  });
}

const DOMAIN_PATTERN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/**
 * Nettoie une saisie : espaces autour, domaine en minuscules sans protocole ni chemin
 * @param {Object} service - { label, domain, enabled }
 * @returns {Object} Service nettoyé
 */
function normalizeService(service) {
  const domain = String(service.domain || '').trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '');
  return { label: String(service.label || '').trim(), domain, enabled: service.enabled !== false };
}

/**
 * Vérifie un service avant de le sauvegarder
 * @param {Object} service - Service nettoyé par normalizeService
 * @param {Array} others - Autres services de la même plateforme (libellés déjà pris)
 * @returns {string|null} Message d'erreur, ou null si le service est valide
 */
function validateService(service, others = []) {
  if (!service.label) return 'Libellé requis';
  if (service.label.length > CONFIG.LABEL_MAX) return `Libellé : ${CONFIG.LABEL_MAX} caractères au plus`;
  if (/\s/.test(service.label)) return 'Libellé : pas d\'espace';
  if (others.some(other => other.label === service.label)) return 'Libellé déjà utilisé';
  if (!DOMAIN_PATTERN.test(service.domain)) return 'Domaine invalide (ex. fixvx.com)';
  return null;
}

/**
 * Copie des services par défaut d'une plateforme
 */
function getDefaultServices(platform) {
  return CONFIG.DEFAULT_SERVICES[platform].map(service => ({ ...service }));
}

/**
 * Garde les services valides d'une liste sauvegardée, dans la limite de MAX_SERVICES
 */
function sanitizeServices(list) {
  if (!Array.isArray(list)) return null;
  const kept = [];
  for (const raw of list) {
    const service = normalizeService(raw || {});
    if (!validateService(service, kept)) kept.push(service);
    if (kept.length === CONFIG.MAX_SERVICES) break;
  }
  return kept;
}

/**
 * Construit la liste initiale à partir de l'ancien réglage enabledDomains (versions 1.1.x, stockage local)
 */
async function migrateLegacySettings() {
  const services = {};
  for (const platform of CONFIG.PLATFORMS) services[platform] = getDefaultServices(platform);

  const local = getStorageAPI();
  if (!local) return services;
  try {
    const legacy = (await storageGet(local, [STORAGE_KEYS.SETTINGS]))[STORAGE_KEYS.SETTINGS]?.enabledDomains || {};
    for (const platform of CONFIG.PLATFORMS) {
      for (const service of services[platform]) {
        // Anciennes clés : xcom, fixvx, fixupx, vxtwitter, kkinstagram, tnktok, tiktxk, kktiktok
        const legacyKey = service.domain === 'x.com' ? 'xcom' : service.domain.split('.')[0];
        if (legacy[legacyKey] === false) service.enabled = false;
      }
    }
  } catch (error) {
    console.error('Error reading legacy settings:', error);
  }
  return services;
}

/**
 * Récupère les services de chaque plateforme ({ x: [...], instagram: [...], tiktok: [...] })
 * Au premier appel, la liste est créée depuis les défauts et l'ancien réglage, puis sauvegardée
 */
async function getServices() {
  const sync = getSyncStorageAPI();
  if (!sync) return migrateLegacySettings();

  try {
    const saved = (await storageGet(sync.storage, [STORAGE_KEYS.SERVICES]))[STORAGE_KEYS.SERVICES];
    if (!saved) {
      const services = await migrateLegacySettings();
      await storageSet(sync.storage, { [STORAGE_KEYS.SERVICES]: services });
      return services;
    }
    const services = {};
    for (const platform of CONFIG.PLATFORMS) {
      services[platform] = sanitizeServices(saved[platform]) || getDefaultServices(platform);
    }
    return services;
  } catch (error) {
    console.error('Error getting services:', error);
    return migrateLegacySettings();
  }
}

/**
 * Sauvegarde les services de toutes les plateformes (les onglets ouverts sont prévenus par storage.onChanged)
 */
async function saveServices(services) {
  const sync = getSyncStorageAPI();
  if (!sync) return;
  await storageSet(sync.storage, { [STORAGE_KEYS.SERVICES]: services });
}

/**
 * Remet les services par défaut d'une plateforme
 */
async function resetServices(platform) {
  const services = await getServices();
  services[platform] = getDefaultServices(platform);
  await saveServices(services);
  return services;
}

/**
 * Lit les services d'une plateforme dans un changement de storage.onChanged, ou null s'ils n'ont pas changé
 */
function getChangedServices(changes, area, platform) {
  const sync = getSyncStorageAPI();
  const change = changes[STORAGE_KEYS.SERVICES];
  if (!sync || area !== sync.area || !change) return null;
  return sanitizeServices(change.newValue?.[platform]) || getDefaultServices(platform);
}

/**
 * Écoute les changements de services faits dans le popup
 */
function onServicesChanged(platform, callback) {
  const api = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : browser.storage;
  api.onChanged.addListener((changes, area) => {
    const services = getChangedServices(changes, area, platform);
    if (services) callback(services);
  });
}

// Export pour utilisation dans les scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToHistory,
    getHistory,
    incrementStats,
    getStats,
    normalizeService,
    validateService,
    getServices,
    saveServices,
    resetServices,
    onServicesChanged
  };
} else {
  window.Storage = {
    saveToHistory,
    getHistory,
    incrementStats,
    getStats,
    normalizeService,
    validateService,
    getServices,
    saveServices,
    resetServices,
    onServicesChanged
  };
}
