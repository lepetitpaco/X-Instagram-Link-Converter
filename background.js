chrome.runtime.onInstalled.addListener(() => {
  // X.com options
  chrome.contextMenus.create({
    id: "copy-x-vxtwitter-page",
    title: "📋 Copy vxtwitter link of this X page",
    contexts: ["page"],
    documentUrlPatterns: ["*://x.com/*"]
  });

  chrome.contextMenus.create({
    id: "copy-x-fixupx-page",
    title: "📋 Copy fixupx link of this X page",
    contexts: ["page"],
    documentUrlPatterns: ["*://x.com/*"]
  });

  // Instagram option (any path)
  chrome.contextMenus.create({
    id: "copy-kkinstagram-page",
    title: "📷 Copy kkinstagram link of this Instagram page",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.instagram.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let replacementDomain = null;

  if (info.menuItemId.includes("vxtwitter")) {
    replacementDomain = "vxtwitter.com";
  } else if (info.menuItemId.includes("fixupx")) {
    replacementDomain = "fixupx.com";
  } else if (info.menuItemId.includes("kkinstagram")) {
    replacementDomain = "kkinstagram.com";
  }

  const rawUrl = tab.url;

  // Check if it's an eligible base domain
  const isX = rawUrl.includes("x.com");
  const isIG = rawUrl.includes("instagram.com");

  if (!isX && !isIG) {
    chrome.tabs.executeScript(tab.id, {
      code: `alert("❌ This page is not supported.")`
    });
    return;
  }

  // Clean query params
  const cleanUrl = rawUrl.split("?")[0];
  const finalUrl = new URL(cleanUrl);
  finalUrl.hostname = replacementDomain;

  chrome.tabs.executeScript(tab.id, {
    code: `navigator.clipboard.writeText(${JSON.stringify(finalUrl.toString())})`
  });
});
