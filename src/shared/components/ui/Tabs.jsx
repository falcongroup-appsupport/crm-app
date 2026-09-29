import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex rounded-lg bg-ink-950 p-1 text-sm font-medium">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "relative flex-1 rounded-md px-3 py-2 transition-colors",
            active === tab.key ? "text-ink-950" : "text-ink-300 hover:text-white",
          )}
        >
          {active === tab.key && (
            <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-md bg-white" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
          )}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
