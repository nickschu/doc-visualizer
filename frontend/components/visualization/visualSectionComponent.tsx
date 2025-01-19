import { VisualSection } from "./visualTypes";
import { ModuleRenderer } from "./moduleRenderer";

export function VisualSectionComponent({ section }: { section: VisualSection }) {
  return (
    // Full screen, flex column, hide overflow
    <section className="h-screen flex flex-col overflow-hidden">
      {/* Header/top area for name + summary (fixed height) */}
      <header className="shrink-0 p-4">
        <h2 className="text-xl font-semibold mb-2">{section.name}</h2>
        <p className="text-gray-600">{section.summary}</p>
      </header>

      {/* Main content area (fills remaining space) */}
      <div className="flex-1 flex">
        {/* Left: Main module, takes remaining width */}
        <div className="flex-1 h-full">
          <ModuleRenderer module={section.main_module} />
        </div>

        {/* Right: side modules stacked vertically, fixed width */}
        <div className="w-1/3 h-full flex flex-col">
          {/* side_module_1 */}
          <div className="flex-1 border-b border-gray-300">
            <ModuleRenderer module={section.side_module_1} />
          {/* side_module_2 */}
            <ModuleRenderer module={section.side_module_2} />
          </div>
        </div>
      </div>
    </section>
  );
}