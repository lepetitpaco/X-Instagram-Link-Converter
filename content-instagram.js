function interceptCopyLink(button) {
    if (button.dataset.kkinstagramHandled) return;
    button.dataset.kkinstagramHandled = "true";

    button.addEventListener("click", () => {
        let attempts = 0;
        const interval = setInterval(async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text.includes("instagram.com")) {
                    const newUrl = new URL(text);
                    newUrl.hostname = "kkinstagram.com";
                    await navigator.clipboard.writeText(newUrl.toString());
                    showToast("✅ Copied as kkinstagram.com");
                    clearInterval(interval);
                }
                if (++attempts > 10) clearInterval(interval);
            } catch (e) {
                clearInterval(interval);
                console.error("❌ Clipboard read error:", e);
            }
        }, 100);
    });
}

function isCopyLinkSVG(svg) {
    const path = svg.querySelector("path");
    return path && path.getAttribute("d")?.includes("a6.47 6.47 0 0 1");
}

function showToast(message) {
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
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.top = "30px";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.top = "20px";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Observer for dynamic content
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;

            node.querySelectorAll?.("svg").forEach((svg) => {
                if (!isCopyLinkSVG(svg)) return;
                const wrapper = svg.closest("div[role='button']");
                if (wrapper) interceptCopyLink(wrapper);
            });
        });
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Apply to existing
document.querySelectorAll("svg").forEach((svg) => {
    if (!isCopyLinkSVG(svg)) return;
    const wrapper = svg.closest("div[role='button']");
    if (wrapper) interceptCopyLink(wrapper);
});
