import { useNavigate, Link } from "react-router";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { cn } from "../components/ui/utils";
import { buttonVariants } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm max-w-lg w-full text-center flex flex-col items-center">
        {/* Icon Container matching the dashboard's alert gradient */}
        <div className="bg-linear-to-br from-[#EA580C] to-[#F59E0B] text-white rounded-2xl p-5 shadow-sm mb-6">
          <AlertTriangle className="size-10 text-white opacity-90" />
        </div>

        {/* Text Content */}
        <h1 className="text-[32px] font-bold text-[#0B1F4D] mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-[14px] font-medium text-gray-500 mb-8 max-w-sm">
          The page you are looking for doesn't exist, has been moved, or you
          don't have the necessary permissions to view it.
        </p>

        {/* Action Buttons using your exact button styles */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "cursor-pointer",
            )}
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>

          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "cursor-pointer",
            )}
          >
            <Home className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
