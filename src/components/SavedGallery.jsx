import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import { downloadImage } from "../services/apiService";
import { toast } from "react-toastify";

export default function SavedGallery({
  savedImages,
  onDeleteImage,
  onClearAll,
  onOpenLightbox,
  onUsePrompt,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredImages = savedImages.filter((img) =>
    (img.prompt || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (img) => {
    toast.info("Downloading saved artwork...");
    await downloadImage(img.url, `saved-imagine-${Date.now()}.png`);
    toast.success("Download started!");
  };

  if (savedImages.length === 0) {
    return (
      <div className="saved-gallery-container empty-gallery">
        <div className="empty-icon-box">
          <BookmarkRemoveIcon className="empty-icon" />
        </div>
        <h3>No Saved Images Yet</h3>
        <p>Your saved artwork gallery will appear here. Click &quot;Save&quot; on any generated image to keep it.</p>
      </div>
    );
  }

  return (
    <div className="saved-gallery-container">
      <div className="gallery-header-row">
        <div className="gallery-title-box">
          <h2>Saved Gallery</h2>
          <span className="gallery-count">{savedImages.length} saved</span>
        </div>

        <div className="gallery-actions-row">
          <div className="gallery-search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search saved prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gallery-search-input"
            />
          </div>

          <button
            type="button"
            className="clear-gallery-btn"
            onClick={onClearAll}
            title="Clear all saved images"
          >
            <DeleteOutlineIcon />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="no-search-results">
          <p>No saved images matching &ldquo;{searchTerm}&rdquo;</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((img) => (
            <div key={img.id || img.url} className="gallery-card">
              <div className="gallery-image-wrapper">
                <img
                  src={img.url}
                  alt={img.prompt || "Saved image"}
                  className="gallery-image"
                  loading="lazy"
                  onClick={() => onOpenLightbox(img)}
                />
                <div className="gallery-card-overlay">
                  <button
                    type="button"
                    className="overlay-action-btn"
                    onClick={() => onOpenLightbox(img)}
                    title="View Fullscreen"
                  >
                    <VisibilityIcon />
                  </button>
                  <button
                    type="button"
                    className="overlay-action-btn"
                    onClick={() => handleDownload(img)}
                    title="Download Image"
                  >
                    <DownloadIcon />
                  </button>
                  {img.prompt && (
                    <button
                      type="button"
                      className="overlay-action-btn"
                      onClick={() => onUsePrompt(img.prompt)}
                      title="Reuse Prompt"
                    >
                      <AutoFixHighIcon />
                    </button>
                  )}
                  <button
                    type="button"
                    className="overlay-action-btn delete-btn"
                    onClick={() => onDeleteImage(img.id || img.url)}
                    title="Delete from saved"
                  >
                    <DeleteOutlineIcon />
                  </button>
                </div>
              </div>
              <div className="gallery-card-info">
                <p className="gallery-prompt-snippet">
                  {img.prompt || "Saved Image"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
