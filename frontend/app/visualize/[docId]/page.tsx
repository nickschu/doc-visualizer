"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

import { VisualResponse } from "@/components/visualization/visualTypes";
import { VisualSectionComponent } from "@/components/visualization/visualSectionComponent";

type Section = {
  id: string;
  label: string;
  icon?: string;
};
  
const SECTIONS: Section[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "operations", label: "Operational Performance", icon: "⚙️" },
  { id: "risk", label: "Risk Factors", icon: "⚠️" },
  { id: "market", label: "Market Performance", icon: "📈" },
];

export default function VisualizePage() {
  const [visualData, setVisualData] = useState<VisualResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const fetchedRef = useRef<{[key: string]: VisualResponse | undefined}>({});
  const inFlightRef = useRef<Set<string>>(new Set());

  const params = useParams();

  // Track which section is selected
  const [selectedSection, setSelectedSection] = useState<string>("overview");

  useEffect(() => {
    const fetchVisualization = async () => {
      setIsLoading(true);
      
      // Retrieve the docId
      const docId = params.docId as string;
      // If data has been cached, use it and exit early
      if (fetchedRef.current[docId]) {
        setVisualData(fetchedRef.current[docId] as VisualResponse);
        setIsLoading(false);
        return;
      }
      // If a request for this docId is already in-flight, do nothing
      if (inFlightRef.current.has(docId)) {
        return;
      }
      // Mark the request as in-flight
      inFlightRef.current.add(docId);
      
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
        fetchedRef.current[docId] = data;
      } catch (err: any) {
        setError(err.message);
        // Reset fetched status on error so we can try again
        fetchedRef.current[docId] = undefined;
      } finally {
        inFlightRef.current.delete(docId);
        setIsLoading(false);
      }
    };

    fetchVisualization();
  }, [params.docId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  else if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Generating Visualization</h1>
        <p className="text-gray-600">This may take a moment as we analyze your document...</p>
      </div>
    );
  }
  else if (!visualData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Visualization Data</h1>
          <p className="text-gray-600">We couldn't find visualization data for this document.</p>
        </div>
      </div>
    );
  }

  // Now we have the entire VisualResponse in visualData
  // We can build a UI that allows the user to switch among sections

  const renderModules = () => {
    switch (selectedSection) {
      case "overview":
        return <VisualSectionComponent section={visualData.overview} />;
      case "operations":
        return <VisualSectionComponent section={visualData.operational_performance} />;
      case "risk":
        return <VisualSectionComponent section={visualData.risk_factors} />;
      case "market":
        return <VisualSectionComponent section={visualData.market_position} />;
      default:
        return (
          <div className="p-8 text-center">
            <p className="text-gray-600">Select a section from the sidebar to view data.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* sidebar - responsive */}
      <aside 
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-10 w-64 h-full transition-transform duration-300 ease-in-out flex-shrink-0 bg-white shadow-md`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Document Analysis</h2>
          <nav className="space-y-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  section.id === selectedSection 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  setSelectedSection(section.id);
                  // For mobile, close sidebar after selection
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
              >
                {section.icon && <span className="mr-3 text-xl">{section.icon}</span>}
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">
            {visualData.company_name}
          </h1>
          <p className="text-gray-600 mt-1">
            Financial Performance Visualization
          </p>
        </div>
        <div>{renderModules()}</div>
      </main>
    </div>
  );
}
