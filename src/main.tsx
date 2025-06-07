import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouter } from "./router";
import "./index.css";
import { QueryClient } from "@tanstack/react-query";

// O QueryClient será instanciado dentro do QueryProvider,
// mas o router ainda precisa de uma instância para os loaders.
const queryClient = new QueryClient();

// Crie o roteador passando o client
const router = createRouter(queryClient);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
