import "./index.css";
import React, { useState } from "react";
import Upload from "@/pages/Upload";
import Dashboard from "./pages/Dashboard";

import { PiDetective } from "react-icons/pi";

export function App() {
  const [page, setPage] = useState("home");

  const NavButton = ({
    target,
    children,
  }: {
    target: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => setPage(target)}
      className={`px-4 py-2 rounded-md transition-colors ${
        page === target
          ? "bg-violet-500 text-white"
          : "text-slate-950 hover:bg-violet-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <nav className="max-w-screen-2xl mx-auto px-6 lg:px-32 flex justify-between items-center h-20">
          <div className="text-xl text-violet-700 flex items-center gap-2 cursor-default">
            <PiDetective className="text-2xl" />
            VioDetect
          </div>
          <div className="flex items-center gap-2 rounded-lg">
            <NavButton target="home">Dashboard</NavButton>
            <NavButton target="upload">Upload Video</NavButton>
          </div>
        </nav>
      </header>
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-32 py-12">
        {page === "home" && <Dashboard />}
        {page === "upload" && <Upload />}
      </main>
    </div>
  );
}

export default App;
