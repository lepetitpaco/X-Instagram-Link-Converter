function addXButtons() {
    const actionGroup = document.querySelector('div[role="group"][aria-label*="likes"]');
    if (!actionGroup || document.getElementById("custom-share-buttons")) return;
  
    const wrapper = document.createElement("div");
    wrapper.id = "custom-share-buttons";
    wrapper.style.marginTop = "10px";
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";
  
    const createToast = (message) => {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.style.position = "fixed";
      toast.style.top = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = "#1d9bf0";
      toast.style.color = "#fff";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "9999px";
      toast.style.fontSize = "14px";
      toast.style.fontWeight = "600";
      toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      toast.style.zIndex = "9999";
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease, top 0.3s ease";
  
      document.body.appendChild(toast);
  
      // animation d'apparition
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.top = "30px";
      });
  
      // disparition après 2 secondes
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.top = "20px";
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    };
  
    const createButton = (label, domain) => {
      const btn = document.createElement("button");
      btn.textContent = label;
  
      // Style Twitter Blue
      btn.style.padding = "8px 12px";
      btn.style.borderRadius = "9999px";
      btn.style.border = "none";
      btn.style.backgroundColor = "#1d9bf0";
      btn.style.color = "#ffffff";
      btn.style.fontSize = "14px";
      btn.style.fontWeight = "600";
      btn.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      btn.style.cursor = "pointer";
      btn.style.transition = "background-color 0.2s ease-in-out";
  
      btn.onmouseover = () => btn.style.backgroundColor = "#1a8cd8";
      btn.onmouseout = () => btn.style.backgroundColor = "#1d9bf0";
  
      btn.onclick = () => {
        const currentUrl = window.location.href.split("?")[0];
        if (!currentUrl.includes("x.com")) {
          createToast("❌ Invalid X.com post URL.");
          return;
        }
        const newUrl = new URL(currentUrl);
        newUrl.hostname = domain;
        navigator.clipboard.writeText(newUrl.toString()).then(() => {
          createToast(`✅ Copied: ${domain}`);
        });
      };
  
      return btn;
    };
  
    wrapper.appendChild(createButton("📋 fixvx", "fixvx.com"));
    wrapper.appendChild(createButton("📋 fixupx", "fixupx.com"));
  
    actionGroup.parentNode.insertBefore(wrapper, actionGroup.nextSibling);
  }
  
  // Exécute au chargement + au scroll dynamique
  const observer = new MutationObserver(() => {
    addXButtons();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  