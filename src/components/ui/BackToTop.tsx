import { AnimatePresence } from "framer-motion";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { m } from "@/components/motion";
import { useScrolled } from "@/hooks/useScrolled";

export default function BackToTop() {
  const visible = useScrolled(undefined, 400);
  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-accent p-3 text-accent-foreground shadow-elevated"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
