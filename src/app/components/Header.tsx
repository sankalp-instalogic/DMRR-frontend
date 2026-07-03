import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { Menu, X } from "lucide-react";

import { Dropdown, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "logout",
      label: "Sign Out",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar-nav"
          >
            {sidebarOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/image.png"
              alt="Maharashtra State Disaster Management Authority"
              className="size-12 object-contain"
            />

            <div>
              <h1 className="text-sm font-semibold leading-tight text-primary">
                Disaster Management, Relief & Rehabilitation Department
              </h1>

              <p className="text-xs text-muted-foreground">
                DMRR Project Pipeline Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={["click"]}
            arrow
          >
            <button
              className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer"
              aria-label={`Account menu for ${auth?.username ?? "Unknown User"}`}
              aria-haspopup="menu"
            >
              <Avatar
                size="small"
                style={{ backgroundColor: "var(--secondary)" }}
                icon={<UserOutlined />}
              />

              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-primary leading-none mb-1">
                  {auth?.username ?? "Unknown User"}
                </p>

                <p className="text-[10px] text-muted-foreground leading-none">
                  {auth?.role ?? "No Role"}
                </p>
              </div>

              <DownOutlined className="text-muted-foreground" aria-hidden="true" />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}