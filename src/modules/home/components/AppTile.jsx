import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AppIcon } from "./AppIcons";

const tileVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

export function AppTile({ app }) {
  return (
    <motion.div variants={tileVariants}>
      <Link to={app.to} className="group flex flex-col items-center gap-3 rounded-xl p-1 outline-none" title={app.ready ? app.label : `${app.label} — coming soon`}>
        <span className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-[0_1px_2px_rgba(10,10,10,0.06),0_4px_14px_rgba(10,10,10,0.06)] ring-1 ring-ink-100 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgba(10,10,10,0.06),0_12px_28px_rgba(10,10,10,0.12)] group-focus-visible:ring-2 group-focus-visible:ring-signal-500 sm:h-20 sm:w-20 dark:bg-ink-800 dark:ring-ink-700">
          <AppIcon name={app.icon} className="h-11 w-11 transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14" />
          {!app.ready && (
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wide text-ink-500 ring-2 ring-white dark:bg-ink-700 dark:text-ink-300 dark:ring-ink-950">
              Soon
            </span>
          )}
        </span>
        <span className="text-center text-[13px] font-medium leading-tight text-ink-800 sm:text-sm dark:text-ink-100">{app.label}</span>
      </Link>
    </motion.div>
  );
}
