import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { SidebarProvider } from "../context/SidebarContext";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { ConfigProvider } from "antd";

export const queryClient = new QueryClient();

// Primary color from src/styles/theme.css (--primary)
const PRIMARY = "#0B1F4D";

export default function App() {
  const modules = [AllCommunityModule];
  return (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AgGridProvider modules={modules}>
            <SidebarProvider>
              <ConfigProvider
                theme={{
                  components: {
                    // Scoped to Tabs only — leaves other antd inputs unchanged
                    Tabs: {
                      itemSelectedColor: PRIMARY,
                      itemActiveColor: PRIMARY,
                      itemHoverColor: PRIMARY,
                      inkBarColor: PRIMARY,
                    },
                  },
                }}
              >
                <RouterProvider router={router} />
              </ConfigProvider>
              <Toaster />
            </SidebarProvider>
          </AgGridProvider>
        </QueryClientProvider>
      </AuthProvider>
  );
}
