import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { createRouter } from "./router";
import "./index.css";
import { QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryProvider } from "./providers/QueryProvider";

// O QueryClient será instanciado dentro do QueryProvider,
// mas o router ainda precisa de uma instância para os loaders.
const queryClient = new QueryClient();

// Crie o roteador passando o client
const router = createRouter(queryClient);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  </React.StrictMode>,
);
