import { Construction } from "lucide-react";

interface UnderDevelopmentProps {
  moduleName?: string;
}

export function UnderDevelopment({ moduleName }: UnderDevelopmentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-12 max-w-md w-full shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 p-4 rounded-full">
            <Construction className="size-10 text-amber-600" />
          </div>
        </div>
        {moduleName && (
          <p className="text-sm text-amber-600 font-medium mb-2 uppercase tracking-wide">{moduleName}</p>
        )}
        <h2 className="text-2xl font-bold text-[#0B1F4D] mb-3">Module Under Development</h2>
        <p className="text-muted-foreground text-sm">
          This module is currently being developed and will be available soon.
        </p>
      </div>
    </div>
  );
}
