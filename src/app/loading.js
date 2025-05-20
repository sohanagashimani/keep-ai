"use client";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex flex-row items-center h-screen justify-center">
      <div className="flex flex-col">
        <LoadingSpinner />
      </div>
    </div>
  );
} 