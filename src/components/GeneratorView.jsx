import { useState } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { downloadImage } from "../services/apiService";
import { toast } from "react-toastify";

export default function GeneratorView({
  isGenerating,
  generatedImage,
  errorMessage,
  activePrompt,
  generationTime,
  onSaveImage,
  onRegenerate,
  onOpenLightbox,
  isSaved,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyPrompt = () => {
    if (!activePrompt) return;
    navigator.clipboard.writeText(activePrompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = async () => {
    if (!generatedImage?.url) return;
    setIsDownloading(true);
    toast.info("Preparing high-res download...");
    const success = await downloadImage(
      generatedImage.url,
      `imagine-ai-${Date.now()}.png`
    );
    setIsDownloading(false);
    if (success) {
      toast.success("Download started!");
    }
  };

  // 1. Loading State with Skeleton Loader
  if (isGenerating) {
    return (
      <div className="generator-card loading-card">
        <div className="skeleton-image-wrapper">
          <div className="skeleton-pulse"></div>
          <div className="loading-status-overlay">
            <div className="glowing-spinner"></div>
            <p className="loading-title">Creating Artwork</p>
            <p className="loading-subtitle">
              {generationTime < 3
                ? "Connecting to AI model..."
                : generationTime < 8
                ? "Synthesizing pixels from prompt..."
                : "Adding final artistic details..."}
            </p>
            <span className="loading-timer">{generationTime}s elapsed</span>
          </div>
        </div>
        <div className="skeleton-prompt-line"></div>
      </div>
    );
  }

  // 2. Error State
  if (errorMessage && !generatedImage) {
    return (
      <div className="generator-card error-card">
        <div className="error-icon-box">
          <ErrorOutlineIcon className="error-icon" />
        </div>
        <h3 className="error-title">Generation Issue</h3>
        <p className="error-message">{errorMessage}</p>
        <div className="error-actions">
          <button
            type="button"
            className="retry-btn"
            onClick={onRegenerate}
          >
            <RefreshIcon className="btn-icon" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Generated Image Result State
  if (generatedImage) {
    const saved = isSaved(generatedImage.url);

    return (
      <div className="generator-card result-card">
        <div className="result-image-wrapper">
          <img
            src={generatedImage.url}
            alt={generatedImage.prompt}
            className="result-image"
            loading="eager"
            onClick={() => onOpenLightbox(generatedImage)}
          />
          <button
            type="button"
            className="lightbox-overlay-btn"
            onClick={() => onOpenLightbox(generatedImage)}
            title="Expand Fullscreen"
          >
            <VisibilityIcon />
          </button>


        </div>

        <div className="result-meta">
          <p className="active-prompt-text">
            &ldquo;{generatedImage.prompt}&rdquo;
          </p>

          <div className="result-action-bar">
            <button
              type="button"
              className={`action-btn save-btn ${saved ? "saved" : ""}`}
              onClick={() => onSaveImage(generatedImage)}
            >
              {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              <span>{saved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              className="action-btn download-btn"
              disabled={isDownloading}
              onClick={handleDownload}
            >
              <DownloadIcon />
              <span>{isDownloading ? "Downloading..." : "Download"}</span>
            </button>

            <button
              type="button"
              className="action-btn copy-btn"
              onClick={handleCopyPrompt}
              title="Copy Prompt"
            >
              <ContentCopyIcon />
            </button>

            <button
              type="button"
              className="action-btn regen-btn"
              onClick={onRegenerate}
              title="Regenerate Image"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Initial Hero Welcome State
  return (
    <div className="hero-welcome-card">
      <div className="hero-icon-container">
        <AutoAwesomeIcon className="hero-sparkle-icon" />
      </div>
      <h1 className="hero-headline">Turn Words into Masterpieces</h1>
      <p className="hero-subtext">
        Enter any description in the prompt bar below or select an inspiration prompt to generate instant AI artwork.
      </p>
    </div>
  );
}
