import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const STORAGE_KEY = "savedImages";

export const useSavedImages = () => {
  const [savedImages, setSavedImages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Normalize data structure for backward compatibility
      return parsed.map((item, index) => {
        if (typeof item === "string") {
          return {
            id: `legacy-${index}-${Date.now()}`,
            url: item,
            prompt: "Saved Generation",
            createdAt: new Date().toISOString(),
          };
        }
        return item;
      });
    } catch (e) {
      console.error("Failed to parse saved images from localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedImages));
    } catch (e) {
      console.error("Failed to persist saved images to localStorage:", e);
    }
  }, [savedImages]);

  const saveImage = useCallback((imageData) => {
    setSavedImages((prev) => {
      const urlToSave = typeof imageData === "string" ? imageData : imageData.url;
      const alreadySaved = prev.some((img) => (img.url || img) === urlToSave);

      if (alreadySaved) {
        toast.info("Image is already saved in your gallery");
        return prev;
      }

      const newItem = typeof imageData === "string"
        ? {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: imageData,
            prompt: "Saved Generation",
            createdAt: new Date().toISOString(),
          }
        : {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: imageData.url,
            prompt: imageData.prompt || "Saved Generation",
            aspectRatio: imageData.aspectRatio || "1:1",
            createdAt: new Date().toISOString(),
          };

      toast.success("Image saved to gallery!");
      return [newItem, ...prev];
    });
  }, []);

  const deleteImage = useCallback((idOrUrl) => {
    setSavedImages((prev) => {
      const updated = prev.filter((img) => img.id !== idOrUrl && img.url !== idOrUrl);
      toast.info("Image removed from gallery");
      return updated;
    });
  }, []);

  const clearAllSaved = useCallback(() => {
    setSavedImages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Gallery cleared");
  }, []);

  const isSaved = useCallback(
    (url) => savedImages.some((img) => img.url === url),
    [savedImages]
  );

  return {
    savedImages,
    saveImage,
    deleteImage,
    clearAllSaved,
    isSaved,
  };
};
