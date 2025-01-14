import { VisualSection } from "./visualTypes";
import { ModuleRenderer } from "./moduleRenderer";

export function VisualSectionComponent({ section }: { section: VisualSection }) {
    return (
      <section className="mb-8 border-b pb-4">
        <h2 className="text-xl font-semibold mb-2">{section.name}</h2>
        <p className="text-gray-600 mb-4">{section.summary}</p>
  
        <ModuleRenderer module={section.main_module} />
        <ModuleRenderer module={section.side_module_1} />
        <ModuleRenderer module={section.side_module_2} />
      </section>
    );
  }