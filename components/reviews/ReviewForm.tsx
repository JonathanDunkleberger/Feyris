"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, ChevronDown, X } from "lucide-react";
import { RatingSlider } from "./RatingInput";
import { SUB_RATING_DIMENSIONS, type MediaType } from "@/lib/constants";
import { useToast } from "@/components/shared/Toast";

interface ReviewFormProps {
  mediaId: string;
  mediaType: MediaType;
  onSubmit?: (review: ReviewData) => void;
  onCancel?: () => void;
}

interface ReviewData {
  overall_rating: number;
  sub_ratings: Record<string, number>;
  title: string;
  body: string;
  contains_spoilers: boolean;
}

export function ReviewForm({ mediaId, mediaType, onSubmit, onCancel }: ReviewFormProps) {
  const { toast } = useToast();
  const [overall, setOverall] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [spoilers, setSpoilers] = useState(false);
  const [showSubRatings, setShowSubRatings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dimensions = SUB_RATING_DIMENSIONS[mediaType] || [];

  const handleSubmit = async () => {
    if (overall === 0) {
      toast("Please add an overall rating", "error");
      return;
    }
    if (body.trim().length < 10) {
      toast("Review must be at least 10 characters", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data: ReviewData = {
        overall_rating: overall,
        sub_ratings: subRatings,
        title: title.trim(),
        body: body.trim(),
        contains_spoilers: spoilers,
      };
      onSubmit?.(data);
      toast("Review submitted!", "success");
    } catch {
      toast("Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-gold/[0.08] p-5"
      style={{
        background: "linear-gradient(135deg, rgba(20,20,28,0.95), rgba(14,14,20,0.98))",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-cream">Write a Review</h3>
        {onCancel && (
          <button onClick={onCancel} className="text-cream/25 hover:text-cream/50">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Overall rating */}
      <div className="mb-4">
        <RatingSlider value={overall} onChange={setOverall} label="Overall Rating" />
      </div>

      {/* Sub-ratings (collapsible) */}
      {dimensions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowSubRatings(!showSubRatings)}
            className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-cream/35 hover:text-cream/50 transition-colors"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${showSubRatings ? "rotate-180" : ""}`}
            />
            Sub-ratings (optional)
          </button>
          <AnimatePresence>
            {showSubRatings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {dimensions.map((dim) => (
                  <RatingSlider
                    key={dim.key}
                    value={subRatings[dim.key] || 0}
                    onChange={(v) =>
                      setSubRatings((prev) => ({ ...prev, [dim.key]: v }))
                    }
                    label={dim.label}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="w-full rounded-lg border border-white/[0.06] bg-fey-surface px-3 py-2.5 text-[12.5px] text-cream placeholder:text-cream/20 outline-none focus:border-gold/15"
        />
      </div>

      {/* Body */}
      <div className="mb-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full rounded-lg border border-white/[0.06] bg-fey-surface px-3 py-2.5 text-[12.5px] text-cream placeholder:text-cream/20 outline-none focus:border-gold/15 resize-none"
        />
        <div className="mt-1 text-right text-[9px] text-cream/15">
          {body.length} characters
        </div>
      </div>

      {/* Spoiler toggle + Submit */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={spoilers}
            onChange={(e) => setSpoilers(e.target.checked)}
            className="sr-only"
          />
          <div
            className="flex h-4 w-4 items-center justify-center rounded border transition-colors"
            style={{
              borderColor: spoilers ? "#d4a574" : "rgba(255,255,255,0.08)",
              background: spoilers ? "rgba(212,165,116,0.15)" : "transparent",
            }}
          >
            {spoilers && <AlertTriangle size={9} className="text-[#d4a574]" />}
          </div>
          <span className="text-[11px] text-cream/35">Contains spoilers</span>
        </label>

        <motion.button
          onClick={handleSubmit}
          disabled={submitting || overall === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-bold text-fey-black disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #c8a44e, #a0832e)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Send size={12} /> {submitting ? "Submitting..." : "Submit Review"}
        </motion.button>
      </div>
    </motion.div>
  );
}
