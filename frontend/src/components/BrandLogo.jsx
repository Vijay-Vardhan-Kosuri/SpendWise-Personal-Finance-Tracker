import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/", light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 group focus:outline-none">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          light
            ? "bg-white text-forest-800"
            : "bg-forest-800 text-white group-hover:bg-forest-900"
        }`}
      >
        <TrendingUp className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="flex flex-col leading-none">
        <span
          className={`text-lg font-bold tracking-tight ${
            light ? "text-white" : "text-gray-900 dark:text-white"
          }`}
        >
          Spend<span className={light ? "text-forest-200" : "text-forest-600 dark:text-forest-400"}>Wise</span>
        </span>
        <span
          className={`text-[10px] font-medium tracking-wider uppercase ${
            light ? "text-forest-200" : "text-gray-500 dark:text-slate-400"
          }`}
        >
          Personal Finance
        </span>
      </div>
    </Link>
  );
}
