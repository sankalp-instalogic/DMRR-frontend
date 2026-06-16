import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </AuthProvider>
  );
}
