import { Outlet } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <LoadingProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Outlet />
        </NotificationProvider>
      </ThemeProvider>
    </LoadingProvider>
  );
}
