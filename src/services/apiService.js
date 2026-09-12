import axios from "axios";

// Retrieve available API keys from environment
const getApiKeys = () => {
  return [
    import.meta.env.VITE_GPT_API_KEY1,
    import.meta.env.VITE_GPT_API_KEY2,
    import.meta.env.VITE_GPT_API_KEY3,
    import.meta.env.VITE_GPT_API_KEY4,
    import.meta.env.VITE_GPT_API_KEY5,
    import.meta.env.VITE_GPT_API_KEY6,
    import.meta.env.VITE_GPT_API_KEY7,
    import.meta.env.VITE_GPT_API_KEY8,
    import.meta.env.VITE_GPT_API_KEY9,
    import.meta.env.VITE_GPT_API_KEY10,
  ].filter(Boolean);
};

// Global round-robin index counter for sequential key rotation per prompt
let currentKeyIndex = 0;

export const getNextRotationalKey = () => {
  const keys = getApiKeys();
  if (!keys.length) return null;
  const selectedKey = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return selectedKey;
};

/**
 * Aspect ratio dimension mapping
 */
export const ASPECT_RATIOS = {
  "1:1": { width: 512, height: 512, label: "1:1 Square" },
  "16:9": { width: 768, height: 432, label: "16:9 Landscape" },
  "9:16": { width: 432, height: 768, label: "9:16 Portrait" },
  "4:3": { width: 640, height: 480, label: "4:3 Classic" },
};

/**
 * Strips watermarks and source text by fetching image bytes as a Blob first
 * (bypassing CORS canvas tainting) and cropping the bottom watermark area using HTML5 Canvas.
 */
export const cleanImageWatermark = async (imageUrl, cropBottomRatio = 0.14) => {
  if (!imageUrl || typeof imageUrl !== "string") return imageUrl;

  try {
    let localDataUrl = imageUrl;

    // Convert external HTTP URL to local Base64 Data URL via fetch to bypass CORS canvas tainting
    if (!imageUrl.startsWith("data:")) {
      const resp = await fetch(imageUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        localDataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        });
      }
    }

    // Now load local Data URL into HTML5 Canvas to crop watermark
    return await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(localDataUrl), 4000);
      const img = new Image();

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Calculate height excluding the bottom watermark area (bottom ~14% or min 64px)
          const cropPixels = Math.max(64, Math.round(img.height * cropBottomRatio));
          const cleanHeight = Math.max(100, img.height - cropPixels);

          canvas.width = img.width;
          canvas.height = cleanHeight;

          // Render upper image content cleanly, cutting off the watermark bar completely
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            cleanHeight,
            0,
            0,
            img.width,
            cleanHeight
          );

          const cleanDataUrl = canvas.toDataURL("image/png");
          resolve(cleanDataUrl);
        } catch (err) {
          console.warn("Canvas crop fallback:", err);
          resolve(localDataUrl);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(localDataUrl);
      };

      img.src = localDataUrl;
    });
  } catch (err) {
    console.warn("Watermark stripping fallback to original URL:", err);
    return imageUrl;
  }
};

/**
 * Multi-provider image generation service with multi-tier failover:
 * Tier 1: RapidAPI keys with round-robin rotation
 * Tier 2: OpenAI DALL-E (if key provided)
 * Tier 3: Pollinations AI (Instant, zero-key, watermark-free reliable generator)
 */
export const fetchGeneratedImage = async (promptText, aspectRatio = "1:1") => {
  if (!promptText?.trim()) {
    throw new Error("Please enter a valid prompt to generate an image.");
  }

  const apiKeys = getApiKeys();
  const dimensions = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["1:1"];
  let rawImageUrl = null;

  // 1. Try RapidAPI text-to-image provider across available keys
  if (apiKeys.length > 0) {
    const keysToTry = [...apiKeys].sort(() => Math.random() - 0.5);

    for (const apiKey of keysToTry) {
      try {
        const response = await axios.request({
          method: "POST",
          url: "https://chatgpt-42.p.rapidapi.com/texttoimage",
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
            "Content-Type": "application/json",
          },
          data: {
            text: promptText,
            width: dimensions.width,
            height: dimensions.height,
          },
          timeout: 8000,
        });

        const data = response.data;
        const candidateUrl =
          data?.generated_image ||
          data?.result ||
          data?.url ||
          data?.image ||
          data?.img_url ||
          (typeof data === "string" && data.startsWith("http") ? data : null);

        if (candidateUrl) {
          rawImageUrl = candidateUrl;
          break;
        }
      } catch (rapidError) {
        console.warn(
          "RapidAPI key attempt skipped:",
          rapidError?.message || rapidError
        );
      }
    }
  }

  // 2. Try OpenAI DALL-E fallback provider if RapidAPI failed and key exists
  if (!rawImageUrl) {
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const openAiResponse = await axios.post(
          "https://api.openai.com/v1/images/generations",
          {
            model: "dall-e-3",
            prompt: promptText,
            n: 1,
            size: "1024x1024",
          },
          {
            headers: {
              Authorization: `Bearer ${openAiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 25000,
          }
        );

        const imageUrl =
          openAiResponse.data?.data?.[0]?.url ||
          openAiResponse.data?.data?.[0]?.b64_json;

        if (imageUrl) {
          rawImageUrl = imageUrl.startsWith("data:image") ? imageUrl : imageUrl;
        }
      } catch (fallbackError) {
        console.warn("OpenAI fallback attempt skipped:", fallbackError?.message || fallbackError);
      }
    }
  }

  // 3. High-Reliability Failover: Pollinations AI (Zero-config, instant, clean, no-watermark)
  if (!rawImageUrl) {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(promptText.trim());
    rawImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true`;
  }

  if (!rawImageUrl) {
    throw new Error(
      "Unable to generate image. Please check your network connection and try again."
    );
  }

  // Post-process image to strip out any watermarks or source text cleanly
  const cleanUrl = await cleanImageWatermark(rawImageUrl, 0.14);

  return {
    imageUrl: cleanUrl,
  };
};

/**
 * Downloads image directly by converting URL to Blob to avoid CORS download issues
 */
export const downloadImage = async (imageUrl, filename = "imagine-ai-artwork.png") => {
  try {
    if (imageUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) throw new Error("Failed to fetch image blob");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch (err) {
    console.warn("Direct blob download failed, attempting fallback link:", err);
    window.open(imageUrl, "_blank", "noopener,noreferrer");
    return false;
  }
};
