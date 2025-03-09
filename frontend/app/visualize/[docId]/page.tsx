"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

import { VisualResponse } from "@/components/visualization/visualTypes";
import { VisualSectionComponent } from "@/components/visualization/visualSectionComponent";


type Section = {
    id: string;
    label: string;
  };
  
const SECTIONS: Section[] = [
    { id: "overview", label: "Overview" },
    { id: "operations", label: "Operational Performance" },
    { id: "risk", label: "Risk Factors" },
    { id: "market", label: "Market Performance" },
  ];

export default function VisualizePage() {
  const [visualData, setVisualData] = useState<VisualResponse | null>(null);
  const [error, setError] = useState<string>("");
  const fetchedRef = useRef<{[key: string]: boolean}>({});

  const params = useParams();

  // Track which section is selected
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  useEffect(() => {
    const fetchVisualization = async () => {
      // Skip if we've already fetched this docId
      const docId = params.docId as string;
      if (fetchedRef.current[docId]) {
        return;
      }
      
      // Mark this docId as fetched
      fetchedRef.current[docId] = true;
      
      try {
        const res = await fetch("/api/generate-visualization", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc_id: docId }),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch visualization for docId=${docId}`);
        }
        const data = await res.json();
        setVisualData(data);
      } catch (err: any) {
        setError(err.message);
        // Reset fetched status on error so we can try again
        fetchedRef.current[docId] = false;
      }
    };

    fetchVisualization();
  }, [params.docId]);

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!visualData) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h1 className="text-2xl mb-4">Loading visualization...</h1>
      
    </div>
  }

  // Now we have the entire VisualResponse in visualData
  // We can build a UI that allows the user to switch among sections

  const renderModules = () => {
    switch (selectedSection) {
      case "overview":
        return <div className="p-4"><VisualSectionComponent section={visualData.overview} /></div>;
      case "operations":
        return <div className="p-4"><VisualSectionComponent section={visualData.operational_performance} /></div>;
      case "risk":
        return <div className="p-4"><VisualSectionComponent section={visualData.risk_factors} /></div>;
      case "market":
        return <div className="p-4"><VisualSectionComponent section={visualData.market_position} /></div>;
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
            <h1 className="text-2xl font-bold mb-4">
            Visualization for {visualData.company_name}
            </h1>
        </div>
        <div className="px-4">{renderModules()}</div>
      </main>
    </div>
  );
}
