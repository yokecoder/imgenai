import { useRef, useEffect } from "react";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import CircularProgress from "@mui/material/CircularProgress";
import { ASPECT_RATIOS } from "../services/apiService";

export default function PromptInput({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  onGenerate,
  onRandomPrompt,
  isGenerating,
}) {
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = Math.min(window.innerHeight * 0.25, 180);
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
  };

  return (
    <div className={`prompt-dock ${prompt.trim() ? "has-content" : ""}`}>
      <div className="prompt-controls-bar">
        <div className="aspect-ratio-selector">
          <AspectRatioIcon className="controls-icon" />
          <div className="ratio-options">
            {Object.keys(ASPECT_RATIOS).map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={`ratio-btn ${aspectRatio === ratio ? "selected" : ""}`}
                disabled={isGenerating}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="surprise-btn"
          disabled={isGenerating}
          onClick={onRandomPrompt}
          title="Surprise me with a prompt idea"
        >
          <ShuffleIcon className="btn-icon" />
          <span>Surprise me</span>
        </button>
      </div>

      <div className="prompt-input-row">
        <textarea
          ref={textareaRef}
          className="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to create..."
          rows={1}
          disabled={isGenerating}
        />

        <button
          type="button"
          className="generate-submit-btn"
          disabled={isGenerating || !prompt.trim()}
          onClick={() => onGenerate()}
          title="Generate Image (Enter)"
        >
          {isGenerating ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <AutoFixHighIcon className="gen-btn-icon" />
          )}
          <span className="gen-btn-text">
            {isGenerating ? "Generating..." : "Imagine"}
          </span>
        </button>
      </div>
    </div>
  );
}
