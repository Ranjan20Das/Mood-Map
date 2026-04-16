import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingActionButton() {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to="/entry"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
        aria-label="Quick mood entry"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>
    </motion.div>
  );
}
