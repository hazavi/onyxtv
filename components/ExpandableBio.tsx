"use client";

import { useState } from "react";

interface Props {
  text: string;
}

export default function ExpandableBio({ text }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6 max-w-2xl">
      <p
        className={`text-white/40 leading-relaxed text-sm whitespace-pre-line ${expanded ? "" : "line-clamp-5"}`}
      >
        {text}
      </p>
      {text.length > 300 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-white/50 hover:text-white/80 transition mt-1.5 cursor-pointer"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
