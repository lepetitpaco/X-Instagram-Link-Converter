chrome.runtime.onInstalled.addListener(() => {
  // Crée les options de menu pour X
  chrome.contextMenus.create({
    id: "copy-x-fixvx-page",
    title: "📋 Copy fixvx link of this X page",
    contexts: ["page"],
    documentUrlPatterns: ["*://x.com/*"]
  });

  chrome.contextMenus.create({
    id: "copy-x-fixupx-page",
    title: "📋 Copy fixupx link of this X page",
    contexts: ["page"],
    documentUrlPatterns: ["*://x.com/*"]
  });

  // Crée l'option de menu pour Instagram
  chrome.contextMenus.create({
    id: "copy-kkinstagram-page",
    title: "📷 Copy kkinstagram link of this Instagram page",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.instagram.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const rawUrl = tab.url.split("?")[0];
  const url = new URL(rawUrl);
  let replacementDomain = null;

  switch (info.menuItemId) {
    case "copy-x-fixvx-page":
      replacementDomain = "fixvx.com";
      break;
    case "copy-x-fixupx-page":
      replacementDomain = "fixupx.com";
      break;
    case "copy-kkinstagram-page":
      replacementDomain = "kkinstagram.com";
      break;
    default:
      chrome.tabs.executeScript(tab.id, {
        code: `alert("❌ This page is not supported.")`
      });
      return;
  }

  url.hostname = replacementDomain;

  chrome.tabs.executeScript(tab.id, {
    code: `navigator.clipboard.writeText(${JSON.stringify(url.toString())});`
  });
});
