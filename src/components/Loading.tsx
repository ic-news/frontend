import { LoaderPinwheel } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Loading() {
  const { darkMode } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg p-6 flex items-center space-x-3`}
      >
        <LoaderPinwheel className="text-indigo-600 h-5 w-5 animate-spin" />
        <span className={`${darkMode ? "text-gray-200" : "text-gray-700"} text-sm font-medium`}>
          Loading...
        </span>
      </div>
    </div>
  );
}
