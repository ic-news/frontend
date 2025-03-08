import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

interface BreadcrumbItem {
  label?: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

// Component to display navigation breadcrumbs
export default function Breadcrumb({ items = [] }: BreadcrumbProps) {
  const { darkMode } = useTheme();
  const location = useLocation();

  // Default home item
  const defaultItems: BreadcrumbItem[] = [
    {
      label: "Home",
      path: "/",
    },
  ];

  // Combine default items with provided items
  const breadcrumbItems = [...defaultItems, ...items];

  return (
    <nav className="flex py-3 px-3" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight
                className={`mx-2 h-3 w-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              />
            )}
            <Link
              to={item?.path || ""}
              className={`inline-flex line-clamp-1 whitespace-nowrap items-center ${
                location.pathname === (item?.path || "")
                  ? darkMode
                    ? "text-gray-100"
                    : "text-gray-800"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-100"
                  : "text-gray-500 hover:text-gray-800"
              } text-sm font-medium transition-colors`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
