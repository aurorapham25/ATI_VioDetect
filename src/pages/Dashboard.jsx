import React, { useState, useEffect, useMemo } from "react";

export default function Dashboard() {
  const initialCameras = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    isViolent: false,
  }));

  const [cameras, setCameras] = useState(initialCameras);
  const [logs, setLogs] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [cameraIdFilter, setCameraIdFilter] = useState("");
  const [probabilityFilter, setProbabilityFilter] = useState("all");

  useEffect(() => {
    // Connect to the Server-Sent Events (SSE) endpoint
    // Ensure this URL is correct for your SSE server
    const eventSource = new EventSource("http://localhost:3001/stream");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE data:", data);

      // Update logs and camera states based on the received data
      setLogs((prevLogs) => {
        const newLogsBatch = data.cameras.map((cameraData) => ({
          id: Date.now() + Math.random(), // Still need unique IDs for React keys
          cameraId: cameraData.cameraId,
          timestamp: new Date(data.timestamp), // Use the main timestamp for all logs in this batch
          probability: cameraData.probability,
        }));
        // Prepend new logs and maintain a maximum of 100 entries
        return [
          ...newLogsBatch,
          ...prevLogs.slice(0, 99 - newLogsBatch.length),
        ];
      });

      setCameras((prevCameras) => {
        const updatedCameras = [...prevCameras];
        data.cameras.forEach((cameraData) => {
          const camIndex = updatedCameras.findIndex(
            (cam) => cam.id === cameraData.cameraId
          );
          if (camIndex !== -1) {
            updatedCameras[camIndex] = {
              ...updatedCameras[camIndex],
              isViolent: cameraData.probability > 75, // Your threshold
              currentProbability: cameraData.probability, // Storing probability to display if desired
            };
          }
        });
        return updatedCameras;
      });
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close(); // Close the connection on error
    };

    // Clean up the EventSource connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const filteredLogs = useMemo(() => {
    // Your existing filtering logic remains the same
    return logs
      .filter((log) =>
        cameraIdFilter ? log.cameraId.toString().includes(cameraIdFilter) : true
      )
      .filter((log) => {
        if (probabilityFilter === "all") return true;
        const [min, max] = probabilityFilter.split("-").map(Number);
        return log.probability >= min && log.probability <= max;
      });
  }, [logs, cameraIdFilter, probabilityFilter]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className={`relative aspect-video bg-slate-400 rounded-lg shadow-md group ${
              cam.isViolent ? "ring-4 ring-red-400" : ""
            }`}
          >
            {/* Video Feed Integration - this replaces the solid background visually */}
            <img
              src={`https://mutably-suppletory-ned.ngrok-free.dev/video_feed/${cam.id}`}
              alt={`Camera ${cam.id} Feed`}
              className="absolute inset-0 w-full h-full object-cover rounded-lg" // Added rounded-lg to match parent
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                e.target.src = `https://mutably-suppletory-ned.ngrok-free.dev/video_feed/${cam.id}`; // Placeholder
                e.target.style.filter = "grayscale(80%)"; // Make placeholder visually distinct
              }}
            />

            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
              CAM {String(cam.id).padStart(2, "0")}
            </div>
            {cam.isViolent && (
              <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded animate-pulse">
                VIOLENCE DETECTED!
              </div>
            )}
            {/* Optional: Display current probability on the card, without changing original style */}
            {cam.currentProbability !== undefined &&
              !cam.isViolent && ( // Only show if not violent, to avoid overlap
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
                  Prob: {cam.currentProbability}%
                </div>
              )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={() => setShowTable(!showTable)}
          className="bg-violet-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow"
        >
          {showTable ? "Hide" : "Show"} Activity Log
        </button>
      </div>
      {showTable && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by Camera ID..."
              value={cameraIdFilter}
              onChange={(e) => setCameraIdFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select
              value={probabilityFilter}
              onChange={(e) => setProbabilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Probabilities</option>
              <option value="0-25">0% - 25%</option>
              <option value="25-50">25% - 50%</option>
              <option value="50-75">50% - 75%</option>
              <option value="75-100">75% - 100%</option>
            </select>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left text-slate-500">
              <thead className="text-sm text-slate-700 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Camera ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Violence Probability
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {log.cameraId}
                    </td>
                    <td className="px-6 py-4">
                      {log.timestamp.toLocaleString("en-GB")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          log.probability > 75
                            ? "bg-red-100 text-red-800"
                            : log.probability > 50
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {log.probability}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
