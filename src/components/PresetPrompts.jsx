
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { SAMPLE_PROMPTS } from "../hooks/useImageGenerator";

export default function PresetPrompts({ onSelectPrompt, isGenerating }) {
  return (
    <div className="preset-prompts-container">
      <div className="preset-header">
        <LightbulbIcon className="preset-icon" />
        <span>Try an inspiration prompt</span>
      </div>
      <div className="preset-chips">
        {SAMPLE_PROMPTS.slice(0, 4).map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-chip"
            disabled={isGenerating}
            onClick={() => onSelectPrompt(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
