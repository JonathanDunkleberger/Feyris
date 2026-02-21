"use client";

import { useEffect } from "react";
import { useMediaStore } from "@/stores/media-store";

/** Hydrates the media store from localStorage on mount. Place in root layout. */
export function MediaStoreHydrator() {
  const hydrate = useMediaStore((s) => s._hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
