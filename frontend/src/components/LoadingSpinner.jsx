import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading...", fullHeight = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullHeight ? "min-h-[320px]" : "py-10"
      }`}
    >
      <Loader2 className="h-7 w-7 animate-spin text-forest-800 dark:text-forest-400" strokeWidth={2} />
      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
