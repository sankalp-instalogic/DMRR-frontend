import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { Menu, X, User, ChevronDown, LogOut } from "lucide-react";

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

    const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/image.png"
              alt="Maharashtra State Disaster Management Authority"
              className="size-12 object-contain"
            />

            <div>
              <h1 className="text-sm font-semibold leading-tight text-[#0B1F4D]">
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
          {/* <button className="relative cursor-pointer p-2 hover:bg-muted rounded-lg text-[#64748B] hover:text-[#0B1F4D] transition-colors">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full border border-white"></span>
          </button> */}

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
            >
              <div className="bg-[#1E5AA8] text-white p-1.5 rounded-full">
                <User className="size-4" />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-[#0B1F4D] leading-none mb-1">
                  Admin User
                </p>

                <p className="text-[10px] text-[#64748B] leading-none">
                  officer@disaster-management.gov
                </p>
              </div>

              <ChevronDown className="size-4 text-[#64748B]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer text-left flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors rounded-xl"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
