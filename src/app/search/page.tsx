// src/app/search/page.tsx
import { Suspense } from "react";
import SearchContent from "@/components/SearchComponent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[50vh]">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}