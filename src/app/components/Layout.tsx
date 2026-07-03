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
          id="main-content"
          className={`transition-all duration-300 min-w-0 p-6 min-h-[calc(100vh-73px)]
            ${sidebarOpen ? "ml-80 w-[calc(100%-20rem)]" : "w-full"}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}