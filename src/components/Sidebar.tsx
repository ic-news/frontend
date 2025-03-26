import { useTheme } from "@/context/ThemeContext";
import { Home, Moon, Newspaper, Sun } from "lucide-react";
import { Trans } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import { classNames } from "../utils";
import Translate from "./Translate";
import { Badge } from "./ui/badge";
interface NavItem {
  icon: any;
  label: string;
  badge: string;
  router: string;
}
const navItems: NavItem[] = [
  { icon: Home, label: "sidebar.home", badge: "", router: "/" },
  { icon: Newspaper, label: "sidebar.news", badge: "", router: "/news" },
];
export function Theme({ className }: { className: string }) {
  const { darkMode, toggleDarkMode } = useTheme();
  return darkMode ? (
    <Moon
      className={classNames(
        className,
        "md:ml-auto w-5 h-5 cursor-pointer",
        darkMode ? "stroke-white" : ""
      )}
      onClick={toggleDarkMode}
    />
  ) : (
    <Sun
      className={classNames(className, "md:ml-auto w-5 h-5 cursor-pointer")}
      onClick={toggleDarkMode}
    />
  );
}
function Version() {
  return (
    <>
      <Badge className="md:ml-2 h-6 hidden xl:block">Beta</Badge>
      <Badge className="md:ml-2 h-6 hidden max-xl:block">β</Badge>
    </>
  );
}
export default function Sidebar() {
  const location = useLocation();
  return (
    <>
      {/* Sidebar */}
      <aside className="bg-[var(--bg-color-secondary)] xl:min-w-[260px] md:w-64 border-r border-[var(--border-color)] p-2 md:p-4 flex flex-col gap-5 items-center md:items-start">
        <div className="w-full flex items-center flex-col md:flex-row gap-2 md:gap-0">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="IC.News Logo" className="rounded-md w-8 h-auto md:mr-2" />
            <span className="text-xl font-bold max-xl:hidden text-[var(--text-color-primary)] flex items-center whitespace-nowrap">
              IC.News
            </span>
          </Link>
          <Version />
          <Theme className={"hidden md:block"} />
        </div>

        <nav className="space-y-2 mb-auto w-full">
          {navItems.map((item, index: any) => (
            <Link
              key={index}
              to={item.router}
              className={classNames(
                "w-full flex items-center px-1 rounded-lg cursor-pointer gap-3 group p-2",
                location.pathname === item.router
                  ? "text-[var(--color-primary)]"
                  : "text-gray-700 hover:text-[var(--color-primary)]"
              )}
            >
              <item.icon
                className={classNames(
                  "w-5 h-5",
                  location.pathname === item.router
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--text-color-primary)] group-hover:text-[var(--color-primary)]"
                )}
              />
              <h2
                className={classNames(
                  "text-lg font-semibold max-md:hidden",
                  location.pathname === item.router
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--text-color-primary)] group-hover:text-[var(--color-primary)]"
                )}
              >
                <Trans i18nKey={item.label} />
              </h2>
              {item.badge && (
                <span className="ml-2 text-xs bg-green-500 text-white px-1 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <Theme className={"block md:hidden"} />
        <Translate />
        {/* <FlashNews /> */}
      </aside>
    </>
  );
}
