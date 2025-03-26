import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./App";
import Details from "./Details";
import Flash from "./Flash";
import Home from "./Home";
import NotFound from "./components/NotFound";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Flash />,
      },
      {
        path: "/news",
        element: <Home />,
      },
      {
        path: "/news/:id",
        element: <Details />,
      },
      {
        path: "/flash/:id",
        element: <Details />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export default createBrowserRouter(routes);
