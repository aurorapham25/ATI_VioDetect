import React, { useState } from "react";
import ResultDisplay from "./ResultDisplay";

import { PiUploadSimple } from "react-icons/pi";

const Upload = () => {
  const [status, setStatus] = useState("idle"); // idle -> processing -> result
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [processingStep, setProcessingStep] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (fileURL) {
        URL.revokeObjectURL(fileURL);
      }
      setFileURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleDetect = async () => {
    if (!file) {
      alert("Please select a video file first.");
      return;
    }

    setStatus("processing");
    setProcessingStep("Uploading video...");

    const formData = new FormData();
    formData.append("video_file", file); // Use 'video_file' or whatever name your backend expects for the video input

    try {
      // Replace with your actual ngrok URL
      const apiUrl = "https://mutably-suppletory-ned.ngrok-free.dev/analyze/";

      const response = await fetch(apiUrl, {
        method: "POST", // It must be a POST request to send a file
        body: formData,
        // The 'Content-Type' header is automatically set to 'multipart/form-data'
        // by the browser when you use FormData, so you don't need to set it manually.
      });

      if (!response.ok) {
        // Attempt to parse error message from backend if available
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default error message
        }
        throw new Error(errorMessage);
      }

      setProcessingStep("Analyzing video with AI...");
      const data = await response.json(); // This is where you expect your detection results

      // Validate the structure of the data returned by the API
      if (
        data &&
        typeof data.overallProbability === "number" &&
        Array.isArray(data.timestamps)
      ) {
        setResult(data);
        setStatus("result");
      } else {
        throw new Error("API returned invalid data format.");
      }
    } catch (error) {
      console.error("Detection error:", error);
      alert(`An error occurred during detection: ${error.message}`);
      setStatus("idle"); // Reset to idle state on error
    } finally {
      // Optional: Clean up the fileURL if you only need it for the upload
      // if (fileURL) {
      //   URL.revokeObjectURL(fileURL);
      // }
    }
  };

  if (status === "processing") {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-slate-700">
          {processingStep}
        </h2>
        <div className="w-32 h-32 mx-auto mt-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "result" && result && fileURL) {
    return (
      <ResultDisplay
        result={result}
        videoURL={fileURL}
        onReset={() => {
          setStatus("idle");
          setFile(null);
          setFileURL(null);
          setResult(null);
        }}
      />
    );
  }

  return (
    <div className="text-center max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-slate-950">
        Welcome to <span className="text-violet-700">VioDetect</span>
      </h1>
      <p className="mt-4 text-lg text-slate-950">
        Analyze your video for potential violent content with our advanced AI.
      </p>
      <div className="mt-10">
        <p className="text-slate-950 mb-6">
          Upload a video file to begin the detection process.
        </p>
        <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-10 hover:border-violet-500 transition-colors">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center text-slate-950 gap-4">
            <PiUploadSimple className="text-6xl text-violet-700 " />
            {file ? (
              <p className=" text-2xl font-semibold">{file.name}</p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-2xl font-semibold">Drop your video here</p>
                <p>or click to browse</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleDetect}
        disabled={!file}
        className="mt-8 w-full bg-violet-500 text-white py-3 rounded-lg hover:bg-violet-700 transition-colors shadow disabled:bg-violet-200 disabled:cursor-not-allowed"
      >
        Start Detection
      </button>
    </div>
  );
};

export default Upload;
