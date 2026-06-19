import { NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sidebarLinks } from "../../../constants/sidebarLinks";
import type { NavItem } from "../../../constants/sidebarLinks";

export default function Sidebar() {
  const { sidebarOpen } = useSidebar();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const findActiveSections = (
    items: NavItem[],
    sections: Record<string, boolean> = {},
  ): Record<string, boolean> => {
    items.forEach((item) => {
      if (item.children) {
        const hasActive = hasActiveChild(item.children);

        if (hasActive && item.stateKey) {
          sections[item.stateKey] = true;
        }

        findActiveSections(item.children, sections);
      }
    });

    return sections;
  };

  useEffect(() => {
    const activeSections = findActiveSections(sidebarLinks);

    setExpandedSections((prev) => ({
      ...prev,
      ...activeSections,
    }));
  }, [location.pathname]);

  const toggleSection = (key: string, defaultExpanded: boolean) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] !== undefined ? !prev[key] : !defaultExpanded,
    }));
  };

  // Checks if a parent item has an active child route
  const hasActiveChild = (children?: NavItem[]): boolean => {
    if (!children) return false;
    return children.some((child) => {
      if (child.to) {
        // Precise active check for exact match or sub-routes
        return (
          location.pathname === child.to ||
          location.pathname.startsWith(`${child.to}/`)
        );
      }
      return hasActiveChild(child.children);
    });
  };

  // Styling for top-level links without children
  const topLevelLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "hover:bg-sidebar-accent text-sidebar-foreground"
    }`;

  // Styling for nested child links (Level 2 and 3)
  const childLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer w-full text-left ${
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    }`;

  return (
    <aside
      className={`fixed left-0 top-18.25 h-[calc(100vh-73px)] bg-sidebar text-sidebar-foreground transition-all duration-300 ${
        sidebarOpen ? "w-72" : "w-0"
      } overflow-hidden z-40`}
    >
      <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
        {sidebarLinks.map((item) => {
          const Icon = item.icon;

          // --- LEVEL 1: Dropdown/Folders ---
          if (item.children && item.stateKey) {
            const isItemActive = hasActiveChild(item.children);
            const isExpanded =
              expandedSections[item.stateKey] !== undefined
                ? expandedSections[item.stateKey]
                : isItemActive;

            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleSection(item.stateKey!, isExpanded)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer text-sidebar-foreground"
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="size-5" />}
                    <span className="text-left leading-tight">
                      {item.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-4 shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      // --- LEVEL 2: Nested Dropdown ---
                      if (child.children && child.stateKey) {
                        const isChildActive = hasActiveChild(child.children);
                        const isChildExpanded =
                          expandedSections[child.stateKey] !== undefined
                            ? expandedSections[child.stateKey]
                            : isChildActive;

                        return (
                          <div key={child.title}>
                            <button
                              onClick={() =>
                                toggleSection(child.stateKey!, isChildExpanded)
                              }
                              className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sm font-medium cursor-pointer text-sidebar-foreground"
                            >
                              <span>{child.title}</span>
                              {isChildExpanded ? (
                                <ChevronDown className="size-3.5 shrink-0" />
                              ) : (
                                <ChevronRight className="size-3.5 shrink-0" />
                              )}
                            </button>

                            {/* --- LEVEL 3: Leaf Links --- */}
                            {isChildExpanded && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                                {child.children.map((subChild) => (
                                  <NavLink
                                    key={subChild.to}
                                    to={subChild.to!}
                                    end={subChild.end}
                                    className={childLinkClass}
                                  >
                                    {subChild.title}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // --- LEVEL 2: Leaf Links (e.g., Master Data Items) ---
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to!}
                          end={child.end}
                          className={childLinkClass}
                        >
                          {child.title}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // --- LEVEL 1: Direct Links (e.g., Dashboard, AI Intelligence) ---
          return (
            <NavLink
              key={item.to}
              to={item.to!}
              end={item.end}
              className={topLevelLinkClass}
            >
              {Icon && <Icon className="size-5" />}
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
