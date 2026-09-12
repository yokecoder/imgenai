import { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { downloadImage } from "../services/apiService";
import { toast } from "react-toastify";

export default function LightboxModal({ image, onClose, onSave, isSaved }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const saved = isSaved(image.url);

  const handleCopyPrompt = () => {
    if (!image.prompt) return;
    navigator.clipboard.writeText(image.prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = async () => {
    toast.info("Downloading image...");
    await downloadImage(image.url, `imagine-artwork-${Date.now()}.png`);
    toast.success("Download complete!");
  };

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lightbox-close-btn"
          onClick={onClose}
          title="Close (Esc)"
        >
          <CloseIcon />
        </button>

        <div className="lightbox-image-container">
          <img
            src={image.url}
            alt={image.prompt || "Lightbox view"}
            className="lightbox-main-image"
          />
        </div>

        <div className="lightbox-footer">
          <p className="lightbox-prompt-text">
            {image.prompt || "Generated Artwork"}
          </p>

          <div className="lightbox-actions">
            {onSave && (
              <button
                type="button"
                className={`lightbox-action-btn ${saved ? "saved" : ""}`}
                onClick={() => onSave(image)}
              >
                {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                <span>{saved ? "Saved" : "Save"}</span>
              </button>
            )}

            <button
              type="button"
              className="lightbox-action-btn"
              onClick={handleDownload}
            >
              <DownloadIcon />
              <span>Download</span>
            </button>

            {image.prompt && (
              <button
                type="button"
                className="lightbox-action-btn icon-only"
                onClick={handleCopyPrompt}
                title="Copy Prompt"
              >
                <ContentCopyIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
