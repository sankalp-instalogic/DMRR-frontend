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
          className={`transition-all duration-300 min-w-0 p-6 min-h-[calc(100vh-73px)]
    ${sidebarOpen ? "ml-69 w-[calc(100%-17.25rem)]" : "w-full"}
  `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
