// Popup script pour l'extension
// Copie du lien de l'onglet actif, édition des services par plateforme, statistiques et historique
// Note: config.js et storage.js sont chargés avant ce script dans popup.html

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
 * Vérifie si le domaine d'une URL fait partie d'une liste (sous-domaines compris)
 */
function hasDomain(url, domains) {
  try {
    const hostname = new URL(url).hostname;
    return domains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

/**
 * Vérifie si une URL est une URL de vidéo TikTok valide
 */
function isValidTikTokUrl(url) {
  return hasDomain(url, CONFIG.TIKTOK_DOMAINS) && /^\/@[^/]+\/video\/\d+/.test(new URL(url).pathname);
}

const URL_VALIDATORS = {
  x: url => hasDomain(url, CONFIG.X_DOMAINS),
  instagram: url => hasDomain(url, CONFIG.INSTAGRAM_DOMAINS),
  tiktok: isValidTikTokUrl
};

/**
 * Récupère l'onglet actif
 */
function getActiveTab() {
  return new Promise((resolve, reject) => {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (browserAPI.runtime.lastError) {
        reject(new Error(browserAPI.runtime.lastError.message));
      } else {
        resolve(tabs && tabs[0]);
      }
    });
  });
}

/**
 * Demande au content script TikTok l'URL de la vidéo affichée (le fil « Pour toi » n'a pas l'URL de la vidéo)
 * @returns {Promise<string|null>} URL de la vidéo, ou null si l'onglet ne répond pas
 */
function getDisplayedTikTokUrl(tab) {
  return new Promise((resolve) => {
    browserAPI.tabs.sendMessage(tab.id, { type: 'xilc-current-url' }, (response) => {
      // Pas de content script dans l'onglet : on lit lastError pour ne pas laisser d'erreur non traitée
      if (browserAPI.runtime.lastError) {
        resolve(null);
      } else {
        resolve(response?.url || null);
      }
    });
  });
}

/**
 * Obtient le lien du post de l'onglet actif et le convertit vers le domaine d'un service
 */
async function getPostLink(replacementHost, platform) {
  if (!browserAPI) {
    showStatus(CONFIG.MESSAGES.ERROR + ': Browser API not available', 'error');
    return;
  }

  try {
    const tab = await getActiveTab();
    if (!tab || !tab.url) {
      showStatus(CONFIG.MESSAGES.ERROR + ': No active tab found', 'error');
      return;
    }

    let rawUrl = tab.url;
    if (platform === 'tiktok' && hasDomain(rawUrl, CONFIG.TIKTOK_DOMAINS)) {
      rawUrl = (await getDisplayedTikTokUrl(tab)) || rawUrl;
    }

    if (!URL_VALIDATORS[platform](rawUrl)) {
      showStatus(CONFIG.MESSAGES.NOT_SUPPORTED + ` (${CONFIG.PLATFORM_NAMES[platform]})`, 'error');
      return;
    }

    const cleanUrl = rawUrl.split('?')[0];
    const finalUrl = convertUrl(cleanUrl, replacementHost);
    if (!finalUrl) {
      showStatus(CONFIG.MESSAGES.ERROR + ': URL conversion failed', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(finalUrl);
      await window.Storage.saveToHistory(cleanUrl, finalUrl, replacementHost, platform);
      await window.Storage.incrementStats(platform, replacementHost);
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

let statusTimeout;

/**
 * Affiche un message de statut
 */
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type === 'success' ? 'status-success' : 'status-error';

  // Effacer après 3 secondes
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}

/**
 * Charge et affiche les statistiques
 */
async function loadStats() {
  try {
    const stats = await window.Storage.getStats();
    document.getElementById('stats-total').textContent = stats.total || 0;
    document.getElementById('stats-today').textContent = stats.today || 0;
    document.getElementById('stats-x').textContent = stats.byPlatform?.x || 0;
    document.getElementById('stats-instagram').textContent = stats.byPlatform?.instagram || 0;
    document.getElementById('stats-tiktok').textContent = stats.byPlatform?.tiktok || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

/**
 * Charge et affiche l'historique
 */
async function loadHistory() {
  try {
    const history = await window.Storage.getHistory();
    const container = document.getElementById('history-container');

    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">No recent conversions</div>';
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

// Services de chaque plateforme, tels que sauvegardés
let services = {};

/**
 * Crée un élément avec une classe et un texte (jamais d'innerHTML : les valeurs viennent de la saisie)
 */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/**
 * Affiche un bouton de copie par service actif, groupés par plateforme
 */
function renderCopyButtons() {
  const container = document.getElementById('copy-sections');
  container.replaceChildren();

  CONFIG.PLATFORMS.forEach(platform => {
    const enabled = services[platform].filter(service => service.enabled);
    if (enabled.length === 0) return;

    const section = createElement('div', 'section');
    section.appendChild(createElement('h3', null, CONFIG.PLATFORM_NAMES[platform]));
    enabled.forEach(service => {
      const button = createElement('button', null, `📋 Copy ${service.domain} link`);
      button.addEventListener('click', () => getPostLink(service.domain, platform));
      section.appendChild(button);
    });
    container.appendChild(section);
    container.appendChild(createElement('div', 'divider'));
  });
}

/**
 * Sauvegarde les services ; les onglets ouverts reconstruisent leurs boutons via storage.onChanged
 */
async function persistServices() {
  try {
    await window.Storage.saveServices(services);
    renderCopyButtons();
  } catch (error) {
    console.error('Error saving services:', error);
    showStatus(CONFIG.MESSAGES.ERROR + ': ' + error.message, 'error');
  }
}

/**
 * Crée un petit bouton d'action de l'éditeur
 */
function createEditorButton(text, title, onClick) {
  const button = createElement('button', 'editor-btn', text);
  button.type = 'button';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Crée une ligne de l'éditeur : case activée, libellé, domaine, monter, descendre, supprimer
 * @param {string} platform
 * @param {number} index - Position dans la liste, ou -1 pour un nouveau service pas encore sauvegardé
 * @param {Object} service
 * @param {HTMLElement} errorBox - Zone d'erreur de la plateforme
 */
function createServiceRow(platform, index, service, errorBox) {
  const list = services[platform];
  const isNew = index === -1;
  const row = createElement('div', 'service-row');

  const enabled = document.createElement('input');
  enabled.type = 'checkbox';
  enabled.checked = service.enabled;
  enabled.title = 'Show';

  const label = document.createElement('input');
  label.type = 'text';
  label.className = 'service-label';
  label.value = service.label;
  label.maxLength = CONFIG.LABEL_MAX;
  label.placeholder = 'vx';
  label.setAttribute('aria-label', 'Label');

  const domain = document.createElement('input');
  domain.type = 'text';
  domain.className = 'service-domain';
  domain.value = service.domain;
  domain.placeholder = 'fixvx.com';
  domain.setAttribute('aria-label', 'Domain');

  // Sauvegarde dès que la ligne est valide ; sinon l'erreur reste affichée et rien n'est écrit
  const commit = async () => {
    const candidate = window.Storage.normalizeService({ label: label.value, domain: domain.value, enabled: enabled.checked });
    if (isNew && !candidate.label && !candidate.domain) return;
    const others = list.filter((_, i) => i !== index);
    const error = window.Storage.validateService(candidate, others);
    row.classList.toggle('invalid', Boolean(error));
    errorBox.textContent = error || '';
    if (error) return;

    label.value = candidate.label;
    domain.value = candidate.domain;
    if (isNew) {
      list.push(candidate);
      await persistServices();
      renderServicesEditor();
    } else {
      list[index] = candidate;
      await persistServices();
      updateSummary(platform);
    }
  };
  enabled.addEventListener('change', commit);
  label.addEventListener('change', commit);
  domain.addEventListener('change', commit);

  const move = (delta) => async () => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    await persistServices();
    renderServicesEditor();
  };
  const up = createEditorButton('↑', 'Move up', move(-1));
  const down = createEditorButton('↓', 'Move down', move(1));
  const remove = createEditorButton('✕', 'Remove', async () => {
    if (!isNew) {
      list.splice(index, 1);
      await persistServices();
    }
    renderServicesEditor();
  });
  up.disabled = isNew || index === 0;
  down.disabled = isNew || index === list.length - 1;

  row.append(enabled, label, domain, up, down, remove);
  return row;
}

/**
 * Texte du résumé d'une plateforme dans l'éditeur : nom et nombre de services affichés
 */
function getSummaryText(platform) {
  const list = services[platform];
  return `${CONFIG.PLATFORM_NAMES[platform]} (${list.filter(service => service.enabled).length}/${list.length})`;
}

/**
 * Met à jour le résumé d'une plateforme sans reconstruire l'éditeur (garde le focus dans les champs)
 */
function updateSummary(platform) {
  const summary = document.querySelector(`.services-platform[data-platform="${platform}"] summary`);
  if (summary) summary.textContent = getSummaryText(platform);
}

// Plateformes dont la section de l'éditeur est dépliée (conservé entre deux rendus)
const openPlatforms = new Set();

/**
 * Affiche l'éditeur des services, une section repliable par plateforme
 */
function renderServicesEditor() {
  const container = document.getElementById('services-editor');
  container.replaceChildren();

  CONFIG.PLATFORMS.forEach(platform => {
    const list = services[platform];
    const details = createElement('details', 'services-platform');
    details.dataset.platform = platform;
    details.open = openPlatforms.has(platform);
    details.addEventListener('toggle', () => {
      details.open ? openPlatforms.add(platform) : openPlatforms.delete(platform);
    });

    details.appendChild(createElement('summary', null, getSummaryText(platform)));

    const rows = createElement('div', 'service-rows');
    const errorBox = createElement('div', 'services-error');
    list.forEach((service, index) => rows.appendChild(createServiceRow(platform, index, service, errorBox)));

    const actions = createElement('div', 'services-actions');
    const add = createEditorButton('+ Add', 'Add a service', () => {
      const row = createServiceRow(platform, -1, { label: '', domain: '', enabled: true }, errorBox);
      rows.appendChild(row);
      row.querySelector('.service-label').focus();
      add.disabled = true;
    });
    add.disabled = list.length >= CONFIG.MAX_SERVICES;
    const reset = createEditorButton('Reset', 'Restore the default services', async () => {
      services = await window.Storage.resetServices(platform);
      renderCopyButtons();
      renderServicesEditor();
    });
    actions.append(add, reset);

    details.append(rows, errorBox, actions);
    container.appendChild(details);
  });
}

/**
 * Affiche les nouveautés de chaque version ; une pastille signale une version pas encore consultée
 */
async function renderChangelog() {
  const container = document.getElementById('changelog');
  const version = browserAPI?.runtime?.getManifest?.().version || CONFIG.CHANGELOG[0].version;
  const storage = browserAPI?.storage?.local;
  const seen = storage ? (await new Promise(resolve => storage.get(['lastSeenVersion'], resolve)))?.lastSeenVersion : version;

  const details = createElement('details', 'changelog');
  const summary = createElement('summary', null, `What's new · v${version}`);
  if (seen !== version) summary.appendChild(createElement('span', 'changelog-badge', 'NEW'));
  details.appendChild(summary);

  CONFIG.CHANGELOG.forEach(release => {
    details.appendChild(createElement('div', 'changelog-version', `v${release.version}`));
    const list = createElement('ul');
    release.changes.forEach(change => list.appendChild(createElement('li', null, change)));
    details.appendChild(list);
  });

  details.addEventListener('toggle', () => {
    if (!details.open || seen === version) return;
    summary.querySelector('.changelog-badge')?.remove();
    storage?.set({ lastSeenVersion: version });
  });
  container.replaceChildren(details);
}

// Event listener pour effacer l'historique
document.getElementById('clear-history').addEventListener('click', async () => {
  if (confirm('Clear the conversion history?')) {
    try {
      const storage = browserAPI?.storage?.local;
      if (storage) {
        await new Promise((resolve) => {
          storage.set({ conversionHistory: [] }, resolve);
        });
        await loadHistory();
        showStatus('History cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      showStatus('Could not clear history', 'error');
    }
  }
});

// Charger les données au démarrage
window.addEventListener('DOMContentLoaded', async () => {
  services = await window.Storage.getServices();
  renderCopyButtons();
  renderServicesEditor();
  await loadStats();
  await loadHistory();
  await renderChangelog();
});
