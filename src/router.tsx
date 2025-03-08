import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./App";
import Details from "./Details";
import FlashNews from "./FlashNews";
import Home from "./Home";
import NotFound from "./components/NotFound";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/flash-news",
        index: true,
        element: <FlashNews />,
      },
      {
        path: "news/:id",
        element: <Details />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
