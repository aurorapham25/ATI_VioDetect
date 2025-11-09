import React, { useState, useEffect, useRef, useMemo } from "react";

export default function Dashboard() {
  const initialCameras = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    isViolent: false,
  }));

  const generateMockLog = () => ({
    id: Date.now() + Math.random(),
    cameraId: Math.floor(Math.random() * 16) + 1,
    timestamp: new Date(),
    probability: Math.floor(Math.random() * 100),
  });

  const [cameras, setCameras] = useState(initialCameras);
  const [logs, setLogs] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [cameraIdFilter, setCameraIdFilter] = useState("");
  const [probabilityFilter, setProbabilityFilter] = useState("all");

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
      if (newLog.probability > 75) {
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === newLog.cameraId ? { ...cam, isViolent: true } : cam
          )
        );
      } else {
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === newLog.cameraId ? { ...cam, isViolent: false } : cam
          )
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
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
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
              CAM {String(cam.id).padStart(2, "0")}
            </div>
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
