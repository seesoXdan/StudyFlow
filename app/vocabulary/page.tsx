"use client";

import { useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function VocabularyPage() {
  // Cache-bust on every visit so updates to the tool always load fresh.
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    setSrc(`${basePath}/vocabulary.html?t=${Date.now()}`);
  }, []);

  return (
    <iframe
      key={src}
      src={src || `${basePath}/vocabulary.html`}
      title="영어단어"
      className="w-full rounded-2xl border border-border bg-white"
      style={{ height: "calc(100dvh - 180px)", minHeight: 480 }}
    />
  );
}
