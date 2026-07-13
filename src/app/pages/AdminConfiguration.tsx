import { Link } from "react-router";
import {
  Users,
  Server,
  FileText,
  IndianRupee,
  MapPin,
  Building2,
  HardHat,
  Package,
  FileCode,
  Database,
} from "lucide-react";

const adminModules = [
  {
    title: "User Management",
    icon: Users,
    link: "user-management",
    color: "bg-chart-1",
  },
  {
    title: "OCR Queue Monitor",
    icon: FileCode,
    link: "#",
    color: "bg-chart-3",
  },
];

const masterModules = [
  {
    title: "NDMA Guideline Registry",
    icon: FileText,
    link: "/master/ndma-guidelines",
    color: "bg-chart-1",
  },
  {
    title: "Budget Allocation Master",
    icon: IndianRupee,
    link: "/master/budget",
    color: "bg-chart-2",
  },
  {
    title: "Officer Master",
    icon: Users,
    link: "/master/officer",
    color: "bg-chart-3",
  },
  {
    title: "District Master",
    icon: MapPin,
    link: "/master/district",
    color: "bg-chart-4",
  },
  {
    title: "Taluka Master",
    icon: MapPin,
    link: "/master/taluka",
    color: "bg-chart-5",
  },
  {
    title: "Department Master",
    icon: Building2,
    link: "/master/department",
    color: "bg-chart-1",
  },
  {
    title: "Vendor Master",
    icon: HardHat,
    link: "/master/vendor",
    color: "bg-chart-2",
  },
  {
    title: "Equipment Catalogue",
    icon: Package,
    link: "/master/equipment",
    color: "bg-chart-3",
  },
];

export function AdminConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Admin & Configuration</h1>
        <p className="text-sm text-muted-foreground">
          System settings and master data management
        </p>
      </div>

      <h2 className="text-lg font-bold mt-8 mb-4 border-b border-border pb-2 text-primary flex items-center gap-2">
        <Server className="size-5" /> System Administration
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {adminModules.map((module, index) => (
          <Link
            key={index}
            to={module.link}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary transition-all group"
          >
            <div
              className={`${module.color} text-primary-foreground p-3 rounded-lg inline-block mb-3`}
            >
              <module.icon className="size-6" />
            </div>
            <h3 className="font-bold group-hover:text-primary transition-colors">
              {module.title}
            </h3>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold mt-8 mb-4 border-b border-border pb-2 text-primary flex items-center gap-2">
        <Database className="size-5" /> Master Data Management
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {masterModules.map((module, index) => (
          <Link
            key={index}
            to={module.link}
            className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary transition-all group"
          >
            <div
              className={`${module.color} text-primary-foreground p-3 rounded-lg inline-block mb-3 opacity-90`}
            >
              <module.icon className="size-6" />
            </div>
            <h3 className="font-bold group-hover:text-primary transition-colors">
              {module.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
