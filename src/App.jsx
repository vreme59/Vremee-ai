import React, { useRef, useState } from "react";
import { requestToGroqAI } from "./utils/groq";
import "./App.css";

function App() {
  const contentRef = useRef();
  const [data, setData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [prevContentLength, setPrevContentLength] = useState(0);

  const handleSubmit = async () => {
    setIsGenerating(true);
    setData(""); // Reset data when submitting a new request
    setHasSubmitted(true);

    try {
      // Append instruction for Indonesian response
      const prompt = `Jawab dalam bahasa Indonesia: ${contentRef.current.value}`;
      const ai = await requestToGroqAI(prompt);

      // Split the response into paragraphs and add a delay for each paragraph
      const paragraphs = ai.split("\n\n");
      let displayedData = "";

      for (const paragraph of paragraphs) {
        displayedData += `${paragraph}\n\n`;
        setData(displayedData);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
      }
    } catch (error) {
      console.error("Error during request:", error);
      setData("Terjadi kesalahan saat mengambil respons.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = () => {
    const currentLength = contentRef.current.value.length;
    if (prevContentLength - currentLength >= 2) {
      // Clear the generated response if 2 or more characters are removed
      setData("");
      setHasSubmitted(false);
    }
    setPrevContentLength(currentLength);
  };

  return (
    <main className="flex flex-col min-h-[80vh] justify-center items-center">
      <h1 className="text-4xl text-indigo-500">REACT | GROQ AI</h1>
      <form
        className="flex flex-col gap-3 py-4 w-full max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          ref={contentRef}
          onChange={handleInputChange} // Track input changes
          placeholder="Ketik permintaan disini..."
          className="py-2 px-3 text-md rounded-md w-full border border-gray-300"
          type="text"
        />
        <button
          type="submit"
          className="py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-md"
        >
          Submit
        </button>
      </form>

      {/* Only show response container after the user submits */}
      {hasSubmitted && (
        <div className="w-full max-w-md mt-4 p-4 bg-gray-100 rounded-md overflow-hidden">
          {isGenerating && (
            <p className="text-center text-indigo-500 animate-generating">
              Generating<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
            </p>
          )}
          {/* Render response text with paragraphs, each in a styled paragraph */}
          {data.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-justify leading-relaxed indent-8">{paragraph}</p>
          ))}
        </div>
      )}
    </main>
  );
}

export default App;
