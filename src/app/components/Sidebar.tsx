import { NavLink, useLocation } from "react-router";
import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sidebarLinks } from "../../../constants/sidebarLinks";

export default function Sidebar() {
  const { sidebarOpen } = useSidebar();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const parentLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm cursor-pointer ${
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground font-medium"
    }`;

  const childLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
        : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent"
    }`;

  return (
    <aside
      className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-sidebar text-sidebar-foreground transition-all duration-300 ${
        sidebarOpen ? "w-72" : "w-0"
      } overflow-hidden z-40`}
    >
      <nav className="p-3 space-y-1 overflow-y-auto h-full">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;

          if (item.children && item.stateKey) {
            const hasActiveChild = item.children.some((child) =>
              location.pathname.startsWith(child.to),
            );

            const isExpanded =
              expandedSections[item.stateKey] !== undefined
                ? expandedSections[item.stateKey]
                : hasActiveChild;

            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleSection(item.stateKey!)}
                  className="
    group
    flex items-center justify-between
    w-full
    px-4 py-3
    rounded-xl
    text-sm
    font-medium
    text-sidebar-foreground/80
    hover:text-sidebar-foreground
    hover:bg-sidebar-accent
    transition-all duration-200
    cursor-pointer
  "
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5" />
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-5 mt-2 pl-4 border-l border-sidebar-border/50 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={childLinkClass}
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              end={item.end}
              className={parentLinkClass}
            >
              <Icon className="size-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
