import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import GeneratorView from "./components/GeneratorView";
import SavedGallery from "./components/SavedGallery";
import PromptInput from "./components/PromptInput";
import PresetPrompts from "./components/PresetPrompts";
import LightboxModal from "./components/LightboxModal";

import { useImageGenerator } from "./hooks/useImageGenerator";
import { useSavedImages } from "./hooks/useSavedImages";

export default function App() {
  const {
    prompt,
    setPrompt,
    aspectRatio,
    setAspectRatio,
    isGenerating,
    generatedImage,
    activePrompt,
    errorMessage,
    generationTime,
    handleGenerate,
    getRandomPrompt,
  } = useImageGenerator();

  const {
    savedImages,
    saveImage,
    deleteImage,
    clearAllSaved,
    isSaved,
  } = useSavedImages();

  const [showSaved, setShowSaved] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleSelectPresetPrompt = (selectedPrompt) => {
    setPrompt(selectedPrompt);
    handleGenerate(selectedPrompt);
  };

  const handleUsePromptFromGallery = (promptText) => {
    setPrompt(promptText);
    setShowSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        newestOnTop
        hideProgressBar
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        theme="dark"
        toastClassName="custom-toast"
      />

      <Header
        savedCount={savedImages.length}
        toggleSavedGallery={() => setShowSaved((prev) => !prev)}
        showSaved={showSaved}
      />

      <main className="app-main-content">
        {showSaved ? (
          <SavedGallery
            savedImages={savedImages}
            onDeleteImage={deleteImage}
            onClearAll={clearAllSaved}
            onOpenLightbox={(img) => setLightboxImage(img)}
            onUsePrompt={handleUsePromptFromGallery}
          />
        ) : (
          <div className="workspace-container">
            <GeneratorView
              isGenerating={isGenerating}
              generatedImage={generatedImage}
              errorMessage={errorMessage}
              activePrompt={activePrompt}
              generationTime={generationTime}
              onSaveImage={saveImage}
              onRegenerate={() => handleGenerate(activePrompt)}
              onOpenLightbox={(img) => setLightboxImage(img)}
              isSaved={isSaved}
            />

            {!generatedImage && !isGenerating && (
              <PresetPrompts
                onSelectPrompt={handleSelectPresetPrompt}
                isGenerating={isGenerating}
              />
            )}

            {savedImages.length > 0 && (
              <div className="inline-saved-section">
                <div className="inline-saved-header">
                  <h3>Saved Artwork</h3>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => setShowSaved(true)}
                  >
                    View All ({savedImages.length}) &rarr;
                  </button>
                </div>
                <div className="inline-saved-scroll">
                  {savedImages.slice(0, 8).map((img) => (
                    <div
                      key={img.id || img.url}
                      className="inline-saved-card"
                      onClick={() => setLightboxImage(img)}
                      title={img.prompt || "Saved image"}
                    >
                      <img src={img.url} alt={img.prompt || "Saved"} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onGenerate={() => handleGenerate()}
        onRandomPrompt={getRandomPrompt}
        isGenerating={isGenerating}
      />

      {lightboxImage && (
        <LightboxModal
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onSave={saveImage}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}
