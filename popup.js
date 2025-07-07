async function getPostLink(replacementHost) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  
    const rawUrl = tab.url;
    const status = document.getElementById("status");
  
    const isSupported =
      rawUrl.includes("x.com") || rawUrl.includes("instagram.com");
  
    if (!isSupported) {
      status.textContent = "❌ This page is not supported.";
      return;
    }
  
    const cleanUrl = rawUrl.split("?")[0];
    const finalUrl = new URL(cleanUrl);
    finalUrl.hostname = replacementHost;
  
    try {
      await navigator.clipboard.writeText(finalUrl.toString());
      status.textContent = "✅ Copied: " + finalUrl.toString();
    } catch (e) {
      status.textContent = "❌ Error: " + e.message;
    }
  }
  
  // Event listeners
  document.getElementById("copy-vxtwitter").addEventListener("click", () =>
    getPostLink("vxtwitter.com")
  );
  document.getElementById("copy-fixupx").addEventListener("click", () =>
    getPostLink("fixupx.com")
  );
  document.getElementById("copy-kkinstagram").addEventListener("click", () =>
    getPostLink("kkinstagram.com")
  );
  