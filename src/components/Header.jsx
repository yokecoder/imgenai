import { useState, useEffect } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import GetAppIcon from "@mui/icons-material/GetApp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Header({ savedCount, toggleSavedGallery, showSaved }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <AutoAwesomeIcon className="brand-icon" />
        </div>
        <div className="brand-text">
          <span className="brand-title">imagine.ai</span>
          <span className="brand-badge">STUDIO</span>
        </div>
      </div>

      <div className="header-actions">
        {isInstallable && (
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
            title="Install Imagine AI App"
          >
            <GetAppIcon className="btn-icon" />
            <span className="btn-label">Install App</span>
          </button>
        )}

        <button
          type="button"
          className={`gallery-toggle-btn ${showSaved ? "active" : ""}`}
          onClick={toggleSavedGallery}
          title="Toggle Saved Gallery"
        >
          <BookmarkIcon className="btn-icon" />
          <span className="btn-label">Gallery</span>
          {savedCount > 0 && <span className="count-badge">{savedCount}</span>}
        </button>
      </div>
    </header>
  );
}
