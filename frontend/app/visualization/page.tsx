"use client";

import React, { useState } from "react";

type Section = {
  id: string;
  label: string;
};

const SECTIONS: Section[] = [
  { id: "overview", label: "Financial Overview" },
  { id: "revenue", label: "Revenue Breakdown" },
  { id: "risk", label: "Risk Factors" },
  { id: "market", label: "Market Performance" },
];

export default function visualization() {
  // Track which section is selected
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  const renderModules = () => {
    // Placeholder logic
    switch (selectedSection) {
      case "overview":
        return <div className="p-4">[Overview Modules Placeholder]</div>;
      case "revenue":
        return <div className="p-4">[Revenue Modules Placeholder]</div>;
      case "risk":
        return <div className="p-4">[Risk Factors Modules Placeholder]</div>;
      case "market":
        return <div className="p-4">[Market Performance Modules Placeholder]</div>;
      default:
        return <div className="p-4">Select a section from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-100 border-r border-gray-300">
        <div className="p-4">
          <h2 className="mb-2 text-xl font-semibold">Sections</h2>
          <nav>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`block w-full text-left px-3 py-2 mb-1 rounded hover:bg-gray-200 ${
                  section.id === selectedSection ? "bg-blue-100" : ""
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">10-K Visualization</h1>
          <p className="text-gray-600 mb-6">
            Select a section from the left to see relevant modules or charts.
          </p>
        </div>

        <div className="px-4">{renderModules()}</div>
      </main>
    </div>
  );
}
