import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSidebar } from "../../context/SidebarContext";

export function Layout() {
  const { sidebarOpen } = useSidebar();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-69" : "ml-0"
          } p-6 min-h-[calc(100vh-73px)]`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
