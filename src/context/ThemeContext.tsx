import React, { createContext, useContext, useEffect, useState } from "react";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useCommonContext } from "./CommonContext";
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useCommonContext();
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "var(--bg-color-primary)");
  }, []);
  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    // Update document class for Tailwind dark mode
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    isDark: darkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <Sidebar />
      <main key={language?.language_code} className={`bg-[var(--bg-color-secondary)] w-full`}>
        {children}
      </main>
      <RightSidebar />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
