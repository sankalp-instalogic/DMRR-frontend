import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  Search,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  FolderOpen,
  Brain,
  BarChart3,
  Shield,
  Database,
  Settings,
  LogOut,
  Building2,
  FlaskConical,
} from "lucide-react";
import logoImage from "../../imports/image.png";
import Header from "./Header";
import Sidebar from "./Sidebar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [proposalExpanded, setProposalExpanded] = useState(false);
  const [structuralExpanded, setStructuralExpanded] = useState(false);
  const [nonStructuralExpanded, setNonStructuralExpanded] = useState(false);
  const [researchExpanded, setResearchExpanded] = useState(false);
  const [prepExpanded, setPrepExpanded] = useState(false);
  const [procurementsSubExpanded, setProcurementsSubExpanded] = useState(false);
  const [fundsDistributedExpanded, setFundsDistributedExpanded] =
    useState(false);
  const [masterExpanded, setMasterExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const profileRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const subLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-lg text-sm ${
        isActive(to)
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "hover:bg-sidebar-accent"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
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
