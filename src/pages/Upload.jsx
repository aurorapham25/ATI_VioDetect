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

  // const handleDetect = () => {
  //   if (!file || !fileURL) return;
  //   setStatus("processing");
  //   setProcessingStep("Loading video...");

  //   const video = document.createElement("video");
  //   video.preload = "metadata";
  //   video.src = fileURL;

  //   video.onloadedmetadata = () => {
  //     const videoDuration = video.duration;
  //     // URL.revokeObjectURL(video.src); // Clean up memory

  //     // Simulate processing steps
  //     setTimeout(() => {
  //       setProcessingStep("Preprocessing...");
  //       setTimeout(() => {
  //         setProcessingStep("AI is working...");
  //         setTimeout(() => {
  //           // Generate mock data with one entry per second of video.
  //           const timestamps = Array.from(
  //             { length: Math.floor(videoDuration) },
  //             (_, i) => {
  //               const isPotentiallyViolent = Math.random() < 0.2; // 20% chance of a high-prob event
  //               return {
  //                 time: i + Math.random(), // Add jitter to the second
  //                 probability: isPotentiallyViolent
  //                   ? 50 + Math.random() * 50
  //                   : Math.random() * 50,
  //               };
  //             }
  //           );

  //           const highProbEvents = timestamps.filter(
  //             (t) => t.probability > 75
  //           ).length;
  //           const overallProbability = Math.min(
  //             100,
  //             (highProbEvents / (videoDuration || 1)) * 200 + Math.random() * 20
  //           );

  //           setResult({
  //             overallProbability: Math.floor(overallProbability),
  //             timestamps: timestamps,
  //           });
  //           setStatus("result");
  //         }, 1500);
  //       }, 1500);
  //     }, 500);
  //   };

  //   video.onerror = () => {
  //     URL.revokeObjectURL(video.src); // Clean up memory
  //     console.error(
  //       "Could not load video metadata. Please check the file format."
  //     );
  //     setStatus("idle");
  //   };
  // };

  const handleDetect = async () => {
    // Nếu cần file, có thể bỏ qua hoặc giữ điều kiện tùy mục đích
    // if (!file) return;

    setStatus("processing");
    setProcessingStep("Fetching JSON...");

    try {
      // Gọi API backend Flask
      const response = await fetch("http://127.0.0.1:5000/get_json");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch JSON.");
      }

      setProcessingStep("Processing JSON...");
      const data = await response.json(); // Đây chính là JSON từ backend

      setResult(data); // Lưu JSON vào state hoặc hiển thị
      setStatus("result");
    } catch (error) {
      console.error("Error fetching JSON:", error);
      alert("Error: ${error.message}");
      setStatus("idle");
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
