import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, CloudUpload } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/contexts/AuthContext";
import { getQueueCount } from "@/lib/offline-queue";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!user) {
      setPending(0);
      return;
    }
    let cancelled = false;
    const check = async () => {
      const count = await getQueueCount(user.id);
      if (!cancelled) setPending(count);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, isOnline]);

  const show = !isOnline || pending > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-300"
          role="status"
          aria-live="polite"
        >
          {!isOnline ? (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <CloudUpload className="h-3 w-3 animate-pulse" />
              <span>Syncing {pending}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
