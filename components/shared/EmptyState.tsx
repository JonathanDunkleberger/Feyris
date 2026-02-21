"use client";

import { motion } from "framer-motion";
import { CatLogo } from "./CatLogo";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon ? (
        <Icon size={36} className="mb-3 text-cream/10" />
      ) : (
        <div className="mb-3 opacity-[0.15]">
          <CatLogo size={48} />
        </div>
      )}
      <h3 className="mb-1 text-[15px] font-bold text-cream/50">{title}</h3>
      <p className="max-w-xs text-[12px] text-cream/25">{description}</p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="mt-4 rounded-lg border border-gold/15 bg-gold/[0.06] px-5 py-2 text-[12px] font-semibold text-gold"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
