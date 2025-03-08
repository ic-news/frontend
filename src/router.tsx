import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./App";
import Details from "./Details";
import Home from "./Home";
import News from "./News";
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
        path: "/news",
        index: true,
        element: <News />,
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
