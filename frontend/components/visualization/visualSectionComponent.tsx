import { VisualSection } from "./visualTypes";
import { ModuleRenderer } from "./moduleRenderer";
import { useState } from "react";

export function VisualSectionComponent({ section }: { section: VisualSection }) {
  const [layout, setLayout] = useState<"grid" | "featured">("grid");

  return (
    <section className="p-4 pb-8">
      {/* Header with actions */}
      <header className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{section.name}</h2>
          <p className="text-gray-600 max-w-4xl">{section.summary}</p>
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              onClick={() => setLayout("grid")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                layout === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setLayout("featured")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                layout === "featured"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Featured View
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard layout */}
      {layout === "grid" ? (
        /* Grid Layout - more balanced, equal emphasis */
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {/* Main module - spans 8 columns on large screens, full width on small */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-lg shadow-md overflow-hidden">
            <ModuleRenderer module={section.main_module} />
          </div>

          {/* Side modules side by side instead of stacked on larger screens */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden md:col-span-1">
              <ModuleRenderer module={section.side_module_1} />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden md:col-span-1">
              <ModuleRenderer module={section.side_module_2} />
            </div>
          </div>
        </div>
      ) : (
        /* Featured Layout - main insight is prominent, others are smaller and arranged differently */
        <div className="flex flex-col space-y-4">
          {/* Main insight - full width, taller */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
            <ModuleRenderer module={section.main_module} />
          </div>
          
          {/* Secondary insights in a 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500">
              <ModuleRenderer module={section.side_module_1} />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-500">
              <ModuleRenderer module={section.side_module_2} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}