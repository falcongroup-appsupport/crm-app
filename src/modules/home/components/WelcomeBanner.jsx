import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Crosshair } from "lucide-react";

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** The pill at the top of the launcher — mirrors the event banner in the reference. */
export function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_rgba(10,10,10,0.06)] ring-1 ring-ink-100 sm:flex-row sm:items-center sm:gap-6 sm:rounded-full dark:bg-ink-900 dark:ring-ink-800"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal-600">
          <Crosshair className="h-4 w-4 text-white" strokeWidth={2.25} />
        </span>
        <p className="text-sm font-medium leading-snug text-ink-900 dark:text-ink-50">
          Falcon Survey Engineering CRM — from enquiry to handover, in one place
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 pl-11 sm:pl-0">
        <span className="whitespace-nowrap text-sm text-ink-500 dark:text-ink-400">
          {today()}
        </span>
        <Link
          to="/enquiries/new"
          className="group inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-signal-600 hover:text-signal-700 dark:text-signal-400"
        >
          New enquiry
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
