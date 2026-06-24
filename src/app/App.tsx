import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { SidebarProvider } from "../context/SidebarContext";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";

export const queryClient = new QueryClient();
export default function App() {
  const modules = [AllCommunityModule];
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
          <AgGridProvider modules={modules}>
            <SidebarProvider>
              <RouterProvider router={router} />
              <Toaster />
            </SidebarProvider>
          </AgGridProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
