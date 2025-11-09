import React, { useState, useEffect, useRef, useMemo } from "react";
import CustomVideoPlayer from "../components/CustomVideoPlayer";

export default function ResultDisplay({ result, videoURL, onReset }) {
  const [showAll, setShowAll] = useState(false);
  const [probabilityFilter, setProbabilityFilter] = useState("all");
  const playerRef = useRef(null);

  const filteredTimestamps = useMemo(() => {
    const base = showAll
      ? result.timestamps
      : result.timestamps.filter((t) => t.probability > 50);
    return base.filter((t) => {
      if (probabilityFilter === "all") return true;
      const [min, max] = probabilityFilter.split("-").map(Number);
      return t.probability >= min && t.probability <= max;
    });
  }, [result, showAll, probabilityFilter]);

  const handleTimestampClick = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-lg text-slate-950 mb-2">Analysis Complete</p>
        <h2 className="text-2xl font-semibold text-slate-800">
          The video has a{" "}
          <span className="text-violet-600">{result.overallProbability}%</span>{" "}
          violence probability
        </h2>
      </div>

      <CustomVideoPlayer
        ref={playerRef}
        src={videoURL}
        violentTimestamps={result.timestamps.filter((t) => t.probability > 75)}
      />

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            {showAll ? "Show Violence Events" : "Show All Events"}
          </button>
          <select
            value={probabilityFilter}
            onChange={(e) => setProbabilityFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 "
          >
            <option value="all">All Probabilities</option>
            <option value="0-25">0% - 25%</option>
            <option value="25-50">25% - 50%</option>
            <option value="50-75">50% - 75%</option>
            <option value="75-100">75% - 100%</option>
          </select>
        </div>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-sm text-slate-700 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Timestamp (seconds)
                </th>
                <th scope="col" className="px-6 py-3">
                  Violence Probability
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTimestamps.map((ts) => (
                <tr
                  key={ts.time}
                  onClick={() => handleTimestampClick(ts.time)}
                  className="bg-white border-b cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {ts.time.toFixed(2)}s
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        ts.probability > 75
                          ? "bg-red-100 text-red-800"
                          : ts.probability > 50
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {Math.round(ts.probability)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onReset}
          className="bg-violet-500 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow"
        >
          Analyze Another Video
        </button>
      </div>
    </div>
  );
}
