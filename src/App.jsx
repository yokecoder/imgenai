import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/*
todo 1: add more api keys
*/
export default function App() {
    const GPT_API_KEYS = [
        import.meta.env.VITE_GPT_API_KEY1,
        import.meta.env.VITE_GPT_API_KEY2,
        import.meta.env.VITE_GPT_API_KEY3
    ];

    // To verify it's working
    const randomApiKey = (() => {
        let index = 0;
        let shuffledKeys = [];

        return () => {
            if (index === 0 || index >= shuffledKeys.length) {
                shuffledKeys = [...GPT_API_KEYS].sort(
                    () => Math.random() - 0.5
                ); // Shuffle keys
                index = 0;
            }
            return shuffledKeys[index++];
        };
    })();

    const textareaRef = useRef(null);
    const [prompt, setPrompt] = useState("");
    const [savedImages, setSavedImages] = useState(() =>
        JSON.parse(localStorage.getItem("savedImages") ?? "[]")
    );

    const handleInput = () => {
        const textArea = textareaRef.current;
        textArea.style.height = "auto";
        textArea.style.height = textArea.scrollHeight + "px";
    };
    const saveImage = src => {
        setSavedImages(prev => {
            if (prev.includes(src)) {
                toast("Image is Already Saved");
                return prev;
            } // Avoid duplicates

            const updated = [src, ...prev];
            localStorage.setItem("savedImages", JSON.stringify(updated));
            toast("Image Saved");
            return updated;
        });
    };

    const fetchGenImage = async () => {
        if (!prompt) return null;
        const options = {
            method: "POST",
            url: "https://chatgpt-42.p.rapidapi.com/texttoimage",
            headers: {
                "x-rapidapi-key": `${randomApiKey()}`,
                "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            data: {
                text: prompt,
                width: 284,
                height: 284
            }
        };

        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error("Error fetching image:", error);
            return null;
        }
    };

    const {
        data: imageData,
        isLoading,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ["generatedImage"],
        queryFn: fetchGenImage,
        enabled: false,
        cacheTime: 1000 * 60 * 30
    });

    return (
        <>
            <div className="app-container">
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    newestOnTop
                    hideProgressBar
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    theme="dark"
                />
                <div className="title-bar">
                    <span className="title-text">imagine.ai</span>
                </div>
                {savedImages.length > 0 && (
                    <div className="saved-imgs-layout">
                        <h3 className="colored-txt">Saved Images</h3>
                        <div className="saved-imgs-carousel">
                            {savedImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    className="saved-image"
                                    alt="Saved"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="gen-imgs-container">
                    {!prompt && !imageData && (
                        <p className="para-text">
                            Turn Your Ideas into Stunning Images!!
                        </p>
                    )}
                    {(isLoading || isFetching) && (
                        <div className="loader"></div>
                    )}
                    {imageData && !isLoading && !isFetching && (
                        <>
                            <p className="desc-text colored-txt">
                                Here is your generated image
                            </p>
                            <img
                                src={imageData?.generated_image}
                                className="generated-image"
                                height="256px"
                                width="256px"
                                alt="Generated"
                            />
                            <div className="image-options">
                                <button
                                    type="button"
                                    onClick={() =>
                                        saveImage(imageData?.generated_image)
                                    }
                                    className="img-opt-button">
                                    Save
                                </button>
                                <a
                                    href={imageData?.generated_image}
                                    onClick={() =>
                                        toast("Downloading Image !!")
                                    }
                                    download="generated-image .jpg"
                                    className="img-opt-button">
                                    Download
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={`prompt-cont ${prompt ? "active" : ""}`}>
                <textarea
                    type="text"
                    ref={textareaRef}
                    onInput={handleInput}
                    className="prompt-box"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Express your imaginations here"></textarea>

                <IconButton onClick={refetch}>
                    <AutoFixHighIcon className="gen-ico" />
                </IconButton>
            </div>
        </>
    );
}
