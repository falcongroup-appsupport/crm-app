import { motion } from "framer-motion";
import { LandingHeader } from "../components/LandingHeader";
import { SurveyBackdrop } from "../components/SurveyBackdrop";
import { AppTile } from "../components/AppTile";
import { LAUNCHER_APPS } from "../config/apps";

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.02, delayChildren: 0.1 } } };

/**
 * Full-screen landing page (outside the sidebar layout): an app launcher,
 * modelled on the Odoo home screen, over a survey-map backdrop
 * (topo contours, drone flight lines, control points, bathymetry).
 */
export default function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-paper dark:bg-ink-950">
      <SurveyBackdrop />

      <LandingHeader />

      <main className="px-4 pb-20 pt-10 sm:px-6 lg:pt-12">
        <motion.div
          variants={grid}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 md:grid-cols-6 lg:mt-10 lg:gap-y-10"
        >
          {LAUNCHER_APPS.map((app) => (
            <AppTile key={app.key} app={app} />
          ))}
        </motion.div>
      </main>
    </div>
  );
}
