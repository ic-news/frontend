import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { WalletConnectorProvider } from "./connector";
import { CommonContextProvider } from "./context/CommonContext";
import "./index.scss";
import router from "./router";
// Import I18nProvider
import I18nProvider from "./i18n/I18nextProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletConnectorProvider>
        <CommonContextProvider>
          <I18nProvider>
            <RouterProvider router={router} />
            <Toaster />
          </I18nProvider>
        </CommonContextProvider>
      </WalletConnectorProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
