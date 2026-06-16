import { Outlet } from "react-router";
import { useSidebar } from "../context/SidebarContext";

import Header from "./Header";
import Sidebar from "./Sidebar";

export function Layout() {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <div className="flex">
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-72" : "ml-0"
          } p-6 min-h-[calc(100vh-73px)]`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
