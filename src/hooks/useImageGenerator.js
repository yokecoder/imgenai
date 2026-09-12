import { useState, useCallback, useRef } from "react";
import { fetchGeneratedImage } from "../services/apiService";

export const SAMPLE_PROMPTS = [
  "A majestic cyberpunk city at night with neon lights reflecting on wet streets, hyperrealistic 8k",
  "An ethereal underwater palace surrounded by bioluminescent jellyfish and ancient coral reefs",
  "A cozy futuristic cabin in a snowy pine forest with glowing warm windows under aurora borealis",
  "A whimsical steampunk clockwork owl with intricate brass gears and glowing amber sapphire eyes",
  "Minimalist abstract landscape with floating pastel geometric spheres and soft sunset fog",
  "A retro 80s synthwave sports car driving towards a grid horizon with a giant neon sun",
  "An ancient mystical library with floating glowing spellbooks and emerald candlelight",
  "A cute baby dragon sleeping inside a crystal geode egg with sparkling stardust trail"
];

export const useImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [activePrompt, setActivePrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [generationTime, setGenerationTime] = useState(0);
  const timerRef = useRef(null);

  const getRandomPrompt = useCallback(() => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
    setErrorMessage("");
  }, []);

  const handleGenerate = useCallback(
    async (overridePrompt) => {
      const targetPrompt = (overridePrompt || prompt).trim();
      if (!targetPrompt) return;

      setErrorMessage("");
      setIsGenerating(true);
      setActivePrompt(targetPrompt);
      setGenerationTime(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      try {
        const result = await fetchGeneratedImage(targetPrompt, aspectRatio);
        if (result?.imageUrl) {
          setGeneratedImage({
            url: result.imageUrl,
            prompt: targetPrompt,
            aspectRatio,
            provider: result.provider,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Generation error:", err);
        setErrorMessage(
          err.message || "Image generation failed. Please check your connection and try again."
        );
      } finally {
        setIsGenerating(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    },
    [prompt, aspectRatio]
  );

  return {
    prompt,
    setPrompt,
    aspectRatio,
    setAspectRatio,
    isGenerating,
    generatedImage,
    activePrompt,
    errorMessage,
    setErrorMessage,
    generationTime,
    handleGenerate,
    getRandomPrompt,
  };
};
