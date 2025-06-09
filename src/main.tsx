import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouter } from "./router";
import "./index.css";
import { QueryClient } from "@tanstack/react-query";

// O QueryClient ainda é necessário para ser passado para os loaders do roteador.
const queryClient = new QueryClient();

// Crie o roteador passando o client. O App.tsx, como elemento raiz,
// irá agora fornecer todos os contextos necessários.
const router = createRouter(queryClient);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
